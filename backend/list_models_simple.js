const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const models = response.data.models.map(m => m.name.replace("models/", ""));
    fs.writeFileSync("available_models.txt", models.join("\n"), "utf8");
    console.log("Written models to available_models.txt");
  } catch (err) {
    console.error("Failed", err.message);
  }
}

listModels();
