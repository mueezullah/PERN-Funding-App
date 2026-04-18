const express = require("express");
const router = express.Router();
const paymentController = require("./payments.controller");
const { ensureAuthenticated } = require("../auth/auth.middleware");

// POST /api/payments/create-intent
// We use 'ensureAuthenticated' because we need to know WHICH user is donating
router.post("/create-intent", ensureAuthenticated, paymentController.createDonationIntent);

// POST /api/payments/confirm
// Called when frontend says Stripe succeeded. We verify and update the DB!
router.post("/confirm", ensureAuthenticated, paymentController.confirmDonation);

module.exports = router;
