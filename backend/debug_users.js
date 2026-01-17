const mysql = require('mysql2/promise');

async function listUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    const [rows] = await connection.execute("SELECT id, username, role FROM users");
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

listUsers();
