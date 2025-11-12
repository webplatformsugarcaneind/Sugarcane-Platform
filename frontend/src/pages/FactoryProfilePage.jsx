import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FactoryProfilePage.css';

const FactoryProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [factory, setFactory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchFactoryProfile();
        } else {
            setError('No factory ID provided');
            setLoading(false);
        }
    }, [id]);

    const fetchFactoryProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }
            const response = await axios.get(`/api/public/factories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const factoryData = response.data.data?.factory || response.data.factory || response.data;
            setFactory(factoryData);
        } catch (err) {
            console.error('Error fetching factory profile:', err);
            setError(err.response?.data?.message || 'Failed to fetch factory profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="factory-profile-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading factory profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="factory-profile-page">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Profile</h3>
                    <p className="error-message">{error}</p>
                    <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
                </div>
            </div>
        );
    }

    if (!factory) {
        return (
            <div className="factory-profile-page">
                <div className="error-container">
                    <div className="error-icon">🏭</div>
                    <h3>Factory Not Found</h3>
                    <p>The factory you are looking for does not exist.</p>
                    <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="factory-profile-page">
            <button onClick={() => navigate(-1)} className="back-btn">← Back to Factory Network</button>
            <div className="profile-container">
                <div className="left-column">
                    <div className="factory-header-card">
                        <div className="factory-avatar">
                            <span className="avatar-icon">🏭</span>
                        </div>
                        <span className="scale-badge" style={{ backgroundColor: getCapacityColor(factory.capacity) }}>
                            {getCapacityLabel(factory.capacity)}
                        </span>
                        <h1 className="factory-name">{factory.name}</h1>
                        <p className="factory-location">
                            <span className="location-icon">📍</span>
                            {factory.location || 'Location not specified'}
                        </p>
                    </div>
                    <div className="info-card">
                        <h2 className="card-title">About Factory</h2>
                        <p className="about-text">
                            {factory.description || 'Modern sugar processing facility. Information not available for operating hours.'}
                        </p>
                    </div>
                    <div className="info-card">
                        <h2 className="card-title">Contact Information</h2>
                        <div className="contact-list">
                            {factory.contactInfo?.email && (
                                <div className="contact-item">
                                    <span className="contact-icon">📧</span>
                                    <div className="contact-details">
                                        <span className="contact-label">Email</span>
                                        <a href={`mailto:${factory.contactInfo.email}`} className="contact-value">
                                            {factory.contactInfo.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {factory.contactInfo?.phone && (
                                <div className="contact-item">
                                    <span className="contact-icon">📱</span>
                                    <div className="contact-details">
                                        <span className="contact-label">Phone</span>
                                        <a href={`tel:${factory.contactInfo.phone}`} className="contact-value">
                                            {factory.contactInfo.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {factory.contactInfo?.website && (
                                <div className="contact-item">
                                    <span className="contact-icon">🌐</span>
                                    <div className="contact-details">
                                        <span className="contact-label">Website</span>
                                        <a href={factory.contactInfo.website.startsWith('http') ? factory.contactInfo.website : `https://${factory.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="contact-value">
                                            Visit Website
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="connect-btn">🌐 Connect & Collaborate</button>
                </div>
                <div className="right-column">
                    <div className="info-card">
                        <h2 className="card-title">Basic Information</h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="info-label">Factory Name</span>
                                <span className="info-value">{factory.name || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Processing Capacity</span>
                                <span className="info-value">{factory.capacity || 'Not specified'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Location</span>
                                <span className="info-value">
                                    <span className="location-icon">📍</span>
                                    {factory.location || 'Location not specified'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Established Year</span>
                                <span className="info-value">{factory.establishedYear || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="info-card">
                        <h2 className="card-title">Collaboration Opportunities</h2>
                        <div className="collaboration-grid">
                            <div className="collab-tag">
                                <span className="collab-icon">🔄</span>
                                Resource Sharing
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">⚙️</span>
                                Technical Exchange
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">✓</span>
                                Best Practices
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">🚚</span>
                                Logistics Coordination
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">💡</span>
                                Innovation Partnership
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">📚</span>
                                Knowledge Sharing
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FactoryProfilePage;