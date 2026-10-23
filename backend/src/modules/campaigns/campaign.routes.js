import { Router } from "express";
import {
  create,
  listActive,
  getOne,
  getUserCampaigns,
  update,
  deleteCampaign,
  pinCampaign,
  getCreatorAnalytics,
} from "./campaign.controller.js";
import { validateCreate, validateUpdate } from "./campaign.validation.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", ensureAuthenticated, validateCreate, create);
router.get("/", listActive);
router.get("/creator/analytics", ensureAuthenticated, getCreatorAnalytics);
router.get("/user/:userId", getUserCampaigns);
router.get("/:id", getOne);
router.patch("/:id/pin", ensureAuthenticated, pinCampaign);
router.put("/:id", ensureAuthenticated, validateUpdate, update);
router.delete("/:id", ensureAuthenticated, deleteCampaign);

export default router;

