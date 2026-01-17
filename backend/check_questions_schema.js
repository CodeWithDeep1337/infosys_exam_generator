
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
    const [columns] = await connection.execute("DESCRIBE questions");
    console.log("SCHEMA questions:");
    columns.forEach(c => console.log(`${c.Field}: ${c.Type} (Null: ${c.Null}, Key: ${c.Key})`));
  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}
checkSchema();
