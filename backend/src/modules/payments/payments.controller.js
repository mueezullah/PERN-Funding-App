import asyncHandler from "../../middlewares/asyncHandler.js";
import * as paymentsService from "./payments.service.js";

/**
 * POST /api/payments/create-intent
 * Initiates an idempotent donation intent on Stripe and records pending state.
 */
export const createDonationIntent = asyncHandler(async (req, res) => {
  const { amount, campaignId } = req.body;
  const userId = req.user.id;

  const result = await paymentsService.createDonationIntentService({
    userId,
    campaignId,
    amount,
  });

  return res.status(result.status).json({
    clientSecret: result.clientSecret,
  });
});

/**
 * POST /api/payments/confirm
 * Verifies with Stripe that payment completed and executes DB fulfillment.
 */
export const confirmDonation = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  const result = await paymentsService.confirmDonationService(paymentIntentId);

  return res.status(result.status).json({
    message: result.message,
  });
});

/**
 * POST /webhooks/stripe
 * Stripe safety-net webhook handler with raw buffer signature verification.
 */
export const stripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];
    const result = await paymentsService.handleStripeWebhook(req.body, signature);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 400).json({ message: err.message });
  }
};

/**
 * POST /api/payments/cleanup
 * Maintenance utility to clean up orphaned pending donations older than 1 hour.
 */
export const cleanupStaleDonations = asyncHandler(async (req, res) => {
  const result = await paymentsService.cleanupStaleDonationsService();
  return res.status(200).json(result);
});
