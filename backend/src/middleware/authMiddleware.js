const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    // console.log("Decoded User from Token:", user); // DEBUG LOG
    req.user = user; // Attach decoded user info to request
    next();
  });
}

// Middleware to check user role
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = (req.user && req.user.role) ? req.user.role.toUpperCase() : "";
    const allowed = allowedRoles.map(r => r.toUpperCase());
    
    if (!req.user || !allowed.includes(userRole)) {
      console.warn(`Access Denied. User Role: ${userRole}, Allowed: ${allowed}`); // Debug Log
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
