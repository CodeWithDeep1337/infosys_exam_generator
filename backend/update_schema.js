const mysql = require("mysql2/promise");
require("dotenv").config();

async function updateSchema() {
  console.log("🔧 Updating Database Schema...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    console.log("✅ Connected to database.");

    // Check if status column exists, if not add it
    try {
        await connection.query("SELECT status FROM quiz_attempts LIMIT 1");
        console.log("ℹ️ Column 'status' already exists.");
    } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') {
            console.log("⚠️ Column 'status' missing. Adding it...");
            await connection.query(`
                ALTER TABLE quiz_attempts 
                ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING' AFTER quiz_id,
                ADD COLUMN started_at TIMESTAMP NULL,
                ADD COLUMN completed_at TIMESTAMP NULL;
            `);
            console.log("✅ Columns added successfully.");
        } else {
            throw err;
        }
    }

    console.log("🎉 Database schema updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Update Failed:", err);
    process.exit(1);
  }
}

updateSchema();
