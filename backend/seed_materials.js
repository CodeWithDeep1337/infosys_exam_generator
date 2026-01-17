const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndSeedMaterials() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log("✅ Connected to DB");

        // 1. Find the topic 'list' or similar
        const [topics] = await connection.query("SELECT * FROM topics WHERE name LIKE '%list%' OR name LIKE '%python%'");
        console.log("🔍 Topics Found:", topics);

        if (topics.length === 0) {
            console.log("❌ No relevant topics found to seed materials for.");
            return;
        }

        // 2. Check materials for these topics
        for (const topic of topics) {
            const [materials] = await connection.query("SELECT * FROM materials WHERE topic_id = ?", [topic.id]);
            console.log(`Resource check for Topic '${topic.name}' (ID: ${topic.id}): Found ${materials.length} items.`);
            
            if (materials.length === 0) {
                console.log(`⚠️ No materials for Topic '${topic.name}'. Seeding dummy data...`);
                
                // Using explicit values and checking for proper quoting
                try {
                    await connection.query(`
                        INSERT INTO materials (title, type, link, topic_id, file_path, file_type, uploaded_at) 
                        VALUES 
                        (?, 'LINK', ?, ?, ?, 'LINK', NOW()),
                        (?, 'YOUTUBE', ?, ?, ?, 'YOUTUBE', NOW()),
                        (?, 'PDF', NULL, ?, ?, 'PDF', NOW())
                    `, [
                        'Introduction to Lists', 'https://docs.python.org/3/tutorial/datastructures.html', topic.id, 'https://docs.python.org/3/tutorial/datastructures.html',
                        'List Methods Video', 'https://youtube.com/watch?v=ohCDkTgAFfk', topic.id, 'https://youtube.com/watch?v=ohCDkTgAFfk',
                        'Advanced List PDF', topic.id, 'dummy_list.pdf'
                    ]);
                    console.log("✅ Seeded 3 materials for " + topic.name);
                } catch (insertErr) {
                    console.error("❌ Insert Fail: " + insertErr.message);
                }
            }
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        if(connection) await connection.end();
    }
}

checkAndSeedMaterials();
