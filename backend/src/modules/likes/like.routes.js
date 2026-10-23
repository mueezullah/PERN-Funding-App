import express from "express";
import { toggleLike, getLikeStatus } from "./like.controller.js";
import { ensureAuthenticated, optionalAuth } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/", ensureAuthenticated, toggleLike);
router.post("/toggle", ensureAuthenticated, toggleLike);
router.get("/status", optionalAuth, getLikeStatus);

export default router;
