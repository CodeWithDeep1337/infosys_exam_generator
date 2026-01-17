const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    const tables = ['subjects', 'topics', 'materials'];
    for (const table of tables) {
        console.log(`\n--- ${table.toUpperCase()} SCHEMA ---`);
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        const hasCreatedAt = columns.some(c => c.Field === 'created_at');
        console.log(`Has created_at: ${hasCreatedAt}`);
        if(!hasCreatedAt) {
            columns.forEach(c => console.log(`${c.Field}: ${c.Type}`));
        }
    }

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

checkSchema();
