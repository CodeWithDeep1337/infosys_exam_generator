const db = require('./src/config/db');

async function regradeAttempt() {
  try {
    const attemptId = 60; 
    const quizId = 30;

    console.log(`Re-grading Attempt #${attemptId}...`);

    // 0. Get Questions (for Short Answer keys)
    const [questions] = await db.query("SELECT id, question_type, correct_answer FROM questions WHERE quiz_id = ?", [quizId]);
    const saMap = {};
    questions.forEach(q => {
        if (q.question_type !== 'MCQ') saMap[q.id] = q.correct_answer;
    });

    // 1. Get Correct Mock Map (MCQ)
    const [correctOptions] = await db.query(`
        SELECT o.question_id, o.option_text 
        FROM options o
        JOIN questions q ON o.question_id = q.id
        WHERE q.quiz_id = ? AND o.is_correct = 1
    `, [quizId]);

    const correctMap = {};
    correctOptions.forEach(o => correctMap[o.question_id] = o.option_text);
    
    // 2. Get User Answers
    const [answers] = await db.query("SELECT id, question_id, user_answer FROM quiz_answers WHERE attempt_id = ?", [attemptId]);
    
    let totalScore = 0;
    const normalize = (str) => String(str || "").trim().toLowerCase();

    for (const ans of answers) {
        // Check MCQ map first, fallback to Short Answer map
        const correctText = correctMap[ans.question_id] || saMap[ans.question_id];
        let isCorrect = 0;
        
        if (correctText && normalize(ans.user_answer) === normalize(correctText)) {
            isCorrect = 1;
            totalScore += 1; // Assuming 1 point per question
            console.log(`Question ${ans.question_id}: Correct! (${ans.user_answer})`);
        } else {
            console.log(`Question ${ans.question_id}: Wrong. (User: ${ans.user_answer} vs Correct: ${correctText})`);
        }

        // Update Answer: Set is_correct and RESET manual_score to NULL to allow auto-grading to show
        await db.query("UPDATE quiz_answers SET is_correct = ?, manual_score = NULL WHERE id = ?", [isCorrect, ans.id]);
    }

    // 3. Update Attempt Score
    await db.query("UPDATE quiz_attempts SET score = ? WHERE id = ?", [totalScore, attemptId]);
    console.log(`Attempt #${attemptId} re-graded. New Score: ${totalScore}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

regradeAttempt();
