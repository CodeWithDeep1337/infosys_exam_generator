const db = require('./src/config/db');

async function checkAttempt() {
  try {
    const attemptId = 60; // From screenshot
    // Fetch answers for this attempt
    const [rows] = await db.query(`
      SELECT qa.id, qa.question_id, qa.user_answer, qa.is_correct, qa.manual_score, 
             q.question_text, q.correct_answer, q.question_type
      FROM quiz_answers qa
      JOIN questions q ON qa.question_id = q.id
      WHERE qa.attempt_id = ?
    `, [attemptId]);

    // Also fetch correct options for these questions to see what it compared against
    if (rows.length > 0) {
        const questionIds = rows.map(r => r.question_id);
        const [options] = await db.query(`
            SELECT question_id, option_text, is_correct 
            FROM options 
            WHERE question_id IN (?) AND is_correct = 1
        `, [questionIds]);
        
        console.log("--- Correct Options in DB ---");
        console.log(JSON.stringify(options, null, 2));
    }

    console.log(`\n--- Answers for Attempt #${attemptId} ---`);
    console.log(JSON.stringify(rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAttempt();
