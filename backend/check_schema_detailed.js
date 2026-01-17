const db = require('./src/config/db');

async function checkSchema() {
  try {
    const connection = await db.getConnection();
    const [attempts] = await connection.query("SHOW CREATE TABLE quiz_attempts");
    console.log("APPROX_SCHEMA_ATTEMPTS:", JSON.stringify(attempts, null, 2));
    
    const [questions] = await connection.query("SHOW CREATE TABLE questions");
    console.log("APPROX_SCHEMA_QUESTIONS:", JSON.stringify(questions, null, 2));

    connection.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
