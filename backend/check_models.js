const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // For listing models, we don't need a specific model instance
    // We need to access the model manager if available or just try a standard call
    // The SDK doesn't expose listModels directly on the main class easily in all versions.
    // Let's try a direct fetch or just test a known model.
    
    console.log("Checking available models...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        await model.generateContent("test");
        console.log("✅ gemini-1.5-flash is WORKING");
    } catch(e) {
        console.log("❌ gemini-1.5-flash failed:", e.message);
    }

    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    try {
        await modelPro.generateContent("test");
        console.log("✅ gemini-pro is WORKING");
    } catch(e) {
        console.log("❌ gemini-pro failed:", e.message);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();