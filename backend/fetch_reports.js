const jwt = require("jsonwebtoken");
require("dotenv").config();

async function fetchReports() {
    // Generate Token
    const token = jwt.sign(
        { id: 1, role: "INSTRUCTOR", username: "InstructorUser" }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
    );

    try {
        const response = await fetch("http://localhost:8080/api/quiz/reports", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("API Status:", response.status);
        console.log("API Data:", JSON.stringify(data));
    } catch (err) {
        console.error("Fetch Error:", err.cause || err);
    }
}
fetchReports();
