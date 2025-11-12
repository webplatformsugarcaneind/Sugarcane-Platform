import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FactoryProfileViewPage.css';

/**
 * FactoryProfileViewPage Component
 * 
 * Displays detailed information about a specific factory
 */
const FactoryProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get factory data from navigation state or fallback
    const factoryData = location.state?.factoryData || null;

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (!factoryData) {
        return (
            <div className="factory-profile-page">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
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
                        <span className="avatar-icon">🏭</span>
                    </div>
                    <div className="factory-title">
                        <h1>{factoryData.name || 'Unknown Factory'}</h1>
                        <p className="factory-location">📍 {factoryData.location || 'Location not specified'}</p>
                        <div className="capacity-badge" style={{ backgroundColor: getCapacityColor(factoryData.capacity) }}>
                            {getCapacityLabel(factoryData.capacity)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="profile-content">
                {/* Basic Information */}
                <div className="info-section">
                    <h2>🏭 Factory Information</h2>
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
                        {factoryData.establishedYear && (
                            <div className="info-item">
                                <span className="info-label">Established:</span>
                                <span className="info-value">{factoryData.establishedYear}</span>
                            </div>
                        )}
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
                    <h2>🤝 Collaboration Opportunities</h2>
                    <div className="opportunity-tags">
                        <span className="opportunity-tag">🔄 Resource Sharing</span>
                        <span className="opportunity-tag">⚙️ Technical Exchange</span>
                        <span className="opportunity-tag">📊 Best Practices</span>
                        <span className="opportunity-tag">🚚 Logistics Coordination</span>
                        <span className="opportunity-tag">🌾 Supply Chain Integration</span>
                        <span className="opportunity-tag">💡 Innovation Partnerships</span>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="info-section">
                    <h2>📞 Contact Information</h2>
                    <div className="contact-grid">
                        {factoryData.contactInfo?.email && (
                            <div className="contact-item">
                                <span className="contact-icon">📧</span>
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
                                <span className="contact-icon">📱</span>
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
                                <span className="contact-icon">🌐</span>
                                <div className="contact-details">
                                    <span className="contact-label">Website</span>
                                    <a 
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
                    <h2>⚙️ Technical Specifications</h2>
                    <div className="tech-specs">
                        <div className="spec-card">
                            <div className="spec-icon">🏭</div>
                            <div className="spec-content">
                                <h4>Processing Capacity</h4>
                                <p>{factoryData.capacity || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="spec-card">
                            <div className="spec-icon">⏰</div>
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
                            <div className="spec-icon">📅</div>
                            <div className="spec-content">
                                <h4>Established</h4>
                                <p>{factoryData.establishedYear || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="spec-card">
                            <div className="spec-icon">📍</div>
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