const db = require('./src/config/db');

async function fixQuiz() {
  try {
    // Manually set 'None' as correct for Q143 (Question ID from logs/screenshot context)
    // Adjust logic to be safer: Find option with text "None" for Question 143
    const qId = 143;
    
    // First, verify we have such an option
    const [opts] = await db.query("SELECT id FROM options WHERE question_id = ? AND option_text LIKE '%None%'", [qId]);
    
    if (opts.length > 0) {
        await db.query("UPDATE options SET is_correct = 1 WHERE id = ?", [opts[0].id]);
        console.log(`Updated Option ${opts[0].id} to be Correct.`);
    } else {
        console.log("Option 'None' not found for Q", qId);
    }
    
    // Also Check Q1 (ID 142) - Correct Answer should be "[1, 2, 3]"
    // Student answered "Error" (Wrong).
    // Ensure "[1, 2, 3]" is marked correct in DB so we know what IS correct.
    const q1Id = 142;
    const [opts1] = await db.query("SELECT id FROM options WHERE question_id = ? AND option_text LIKE '%[1, 2, 3]%'", [q1Id]);
    if (opts1.length > 0) {
         await db.query("UPDATE options SET is_correct = 1 WHERE id = ?", [opts1[0].id]);
         console.log(`Updated Option ${opts1[0].id} to be Correct (Q1).`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixQuiz();
