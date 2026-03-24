const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");

const router = express.Router();

// Mount module routes
router.use("/auth", authRoutes);

module.exports = router;
