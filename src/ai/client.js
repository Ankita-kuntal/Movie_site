import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ API Key is missing. AI features disabled.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ✅ CONFIRMED MODELS FROM YOUR LIST
const MODEL_PRIORITY = [
  "gemini-2.5-flash",       // ✅ You have this (Stable)
  "gemini-2.0-flash",       // ✅ You have this (Backup)
  "gemini-flash-latest"     // ✅ You have this (Safe Fallback)
];

// 🛡️ MANUAL FALLBACK MAP (The "Mini Brain")
const GENRE_KEYWORDS = {
  "funny": "35", "comedy": "35", "comedies": "35",
  "scary": "27", "horror": "27", "creepy": "27",
  "romantic": "10749", "romance": "10749", "love": "10749",
  "action": "28", "fight": "28",
  "drama": "18", "sad": "18", "emotional": "18",
  "animated": "16", "cartoon": "16", "anime": "16",
  "documentary": "99",
  "sci-fi": "878", "space": "878", "future": "878"
};

const generateWithFailover = async (prompt) => {
  if (!genAI) throw new Error("API Key is missing.");

  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`⚠️ ${modelName} failed. Trying next...`);
    }
  }
  throw new Error("All AI models failed.");
};

export const askAI = async (prompt) => {
  try {
    return await generateWithFailover(prompt);
  } catch (error) {
    return "I couldn't fetch that info right now, but it sounds interesting!";
  }
};

export const parseSearchIntent = async (query) => {
  const lowerQuery = query.toLowerCase();

  // 1️⃣ ATTEMPT: Ask AI
  try {
    if (!genAI) throw new Error("No Key");
    
    const prompt = `
      You are a movie search engine. Convert query to JSON.
      Query: "${query}"
      
      RULES:
      - If user asks for a Genre/Vibe (e.g. "Funny", "Scary", "80s Action"), use "discover" + "with_genres".
      - If user asks for a Title (e.g. "Batman", "Frozen"), use "search".
      - TMDB IDs: Action=28, Comedy=35, Horror=27, Romance=10749, Sci-Fi=878, Animation=16, Drama=18.
      
      Example: "Funny movies" -> { "type": "discover", "with_genres": "35" }
      Example: "Batman" -> { "type": "search", "query": "Batman" }
      
      Return JSON ONLY.
    `;

    const text = await generateWithFailover(prompt);
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.warn("⚠️ AI Failed. Switching to Manual Fallback...");
  }

  // 2️⃣ FALLBACK: The "Mini Brain"
  for (const [word, id] of Object.entries(GENRE_KEYWORDS)) {
    if (lowerQuery.includes(word)) {
      console.log(`🛡️ Fallback: Mapped "${word}" to Genre ID ${id}`);
      return { type: "discover", with_genres: id };
    }
  }

  // 3️⃣ FINAL RESORT: Basic Search
  return { type: "search", query: query };
};