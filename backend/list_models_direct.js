const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function checkAvailableModels() {
  // Access the API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env");
    return;
  }

  // Create a custom fetch implementation if needed, but standard SDK should work for listModels
  // We will use the REST API directly to avoid SDK abstraction hiding the error details for list_models
  // or just try the SDK's model manager if exposed. 
  // actually, the SDK doesn't expose listModels easily on the client object in v0.1.
  
  // Let's use a direct fetch to the API to see what's allowed.
  // This bypasses SDK version issues.
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        console.error("❌ API Error:", data.error.message);
    } else if (data.models) {
        console.log("✅ Available Models for this Key:");
        data.models.forEach(m => {
            // Filter for 'generateContent' supported models
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(` - ${m.name} (Version: ${m.version})`);
            }
        });
    } else {
        console.log("❓ No models found in response:", data);
    }
  } catch (error) {
    console.error("❌ Network/Script Error:", error);
  }
}

checkAvailableModels();