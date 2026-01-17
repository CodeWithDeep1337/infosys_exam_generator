const db = require('./src/config/db');

async function addTimeLimitColumn() {
  try {
    console.log("Checking quizzes table schema...");
    const [columns] = await db.query("DESCRIBE quizzes");
    const hasColumn = columns.some(c => c.Field === 'time_limit');

    if (hasColumn) {
      console.log("Column 'time_limit' already exists. Skipping.");
    } else {
      console.log("Adding 'time_limit' column...");
      await db.query("ALTER TABLE quizzes ADD COLUMN time_limit INT DEFAULT 10");
      console.log("Column added successfully.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Schema update failed:", err);
    process.exit(1);
  }
}

addTimeLimitColumn();
