/**
 * kyc.service.js
 *
 * All Didit API interactions and database operations for KYC.
 *
 * Didit authenticates API requests with the project's API key in x-api-key.
 */

import crypto from "crypto";
import prisma from "../../config/prisma.js";
import env from "../../config/env.js";

// ─── Didit API constants ──────────────────────────────────────────────────────
const DIDIT_BASE_URL = "https://verification.didit.me/v2";

function getApiKey() {
  if (!env.DIDIT_API_KEY) {
    const err = new Error(
      "Didit API key is not configured. Set DIDIT_API_CLIENT_ID in backend/.env.",
    );
    err.statusCode = 503;
    throw err;
  }
  return env.DIDIT_API_KEY;
}

// ─── Session creation ─────────────────────────────────────────────────────────

/**
 * Creates a Didit KYC session for the given user.
 * - If the user already has a KYC record (re-application after rejection),
 *   it overwrites the existing row via upsert so there's always ≤ 1 per user.
 * - Returns the Didit redirect URL.
 */
export const startKycSession = async (userId) => {
  // Block users who are already approved
  const existing = await prisma.kycVerification.findUnique({
    where: { user_id: userId },
  });

  if (existing?.admin_status === "approved") {
    return {
      success: false,
      status: 409,
      message: "Your identity is already verified.",
    };
  }

  if (
    existing?.didit_status === "pending" ||
    existing?.didit_status === "in_review"
  ) {
    return {
      success: false,
      status: 409,
      message:
        "A KYC session is already in progress. Please complete or wait for the result.",
    };
  }

  const response = await fetch(`${DIDIT_BASE_URL}/session/`, {
    method: "POST",
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: env.DIDIT_WORKFLOW_ID,
      // vendor_data is how we map the session back to our user on webhook
      vendor_data: String(userId),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(
      `Didit session creation failed (${response.status}): ${text}`,
    );
    err.statusCode = 502;
    throw err;
  }

  const { session_id, url } = await response.json();

  // Upsert — creates or replaces the existing KYC row for this user
  await prisma.kycVerification.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      didit_session_id: session_id,
      didit_status: "pending",
      admin_status: "pending",
    },
    update: {
      didit_session_id: session_id,
      didit_status: "pending",
      admin_status: "pending",
      // Clear previously extracted fields on re-submission
      extracted_name: null,
      extracted_dob: null,
      document_number: null,
      raw_response: undefined,
    },
  });

  return { success: true, status: 201, data: { url, session_id } };
};

/**
 * Returns the current KYC verification status for the logged-in user.
 */
export const getKycStatus = async (userId) => {
  const kyc = await prisma.kycVerification.findUnique({
    where: { user_id: userId },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kyc_verified: true, role: true },
  });

  return {
    success: true,
    status: 200,
    data: {
      kyc_verified: user?.kyc_verified ?? false,
      role: user?.role,
      didit_status: kyc?.didit_status ?? "none",
      admin_status: kyc?.admin_status ?? "none",
    },
  };
};

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verifies the X-Signature-V2 header sent by Didit.
 * Didit computes: HMAC-SHA256(rawBody, webhookSecret) → hex string.
 * We re-compute it and do a timing-safe comparison.
 *
 * @param {Buffer} rawBody   - The raw request body buffer (NOT parsed JSON)
 * @param {string} signature - Value of the X-Signature-V2 header
 * @throws {Error} statusCode 401 if the signature doesn't match
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.DIDIT_WEBHOOK_SECRET) {
    const err = new Error("DIDIT_WEBHOOK_SECRET is not configured.");
    err.statusCode = 500;
    throw err;
  }

  const expected = crypto
    .createHmac("sha256", env.DIDIT_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature ?? "", "utf8");
  const expBuffer = Buffer.from(expected, "utf8");

  // Constant-time comparison prevents timing attacks
  if (
    sigBuffer.length !== expBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expBuffer)
  ) {
    const err = new Error("Invalid webhook signature.");
    err.statusCode = 401;
    throw err;
  }
};

// ─── Webhook event handler ───────────────────────────────────────────────────

/**
 * Processes a verified Didit webhook payload.
 * Only handles `status.updated` events; silently ignores others.
 *
 * Does NOT update the user's role — that only happens after admin approval.
 */
