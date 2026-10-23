import { Router } from "express";
import { getExploreFeed } from "./explore.controller.js";
import { optionalAuth } from "../auth/auth.middleware.js";

const router = Router();

// Explore feed is publicly readable; optionalAuth attaches req.user if token present
router.get("/", optionalAuth, getExploreFeed);

export default router;
