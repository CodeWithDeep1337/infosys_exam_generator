const db = require('./src/config/db');

async function resetDatabase() {
  try {
    console.log("Starting database reset...");
    
    // Disable FK checks
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    console.log("Foreign key checks disabled.");

    // Get table list
    const [tables] = await db.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (tableNames.length === 0) {
        console.log("No tables found.");
        return;
    }

    console.log(`Found ${tableNames.length} tables. Truncating...`);

    for (const tableName of tableNames) {
        try {
            // Using TRUNCATE which resets auto-increment and is faster
            await db.query(`TRUNCATE TABLE ${tableName}`);
            console.log(`- Truncated ${tableName}`);
        } catch (err) {
            console.error(`Failed to truncate ${tableName}: ${err.message}. Trying DELETE FROM...`);
            // Fallback to DELETE FROM if TRUNCATE fails (though with FK checks off, TRUNCATE usually works)
            await db.query(`DELETE FROM ${tableName}`);
            console.log(`- Deleted from ${tableName}`);
        }
    }

    // specific seed for admin if needed? User said "test from scratch", so maybe empty is fine. 
    // Usually one needs at least one admin account.
    // But the user said "remove all users course all things". So I will leave it empty.

    // Re-enable FK checks
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Foreign key checks enabled.");
    
    console.log("Database reset complete. All data cleared.");
    process.exit(0);

  } catch (err) {
    console.error("Critical Error during reset:", err);
    process.exit(1);
  }
}

resetDatabase();
