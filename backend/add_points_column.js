
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPointsColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    // Check if column exists first to avoid error
    const [columns] = await connection.execute("SHOW COLUMNS FROM questions LIKE 'points'");
    
    if (columns.length === 0) {
        console.log("Adding 'points' column to questions table...");
        await connection.execute("ALTER TABLE questions ADD COLUMN points INT DEFAULT 1");
        console.log("SUCCESS: Column 'points' added.");
    } else {
        console.log("Column 'points' already exists.");
    }

  } catch (error) {
    console.error("FAILED to add column:", error);
  } finally {
    connection.end();
  }
}
addPointsColumn();
