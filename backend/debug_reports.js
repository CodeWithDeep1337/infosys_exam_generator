const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkReports() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "Deep123@sqL",
    database: process.env.DB_NAME || "skillforge",
  });

  try {
    const [users] = await db.query("SELECT id, username FROM users");
    console.log("Users:", JSON.stringify(users));

    const [attempts] = await db.query("SELECT id, user_id, quiz_id, status FROM quiz_attempts");
    console.log("Attempts:", JSON.stringify(attempts));

    const [orphans] = await db.query("SELECT * FROM quiz_attempts WHERE user_id NOT IN (SELECT id FROM users)");
    console.log("Orphan Attempts (Invalid User IDs):", JSON.stringify(orphans));

    const [validReports] = await db.query(`
        SELECT qa.id, u.username, q.title FROM quiz_attempts qa
        JOIN users u ON qa.user_id = u.id
        JOIN quizzes q ON qa.quiz_id = q.id
    `);
    console.log("Valid Reports:", JSON.stringify(validReports));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    db.end();
  }
}

checkReports();
