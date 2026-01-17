const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

// ✅ Middlewares
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// ✅ Routes
const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const subjectRoutes = require("./src/routes/subjectRoutes");
const topicRoutes = require("./src/routes/topicRoutes");
const userRoutes = require("./src/routes/userRoutes"); // optional if you add user CRUD
const instructorRoutes = require("./src/routes/instructorRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/users", userRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/quizzes", require("./src/routes/quizRoutes"));
app.use("/api/quiz", require("./src/routes/quizRoutes"));

// ✅ MySQL connection
async function start() {
  try {
    const connection = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    app.set("db", connection);
    console.log("✅ MySQL connected");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
}

start();
