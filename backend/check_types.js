const db = require('./src/config/db');

async function checkTypes() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('quiz_attempts', 'questions')
      AND COLUMN_NAME = 'id'
    `);
    console.log(rows);
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTypes();
