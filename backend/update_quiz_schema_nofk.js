const db = require('./src/config/db');

async function updateSchema() {
  const connection = await db.getConnection();
  try {
    console.log("Connected...");
    await connection.query("DROP TABLE IF EXISTS quiz_answers");

    await connection.query(`
      CREATE TABLE quiz_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        user_answer TEXT,
        is_correct BOOLEAN DEFAULT NULL, 
        manual_score INT DEFAULT 0
      )
    `);
    console.log("✅ Table 'quiz_answers' created successfully (No FKs).");
    process.exit(0);
  } catch (err) {
    console.error("❌ Schema update failed:", err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

updateSchema();
