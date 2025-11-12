import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FarmerProfileViewPage.css';

/**
 * FarmerProfileViewPage Component
 * 
 * Displays detailed information about a specific farmer
 */
const FarmerProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get farmer data from navigation state or fallback
    const farmerData = location.state?.farmerData || null;

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (!farmerData) {
        return (
            <div className="farmer-profile-page">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Farmer Profile Not Found</h3>
                    <p>Unable to load farmer profile information.</p>
                    <button className="btn btn-primary" onClick={handleGoBack}>
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="farmer-profile-page">
            {/* Header Section */}
            <div className="profile-header">
                <button className="back-button" onClick={handleGoBack}>
                    ← Back to Directory
                </button>
                
                <div className="farmer-header">
                    <div className="farmer-avatar">
                        <div className="avatar-placeholder">
                            🧑‍🌾
                        </div>
                    </div>
                    
                    <div className="farmer-info">
                        <h1>{farmerData.name || 'Unknown Farmer'}</h1>
                        <p className="farmer-subtitle">
                            {farmerData.farmSize ? `${farmerData.farmSize} acres` : 'Farm Size Unknown'} • 
                            {farmerData.location || 'Location Unknown'}
                        </p>
                        <p className="farmer-description">
                            {farmerData.description || 'No description available'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="profile-content">
                {/* Contact Information */}
                <div className="info-section">
                    <h3>📞 Contact Information</h3>
                    <div className="contact-grid">
                        <div className="contact-item">
                            <span className="contact-icon">📧</span>
                            <div className="contact-details">
                                <label>Email</label>
                                <span>{farmerData.email || 'Not available'}</span>
                            </div>
                        </div>
                        
                        <div className="contact-item">
                            <span className="contact-icon">📱</span>
                            <div className="contact-details">
                                <label>Phone</label>
                                <span>{farmerData.phone || 'Not available'}</span>
                            </div>
                        </div>
                        
                        <div className="contact-item">
                            <span className="contact-icon">📍</span>
                            <div className="contact-details">
                                <label>Location</label>
                                <span>{farmerData.location || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Farm Details */}
                <div className="info-section">
                    <h3>🚜 Farm Details</h3>
                    <div className="farm-grid">
                        <div className="farm-detail">
                            <div className="detail-header">
                                <span className="detail-icon">🌾</span>
                                <label>Farm Size</label>
                            </div>
                            <span className="detail-value">{farmerData.farmSize ? `${farmerData.farmSize} acres` : 'Not specified'}</span>
                        </div>

                        <div className="farm-detail">
                            <div className="detail-header">
                                <span className="detail-icon">🌱</span>
                                <label>Crop Types</label>
                            </div>
                            <span className="detail-value">{farmerData.cropTypes || 'Sugarcane'}</span>
                        </div>

                        <div className="farm-detail">
                            <div className="detail-header">
                                <span className="detail-icon">📈</span>
                                <label>Experience</label>
                            </div>
                            <span className="detail-value">{farmerData.experience || 'Not specified'}</span>
                        </div>

                        <div className="farm-detail">
                            <div className="detail-header">
                                <span className="detail-icon">🏆</span>
                                <label>Certification</label>
                            </div>
                            <span className="detail-value">{farmerData.certification || 'Standard'}</span>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="info-section">
                    <h3>ℹ️ Additional Information</h3>
                    <div className="additional-info">
                        <div className="info-item">
                            <span className="info-icon">👤</span>
                            <span>Username: {farmerData.username || 'Not available'}</span>
                        </div>
                        
                        <div className="info-item">
                            <span className="info-icon">📅</span>
                            <span>Member since: {farmerData.createdAt ? new Date(farmerData.createdAt).toLocaleDateString() : 'Not available'}</span>
                        </div>
                        
                        <div className="info-item">
                            <span className="info-icon">🔄</span>
                            <span>Last updated: {farmerData.updatedAt ? new Date(farmerData.updatedAt).toLocaleDateString() : 'Not available'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => {
                    if (farmerData.email) {
                        window.location.href = `mailto:${farmerData.email}`;
                    }
                }}>
                    📧 Send Email
                </button>
                
                {farmerData.phone && (
                    <button className="btn btn-secondary" onClick={() => {
                        window.location.href = `tel:${farmerData.phone}`;
                    }}>
                        📱 Call
                    </button>
                )}
                
                <button className="btn btn-outline" onClick={handleGoBack}>
                    ← Back to Directory
                </button>
            </div>
        </div>
    );
};

export default FarmerProfileViewPage;