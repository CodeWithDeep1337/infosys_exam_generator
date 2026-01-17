const db = require('./src/config/db');

async function checkSchema() {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM quiz_answers");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
