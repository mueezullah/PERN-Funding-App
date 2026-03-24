const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const campaignRoutes = require("./modules/campaigns/campaign.routes");

const router = express.Router();

// Mount module routes
router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);

module.exports = router;
