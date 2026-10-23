import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { stripeWebhook } from "./modules/payments/payments.controller.js";
import { diditWebhook } from "./modules/kyc/kyc.controller.js";
import env from "./config/env.js";

const app = express();

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  STRIPE WEBHOOK — MUST be mounted BEFORE express.json()!                ║
// ║                                                                          ║
// ║  WHY: Stripe signs webhook requests using the raw request body bytes.    ║
// ║  If express.json() parses the body first, the raw bytes are lost and     ║
// ║  signature verification ALWAYS fails with "No signatures found matching  ║
// ║  the expected signature".                                                ║
// ║                                                                          ║
// ║  HOW: We use express.raw() which gives us the body as a Buffer.         ║
// ║  This raw Buffer is exactly what stripe.webhooks.constructEvent() needs. ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
app.post(
    "/webhooks/stripe",
    express.raw({ type: "application/json" }),  // raw body as Buffer, NOT parsed JSON
    stripeWebhook
);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  DIDIT WEBHOOK — same constraint as Stripe: must be BEFORE express.json  ║
// ║  so the raw body bytes are intact for HMAC-SHA256 signature verification ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
app.post(
    "/webhooks/didit",
    express.raw({ type: "application/json" }),
    diditWebhook
);

// Global request pipeline parsing and security middlewares
// (Everything AFTER this line receives parsed JSON bodies as usual)
app.use(express.json());

// ─── CORS ────────────────────────────────────────────────────────────────────
// credentials: true is REQUIRED for the browser to send the httpOnly
// refresh-token cookie cross-origin.
const configuredOrigins = (env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultAllowedOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        process.env.NODE_ENV !== "production" ||
        normalizedOrigin.endsWith(".netlify.app") ||
        normalizedOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true, // allow cookies in cross-origin requests
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Cookie parser ──────────────────────────────────────────────────────────
// Required for req.cookies to be populated (reads the httpOnly refresh cookie)
app.use(cookieParser());

// mount all routes
app.use(routes);

// Global error handler (must be after routes)
app.use(errorHandler);

export default app;
