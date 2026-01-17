const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

const tests = [
  { model: "gemini-1.5-flash", version: "v1beta" },
  { model: "gemini-1.5-flash-001", version: "v1beta" },
  { model: "gemini-pro", version: "v1beta" },
  { model: "gemini-pro", version: "v1" },
  { model: "gemini-1.0-pro", version: "v1beta" }
];

async function testModel(model, version) {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`;
  console.log(`\n🔍 Testing ${model} (${version})...`);
  
  try {
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: "Hello" }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(`✅ SUCCESS: ${model} (${version}) works!`);
    return { model, version, success: true };
  } catch (err) {
    console.log(`❌ FAILED: ${model} (${version}) - ${err.response?.status || err.message}`);
    if (err.response?.data?.error?.message) {
        console.log(`   Msg: ${err.response.data.error.message.substring(0, 100)}...`);
    }
    return { model, version, success: false };
  }
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  console.log(`\n🔍 Listing available models for this Key...`);
  
  try {
    const response = await axios.get(url);
    console.log("✅ API Key is Valid! Available Models:");
    const models = response.data.models.map(m => m.name.replace("models/", ""));
    console.log(models.join(", "));
    
    // Check for Flash
    const flash = models.find(m => m.includes("flash"));
    if (flash) {
        console.log(`\n✨ Recommend using: ${flash}`);
    } else {
        console.log(`\n✨ Recommend using: ${models[0]}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to list models.");
    if (err.response) {
       console.error(`   Status: ${err.response.status}`);
       console.error(`   Message: ${JSON.stringify(err.response.data)}`);
    } else {
       console.error(`   Error: ${err.message}`);
    }
    process.exit(1);
  }
}

listModels();
