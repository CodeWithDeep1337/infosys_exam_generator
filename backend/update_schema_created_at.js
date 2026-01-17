const mysql = require('mysql2/promise');

async function updateSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    console.log("Adding created_at column to tables...");

    const tables = ['subjects', 'topics', 'materials'];
    for (const table of tables) {
        try {
            await connection.execute(`ALTER TABLE ${table} ADD COLUMN created_at DATETIME DEFAULT NULL`);
            console.log(`✅ Added created_at to ${table}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`⚠️ created_at already exists in ${table}`);
            } else {
                console.error(`❌ Error updating ${table}:`, err.message);
            }
        }
    }

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

updateSchema();
