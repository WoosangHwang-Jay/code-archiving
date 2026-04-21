const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local
if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }
  
  // Note: @google/generative-ai doesn't expose a listModels method directly on the main class.
  // It's usually done via the REST API or we check a few common names.
  const commonModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.1-flash'
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  
  console.log("Checking model availability...");
  for (const modelName of commonModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Use a very cheap call to check status
      await model.generateContent("hi", { timeout: 5000 });
      console.log(`[OK] ${modelName}`);
    } catch (err) {
      console.log(`[FAIL] ${modelName}: ${err.message}`);
    }
  }
}

listModels();
