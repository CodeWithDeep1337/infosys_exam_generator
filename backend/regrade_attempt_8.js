const db = require('./src/config/db');

async function regradeAttempt8() {
    try {
        const attemptId = 8;
        console.log(`Regrading Attempt ID: ${attemptId}`);

        // Get answers
        const [rows] = await db.query(`
            SELECT qa.id, qa.user_answer, qa.question_id, qa.manual_score, q.question_type, q.correct_answer, q.points, qa.is_correct
            FROM quiz_answers qa 
            JOIN questions q ON qa.question_id = q.id 
            WHERE qa.attempt_id = ?
        `, [attemptId]);

        // Get options
        const questionIds = rows.filter(r => r.question_type === 'MCQ').map(r => r.question_id);
        let mcqMap = {};
        if (questionIds.length > 0) {
            const [opts] = await db.query(`SELECT question_id, option_text FROM options WHERE question_id IN (?) AND is_correct = 1`, [questionIds]);
            opts.forEach(o => mcqMap[o.question_id] = o.option_text);
        }

        const normalize = (str) => String(str || "").replace(/\s+/g, ' ').trim().toLowerCase();
        let changed = false;

        for (const row of rows) {
            const correctText = row.question_type === 'MCQ' ? mcqMap[row.question_id] : row.correct_answer;
            const ua = row.user_answer || "";
            const isMatch = normalize(ua) === normalize(correctText);
            
            // Fix if match BUT (not correct OR manual_score is 0)
            if (isMatch && (!row.is_correct || row.manual_score === 0)) {
                console.log(`Fixing Q${row.question_id}: "${ua}" matched "${correctText}"`);
                await db.query("UPDATE quiz_answers SET is_correct = 1, manual_score = ? WHERE id = ?", [row.points || 1, row.id]);
                changed = true;
            }
        }

        if (changed) {
            // Recalculate Total
            const [scoreRows] = await db.query(`
                SELECT SUM(COALESCE(manual_score, CASE WHEN is_correct = 1 THEN 1 ELSE 0 END)) as total 
                FROM quiz_answers WHERE attempt_id = ?
            `, [attemptId]);
            const newScore = scoreRows[0].total || 0;
            const newPct = Math.round((newScore / rows.length) * 100); // Simple % calculation
             await db.query("UPDATE quiz_attempts SET score = ? WHERE id = ?", [newPct, attemptId]);
             console.log(`Attempt ${attemptId} updated. New Score: ${newPct}%`);
        } else {
            console.log("No changes needed.");
        }

        process.exit(0);
    } catch (err) { console.error(err); process.exit(1); }
}

regradeAttempt8();
