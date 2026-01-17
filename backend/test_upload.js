const axios = require("axios");
const FormData = require("form-data");

async function testUpload() {
    try {
        const form = new FormData();
        form.append("title", "Test YouTube Video");
        form.append("type", "YOUTUBE");
        form.append("topicId", "1"); // Assuming Topic 1 exists
        form.append("url", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

        const res = await axios.post("http://localhost:8081/api/materials/upload", form, {
            headers: {
                ...form.getHeaders(),
                // Add Authorization if needed (Login first?)
                // Java backend might require token.
            }
        });
        console.log("Upload Success:", res.data);
    } catch (err) {
        console.error("Upload Failed:", err.response ? err.response.data : err.message);
    }
}

// Login to get token first if needed
testUpload();
