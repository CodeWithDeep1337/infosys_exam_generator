const db = require('./src/config/db');

async function updateSchema() {
  const connection = await db.getConnection();
  try {
    console.log("Connected...");

    // 1. Drop if exists (Reset)
    await connection.query("DROP TABLE IF EXISTS quiz_answers");

    // 2. Create Table without FKs first to avoid Type mismatch blocking creation
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
    console.log("✅ Table 'quiz_answers' created (without FKs).");

    // 3. Attempt to add FK for attempts
    try {
        await connection.query(`
            ALTER TABLE quiz_answers 
            ADD CONSTRAINT fk_answers_attempt 
            FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE
        `);
        console.log("✅ FK 'fk_answers_attempt' added.");
    } catch (e) {
        console.warn("⚠️ FK attempt_id failed (Type mismatch?). Retrying with UNSIGNED attempt_id...");
        // Modify column to Unsigned and retry
        await connection.query("ALTER TABLE quiz_answers MODIFY COLUMN attempt_id INT UNSIGNED NOT NULL");
        await connection.query(`
            ALTER TABLE quiz_answers 
            ADD CONSTRAINT fk_answers_attempt 
            FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE
        `);
        console.log("✅ FK 'fk_answers_attempt' added (Unsigned).");
    }

    // 4. Attempt to add FK for questions
    try {
        await connection.query(`
            ALTER TABLE quiz_answers 
            ADD CONSTRAINT fk_answers_question
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        `);
        console.log("✅ FK 'fk_answers_question' added.");
    } catch (e) {
         console.warn("⚠️ FK question_id failed. Retrying with UNSIGNED question_id...");
         await connection.query("ALTER TABLE quiz_answers MODIFY COLUMN question_id INT UNSIGNED NOT NULL");
         await connection.query(`
            ALTER TABLE quiz_answers 
            ADD CONSTRAINT fk_answers_question
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        `);
        console.log("✅ FK 'fk_answers_question' added (Unsigned).");
    }

    console.log("✅ Schema setup complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Critical Failure:", err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

updateSchema();
