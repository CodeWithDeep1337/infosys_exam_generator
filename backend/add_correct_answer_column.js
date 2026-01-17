const mysql = require("mysql2/promise");
require("dotenv").config();

async function addCorrectAnswerColumn() {
  console.log("🔧 Checking 'questions' table schema...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    console.log("✅ Connected to database.");

    // Check if correct_answer column exists
    try {
        await connection.query("SELECT correct_answer FROM questions LIMIT 1");
        console.log("ℹ️ Column 'correct_answer' already exists.");
    } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') {
            console.log("⚠️ Column 'correct_answer' missing. Adding it...");
            await connection.query(`
                ALTER TABLE questions 
                ADD COLUMN correct_answer TEXT AFTER question_type;
            `);
            console.log("✅ Column 'correct_answer' added successfully.");
        } else {
            throw err;
        }
    }

    console.log("🎉 Database schema check/update complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Update Failed:", err);
    process.exit(1);
  }
}

addCorrectAnswerColumn();
