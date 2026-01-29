import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Capture the key safely
const apiKey = "AIzaSyDVL7BAlFkG0WvG1xvbaXf_3cdeLLvc4fU";

// 2. DEBUG: Print it to the console (Safety Check)
// If it prints with quotes like "AIza...", that is the problem!
console.log("🔍 DEPLOYED KEY CHECK:", apiKey ? `Key exists. Starts with: ${apiKey.slice(0, 8)}` : "MISSING/UNDEFINED");

// 3. Setup the client
const genAI = new GoogleGenerativeAI(apiKey);

// 4. Define the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askAI = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I couldn't fetch the AI response right now.";
  }
};

export const parseSearchIntent = async (query) => {
  const prompt = `
    Analyze this movie search query: "${query}"
    Determine if the user is searching for:
    1. A specific movie TITLE (e.g. "Avengers", "Matrix", "Batman")
    2. A filtered DISCOVERY (e.g. "Funny movies from the 90s", "Scary French movies", "Tom Cruise action")
    
    Return ONLY a JSON object.
    Case 1 (Specific Title): { "type": "search", "query": "${query}" }
    Case 2 (Discovery/Filter): { "type": "discover", "primary_release_year": "YYYY", "with_genres": "genre_id", "sort_by": "popularity.desc" }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Intent Error:", error);
    return { type: "search", query: query };
  }
};