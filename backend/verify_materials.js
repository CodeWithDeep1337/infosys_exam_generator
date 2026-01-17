const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkMaterials() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "Deep123@sqL",
    database: process.env.DB_NAME || "skillforge",
  });

  try {
    const [materials] = await db.query("SELECT * FROM materials ORDER BY uploaded_at DESC LIMIT 5");
    console.log("Recent Materials:", JSON.stringify(materials, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    db.end();
  }
}

checkMaterials();
