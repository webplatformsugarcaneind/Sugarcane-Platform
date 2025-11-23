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
    if (titleLower.includes('farmer')) {
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M12 2v20M2 7h10M2 12h10M2 17h10" />
          <path d="M12 2l5 5-5 5m0 0l-5-5 5-5" />
        </svg>
      );
    }
    if (titleLower.includes('hhm')) {
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    }
    if (titleLower.includes('labour') || titleLower.includes('worker')) {
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    }
    if (titleLower.includes('factory') || titleLower.includes('factories')) {
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
          <rect x="2" y="10" width="20" height="14" />
          <path d="M6 10V4l6 6V4l6 6" />
        </svg>
      );
    }
    return icon || (
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
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