const mysql = require('mysql2/promise');

async function checkSubjects() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    console.log("--- SUBJECTS FOR COURSE 1 ---");
    const [rows] = await connection.execute('SELECT * FROM subjects WHERE course_id = 1');
    console.log(JSON.stringify(rows, null, 2));

    console.log("\n--- ALL SUBJECTS ---");
    const [all] = await connection.execute('SELECT id, name, course_id FROM subjects');
    console.log(JSON.stringify(all, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

checkSubjects();
