const db = require('./src/config/db');

async function checkSchema() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM quizzes");
        console.log("Columns in quizzes table:", columns.map(c => c.Field));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
