import express from "express";
import { getAdminAnalytics } from "./admin.controller.js";
import { listPendingKyc, decideKyc } from "./admin.controller.js";
import { ensureAuthenticated, ensureAdmin } from "../auth/auth.middleware.js";

const router = express.Router();

// GET /admin/analytics - Admin only
router.get("/analytics", ensureAuthenticated, ensureAdmin, getAdminAnalytics);

// GET  /admin/kyc/pending  — List KYC submissions awaiting admin review
router.get("/kyc/pending", ensureAuthenticated, ensureAdmin, listPendingKyc);

// PATCH /admin/kyc/:id    — Approve or reject a KYC submission
router.patch("/kyc/:id", ensureAuthenticated, ensureAdmin, decideKyc);

export default router;
