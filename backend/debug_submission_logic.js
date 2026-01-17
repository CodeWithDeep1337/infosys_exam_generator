const db = require('./src/config/db');

async function debugSubmissionLogic() {
  try {
    const quizId = 30; // The quiz in question

    console.log(`Testing logic for Quiz ID: ${quizId}`);

    // 1. Fetch Questions
    const [questions] = await db.query(
        "SELECT id, question_type, correct_answer FROM questions WHERE quiz_id = ?",
        [quizId]
    );
    console.log(`Found ${questions.length} questions.`);

    // 2. Fetch MCQ Correct Options (The Fixed Query)
    const [correctOptions] = await db.query(`
        SELECT o.question_id, o.option_text 
        FROM options o
        JOIN questions q ON o.question_id = q.id
        WHERE q.quiz_id = ? AND o.is_correct = 1
    `, [quizId]);
    
    console.log(`Found ${correctOptions.length} correct options via JOIN.`);
    console.log(JSON.stringify(correctOptions, null, 2));

    // 3. Simulate Map Creation
    const mcqKeys = {};
    correctOptions.forEach(opt => {
        mcqKeys[opt.question_id] = opt.option_text;
    });
    console.log("MCQ Keys Map:", JSON.stringify(mcqKeys, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugSubmissionLogic();
