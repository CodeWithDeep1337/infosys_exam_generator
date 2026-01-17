const mysql = require("mysql2/promise");
require("dotenv").config();

async function repairDatabase() {
  console.log("🔧 Starting Database Repair...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    console.log("✅ Connected to database.");

    // 1. Create Questions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          quiz_id BIGINT NOT NULL,
          question_text LONGTEXT NOT NULL,
          question_type VARCHAR(50),
          order_num INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
          INDEX idx_quiz (quiz_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table 'questions' created or verified.");

    // 2. Create Options Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS options (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          question_id BIGINT NOT NULL,
          option_text LONGTEXT NOT NULL,
          is_correct BOOLEAN DEFAULT FALSE,
          order_num INT,
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
          INDEX idx_question (question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table 'options' created or verified.");

    // 3. Create Quiz Attempts Table (Just in case)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          quiz_id BIGINT NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          score INT,
          total_questions INT,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
          INDEX idx_user (user_id),
          INDEX idx_quiz (quiz_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table 'quiz_attempts' created or verified.");

    console.log("🎉 Database structure repaired successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Repair Failed:", err);
    process.exit(1);
  }
}

repairDatabase();