export const handleWebhookEvent = async (payload) => {
  const { event, session_id, status, vendor_data, kyc } = payload;

  // We only care about status change events
  if (event !== "session.status.updated" && event !== "status.updated") {
    return { ignored: true };
  }

  // Map Didit status strings to our enum values
  const diditStatusMap = {
    Approved: "approved",
    Declined: "declined",
    "In Review": "in_review",
    approved: "approved",
    declined: "declined",
    in_review: "in_review",
    Pending: "pending",
    pending: "pending",
  };

  const mappedStatus = diditStatusMap[status];
  if (!mappedStatus) {
    console.warn(`[KYC Webhook] Unknown Didit status: "${status}" — skipping`);
    return { ignored: true };
  }

  // Extract identity fields from the KYC document scan (if present)
  const document = kyc?.document ?? {};
  const firstName = document.first_name ?? "";
  const lastName = document.last_name ?? "";
  const extractedName = [firstName, lastName].filter(Boolean).join(" ") || null;
  const extractedDob = document.date_of_birth ?? null;
  const documentNumber = document.document_number ?? null;

  // Look up by session_id (unique index — fast lookup)
  const record = await prisma.kycVerification.findUnique({
    where: { didit_session_id: session_id },
  });

  if (!record) {
    // Fallback: try to find by vendor_data (user ID) if session lookup misses
    const userId = parseInt(vendor_data, 10);
    if (!isNaN(userId)) {
      await prisma.kycVerification.updateMany({
        where: { user_id: userId },
        data: {
          didit_status: mappedStatus,
          extracted_name: extractedName,
          extracted_dob: extractedDob,
          document_number: documentNumber,
          raw_response: payload,
        },
      });
    }
    return { processed: true };
  }

  await prisma.kycVerification.update({
    where: { id: record.id },
    data: {
      didit_status: mappedStatus,
      extracted_name: extractedName,
      extracted_dob: extractedDob,
      document_number: documentNumber,
      raw_response: payload,
    },
  });

  return { processed: true };
};

// ─── Admin queries ────────────────────────────────────────────────────────────

/**
 * Returns all KYC records where Didit has approved the identity check
 * but the admin hasn't acted yet (admin_status = pending).
 * Includes user details for the admin dashboard table.
 */
export const getPendingKycRecords = async () => {
  const records = await prisma.kycVerification.findMany({
    where: {
      didit_status: "approved", // Didit cleared them
      admin_status: "pending", // admin hasn't decided yet
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          kyc_verified: true,
          created_at: true,
        },
      },
    },
    orderBy: { updated_at: "asc" }, // oldest first — FIFO review queue
  });

  return { success: true, status: 200, data: records };
};

/**
 * Admin approves or rejects a KYC record.
 *
 * On APPROVE:
 *   - Sets admin_status = approved, kyc_verified = true
 *   - Promotes user role to "fundraiser"
 *   All three writes happen in a single Prisma transaction.
 *
 * On REJECT:
 *   - Sets admin_status = rejected, kyc_verified stays false
 *   - Role is unchanged
 */
export const processAdminDecision = async (kycId, adminStatus) => {
  const record = await prisma.kycVerification.findUnique({
    where: { id: parseInt(kycId, 10) },
    include: { user: true },
  });

  if (!record) {
    return { success: false, status: 404, message: "KYC record not found." };
  }

  if (record.admin_status !== "pending") {
    return {
      success: false,
      status: 409,
      message: `This record has already been ${record.admin_status}.`,
    };
  }

  if (adminStatus === "approved") {
    // Atomic transaction: update KYC record + user table together
    const [updatedKyc] = await prisma.$transaction([
      prisma.kycVerification.update({
        where: { id: record.id },
        data: { admin_status: "approved" },
      }),
      prisma.user.update({
        where: { id: record.user_id },
        data: {
          kyc_verified: true,
          role: "fundraiser",
        },
      }),
    ]);

    return {
      success: true,
      status: 200,
      data: {
        message: `User @${record.user.username} approved as Verified Fundraiser.`,
        kyc: updatedKyc,
      },
    };
  }

  // adminStatus === "rejected"
  const updatedKyc = await prisma.kycVerification.update({
    where: { id: record.id },
    data: { admin_status: "rejected" },
  });

  return {
    success: true,
    status: 200,
    data: {
      message: `KYC application for @${record.user.username} rejected.`,
      kyc: updatedKyc,
    },
  };
};
