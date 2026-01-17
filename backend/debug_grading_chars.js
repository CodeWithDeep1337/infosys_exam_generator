const db = require('./src/config/db');

async function debugLastAttempt() {
    try {
        const [attempts] = await db.query("SELECT id FROM quiz_attempts ORDER BY id DESC LIMIT 1");
        if (attempts.length === 0) { console.log("No attempts."); process.exit(0); }
        const attemptId = attempts[0].id;
        console.log(`Checking Attempt ID: ${attemptId}`);

        const [rows] = await db.query(`
            SELECT qa.id, qa.user_answer, q.id as question_id, q.question_type, q.correct_answer 
            FROM quiz_answers qa JOIN questions q ON qa.question_id = q.id 
            WHERE qa.attempt_id = ?
        `, [attemptId]);

        const questionIds = rows.filter(r => r.question_type === 'MCQ').map(r => r.question_id);
        let mcqMap = {};
        if (questionIds.length > 0) {
            const [opts] = await db.query(`SELECT question_id, option_text FROM options WHERE question_id IN (?) AND is_correct = 1`, [questionIds]);
            opts.forEach(o => mcqMap[o.question_id] = o.option_text);
        }

        rows.forEach(row => {
            const correctAnswer = row.question_type === 'MCQ' ? mcqMap[row.question_id] : row.correct_answer;
            const ua = row.user_answer || "";
            const ca = correctAnswer || "";

            if (ua.includes("extend") || ca.includes("extend")) {
                console.log(`\nMatch Found (Q${row.question_id}):`);
                console.log(`UA: "${ua}"`);
                console.log(`CA: "${ca}"`);
                console.log(`Is Correct: ${row.is_correct}`); // 1 or 0
                // Check manual_score if it exists in the query logic (needs to be selected)
                // Need to restart query to include manual_score in SELECT if missing.
                // Assuming SELECT * was used or updated.
                // Re-doing query in script for safety.
            }
        });
        process.exit(0);
    } catch (err) { console.error(err); process.exit(1); }
}

async function checkSpecificAttempt() {
    const attemptId = 8;
    console.log(`Checking Attempt ${attemptId} specifically for 'extend'`);
    const [rows] = await db.query(`
        SELECT qa.id, qa.user_answer, qa.is_correct, qa.manual_score, q.question_text, q.correct_answer 
        FROM quiz_answers qa JOIN questions q ON qa.question_id = q.id 
        WHERE qa.attempt_id = ?
    `, [attemptId]);
    
    rows.forEach(r => {
        if (r.user_answer.includes("extend")) {
             console.log(`Q: ${r.question_text}`);
             console.log(`UA: ${r.user_answer}`);
             console.log(`Correct: ${r.is_correct}`);
             console.log(`Score: ${r.manual_score}`);
        }
    });
    process.exit(0);
}

checkSpecificAttempt();
