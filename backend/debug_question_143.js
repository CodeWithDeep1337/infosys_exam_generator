const db = require('./src/config/db');

async function debugQuestion() {
  try {
    // Assuming Q2 has id 143 based on the logs
    const qId = 143; 

    const [questions] = await db.query("SELECT * FROM questions WHERE id = ?", [qId]);
    const [options] = await db.query("SELECT id, option_text, is_correct FROM options WHERE question_id = ?", [qId]);
    console.log("--- Options (Compact) ---");
    options.forEach(o => {
        console.log(`[${o.id}] ${o.option_text} (Correct: ${o.is_correct})`);
    });
    
    process.exit(0);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugQuestion();
