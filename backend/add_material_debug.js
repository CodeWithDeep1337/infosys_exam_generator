const axios = require('axios');

const API_URL = 'http://localhost:8081/api';

async function addDummyMaterial() {
    try {
        // 1. Get all topics first to find a valid topic ID
        const topicsRes = await axios.get(`${API_URL}/topics`);
        const topics = topicsRes.data;

        if (topics.length === 0) {
            console.log('No topics found. Create a topic first.');
            return;
        }

        const topicId = topics[0].id; // Use the first available topic
        console.log(`Adding material to Topic ID: ${topicId} (${topics[0].name})`);

        // 2. Add a link material
        const materialData = {
            title: "Test Material Link",
            type: "LINK",
            topicId: topicId,
            url: "https://example.com",
            file: null // Not needed for LINK
        };
        
        // Since the endpoint is @PostMapping("/upload") and takes @RequestParam, we need to use FormData or appropriate encoding if using axios post directly with JSON might fail if it expects multipart.
        // However, standard axios post with URLSearchParams or FormData is safer for RequestParam.
        
        // Let's try sending as FormData since the controller expects MultipartFile optional and @RequestParams
        const formData = new FormData();
        formData.append('title', "Test Material Link");
        formData.append('type', "LINK");
        formData.append('topicId', topicId);
        formData.append('url', "https://example.com");

        const res = await axios.post(`${API_URL}/materials/upload`, formData, {
             headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Material added successfully:', res.data);

    } catch (error) {
        console.error('Error adding material:', error.response ? error.response.data : error.message);
    }
}

addDummyMaterial();
