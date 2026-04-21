const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: listModels is not directly on genAI in some versions, 
    // it's usually accessed via a client or just not available in the simple SDK.
    // Actually, in @google/generative-ai, there isn't a direct listModels tool.
    // It's a REST API thing.
    console.log("Checking model 'gemini-1.5-flash'...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
       console.error("Details:", await err.response.json());
    }
  }
}

listModels();
