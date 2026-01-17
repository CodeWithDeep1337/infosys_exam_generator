const express = require("express");
const router = express.Router();
const db = require("../config/db");

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ===========================
   ADD TOPIC (INSTRUCTOR/ADMIN)
=========================== */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  async (req, res) => {
    try {
      const { subject_id, name } = req.body;

      if (!subject_id || !name) {
        return res
          .status(400)
          .json({ error: "Subject ID and topic name are required" });
      }

      const [result] = await db.query(
        "INSERT INTO topics (subject_id, name) VALUES (?, ?)",
        [subject_id, name.trim()]
      );

      res.status(201).json({
        message: "Topic added successfully",
        topicId: result.insertId,
      });
    } catch (err) {
      console.error("Error adding topic:", err);
      res.status(500).json({ error: "Failed to add topic" });
    }
  }
);

/* ===========================
   GET TOPICS BY SUBJECT (Students can view)
=========================== */
router.get(
  "/:subjectId",
  authenticateToken,
  authorizeRoles("STUDENT", "INSTRUCTOR", "ADMIN"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM topics WHERE subject_id = ?",
        [req.params.subjectId]
      );

      res.json({ topics: rows });
    } catch (err) {
      console.error("Error fetching topics:", err);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  }
);

module.exports = router;
