const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Instructor Dashboard
router.get("/dashboard",
  authenticateToken,
  authorizeRoles("INSTRUCTOR"),
  (req, res) => {
    res.json({
      message: "Instructor Dashboard Accessed",
      instructor: req.user
    });
  }
);

const quizController = require("../controllers/quizController");

// Reports
router.get("/reports",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.getAllQuizAttempts
);

// Student Details
router.get("/student/:id/details",
  // authenticateToken,
  // authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.getStudentDetails
);

// Get Quiz Attempt Details (for grading)
router.get("/quiz/attempt/:attemptId",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.getQuizAttemptDetails
);

// Grade Individual Answer
router.post("/grade",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.gradeAnswer
);

module.exports = router;
