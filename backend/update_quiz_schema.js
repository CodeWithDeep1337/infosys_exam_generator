const db = require('./src/config/db');

async function updateSchema() {
  try {
    const connection = await db.getConnection();
    console.log("Connected to DB...");

    // Create quiz_answers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        user_answer TEXT,
        is_correct BOOLEAN DEFAULT NULL,
        manual_score INT DEFAULT 0,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Table 'quiz_answers' checked/created.");

    // Ensure question_type in questions table is valid (ENUM or VARCHAR)
    // We'll just trust it's VARCHAR or wide enough based on previous interaction.
    
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error("❌ Schema update failed:", err);
    process.exit(1);
  }
}

updateSchema();
