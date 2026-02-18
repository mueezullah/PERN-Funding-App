const jwt = require("jsonwebtoken");

// Checks if user is logged in with a valid JWT. Auth middleware -> verify token
const ensureAuthenticated = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(403).json({
      message: "Unauthorized, JWT token is require",
    });
  }
  try {
    const decoded = jwt.verify(auth, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Unauthorized, JWT token wrong or expired",
    });
  }
};

// Checks if user is logged in with a valid JWT and is an admin. Admin middleware -> check role
const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
};

module.exports = { ensureAuthenticated, ensureAdmin };
