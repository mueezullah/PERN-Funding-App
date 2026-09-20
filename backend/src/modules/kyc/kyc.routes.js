import express from "express";
import { startSession, checkStatus } from "./kyc.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = express.Router();

// GET /kyc/status — authenticated users only
router.get("/status", ensureAuthenticated, checkStatus);

// POST /kyc/start — authenticated users only
// Initiates a Didit hosted KYC session and returns the redirect URL
router.post("/start", ensureAuthenticated, startSession);

// NOTE: The Didit webhook is NOT mounted here.
// It's mounted directly in app.js BEFORE express.json() because
// Didit requires the raw (unparsed) request body to verify HMAC signatures.
// See app.js: POST /webhooks/didit

export default router;
