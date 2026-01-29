import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Setup the client with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 2. Define the model we will use (Gemini 1.5 Flash is fast and cheap/free)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * A helper function to ask the AI a question.
 * @param {string} prompt - The question or instruction for the AI.
 * @returns {Promise<string>} - The AI's text answer.
 */
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
    
    Case 1 (Specific Title):
    { "type": "search", "query": "${query}" }
    
    Case 2 (Discovery/Filter):
    { 
      "type": "discover",
      "primary_release_year": "YYYY", (optional)
      "with_genres": "genre_id", (optional, map: Action=28, Comedy=35, Horror=27, Drama=18, SciFi=878, Romance=10749, Thriller=53)
      "sort_by": "popularity.desc"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Intent Error:", error);
    // Fallback: If AI fails, just treat it as a normal search title
    return { type: "search", query: query };
  }
};