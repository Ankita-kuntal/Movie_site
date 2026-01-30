import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Get the key from the .env file
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. Safety Check
if (!apiKey) {
  console.error("❌ API Key is missing! Check your .env file.");
}

// 3. Setup the client
const genAI = new GoogleGenerativeAI(apiKey);

// 4. ✅ USE THIS EXACT MODEL: "gemini-2.5-flash-lite"
// (Your screenshot proves this is the one available to you)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const askAI = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I couldn't fetch the AI response right now. (Quota or Network Error)";
  }
};

export const parseSearchIntent = async (query) => {
  try {
    // Simplified prompt for the Lite model
    const prompt = `Analyze: "${query}". Return JSON: { "type": "search", "query": "${query}" }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Intent Error:", error);
    return { type: "search", query: query };
  }
};