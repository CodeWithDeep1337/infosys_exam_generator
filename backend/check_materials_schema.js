const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log("Connected to DB");
        const [columns] = await db.query("SHOW COLUMNS FROM materials");
        columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
        await db.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkSchema();
