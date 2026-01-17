const db = require('./src/config/db');

async function checkLatestQuiz() {
  try {
    const [rows] = await db.query("SELECT id, title, time_limit, created_at FROM quizzes ORDER BY id DESC LIMIT 1");
    console.log("Latest Quiz:", rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkLatestQuiz();
