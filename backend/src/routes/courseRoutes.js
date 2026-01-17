const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/* ===========================
   ADD COURSE (INSTRUCTOR)
=========================== */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("INSTRUCTOR"),
  async (req, res) => {
    try {
      const { title, difficulty, duration } = req.body;

      if (!title || !difficulty || !duration) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const [result] = await db.query(
        "INSERT INTO courses (title, difficulty, duration, instructor_id) VALUES (?,?,?,?)",
        [title.trim(), difficulty, duration, req.user.id]
      );

      res.status(201).json({
        message: "Course added successfully",
        courseId: result.insertId,
      });
    } catch (err) {
      console.error("Error adding course:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ===========================
   GET INSTRUCTOR COURSES
=========================== */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("INSTRUCTOR"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM courses WHERE instructor_id = ?",
        [req.user.id]
      );

      res.json(rows);
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
