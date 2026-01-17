// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * ✅ REGISTER Controller
 */
async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "All fields (username, email, password, role) are required" });
    }

    const db = req.app.get("db");

    // Check if user already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email.toLowerCase(), username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email.toLowerCase(), hashedPassword, role.toUpperCase()]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: result.insertId, username, email, role: role.toUpperCase() },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ✅ LOGIN Controller
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = req.app.get("db");

    // Find user
    const [users] = await db.query(
      "SELECT id, username, email, role, password FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ✅ STUDENT DASHBOARD Controller
 */
async function studentDashboard(req, res) {
  try {
    const db = req.app.get("db");

    // Get student info
    const [student] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ? AND role = 'STUDENT'",
      [req.user.id]
    );

    if (student.length === 0) {
      return res.status(403).json({ error: "Access denied: Not a student" });
    }

    res.json({
      message: "Student Dashboard",
      student: student[0],
    });
  } catch (err) {
    console.error("Student Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ✅ INSTRUCTOR DASHBOARD Controller
 */
async function instructorDashboard(req, res) {
  try {
    const db = req.app.get("db");

    // Get instructor info
    const [instructor] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ? AND role = 'INSTRUCTOR'",
      [req.user.id]
    );

    if (instructor.length === 0) {
      return res.status(403).json({ error: "Access denied: Not an instructor" });
    }

    res.json({
      message: "Instructor Dashboard",
      instructor: instructor[0],
    });
  } catch (err) {
    console.error("Instructor Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ✅ ADMIN DASHBOARD Controller
 */
async function adminDashboard(req, res) {
  try {
    const db = req.app.get("db");

    // Get admin info
    const [admin] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ? AND role = 'ADMIN'",
      [req.user.id]
    );

    if (admin.length === 0) {
      return res.status(403).json({ error: "Access denied: Not an admin" });
    }

    res.json({
      message: "Admin Dashboard",
      admin: admin[0],
    });
  } catch (err) {
    console.error("Admin Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  register,
  login,
  studentDashboard,
  instructorDashboard,
  adminDashboard,
};
