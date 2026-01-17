const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    console.log("--- QUIZ_ATTEMPTS ---");
    const [attemptsCols] = await connection.execute("DESCRIBE quiz_attempts");
    console.log(JSON.stringify(attemptsCols, null, 2));

    console.log("\n--- QUIZ_RESPONSES ---");
    // Check if this table exists or where responses are stored
    try {
        const [respCols] = await connection.execute("DESCRIBE quiz_responses");
        console.log(JSON.stringify(respCols, null, 2));
    } catch (e) {
        console.log("quiz_responses table might not exist.");
    }

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

checkSchema();
