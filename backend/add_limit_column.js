const db = require('./src/config/db');

async function addTimeLimitColumn() {
    try {
        console.log("Checking if time_limit column exists...");
        const [columns] = await db.query("SHOW COLUMNS FROM quizzes LIKE 'time_limit'");
        
        if (columns.length === 0) {
            console.log("Adding time_limit column to quizzes table...");
            await db.query("ALTER TABLE quizzes ADD COLUMN time_limit INT DEFAULT 10");
            console.log("✅ API Column 'time_limit' added successfully.");
        } else {
            console.log("ℹ️ Column 'time_limit' already exists.");
        }
        process.exit();
    } catch (err) {
        console.error("❌ Error adding column:", err);
        process.exit(1);
    }
}

addTimeLimitColumn();
