const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Deep123@sqL',
    database: process.env.DB_NAME || 'skillforge',
};

// Actual files present in uploads folder
const pdfFiles = [
    '7e63b1ca-f41c-4afb-bef2-73126646da2f_SQL_Lab_Manual.pdf',
    'b0d1e448-06b1-4eb3-866e-48a79a412c65_06012026102053AM.pdf'
];

async function fixMaterials() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database.');

        // 1. Get all PDF materials
        const [rows] = await connection.execute("SELECT id, title, type FROM materials WHERE type = 'PDF'");
        
        if (rows.length === 0) {
            console.log('No PDF materials found to fix.');
            return;
        }

        console.log(`Found ${rows.length} PDF materials.`);

        // 2. Update them with valid file paths
        for (let i = 0; i < rows.length; i++) {
            const material = rows[i];
            const validFile = pdfFiles[i % pdfFiles.length]; // Cycle through valid files
            
            await connection.execute(
                "UPDATE materials SET file_path = ?, file_type = 'PDF' WHERE id = ?",
                [validFile, material.id]
            );
            console.log(`Updated Material ID ${material.id} ('${material.title}') -> ${validFile}`);
        }

        console.log('✅ Successfully updated all PDF links.');

    } catch (error) {
        console.error('❌ Error updating materials:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixMaterials();
