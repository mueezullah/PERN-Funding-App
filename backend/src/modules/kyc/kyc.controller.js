import {
  startKycSession,
  getKycStatus,
  verifyWebhookSignature,
  handleWebhookEvent,
} from "./kyc.service.js";

// ─── GET /kyc/status ──────────────────────────────────────────────────────────
/**
 * Authenticated endpoint — gets current KYC status for the logged-in user.
 */
export const checkStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getKycStatus(userId);
    return res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
};

// ─── POST /kyc/start ──────────────────────────────────────────────────────────
/**
 * Authenticated endpoint — creates a Didit KYC session for the logged-in user.
 * Returns the Didit hosted-flow URL so the frontend can redirect the user.
 */
export const startSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await startKycSession(userId);

    return res.status(result.status).json(
      result.success
        ? { success: true, ...result.data }
        : { success: false, message: result.message }
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /webhooks/didit ─────────────────────────────────────────────────────
/**
 * Public endpoint — receives Didit status-change events.
 *
 * IMPORTANT: This handler receives req.body as a raw Buffer because it is
 * mounted in app.js with express.raw() BEFORE express.json().
 * We must NOT call JSON.parse() via express middleware on this route.
 */
export const diditWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-signature-v2"] ?? "";
    const rawBody = req.body; // Buffer from express.raw()

    // 1. Verify the HMAC signature — throws 401 on mismatch
    verifyWebhookSignature(rawBody, signature);

    // 2. Parse the body now that we've confirmed it's authentic
    const payload = JSON.parse(rawBody.toString("utf8"));

    // 3. Process the event (idempotent — safe to retry)
    const result = await handleWebhookEvent(payload);

    // Always respond 200 quickly so Didit doesn't retry unnecessarily
    return res.status(200).json({ received: true, ...result });
  } catch (err) {
    next(err);
  }
};
