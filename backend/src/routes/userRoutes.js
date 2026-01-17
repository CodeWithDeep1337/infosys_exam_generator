const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/* ===========================
   ADMIN ONLY ROUTES
=========================== */

// Get all users
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const db = req.app.get("db");
      const [users] = await db.query(
        "SELECT id, username, email, role FROM users"
      );
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get user by ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const db = req.app.get("db");
      const [users] = await db.query(
        "SELECT id, username, email, role FROM users WHERE id = ?",
        [req.params.id]
      );
      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(users[0]);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update user
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const db = req.app.get("db");
      const { username, email, role } = req.body;
      
      await db.query(
        "UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?",
        [username, email, role, req.params.id]
      );
      res.json({ message: "User updated successfully" });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete user
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const db = req.app.get("db");
      await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;

