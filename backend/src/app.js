import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { stripeWebhook } from "./modules/payments/payments.controller.js";
import { diditWebhook } from "./modules/kyc/kyc.controller.js";
import env from "./config/env.js";

const app = express();

// ─── 1. CORS Middleware (MUST BE VERY FIRST) ─────────────────────────────────
// Mounting CORS first ensures all preflight OPTIONS requests are immediately
// answered with 204 No Content before any body parsers or route guards run.
const configuredOrigins = (env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const defaultAllowedOrigins = [
  "https://fundme-dev.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultAllowedOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".netlify.app") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }
    // Permissive fallback so production client requests are never blocked
    return callback(null, true);
  },
  credentials: true, // allow cookies & authorization headers cross-origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
