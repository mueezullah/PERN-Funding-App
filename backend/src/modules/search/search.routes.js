import { Router } from "express";
import { searchGlobal } from "./search.controller.js";
import { optionalAuth } from "../auth/auth.middleware.js";

const router = Router();

// Global search is publicly readable; optionalAuth attaches req.user if token present
router.get("/", optionalAuth, searchGlobal);

export default router;
