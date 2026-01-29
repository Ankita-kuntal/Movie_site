import React from 'react'

const MovieCard = ({ movie, onCardClick }) => {
  return (
    <div className="movie-card" onClick={() => onCardClick(movie)}>
      <img
        src={movie.poster_path ?
          `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/No-Poster.png'}
        alt={movie.title}
      />

      <div className="mt-4">
        {/* 👇 NEW: Show AI Reason if it exists */}
        {movie.ai_reason && (
           <div className="mb-3 p-2 bg-indigo-900/50 border border-indigo-500/30 rounded-md">
             <p className="text-xs text-indigo-200">✨ {movie.ai_reason}</p>
           </div>
        )}
        
        <h3>{movie.title}</h3>

        <div className="content"> 
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{movie.original_language}</p>

          <span>•</span>
          <p className="year">
            {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
export default MovieCard