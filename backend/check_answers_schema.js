const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    const [columns] = await connection.execute("DESCRIBE quiz_answers");
    console.log("SCHEMA quiz_answers:");
    columns.forEach(c => console.log(`${c.Field}: ${c.Type}`));
  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}
checkSchema();
