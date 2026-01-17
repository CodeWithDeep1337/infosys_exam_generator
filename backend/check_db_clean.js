const mysql = require('mysql2/promise');

async function checkDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    console.log("--- COURSES TABLE SCHEMA ---");
    const [columns] = await connection.execute("DESCRIBE courses");
    columns.forEach(c => console.log(`${c.Field}: ${c.Type}`));

    console.log("\n--- COURSES DATA ---");
    const [rows] = await connection.execute('SELECT id, title, duration FROM courses');
    console.log(JSON.stringify(rows, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

checkDB();
