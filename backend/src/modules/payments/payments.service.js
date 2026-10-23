// 💡 ARCHITECTURE NOTE (DUAL DATABASE ACCESS PATTERN):
// Standard CRUD models (Users, Posts, Comments, Likes, Follows) use Prisma ORM for type safety.
// Payments & Critical Financial Transactions explicitly use Raw SQL (`pg` pool, parameterized queries,
// explicit BEGIN/COMMIT transaction locks) to showcase raw SQL proficiency, low-level transaction control,
// and performance optimization alongside Prisma.

import pool from "../../config/db.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates or retrieves an idempotent Stripe PaymentIntent for a donation.
 * 
 * @param {Object} params
 * @param {number} params.userId
 * @param {number} params.campaignId
 * @param {number} params.amount
 * @returns {Promise<{ clientSecret: string }>}
 */
export const createDonationIntentService = async ({ userId, campaignId, amount }) => {
  // 1. Fetch campaign to validate donor ownership, status, and remaining amount
  const campaignQuery = await pool.query(
    "SELECT user_id, goal_amount, current_amount, status FROM campaigns WHERE id = $1",
    [campaignId]
  );
  if (campaignQuery.rows.length === 0) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  const campaign = campaignQuery.rows[0];
  if (campaign.user_id === userId) {
    const error = new Error("You cannot donate to your own campaign");
    error.statusCode = 400;
    throw error;
  }
  if (campaign.status !== "active") {
    const error = new Error("This campaign is no longer active");
    error.statusCode = 400;
    throw error;
  }

  const goalAmount = parseFloat(campaign.goal_amount);
  const currentAmount = parseFloat(campaign.current_amount);
  const remainingAmount = goalAmount - currentAmount;

  if (amount > remainingAmount) {
    const error = new Error(
      `You cannot fund more than the required amount. Remaining required amount is $${remainingAmount.toFixed(2)}.`
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. IDEMPOTENCY CHECK: Look for an existing pending donation for this user/campaign
  const existingDonation = await pool.query(
    `SELECT stripe_payment_intent_id FROM donations
     WHERE donor_id = $1 AND campaign_id = $2 AND status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    [userId, campaignId]
  );

  if (existingDonation.rows.length > 0) {
    try {
      const existingIntent = await stripe.paymentIntents.retrieve(
        existingDonation.rows[0].stripe_payment_intent_id
      );

      const reusableStates = [
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
      ];

      if (reusableStates.includes(existingIntent.status)) {
        console.log(
          `♻️  Reusing existing PaymentIntent ${existingIntent.id} for user ${userId} on campaign ${campaignId}`
        );
        return { clientSecret: existingIntent.client_secret, status: 200 };
      }
    } catch (stripeError) {
      console.warn(
        `⚠️  Could not retrieve existing PaymentIntent: ${stripeError.message}. Creating new one.`
      );
    }
  }

  // 3. Create a fresh Payment Intent on Stripe (amount in cents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata: {
      campaignId: String(campaignId),
      userId: String(userId),
    },
  });

  // 4. Save pending donation in DB
  const query = `
    INSERT INTO donations (campaign_id, donor_id, amount, stripe_payment_intent_id, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING *;
  `;
  const values = [campaignId, userId, amount, paymentIntent.id];
  await pool.query(query, values);

  return { clientSecret: paymentIntent.client_secret, status: 201 };
};

/**
 * Core transactional atomic fulfillment for donations.
 * Called by both confirmDonation and stripeWebhook for idempotent fulfillment.
 * 
 * @param {string} paymentIntentId
 * @returns {Promise<{ notFound?: boolean, alreadyCompleted?: boolean, success?: boolean }>}
 */
export const fulfillDonation = async (paymentIntentId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the pending donation record
    const checkQuery = `SELECT status, amount, campaign_id FROM donations WHERE stripe_payment_intent_id = $1`;
    const { rows } = await client.query(checkQuery, [paymentIntentId]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    if (rows[0].status === "completed") {
      await client.query("ROLLBACK");
      return { alreadyCompleted: true };
    }

    const amount = rows[0].amount;
    const campaignId = rows[0].campaign_id;

    // Mark donation as completed
    await client.query(
      `UPDATE donations SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntentId]
    );

    // Add funds to campaign and auto-complete if goal is reached
    await client.query(
      `UPDATE campaigns 
       SET current_amount = current_amount + $1,
           status = CASE 
               WHEN current_amount + $1 >= goal_amount THEN 'completed' 
               ELSE status 
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [amount, campaignId]
    );

    await client.query("COMMIT");
    console.log(
      `✅ Donation fulfilled: PaymentIntent ${paymentIntentId}, $${amount} → campaign ${campaignId}`
    );

    return { success: true };
  } catch (dbError) {
    await client.query("ROLLBACK");
    throw dbError;
  } finally {
    client.release();
  }
};

/**
 * Confirms donation on the fast path (called from frontend).
 * 
 * @param {string} paymentIntentId 
 * @returns {Promise<{ message: string, status: number }>}
 */
export const confirmDonationService = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    const error = new Error("Payment was not successful in Stripe");
    error.statusCode = 400;
    throw error;
  }

  const result = await fulfillDonation(paymentIntentId);

  if (result.alreadyCompleted) {
    return { message: "Donation already confirmed", status: 200 };
  }

  return { message: "Donation confirmed and campaign updated!", status: 200 };
};

/**
 * Handles incoming raw Stripe Webhook events with signature verification.
 * 
 * @param {Buffer} rawBody 
 * @param {string} signature 
 * @returns {Promise<{ received: boolean }>}
 */
export const handleStripeWebhook = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    const error = new Error(`Webhook Error: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log(`🔔 Webhook received: payment_intent.succeeded for ${paymentIntent.id}`);

    try {
      const result = await fulfillDonation(paymentIntent.id);

      if (result.notFound) {
        console.warn(
          `⚠️  Webhook: No donation row found for ${paymentIntent.id}. The frontend confirm call will handle it.`
        );
      } else if (result.alreadyCompleted) {
        console.log(
          `ℹ️  Webhook: Donation ${paymentIntent.id} was already confirmed by frontend.`
        );
      } else {
        console.log(
          `🛟  Webhook: Safety net activated! Fulfilled donation ${paymentIntent.id}`
        );
      }
    } catch (error) {
      console.error(`❌ Webhook: Error fulfilling donation ${paymentIntent.id}:`, error);
    }
  }

  return { received: true };
};

/**
 * Cleans up stale pending donations older than 1 hour.
 * 
 * @returns {Promise<{ expiredCount: number, message: string }>}
 */
export const cleanupStaleDonationsService = async () => {
  const result = await pool.query(
    `UPDATE donations
     SET status = 'expired', updated_at = CURRENT_TIMESTAMP
     WHERE status = 'pending'
       AND created_at < NOW() - INTERVAL '1 hour'
     RETURNING id, stripe_payment_intent_id, campaign_id`
  );

  const expiredCount = result.rowCount;

  if (expiredCount > 0) {
    console.log(`🧹 Cleaned up ${expiredCount} stale pending donation(s):`);
    result.rows.forEach((row) => {
      console.log(
        `   - Donation #${row.id} (Stripe: ${row.stripe_payment_intent_id}, Campaign: ${row.campaign_id})`
      );
    });

    const cancelResults = await Promise.allSettled(
      result.rows.map((row) =>
        stripe.paymentIntents
          .cancel(row.stripe_payment_intent_id)
          .catch((err) => {
            console.warn(
              `   ⚠️  Could not cancel Stripe intent ${row.stripe_payment_intent_id}: ${err.message}`
            );
          })
      )
    );

    const canceledCount = cancelResults.filter((r) => r.status === "fulfilled").length;
    console.log(`   ✅ Canceled ${canceledCount}/${expiredCount} Stripe PaymentIntents`);
  } else {
    console.log(`🧹 No stale pending donations to clean up.`);
  }

  return {
    message: `Cleaned up ${expiredCount} stale pending donation(s)`,
    expiredCount,
  };
};
