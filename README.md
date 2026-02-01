# 🎬 AI-Powered Movie Discovery Platform

An intelligent movie search and discovery web application that combines the power of AI with real-time movie data to help users find their perfect watch.

![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://movie-site-chi.vercel.app/)

## ✨ Features

### 🧠 AI-Powered Search
- **Intelligent Search Intent Parsing**: Uses Google Gemini AI to understand whether you're searching for a specific movie or a mood/genre
- **Natural Language Queries**: Search with phrases like "funny movies", "scary 80s films", or specific titles like "Batman"
- **Smart Fallback System**: Manual keyword mapping ensures search works even if AI quota is exceeded

### 🎯 Personalized Recommendations
- **Taste Profiler**: Interactive quiz to discover movies based on your mood, preferred genre, and available time
- **AI-Generated Tags**: Each movie gets mood tags and fun facts powered by Gemini AI
- **Custom Reasoning**: See why each movie was recommended specifically for you

### 📊 Trending Movies
- **Database-Backed Analytics**: Tracks most searched movies using Appwrite
- **Real-Time Trending**: See what others are watching right now

### 🎨 Modern User Experience
- **Responsive Design**: Built with Tailwind CSS for seamless mobile and desktop experience
- **Debounced Search**: Optimized search with 500ms delay to reduce API calls
- **Modal Details View**: Click any movie for detailed information, ratings, and AI insights
- **Loading States**: Smooth loading indicators for better UX

## 🛠️ Tech Stack

**Frontend:**
- ⚛️ React 19.1.0
- ⚡ Vite 7.0.4
- 🎨 Tailwind CSS 3.4.17
- 🔄 React Hooks & Custom Hooks (react-use)

**Backend & Services:**
- 🤖 Google Generative AI (Gemini API)
- 🗄️ Appwrite (Database & Analytics)
- 🎥 The Movie Database (TMDB) API

**Development Tools:**
- ESLint with React plugins
- PostCSS & Autoprefixer

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API Keys (see below)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ankita-kuntal/Movie_site.git
cd Movie_site
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# TMDB API (Get from https://www.themoviedb.org/settings/api)
VITE_TMDB_API_KEY=your_tmdb_bearer_token

# Google Gemini API (Get from https://ai.google.dev/)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Appwrite Configuration (Get from https://cloud.appwrite.io/)
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_TABLE_ID=your_collection_id
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🔑 API Setup Guide

### 1. TMDB API
1. Create an account at [TMDB](https://www.themoviedb.org/)
2. Go to Settings > API
3. Request an API key
4. Copy the "API Read Access Token" (Bearer Token)

### 2. Google Gemini API
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Copy the key to your `.env` file

### 3. Appwrite Setup
1. Sign up at [Appwrite Cloud](https://cloud.appwrite.io/)
2. Create a new project
3. Create a database with a collection for trending movies
4. Add these attributes to your collection:
   - `searchTerm` (string)
   - `count` (integer)
   - `movie_id` (integer)
   - `poster_url` (string)

## 🎯 How It Works

### AI Search Intent Parsing
```javascript
User Input: "Funny movies from the 90s"
    ↓
AI Analysis (Gemini)
    ↓
{
  "type": "discover",
  "with_genres": "35",
  "primary_release_year": "1990-1999"
}
    ↓
TMDB Discover API
    ↓
Filtered Results
```

### Taste Profiler Flow
```javascript
1. User answers 3 questions (mood, genre, time)
2. Gemini generates 3 personalized recommendations
3. App searches TMDB for each recommended movie
4. Results display with AI reasoning
```

## 📁 Project Structure

```
Movie_site/
├── src/
│   ├── ai/
│   │   └── client.js          # AI integration & failover logic
│   ├── components/
│   │   ├── MovieCard.jsx      # Movie display card
│   │   ├── Search.jsx         # Search input component
│   │   ├── Modal.jsx          # Movie details modal
│   │   ├── Spinner.jsx        # Loading indicator
│   │   └── TasteProfiler.jsx  # AI recommendation wizard
│   ├── App.jsx                # Main application logic
│   ├── appwrite.js            # Database operations
│   └── main.jsx               # Entry point
├── public/                    # Static assets
├── .env                       # Environment variables (not in repo)
└── package.json              # Dependencies
```

## 🌟 Key Features Breakdown

### 1. Multi-Model AI Failover
The app uses a priority queue of Gemini models:
- Primary: `gemini-2.5-flash`
- Backup: `gemini-2.0-flash`
- Fallback: `gemini-flash-latest`

If all fail, a manual keyword mapping system activates.

### 2. Debounced Search
Reduces API calls by waiting 500ms after the user stops typing:
```javascript
useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])
```

### 3. Smart Search Types
- **Keyword Search**: Direct TMDB search for movie titles
- **Discovery Search**: Genre/mood-based filtering with TMDB Discover API
- **AI Recommendations**: Personalized suggestions with reasoning

## 🐛 Known Issues & Improvements

- [ ] Add TypeScript for better type safety
- [ ] Implement unit tests (Jest/Vitest)
- [ ] Add movie watchlist functionality
- [ ] Implement user authentication
- [ ] Add movie trailers integration
- [ ] Cache API responses for better performance

## 📊 Performance

- ⚡ Fast initial load with Vite
- 🔄 Lazy loading for images
- ⏱️ Debounced search reduces unnecessary API calls
- 📱 Fully responsive on all devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ankita Kuntal**
- GitHub: [@Ankita-kuntal](https://github.com/Ankita-kuntal)
- Live Demo: [movie-site-chi.vercel.app](https://movie-site-chi.vercel.app/)

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie database API
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Appwrite](https://appwrite.io/) for backend services
- [Vercel](https://vercel.com/) for hosting

---

⭐ **Star this repo if you found it helpful!** ⭐

Made with ❤️ and AI