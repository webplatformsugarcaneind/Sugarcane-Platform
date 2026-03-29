import React, { useState } from 'react';
import './FactoryCard.css';

const FactoryCard = ({ 
  name, 
  location, 
  imageUrl, 
  onClick,
  id,
  description,
  capacity,
  hhmCount 
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  // Multiple fallback images focused on industrial/factory scenes
  const fallbackImages = [
    "https://images.unsplash.com/photo-1558449028-b06c814be8d5?w=400&h=250&fit=crop", // Industrial facility
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop", // Factory pipes
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=250&fit=crop", // Industrial plant
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=250&fit=crop"  // Manufacturing facility
  ];

  const [imageErrorCount, setImageErrorCount] = useState(0);

  const handleImageError = (e) => {
    if (imageErrorCount < fallbackImages.length) {
      e.target.src = fallbackImages[imageErrorCount];
      setImageErrorCount(prev => prev + 1);
    } else {
      // Final fallback - create a colored div with factory icon
      e.target.style.display = 'none';
      const parent = e.target.parentElement;
      if (parent && !parent.querySelector('.fallback-factory-icon')) {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'fallback-factory-icon';
        fallbackDiv.innerHTML = '🏭';
        fallbackDiv.style.cssText = `
          width: 100%;
          height: 250px;
          background: linear-gradient(135deg, #4a7c3c 0%, #6db850 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: white;
        `;
        parent.appendChild(fallbackDiv);
      }
    }
  };

  return (
    <div 
      className="factory-card"
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name} factory in ${location}`}
    >
      <div className="factory-card-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={`${name} factory`}
            className="factory-card-image"
            onError={handleImageError}
          />
        ) : (
          <div className="factory-card-fallback">
            <div className="factory-icon">🏭</div>
            <div className="factory-name-overlay">{name}</div>
          </div>
        )}
        <div className="factory-card-overlay">
          <span className="view-details-text">View Details</span>
        </div>
      </div>
      
      <div className="factory-card-content">
        <div className="factory-card-header">
          <h3 className="factory-card-name" title={name}>
            {name}
          </h3>
          <span className="factory-card-icon">🏭</span>
        </div>
        
        <div className="factory-card-location">
          <span className="location-icon">📍</span>
          <span className="location-text" title={location}>
            {location}
          </span>
        </div>

        {description && (
          <p className="factory-card-description" title={description}>
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description
            }
          </p>
        )}

        <div className="factory-card-stats">
          {capacity && (
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-text">Capacity: {capacity.toLocaleString()}</span>
            </div>
          )}
          {hhmCount !== undefined && (
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-text">{hhmCount} HHM{hhmCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="factory-card-action">
          <span className="action-text">Click to learn more</span>
          <span className="action-arrow">→</span>
        </div>
      </div>
    </div>
  );
};

export default FactoryCard;