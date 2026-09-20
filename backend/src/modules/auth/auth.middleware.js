import { verifyToken } from "../../utils/jwt.js";

// Checks if user is logged in with a valid JWT
export const ensureAuthenticated = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).json({
      message: "Unauthorized, JWT token is required",
    });
  }
  try {
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized, JWT token wrong or expired",
    });
  }
};

// Optional auth middleware that attaches req.user if token is present
export const optionalAuth = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (auth) {
    try {
      const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      // Token optional
    }
  }
  next();
};

// Checks if authenticated user has admin role
export const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
};

/**
 * Reusable Role-Based Access Control (RBAC) middleware generator.
 * Allows access if req.user has any of the specified roles.
 * 
 * @param  {...string} allowedRoles - e.g. "admin", "fundraiser"
 * @returns {Function} Express middleware
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(", ")}] roles`,
      });
    }

    next();
  };
};

export const ensureRole = requireRole;
