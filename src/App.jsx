import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import Modal from './components/Modal.jsx'
import TasteProfiler from './components/TasteProfiler.jsx'
import { parseSearchIntent } from './ai/client.js';

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
        // 🧠 Ask AI: "What does the user really want?"
        const intent = await parseSearchIntent(query);
        console.log("🧠 Intent:", intent);

        if (intent.type === 'search') {
          // 🔎 It's a Title (or AI figured out the Title from a plot)
          endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(intent.query)}`;
        
        } else if (intent.type === 'person') {
          // 👤 It's an Actor/Director -> Find their ID first
          const personRes = await fetch(`${API_BASE_URL}/search/person?query=${encodeURIComponent(intent.query)}`, API_OPTIONS);
          const personData = await personRes.json();
          
          if (personData.results?.length > 0) {
            const personId = personData.results[0].id;
            endpoint = `${API_BASE_URL}/discover/movie?with_cast=${personId}&sort_by=popularity.desc`;
          } else {
            setErrorMessage("Actor not found.");
            setIsLoading(false);
            return;
          }

        } else if (intent.type === 'discover') {
          // 🎭 It's a Vibe/Genre
          const params = new URLSearchParams({
            include_adult: 'false',
            include_video: 'false',
            language: 'en-US',
            sort_by: 'popularity.desc',
            ...intent
          });
          params.delete('type'); params.delete('query');
          endpoint = `${API_BASE_URL}/discover/movie?${params.toString()}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok) throw new Error('Failed to fetch movies');
      
      const data = await response.json();
      
      if(data.results.length === 0) {
        setErrorMessage('No movies found matching that search.');
        setMovieList([]);
      } else {
        setMovieList(data.results);
      }

    } catch (error) {
      console.error(`Error: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  // ... (Rest of the component handles trending, modals, etc.)
  const loadTrendingMovies = async () => {
    try {
      const endpoint = `${API_BASE_URL}/trending/movie/week`;
      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();
      setTrendingMovies((data.results || []).map(movie => ({
        id: movie.id,
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/fallback.png",
        title: movie.title,
      })));
    } catch (e) { console.error(e); }
  }

  const openModal = async (movie) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS);
      const data = await res.json();
      setSelectedMovie(data);
      setIsModalOpen(true);
    } catch (e) { console.error(e); }
  };

  const fetchAIMovies = async (recs) => {
    setIsLoading(true);
    try {
      const promises = recs.map(async (rec) => {
        const res = await fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(rec.title)}`, API_OPTIONS);
        const data = await res.json();
        const m = data.results?.[0]; 
        return m ? { ...m, ai_reason: rec.reason } : null;
      });
      setMovieList((await Promise.all(promises)).filter(m => m));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMovies(debouncedSearchTerm); }, [debouncedSearchTerm]);
  useEffect(() => { loadTrendingMovies(); }, []);

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

      <button onClick={() => setIsTasteModalOpen(true)} className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300 group hover:scale-105">
        <span className="text-xl group-hover:rotate-12 transition-transform">✨</span>
        <span className="font-medium text-white text-sm">AI Assistant</span>
      </button>

      {isModalOpen && selectedMovie && <Modal movie={selectedMovie} onClose={() => setIsModalOpen(false)} />}
      
      {isTasteModalOpen && (
        <TasteProfiler 
          onClose={() => setIsTasteModalOpen(false)} 
          onRecommendations={(result) => { setIsTasteModalOpen(false); fetchAIMovies(result); }}
        />
      )}
    </main>
  )
}

export default App
