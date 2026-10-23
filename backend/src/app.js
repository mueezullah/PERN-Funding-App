import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { stripeWebhook } from "./modules/payments/payments.controller.js";
import { diditWebhook } from "./modules/kyc/kyc.controller.js";

const app = express();

// ─── 1. Universal CORS Middleware (Always First) ─────────────────────────────
// Echoes requesting origin and sets credentials: true for cross-site cookie flow
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );

  // Instantly resolve preflight OPTIONS requests with 204 No Content
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// Also keep standard cors middleware for secondary guards
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 204,
  })
);

// ─── 2. Webhooks with Raw Body Parsing ───────────────────────────────────────
// STRIPE WEBHOOK: Must receive raw Buffer for HMAC signature verification
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// DIDIT WEBHOOK: Must receive raw Buffer for HMAC signature verification
app.post(
  "/webhooks/didit",
  express.raw({ type: "application/json" }),
  diditWebhook
);

// ─── 3. Global Body Parser & Cookie Parser ──────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── 4. Application Routes ──────────────────────────────────────────────────
app.use(routes);

// ─── 5. Global Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

export default app;
