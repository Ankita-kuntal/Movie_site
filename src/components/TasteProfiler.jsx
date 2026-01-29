import React, { useState } from 'react';
import { askAI } from '../ai/client.js';

const TasteProfiler = ({ onClose, onRecommendations }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    mood: '',
    genre: '',
    duration: ''
  });

  const handleNext = () => setStep(step + 1);
  
  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const generateRecommendations = async (finalDuration) => {
    setIsLoading(true);
    
    // 1. Construct the prompt
    const prompt = `
      You are a movie expert. Recommend 3 movies for a user with these preferences:
      - Mood: ${preferences.mood}
      - Genre: ${preferences.genre}
      - Time available: ${finalDuration}

      IMPORTANT: Return ONLY a valid JSON array.
      Each object must have:
      1. "title": Exact movie title.
      2. "reason": A short 1-sentence explanation.

      Example:
      [
        {"title": "Inception", "reason": "Fits your focused mood."}
      ]
    `;

    try {
      const responseText = await askAI(prompt);
      console.log("Raw AI Response:", responseText);

      // 2. SMART PARSER: Find the array using Regex
      // This ignores "Here is your JSON" text and grabs only what's between [ and ]
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const recommendations = JSON.parse(jsonMatch[0]);

      // 3. Send data back
      onRecommendations(recommendations);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      alert("The AI got confused. Check the console for the raw response!");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <h2 className="text-2xl font-bold text-white mb-6">🎬 Discover Your Taste</h2>

        {isLoading ? (
           <div className="text-center py-10">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
             <p className="text-lg text-white">Curating your personal lineup...</p>
             <p className="text-sm text-gray-400 mt-2">(Consulting the AI brain)</p>
           </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-300">How are you feeling today?</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Happy', 'Melancholic', 'Energetic', 'Relaxed'].map(mood => (
                    <button 
                      key={mood}
                      onClick={() => { handleChange('mood', mood); handleNext(); }}
                      className="p-3 bg-gray-800 hover:bg-indigo-600 rounded-lg text-white transition"
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-gray-300">Pick a preferred genre tone:</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Thriller/Mystery', 'Comedy/Fun', 'Drama/Deep', 'Sci-Fi/Future'].map(genre => (
                    <button 
                      key={genre}
                      onClick={() => { handleChange('genre', genre); handleNext(); }}
                      className="p-3 bg-gray-800 hover:bg-indigo-600 rounded-lg text-white transition"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <p className="text-gray-300">How much time do you have?</p>
                    <div className="flex flex-col gap-3">
                        {['Short (< 90 mins)', 'Average (~2 hours)', 'Epic (> 2.5 hours)'].map(time => (
                            <button 
                            key={time}
                            onClick={() => { handleChange('duration', time); generateRecommendations(time); }}
                            className="p-3 bg-gray-800 hover:bg-indigo-600 rounded-lg text-white text-left transition"
                            >
                            {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TasteProfiler;