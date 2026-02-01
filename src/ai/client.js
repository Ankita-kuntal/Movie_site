import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODEL_PRIORITY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

// 🛡️ DEMO DATA (For Resume "Uncrashable" Mode)
const MOCK_REC_LIST = JSON.stringify([
  { title: "Inception", reason: "Because you like mind-bending thrillers." },
  { title: "The Grand Budapest Hotel", reason: "Since you enjoy quirky visual comedies." },
  { title: "Interstellar", reason: "For a deep, emotional sci-fi adventure." },
  { title: "La La Land", reason: "A perfect mix of romance, music, and drama." },
  { title: "Spider-Man: Into the Spider-Verse", reason: "Visually stunning animation you'll love." }
]);

const MOCK_ANALYSIS = JSON.stringify({
  trivia: "🔥 Insider Fact: This is running in Demo Mode because the AI is taking a nap. But it works perfectly!",
  mood: ["✨ Resume Ready", "🚀 Fast", "🤖 Demo Mode"]
});

const generateWithFailover = async (prompt) => {
  if (!genAI) throw new Error("API Key is missing.");
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`⚠️ ${modelName} failed.`);
    }
  }
  throw new Error("All AI models failed.");
};

export const askAI = async (prompt) => {
  try {
    return await generateWithFailover(prompt);
  } catch (error) {
    console.error("⚠️ AI Quota Hit! Switching to Resume Demo Mode.");
    if (prompt.includes("trivia") || prompt.includes("mood")) {
      return MOCK_ANALYSIS;
    } else {
      return MOCK_REC_LIST;
    }
  }
};

export const parseSearchIntent = async (query) => {
  // 1️⃣ Fast Path (Manual Genres)
  const lowerQuery = query.toLowerCase();
  const GENRE_MAP = { 
    "funny": "35", "comedy": "35", "scary": "27", "horror": "27", 
    "action": "28", "drama": "18", "sci-fi": "878", "romantic": "10749",
    "animated": "16", "cartoon": "16"
  };

  for (const [word, id] of Object.entries(GENRE_MAP)) {
    if (lowerQuery.includes(word) && !lowerQuery.includes("movie")) {
       return { type: "discover", with_genres: id };
    }
  }

  // 2️⃣ AI Detective (The Smart Part 🕵️‍♂️)
  try {
    if (!genAI) return { type: "search", query: query };
    
    const prompt = `
      Act as a Movie Database Expert. Analyze: "${query}"
      Return JSON ONLY.

      RULES:
      1. PERSON: User names an actor/director (e.g., "Brad Pitt", "Nolan") -> { "type": "person", "query": "Name" }
      2. PLOT: User describes a plot (e.g., "guy stuck on mars", "sinking ship") -> { "type": "search", "query": "The Martian" } (Identify the movie title!)
      3. VIBE: User wants a feeling (e.g., "sad", "80s horror") -> { "type": "discover", "with_genres": "ID", "primary_release_year": "YYYY" }
      4. TITLE: Just a movie name -> { "type": "search", "query": "Title" }
      
      Example: "movie about sinking ship" -> { "type": "search", "query": "Titanic" }
    `;
    
    const text = await generateWithFailover(prompt);
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.warn("AI Detective failed, using basic search.");
  }
  
  return { type: "search", query: query };
};
