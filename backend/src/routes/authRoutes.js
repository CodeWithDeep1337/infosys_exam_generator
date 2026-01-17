// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();

// ✅ Import controller functions from src/controllers/authController.js
const {
  register,
  login,
  studentDashboard,
  instructorDashboard,
  adminDashboard,
} = require("../controllers/authController");


// ✅ Import middleware from src/middleware/authMiddleware.js
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// -------------------- Public Routes --------------------
router.post("/register", register);
router.post("/login", login);

// -------------------- Protected Routes --------------------
router.get(
  "/dashboard/student",
  authenticateToken,
  authorizeRoles("STUDENT"),
  studentDashboard
);

router.get(
  "/dashboard/instructor",
  authenticateToken,
  authorizeRoles("INSTRUCTOR"),
  instructorDashboard
);

router.get(
  "/dashboard/admin",
  authenticateToken,
  authorizeRoles("ADMIN"),
  adminDashboard
);

module.exports = router;
