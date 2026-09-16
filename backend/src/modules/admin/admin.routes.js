import express from "express";
import { getAdminAnalytics } from "./admin.controller.js";
import { ensureAuthenticated, ensureAdmin } from "../auth/auth.middleware.js";

const router = express.Router();

// GET /admin/analytics - Admin only
router.get("/analytics", ensureAuthenticated, ensureAdmin, getAdminAnalytics);

export default router;
