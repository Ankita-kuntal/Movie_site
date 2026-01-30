import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import Modal from './components/Modal.jsx'
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
        // 🧠 Step 1: Ask AI "What does the user want?"
        const intent = await parseSearchIntent(query);
        console.log("🧠 AI Search Logic:", intent); // Check your Console to see this!

        if (intent.type === 'search') {
          // Case A: User wants a specific movie (e.g., "Batman")
          // Use the standard Search endpoint
          endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(intent.query)}`;
        } else if (intent.type === 'discover') {
          // Case B: User wants a vibe (e.g., "Sad movies")
          // Use the Discover endpoint with filters
          const params = new URLSearchParams({
            include_adult: 'false',
            include_video: 'false',
            language: 'en-US',
            sort_by: 'popularity.desc',
            ...intent // Spreads keys like 'with_genres', 'primary_release_year'
          });
          // Remove internal keys so TMDB doesn't complain
          params.delete('type'); 
          params.delete('query');
          
          endpoint = `${API_BASE_URL}/discover/movie?${params.toString()}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      if(data.results.length === 0) {
        setErrorMessage('No movies found matching that vibe. Try "Funny" or "Action".');
        setMovieList([]);
      } else {
        setMovieList(data.results);
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

  const openModal = async (movie) => {
    try {
      const movieDetailsResponse = await fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS);
      const movieDetails = await movieDetailsResponse.json();
      setSelectedMovie(movieDetails);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
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

  const fetchAIMovies = async (aiRecommendations) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const moviePromises = aiRecommendations.map(async (rec) => {
        const response = await fetch(
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(rec.title)}`,
          API_OPTIONS
        );
        const data = await response.json();
        const movie = data.results?.[0]; 
        return movie ? { ...movie, ai_reason: rec.reason } : null;
      });

      const results = await Promise.all(moviePromises);
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

      {isModalOpen && selectedMovie && (
        <Modal movie={selectedMovie} onClose={closeModal} />
      )}

      {isTasteModalOpen && (
        <TasteProfiler 
          onClose={() => setIsTasteModalOpen(false)} 
          onRecommendations={(result) => {
            setIsTasteModalOpen(false);
            fetchAIMovies(result);
          }}
        />
      )}
    </main>
  )
}

export default App