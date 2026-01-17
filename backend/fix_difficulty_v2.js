const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixColumn() {
    let connection;
    try {
        console.log("Connecting to Database:", process.env.DB_NAME);
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log("✅ Connected.");

        // 1. Force Check
        const [columns] = await connection.query("SHOW COLUMNS FROM quizzes LIKE 'difficulty'");
        
        if (columns.length > 0) {
            console.log("ℹ️ Column 'difficulty' ALREADY EXISTS.");
        } else {
            console.log("⚠️ Column 'difficulty' NOT found. Attempting to ADD...");
            await connection.query("ALTER TABLE quizzes ADD COLUMN difficulty VARCHAR(50) DEFAULT 'Medium'");
            console.log("✅ ALTER TABLE executed.");
        }

        // 2. Final Verify
        const [verify] = await connection.query("SHOW COLUMNS FROM quizzes LIKE 'difficulty'");
        if (verify.length > 0) {
            console.log("🎉 VERIFICATION SUCCESS: 'difficulty' column exists.");
        } else {
            console.error("❌ VERIFICATION FAILED: Column still missing!");
        }

    } catch (err) {
        console.error("❌ CRITICAL ERROR:", err.message);
    } finally {
        if(connection) await connection.end();
    }
}

fixColumn();
