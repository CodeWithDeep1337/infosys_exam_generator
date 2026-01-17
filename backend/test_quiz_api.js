const axios = require('axios');

async function testQuizApi() {
    const quizId = 11; // From user screenshot
    const url = `http://localhost:8080/api/quiz/${quizId}`;

    console.log(`📡 Fetching Quiz ${quizId} from ${url}...`);

    try {
        const start = Date.now();
        const res = await axios.get(url);
        const duration = Date.now() - start;
        
        console.log(`✅ Success! (took ${duration}ms)`);
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(res.data, null, 2).substring(0, 200) + "...");
    } catch (err) {
        console.error("❌ Error:");
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error("Data:", err.response.data);
        } else if (err.request) {
            console.error("No response received (Server might be hanging or down)");
        } else {
            console.error("Setup Error:", err.message);
        }
    }
}

testQuizApi();
