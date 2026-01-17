const mysql = require("mysql2/promise");
require("dotenv").config();

async function listUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await connection.query("SELECT id, username, role FROM users");
    console.log("Existing Users:", rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

listUsers();
