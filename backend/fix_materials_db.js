const mysql = require('mysql2/promise');

async function fixMaterials() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    // 1. Get all topics
    const [topics] = await connection.execute('SELECT id, name FROM topics');
    console.log(`Found ${topics.length} topics.`);

    for (const topic of topics) {
        // 2. Check if material exists
        const [materials] = await connection.execute('SELECT id FROM materials WHERE topic_id = ?', [topic.id]);
        
        if (materials.length === 0) {
            console.log(`Topic "${topic.name}" (ID: ${topic.id}) has NO materials. Inserting dummy material...`);
            
            const title = `Intro to ${topic.name}`;
            const type = 'LINK'; // ENUM('VIDEO', 'PDF', 'LINK', 'YOUTUBE')
            const link = 'https://www.google.com';
            const fileType = 'LINK';
            const filePath = 'https://www.google.com';

            await connection.execute(
                'INSERT INTO materials (topic_id, title, type, link, file_type, file_path, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [topic.id, title, type, link, fileType, filePath]
            );
            console.log(`✅  Added material for topic ${topic.id}`);
        } else {
            console.log(`Topic "${topic.name}" (ID: ${topic.id}) already has ${materials.length} materials.`);
        }
    }

    console.log("\n--- FINAL MATERIAL COUNT ---");
    const [allMaterials] = await connection.execute('SELECT COUNT(*) as count FROM materials');
    console.log(`Total Materials: ${allMaterials[0].count}`);

  } catch (error) {
    console.error("Error fixing materials:", error);
  } finally {
    connection.end();
  }
}

fixMaterials();
