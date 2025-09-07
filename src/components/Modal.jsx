import React from 'react';


const Modal = ({ movie, onClose }) => {
  if (!movie) return null;

  // Helper for formatting currency
  const formatCurrency = (num) => {
    if (!num) return 'N/A';
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  // Helper for joining production companies
  const getCompanies = (arr) => {
    if (!arr || !arr.length) return 'N/A';
    return arr.map(c => c.name).join(' • ');
  };

  // Helper for spoken languages
  const getLanguages = (arr) => {
    if (!arr || !arr.length) return 'N/A';
    return arr.map(l => l.english_name).join(', ');
  };

  // Helper for countries
  const getCountries = (arr) => {
    if (!arr || !arr.length) return 'N/A';
    return arr.map(c => c.name).join(' • ');
  };

  // Close modal when clicking outside modal-content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content modal-content-scrollable">
        <button className="modal-close" onClick={onClose}>&times;</button>
        {/* Wide banner image at the top */}
        <div style={{width: '100%', maxHeight: '320px', overflow: 'hidden', borderRadius: '14px 14px 0 0', marginBottom: 18, background: '#18122b', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <img
            src={movie.backdrop_path ?
              `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` :
              (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png')}
            alt={movie.title}
            style={{maxWidth: '100%', maxHeight: '320px', width: 'auto', height: 'auto', objectFit: 'contain', objectPosition: 'center', display: 'block', margin: '0 auto'}}
          />
        </div>
        <div className="modal-body" style={{flexDirection: 'column', gap: 18, overflowY: 'auto', maxHeight: 'calc(100vh - 260px)'}}>
          <div className="modal-details" style={{flex: 1}}>
            <h2 className="modal-title" style={{marginBottom: 8}}>{movie.title}</h2>
            <div className="modal-info" style={{marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12}}>
              <span className="modal-year">{movie.release_date ? movie.release_date : 'N/A'}</span>
              <span className="modal-rating">⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</span>
              <span className="modal-runtime">{movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
            </div>
            {/* Genres as tags */}
            <div style={{marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
              {movie.genres && movie.genres.length > 0 ? (
                movie.genres.map(genre => (
                  <span key={genre.id} style={{background: '#2d2250', color: '#bfaaff', borderRadius: 8, padding: '2px 12px', fontSize: 14, fontWeight: 600}}>{genre.name}</span>
                ))
              ) : 'No genres'}
            </div>
            {/* Overview */}
            <div style={{marginBottom: 16}}>
              <h4 style={{fontWeight: 700, marginBottom: 4}}>Overview</h4>
              <p className="modal-overview">{movie.overview || 'No overview available.'}</p>
            </div>
            {/* Details grid */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16}}>
              <div>
                <span style={{fontWeight: 600}}>Release date:</span><br/>{movie.release_date || 'N/A'}
              </div>
              <div>
                <span style={{fontWeight: 600}}>Countries:</span><br/>{getCountries(movie.production_countries)}
              </div>
              <div>
                <span style={{fontWeight: 600}}>Status:</span><br/>{movie.status || 'N/A'}
              </div>
              <div>
                <span style={{fontWeight: 600}}>Language:</span><br/>{getLanguages(movie.spoken_languages)}
              </div>
              <div>
                <span style={{fontWeight: 600}}>Budget:</span><br/>{formatCurrency(movie.budget)}
              </div>
              <div>
                <span style={{fontWeight: 600}}>Revenue:</span><br/>{formatCurrency(movie.revenue)}
              </div>
              <div style={{gridColumn: '1 / span 2'}}>
                <span style={{fontWeight: 600}}>Tagline:</span><br/>{movie.tagline || 'N/A'}
              </div>
              <div style={{gridColumn: '1 / span 2'}}>
                <span style={{fontWeight: 600}}>Production Companies:</span><br/>{getCompanies(movie.production_companies)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;