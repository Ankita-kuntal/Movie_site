import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ API Key is missing! Check Vercel settings.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 🛡️ RESUME OPTIMIZED LIST
// We put the working model FIRST so the console stays clean.
// The others are backups in case Google changes things later.
const MODEL_PRIORITY = [
  "gemini-2.5-flash-lite",  // ✅ Primary (Working for you now)
  "gemma-2-27b-it",         // 🛡️ High-limit backup
  "gemini-1.5-flash",       // 🛡️ Standard backup
  "gemini-2.0-flash-exp"    // 🛡️ Experimental backup
];

const generateWithFailover = async (prompt) => {
  for (const modelName of MODEL_PRIORITY) {
    try {
      // Use console.groupCollapsed to hide details unless clicked (Clean Console)
      console.groupCollapsed(`🤖 AI Request: Using ${modelName}`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("✅ Success!");
      console.groupEnd(); // Close the group
      return text; 

    } catch (error) {
      console.warn(`⚠️ ${modelName} hit a limit/error. Switching to next backup...`);
      console.groupEnd(); // Close the group even on error
      // Loop continues to the next model automatically...
    }
  }
  throw new Error("All AI models failed. Please try again later.");
};

export const askAI = async (prompt) => {
  try {
    return await generateWithFailover(prompt);
  } catch (error) {
    console.error("❌ AI Critical Failure:", error);
    return "Sorry, I couldn't fetch the AI response right now.";
  }
};

export const parseSearchIntent = async (query) => {
  try {
    const prompt = `
      Task: Analyze movie search query.
      Query: "${query}"
      Output JSON ONLY. Format: { "type": "search", "query": "..." }
    `;
    
    const text = await generateWithFailover(prompt);
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { type: "search", "query": query };
  } catch (error) {
    // Silent failover for search intent (user doesn't need to know)
    return { type: "search", query: query };
  }
};