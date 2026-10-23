import { Router } from "express";
import {
  getUserProfile,
  updateAvatar,
  updateProfile,
  getMyDonations,
  getMyCampaigns,
} from "./user.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

// ─── Authenticated "me" routes (must come before /:username to avoid conflict) ─
router.get("/me/donations", ensureAuthenticated, getMyDonations);
router.get("/me/campaigns", ensureAuthenticated, getMyCampaigns);

// ─── Profile & Avatar update ──────────────────────────────────────────────────
router.put("/profile", ensureAuthenticated, upload.single("avatar"), updateProfile);
router.put("/avatar", ensureAuthenticated, upload.single("avatar"), updateAvatar);

// ─── Public profile lookup ─────────────────────────────────────────────────────
router.get("/:username", getUserProfile);

export default router;
