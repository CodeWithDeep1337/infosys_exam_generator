// src/routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const quizController = require("../controllers/quizController");

// INSTRUCTOR: Generate Quiz Questions via AI
router.post(
  "/generate",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.generateQuiz
);

// INSTRUCTOR: Save/Create Quiz
router.post(
  "/create",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.createQuiz
);

// INSTRUCTOR: Assign Quiz
router.post(
  "/assign",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.assignQuiz
);

// STUDENT: Get My Quizzes
router.get(
  "/my-quizzes",
  authenticateToken,
  authorizeRoles("STUDENT"),
  quizController.getStudentQuizzes
);

// STUDENT: Get Adaptive Stats
router.get(
  "/stats",
  authenticateToken,
  authorizeRoles("STUDENT"),
  quizController.getStudentStats
);

// STUDENT: Submit Quiz
router.post(
  "/submit",
  authenticateToken,
  authorizeRoles("STUDENT"),
  quizController.submitQuiz
);

// INSTRUCTOR: Delete Quiz
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.deleteQuiz
);

// INSTRUCTOR: Get All Attempts (Reports)
router.get(
  "/reports",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.getAllQuizAttempts
);

// INSTRUCTOR: Question CRUD
router.post(
  "/:quizId/question",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.addQuestion
);
router.put(
  "/question/:questionId",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.updateQuestion
);
router.delete(
  "/question/:questionId",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.deleteQuestion
);

// INSTRUCTOR: Grade Attempt
router.post(
  "/grade-attempt",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.gradeQuizAttempt
);

// Get Single Quiz (Public/Protected)
router.get(
  "/:id",
  authenticateToken,
  quizController.getQuizById
);

// Get All Quizzes
router.get(
  "/",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  quizController.getAllQuizzes
);



module.exports = router;
