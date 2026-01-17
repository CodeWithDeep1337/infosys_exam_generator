const axios = require('axios');

async function testApi() {
  try {
    console.log("Fetching http://localhost:8081/api/courses ...");
    const res = await axios.get('http://localhost:8081/api/courses');
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log("Error Status:", error.response.status);
      console.log("Error Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testApi();
