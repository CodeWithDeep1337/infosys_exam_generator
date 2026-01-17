const db = require('./src/config/db');

async function checkSchema() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("DESCRIBE quiz_attempts");
    console.log(rows);
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
