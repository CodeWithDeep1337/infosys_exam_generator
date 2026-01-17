const express = require("express");
const cors = require("cors");
require("dotenv").config(); // load .env variables

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");       // for user CRUD/profile
const courseRoutes = require("./src/routes/courseRoutes");   // for instructor courses
const subjectRoutes = require("./src/routes/subjectRoutes"); // for subjects
const topicRoutes = require("./src/routes/topicRoutes"); // for topics
const instructorRoutes = require("./src/routes/instructorRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/instructor", instructorRoutes);

// Server start
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
