const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function dumpSchema() {
  try {
    console.log("Fetching table list...");
    const [tables] = await db.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    let sqlContent = `-- Complete Project Schema Dump\n-- Generated on ${new Date().toISOString()}\n\n`;

    // Disable foreign key checks to avoid ordering issues
    sqlContent += "SET FOREIGN_KEY_CHECKS = 0;\n\n";

    for (const tableName of tableNames) {
        console.log(`Fetching schema for: ${tableName}`);
        const [createRows] = await db.query(`SHOW CREATE TABLE ${tableName}`);
        const createSql = createRows[0]['Create Table'];
        sqlContent += `-- Table structure for ${tableName}\n`;
        sqlContent += `${createSql};\n\n`;
    }

    // Re-enable foreign key checks
    sqlContent += "SET FOREIGN_KEY_CHECKS = 1;\n";

    const outputPath = path.join(__dirname, 'schema_complete.sql');
    fs.writeFileSync(outputPath, sqlContent);
    
    console.log(`Schema saved to: ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpSchema();
