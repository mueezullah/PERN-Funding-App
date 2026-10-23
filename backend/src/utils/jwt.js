import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Access token — sent in Authorization header with every request (default: 24h, configurable via JWT_EXPIRES_IN)
export const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN || "24h") => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

// Refresh token — long-lived (30 days), stored in httpOnly cookie only
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};
