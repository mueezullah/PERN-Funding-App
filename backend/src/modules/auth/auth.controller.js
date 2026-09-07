import * as authService from "./auth.service.js";
import { verifyRefreshToken, generateToken } from "../../utils/jwt.js";
import * as UserModel from "../users/user.model.js";

// ─── Cookie config ──────────────────────────────────────────────────────────
// httpOnly: JS cannot read this cookie (XSS protection)
// secure: only sent over HTTPS in production
// sameSite: 'strict' prevents CSRF
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  path: "/",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", path: "/" });
};

// ─── Controllers ────────────────────────────────────────────────────────────

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const result = await authService.signupUser(name, username, email, password);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    // Set refresh token as httpOnly cookie — JS cannot read it
    setRefreshCookie(res, result.refreshToken);

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    // Set refresh token as httpOnly cookie — JS cannot read it
    setRefreshCookie(res, result.refreshToken);

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

/**
 * POST /auth/refresh
 * Reads the httpOnly refresh token cookie, verifies it, and issues a new
 * short-lived access token. Frontend calls this silently when it gets a 401.
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token", success: false });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token expired or invalid", success: false });
    }

    // Fetch fresh user data so the new access token has up-to-date role/kyc
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "User not found", success: false });
    }

    const newAccessToken = generateToken({
      email: user.email,
      id: user.id,
      role: user.role,
      kyc_verified: user.kyc_verified,
    });

    return res.status(200).json({
      success: true,
      jwtToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

/**
 * POST /auth/logout
 * Clears the refresh token cookie. The short-lived access token will
 * naturally expire on its own (15 min max).
 */
export const logout = (req, res) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: "Logged out successfully", success: true });
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await authService.fetchAllUsers();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await authService.updateUserRole(id, role);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const toggleKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { kycVerified } = req.body;
    const result = await authService.toggleKycStatus(id, kycVerified);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message, success: false });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
