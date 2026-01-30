import React, { useEffect, useState } from 'react';
import { askAI } from '../ai/client.js';

const Modal = ({ movie, onClose }) => {
  const [aiContent, setAiContent] = useState(null);

  // When the modal opens, ask AI for a fun fact and tags
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (!movie) return;

      const prompt = `
        Analyze the movie "${movie.title}".
        Return ONLY a valid JSON object with these exact keys:
        {
          "fun_fact": "A short, interesting trivia fact about this movie",
          "tags": ["Mood 1", "Mood 2", "Mood 3"]
        }
        Do not write any other text. JUST THE JSON.
      `;

      try {
        // 1. Get the raw text from AI
        const responseText = await askAI(prompt);
        
        // 2. SMART PARSE: Find the JSON object using Regex
        // (This ignores any "Here is your JSON" text the AI might add)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/); 
        
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          setAiContent(data); // ✅ Correct state name
        } else {
          throw new Error("No JSON found");
        }

      } catch (error) {
        console.error("AI Modal Error:", error);
        // Fallback content if AI fails
        setAiContent({ 
          fun_fact: "The AI is currently watching this movie...", 
          tags: ["Classic", "Cinema", "Film"] 
        });
      }
    };

    fetchAIAnalysis();
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden max-w-3xl w-full relative shadow-2xl flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/50 rounded-full p-2">✕</button>

        {/* Left Side: Poster */}
        <div className="w-full md:w-1/3 h-64 md:h-auto relative">
            <img 
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/No-Poster.png'} 
              alt={movie.title} 
              className="w-full h-full object-cover"
            />
        </div>

        {/* Right Side: Content */}
        <div className="p-6 md:w-2/3 flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
            
            <div className="flex items-center gap-3 text-gray-400 text-sm mb-4">
                <span>{movie.release_date?.split('-')[0]}</span>
                <span>•</span>
                <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                <span>•</span>
                <span className="uppercase">{movie.original_language}</span>
            </div>

            {/* AI Generated Tags */}
            {aiContent ? (
                <div className="flex flex-wrap gap-2 mb-4">
                    {aiContent.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                            {tag}
                        </span>
                    ))}
                </div>
            ) : (
                <div className="h-6 w-32 bg-gray-800 animate-pulse rounded mb-4"></div>
            )}

            <p className="text-gray-300 leading-relaxed mb-6">
                {movie.overview}
            </p>

            {/* AI Generated Fun Fact */}
            <div className="mt-auto bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-indigo-400 text-sm font-bold mb-1">🤖 AI Insider Knowledge:</h3>
                {aiContent ? (
                    <p className="text-sm text-gray-300 italic">"{aiContent.fun_fact}"</p>
                ) : (
                    <div className="h-4 w-full bg-gray-800 animate-pulse rounded"></div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;