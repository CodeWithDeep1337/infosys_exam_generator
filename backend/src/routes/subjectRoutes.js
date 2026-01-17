const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/* ===========================
   ADD SUBJECT (INSTRUCTOR)
=========================== */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("INSTRUCTOR"),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Subject name is required" });
      }

      const [result] = await db.query(
        "INSERT INTO subjects (name, instructor_id) VALUES (?, ?)",
        [name.trim(), req.user.id]
      );

      res.status(201).json({
        message: "Subject added successfully",
        subjectId: result.insertId,
      });
    } catch (err) {
      console.error("Error adding subject:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ===========================
   GET SUBJECTS (INSTRUCTOR)
=========================== */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("INSTRUCTOR"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM subjects WHERE instructor_id = ?",
        [req.user.id]
      );
      res.json(rows);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
