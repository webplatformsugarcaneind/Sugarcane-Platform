import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { CRUSHING_STATUS, getCrushingStatusDisplay, DEFAULT_CRUSHING_STATUS } from '../constants/crushingStatus.js';
=======
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
import './FactoryProfileViewPage.css';

/**
 * FactoryProfileViewPage Component
 * 
 * Displays detailed information about a specific factory
 */
const FactoryProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
<<<<<<< HEAD
    
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    // Get factory data from navigation state or fallback
    const factoryData = location.state?.factoryData || null;

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (!factoryData) {
        return (
            <div className="factory-profile-page">
                <div className="error-state">
<<<<<<< HEAD
                    <div className="error-icon">⚠️</div>
=======
                    <div className="error-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                    <h3>Factory Profile Not Found</h3>
                    <p>Unable to load factory profile information.</p>
                    <button className="btn btn-primary" onClick={handleGoBack}>
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const getCapacityColor = (capacity) => {
        if (!capacity) return '#666';
        const numericCapacity = parseInt(capacity.match(/\d+/)?.[0] || '0');
        if (numericCapacity < 1000) return '#ff9800';
        if (numericCapacity < 5000) return '#2196f3';
        return '#4caf50';
    };

    const getCapacityLabel = (capacity) => {
        if (!capacity) return 'Unknown';
        const numericCapacity = parseInt(capacity.match(/\d+/)?.[0] || '0');
        if (numericCapacity < 1000) return 'Small Scale';
        if (numericCapacity < 5000) return 'Medium Scale';
        return 'Large Scale';
    };

    return (
        <div className="factory-profile-page">
            {/* Header */}
            <div className="profile-header">
                <button className="back-button" onClick={handleGoBack}>
                    ← Back to Directory
                </button>
                <div className="header-content">
                    <div className="factory-avatar">
<<<<<<< HEAD
                        <span className="avatar-icon">🏭</span>
                    </div>
                    <div className="factory-title">
                        <h1>{factoryData.name || 'Unknown Factory'}</h1>
                        <p className="factory-location">📍 {factoryData.location || 'Location not specified'}</p>
                        <div className="badges-container">
                            <div className="capacity-badge" style={{ backgroundColor: getCapacityColor(factoryData.capacity) }}>
                                {getCapacityLabel(factoryData.capacity)}
                            </div>
                            <div className={`crushing-status-badge ${factoryData.crushingStatus === CRUSHING_STATUS.ON ? 'status-on' : 'status-off'}`}>
                                {getCrushingStatusDisplay(factoryData.crushingStatus || DEFAULT_CRUSHING_STATUS).icon} {getCrushingStatusDisplay(factoryData.crushingStatus || DEFAULT_CRUSHING_STATUS).label}
                            </div>
=======
                        <span className="avatar-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px' }}>
                                <rect x="4" y="8" width="6" height="14" />
                                <rect x="14" y="8" width="6" height="14" />
                                <path d="M4 8 L7 3 L10 8" />
                                <path d="M14 8 L17 3 L20 8" />
                                <line x1="6" y1="12" x2="6" y2="12" />
                                <line x1="8" y1="12" x2="8" y2="12" />
                                <line x1="6" y1="16" x2="6" y2="16" />
                                <line x1="8" y1="16" x2="8" y2="16" />
                            </svg>
                        </span>
                    </div>
                    <div className="factory-title">
                        <h1>{factoryData.name || 'Unknown Factory'}</h1>
                        <p className="factory-location">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', display: 'inline', verticalAlign: 'middle' }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {' '}{factoryData.location || 'Location not specified'}
                        </p>
                        <div className="capacity-badge" style={{ backgroundColor: getCapacityColor(factoryData.capacity) }}>
                            {getCapacityLabel(factoryData.capacity)}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="profile-content">
                {/* Basic Information */}
                <div className="info-section">
<<<<<<< HEAD
                    <h2>🏭 Factory Information</h2>
=======
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <rect x="4" y="8" width="6" height="14" />
                            <rect x="14" y="8" width="6" height="14" />
                            <path d="M4 8 L7 3 L10 8" />
                            <path d="M14 8 L17 3 L20 8" />
                        </svg>
                        Factory Information
                    </h2>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Factory Name:</span>
                            <span className="info-value">{factoryData.name || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Location:</span>
                            <span className="info-value">{factoryData.location || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Processing Capacity:</span>
                            <span className="info-value">{factoryData.capacity || 'N/A'}</span>
                        </div>
<<<<<<< HEAD
                        <div className="info-item">
                            <span className="info-label">Crushing Status:</span>
                            <span className={`info-value status-value ${factoryData.crushingStatus === CRUSHING_STATUS.ON ? 'status-active' : 'status-inactive'}`}>
                                {getCrushingStatusDisplay(factoryData.crushingStatus || DEFAULT_CRUSHING_STATUS).icon} {factoryData.crushingStatus === CRUSHING_STATUS.ON ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                        {factoryData.operatingSeason && (
                            <div className="info-item">
                                <span className="info-label">Operating Season:</span>
                                <span className="info-value">📅 {factoryData.operatingSeason}</span>
                            </div>
                        )}
=======
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                        {factoryData.establishedYear && (
                            <div className="info-item">
                                <span className="info-label">Established:</span>
                                <span className="info-value">{factoryData.establishedYear}</span>
                            </div>
                        )}
<<<<<<< HEAD
                    </div>
                </div>

                {/* Operations Section */}
                {factoryData.operatingSeason && (
                    <div className="info-section">
                        <h2>⚙️ Operations</h2>
                        <div className="operating-season-display">
                            <div className="season-card">
                                <div className="season-icon">📅</div>
                                <div className="season-details">
                                    <div className="season-label">Operating Season</div>
                                    <div className="season-value">{factoryData.operatingSeason}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

=======
                        {factoryData.operatingHours && (
                            <div className="info-item">
                                <span className="info-label">Operating Hours:</span>
                                <span className="info-value">
                                    {typeof factoryData.operatingHours === 'object'
                                        ? (factoryData.operatingHours.season
                                            ? `${factoryData.operatingHours.season}${factoryData.operatingHours.daily ? ' - ' + factoryData.operatingHours.daily : factoryData.operatingHours.monday ? ' - ' + factoryData.operatingHours.monday : ''}`
                                            : 'Contact for schedule'
                                        )
                                        : factoryData.operatingHours}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                {/* Description */}
                {factoryData.description && (
                    <div className="info-section">
                        <h2>📋 About Factory</h2>
                        <div className="description-content">
                            <p>{factoryData.description}</p>
                        </div>
                    </div>
                )}

                {/* Collaboration Opportunities */}
                <div className="info-section">
<<<<<<< HEAD
                    <h2>🤝 Collaboration Opportunities</h2>
                    <div className="opportunity-tags">
                        <span className="opportunity-tag">🔄 Resource Sharing</span>
                        <span className="opportunity-tag">⚙️ Technical Exchange</span>
                        <span className="opportunity-tag">📊 Best Practices</span>
                        <span className="opportunity-tag">🚚 Logistics Coordination</span>
                        <span className="opportunity-tag">🌾 Supply Chain Integration</span>
                        <span className="opportunity-tag">💡 Innovation Partnerships</span>
=======
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Collaboration Opportunities
                    </h2>
                    <div className="opportunity-tags">
                        <span className="opportunity-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v6m0 6v6m8.66-11.5l-5.2 3m-6.92 4l-5.2 3m0-12l5.2 3m6.92 4l5.2 3" />
                            </svg>
                            Resource Sharing
                        </span>
                        <span className="opportunity-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v6m0 6v6" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            Technical Exchange
                        </span>
                        <span className="opportunity-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                            Best Practices
                        </span>
                        <span className="opportunity-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16,8 20,8 23,11 23,16 16,16" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                            Logistics Coordination
                        </span>
                        <span className="opportunity-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                <path d="M12 20v-8m0 0V4m0 8c2 0 3 1 3 3v5m-3-8c-2 0-3 1-3 3v5" />
                                <path d="M9 3s1 1 1 3-1 3-1 3m6-6s-1 1-1 3 1 3 1 3" />
                            </svg>
                            Supply Chain Integration
                        </span>
                        <span className="opportunity-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                            Innovation Partnerships
                        </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                    </div>
                </div>

                {/* Contact Information */}
                <div className="info-section">
<<<<<<< HEAD
                    <h2>📞 Contact Information</h2>
                    <div className="contact-grid">
                        {factoryData.contactInfo?.email && (
                            <div className="contact-item">
                                <span className="contact-icon">📧</span>
=======
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Contact Information
                    </h2>
                    <div className="contact-grid">
                        {factoryData.contactInfo?.email && (
                            <div className="contact-item">
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                                <div className="contact-details">
                                    <span className="contact-label">Email</span>
                                    <a href={`mailto:${factoryData.contactInfo.email}`} className="contact-link">
                                        {factoryData.contactInfo.email}
                                    </a>
                                </div>
                            </div>
                        )}
                        {factoryData.contactInfo?.phone && (
                            <div className="contact-item">
<<<<<<< HEAD
                                <span className="contact-icon">📱</span>
=======
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                        <line x1="12" y1="18" x2="12.01" y2="18" />
                                    </svg>
                                </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                                <div className="contact-details">
                                    <span className="contact-label">Phone</span>
                                    <a href={`tel:${factoryData.contactInfo.phone}`} className="contact-link">
                                        {factoryData.contactInfo.phone}
                                    </a>
                                </div>
                            </div>
                        )}
                        {factoryData.contactInfo?.website && (
                            <div className="contact-item">
<<<<<<< HEAD
                                <span className="contact-icon">🌐</span>
                                <div className="contact-details">
                                    <span className="contact-label">Website</span>
                                    <a 
=======
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                </span>
                                <div className="contact-details">
                                    <span className="contact-label">Website</span>
                                    <a
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                                        href={factoryData.contactInfo.website.startsWith('http') ? factoryData.contactInfo.website : `https://${factoryData.contactInfo.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-link"
                                    >
                                        Visit Website
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className="info-section">
<<<<<<< HEAD
                    <h2>⚙️ Technical Specifications</h2>
                    <div className="tech-specs">
                        <div className="spec-card">
                            <div className="spec-icon">🏭</div>
=======
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v6m0 6v6m8.66-11.5l-5.2 3m-6.92 4l-5.2 3m0-12l5.2 3m6.92 4l5.2 3" />
                        </svg>
                        Technical Specifications
                    </h2>
                    <div className="tech-specs">
                        <div className="spec-card">
                            <div className="spec-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                    <rect x="4" y="8" width="6" height="14" />
                                    <rect x="14" y="8" width="6" height="14" />
                                    <path d="M4 8 L7 3 L10 8" />
                                    <path d="M14 8 L17 3 L20 8" />
                                </svg>
                            </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                            <div className="spec-content">
                                <h4>Processing Capacity</h4>
                                <p>{factoryData.capacity || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="spec-card">
<<<<<<< HEAD
                            <div className="spec-icon">⏰</div>
                            <div className="spec-content">
                                <h4>Operation Schedule</h4>
                                <p>{factoryData.operatingSeason || 'Contact for schedule'}</p>
                            </div>
                        </div>
                        <div className="spec-card">
                            <div className="spec-icon">📅</div>
=======
                            <div className="spec-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                            </div>
                            <div className="spec-content">
                                <h4>Operation Schedule</h4>
                                <p>
                                    {factoryData.operatingHours
                                        ? (typeof factoryData.operatingHours === 'object'
                                            ? 'Seasonal Operation'
                                            : factoryData.operatingHours)
                                        : 'Contact for schedule'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="spec-card">
                            <div className="spec-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                            <div className="spec-content">
                                <h4>Established</h4>
                                <p>{factoryData.establishedYear || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="spec-card">
<<<<<<< HEAD
                            <div className="spec-icon">📍</div>
=======
                            <div className="spec-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                            <div className="spec-content">
                                <h4>Location</h4>
                                <p>{factoryData.location || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FactoryProfileViewPage;