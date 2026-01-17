const mysql = require('mysql2/promise');
require('dotenv').config();

async function addDifficultyColumn() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log("Connected to DB");

        // Check if column exists
        const [columns] = await db.query("SHOW COLUMNS FROM quizzes LIKE 'difficulty'");
        
        if (columns.length === 0) {
            console.log("Column 'difficulty' NOT found. Adding it...");
            await db.query("ALTER TABLE quizzes ADD COLUMN difficulty VARCHAR(50) DEFAULT 'Medium'");
            console.log("SUCCESS: Column 'difficulty' added.");
        } else {
            console.log("Column 'difficulty' ALREADY EXISTS.");
        }

        await db.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

addDifficultyColumn();
