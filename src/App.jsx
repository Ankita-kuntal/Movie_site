import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import Modal from './components/Modal.jsx'
// import { askAI } from './ai/client'
import TasteProfiler from './components/TasteProfiler.jsx'
import { askAI, parseSearchIntent } from './ai/client.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setsearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isTasteModalOpen, setIsTasteModalOpen] = useState(false);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      if (query) {
        // 🚨 STEP 1: Ask AI "What did the user mean?"
        const intent = await parseSearchIntent(query);
        console.log("🧠 AI Search Intent:", intent);

        if (intent.type === 'search') {
          // Case A: User wants a specific title (Old behavior)
          endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(intent.query)}`;
        } else {
          // Case B: User wants a vibe (New AI Smart Filter)
          // We construct the URL with the filters the AI gave us
          const params = new URLSearchParams({
            include_adult: 'false',
            include_video: 'false',
            language: 'en-US',
            sort_by: 'popularity.desc',
            ...intent // Spreads things like primary_release_year, with_genres
          });
          // Remove the "type" key before sending to TMDB
          params.delete('type'); 
          
          endpoint = `${API_BASE_URL}/discover/movie?${params.toString()}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(!data.results || !Array.isArray(data.results)) {
        setErrorMessage('Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      
      // OPTIONAL: If it was a smart search, update the DB count with the original query
      if(query && movieList.length > 0) {
        // You can keep your Appwrite tracking here if you want
        // updateSearchCount(query, data.results[0]); 
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }


  const loadTrendingMovies = async () => {
    try {
      const endpoint = `${API_BASE_URL}/trending/movie/week`;
      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();

      setTrendingMovies(
        (data.results || []).map(movie => ({
          id: movie.id,
          poster_url: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/fallback.png",
          title: movie.title,
        }))
      );
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  // Function to open the modal
  const openModal = async (movie) => {
    try {
      const movieDetailsResponse = await fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS);
      const movieDetails = await movieDetailsResponse.json();
      setSelectedMovie(movieDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setErrorMessage('Could not load movie details.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

//   useEffect(() => {
//   // 1. Debug: Check which key is loaded
//   const key = import.meta.env.VITE_GEMINI_API_KEY;
//   console.log("🔑 DEBUG KEY:", key ? key.slice(0, 10) + "..." : "UNDEFINED");

//   // 2. Try the request
//   askAI("Hello").then((res) => console.log("🤖 AI Response:", res));
// }, []);

// Add this function inside App component
  const fetchAIMovies = async (aiRecommendations) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 1. We create a list of promises (one search per movie)
      const moviePromises = aiRecommendations.map(async (rec) => {
        // Search TMDB for this specific title
        const response = await fetch(
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(rec.title)}`, 
          API_OPTIONS
        );
        const data = await response.json();
        const movie = data.results?.[0]; // Take the first result
        
        // If found, attach the AI's reason to the movie object!
        return movie ? { ...movie, ai_reason: rec.reason } : null;
      });

      // 2. Wait for all searches to finish
      const results = await Promise.all(moviePromises);
      
      // 3. Filter out any nulls (movies not found)
      const validMovies = results.filter(m => m !== null);
      
      setMovieList(validMovies);
    } catch (error) {
      console.error("Error fetching AI movies:", error);
      setErrorMessage("Could not load AI recommendations.");
    } finally {
      setIsLoading(false);
    }
  };


  
  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="/hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          {/* <div className="mt-4 mb-8">
            <button 
              onClick={() => setIsTasteModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-lg flex items-center gap-2 mx-auto"
            >
              ✨ Discover Your Taste (AI)
            </button>
          </div> */}

          <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onCardClick={openModal} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 👇 MODERN GLASSMORPHISM BUTTON */}
      <button 
        onClick={() => setIsTasteModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 
                   bg-white/10 backdrop-blur-lg border border-white/20 
                   rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300 
                   group hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform duration-300">✨</span>
        <span className="font-medium text-white tracking-wide text-sm">
           AI Assistant
        </span>
      </button>

      {/* (Keep existing modals below) */}

      {isModalOpen && selectedMovie && (
        <Modal movie={selectedMovie} onClose={closeModal} />
      )}

      {isTasteModalOpen && (
        <TasteProfiler 
          onClose={() => setIsTasteModalOpen(false)} 
          onRecommendations={(result) => {
            console.log("Future step: handle results", result);
            setIsTasteModalOpen(false);
            fetchAIMovies(result);
          }}
        />
      )}
    </main>
  )
}

export default App