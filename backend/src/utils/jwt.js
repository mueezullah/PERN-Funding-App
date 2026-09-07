import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Access token — short-lived (15 min), sent in Authorization header with every request
export const generateToken = (payload, expiresIn = "15m") => {
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
