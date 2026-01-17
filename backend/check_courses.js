const mysql = require('mysql2/promise');

async function checkCourses() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM courses');
    console.log("Courses in DB:", JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
        const [subjects] = await connection.execute('SELECT * FROM subjects');
        console.log("Subjects in DB:", JSON.stringify(subjects, null, 2));
    }

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

checkCourses();
