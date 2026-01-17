const mysql = require('mysql2/promise');

async function checkMaterials() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    console.log("\n--- TOPICS ---");
    const [topics] = await connection.execute('SELECT id, name, subject_id FROM topics');
    console.log(JSON.stringify(topics, null, 2));

    console.log("\n--- MATERIALS ---");
    const [materials] = await connection.execute('SELECT id, title, type, topic_id FROM materials');
    console.log(JSON.stringify(materials, null, 2));
    
    if (materials.length === 0) {
        console.log("\n⚠️ No materials found in the database.");
    }

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

checkMaterials();
