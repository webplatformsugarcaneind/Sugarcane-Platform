import React from 'react';
import './GuideBox.css';

const GuideBox = ({ 
  title, 
  onClick,
  description,
  icon,
  color = 'default',
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    console.log('GuideBox handleClick called for:', title);
    console.log('onClick prop:', onClick);
    console.log('disabled:', disabled);
    
    if (!disabled && onClick) {
      console.log('Calling onClick with title:', title);
      onClick(title);
    } else {
      console.log('onClick not called - disabled:', disabled, 'onClick exists:', !!onClick);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Extract role from title for icon selection
  const getRoleIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('farmer')) return '🌾';
    if (titleLower.includes('hhm')) return '👥';
    if (titleLower.includes('labour') || titleLower.includes('worker')) return '⚒️';
    if (titleLower.includes('factory') || titleLower.includes('factories')) return '🏭';
    return icon || '📖';
  };

  const roleIcon = getRoleIcon(title);

  return (
    <div 
      className={`guide-box ${color} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Open guide: ${title}`}
      aria-disabled={disabled}
    >
      <div className="guide-box-content">
        <div className="guide-box-icon">
          {roleIcon}
        </div>
        
        <div className="guide-box-text">
          <h3 className="guide-box-title">
            {title}
          </h3>
          
          {description && (
            <p className="guide-box-description">
              {description}
            </p>
          )}
        </div>

        <div className="guide-box-arrow">
          <span className="arrow-icon">→</span>
        </div>
      </div>

      <div className="guide-box-shine"></div>
    </div>
  );
};

export default GuideBox;