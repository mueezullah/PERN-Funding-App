import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  getAllUsers,
  updateUserRole,
  toggleKycStatus,
} from "./auth.controller.js";
import { signupValidation, loginValidation } from "./auth.validation.js";
import { ensureAuthenticated, ensureAdmin } from "./auth.middleware.js";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);

// Silent token refresh — called automatically by the Axios interceptor on 401
// Uses the httpOnly refresh token cookie, requires no Authorization header
router.post("/refresh", refreshToken);

// Clear the refresh token cookie and end the session
router.post("/logout", logout);

router.get("/users", ensureAuthenticated, ensureAdmin, getAllUsers);
router.put("/users/:id/role", ensureAuthenticated, ensureAdmin, updateUserRole);
router.put("/users/:id/kyc", ensureAuthenticated, ensureAdmin, toggleKycStatus);

export default router;
