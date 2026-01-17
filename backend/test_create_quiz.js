```javascript
const axios = require('axios');
const db = require('./src/config/db');

async function testCreate() {
    try {
        // - [x] Verify Quiz Timer Persistence (Fixed and Verified)
        console.log("Creating quiz with timeLimit: 8...");
        
        // This relies on the server running on port 5000 (default for Node)
        // If it runs on 3000 or 8080, adjust. User has "npm start (backend)" running.
        // Assuming localhost:5000 based on previous context.
        
        const payload = {
            title: "API Test Quiz 8min",
            subject_id: 1,
            description: "Test",
            difficulty: "Medium",
            questions: [{
                question: "Test Q?",
                options: ["A", "B"],
                correctAnswer: "A"
            }],
            timeLimit: 8,
            created_by: 1
        };

        const res = await axios.post('http://localhost:8080/api/quizzes/create', payload);
        console.log("Create Response:", res.status, res.data);

        // Check DB
        const [rows] = await db.query("SELECT id, title, time_limit FROM quizzes WHERE id = ?", [res.data.quizId]);
        console.log("DB Record:", rows[0]);
        
        if (rows[0].time_limit === 8) {
            console.log("SUCCESS: Backend saved 8 correctly.");
        } else {
            console.log("FAILURE: Backend saved " + rows[0].time_limit);
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) console.error("Response:", err.response.data);
        process.exit(1);
    }
}

testCreate();
