// check_models.js
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is missing in .env file");
  process.exit(1);
}

async function listModels() {
  // We hit the API endpoint directly to bypass SDK version issues
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url); // Requires Node.js 18+
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log("\n============= AVAILABLE MODELS =============");
    
    // Filter only models that support text generation (chat)
    const chatModels = data.models?.filter(m => 
        m.supportedGenerationMethods.includes("generateContent")
    );

    if (chatModels && chatModels.length > 0) {
        chatModels.forEach(model => {
            console.log(`ID: ${model.name}`); // This is what we need (e.g. models/gemini-pro)
            console.log(`Name: ${model.displayName}`);
            console.log("--------------------------------------------");
        });
    } else {
        console.log("No text generation models found for this API key.");
    }
    console.log("============================================\n");

  } catch (error) {
    console.error("Failed to fetch models:", error.message);
  }
}

listModels();