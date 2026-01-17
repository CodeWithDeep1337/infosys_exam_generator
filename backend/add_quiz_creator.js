const mysql = require('mysql2/promise');

async function updateSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    // Check if column exists
    const [columns] = await connection.execute("SHOW COLUMNS FROM quizzes LIKE 'created_by'");
    
    if (columns.length === 0) {
      console.log("Adding created_by column...");
      await connection.execute("ALTER TABLE quizzes ADD COLUMN created_by INT DEFAULT NULL");
      // Add foreign key constraint if users table uses id as INT
      // await connection.execute("ALTER TABLE quizzes ADD CONSTRAINT fk_quiz_creator FOREIGN KEY (created_by) REFERENCES users(id)");
      console.log("Column added.");
    } else {
      console.log("Column created_by already exists.");
    }

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

updateSchema();
