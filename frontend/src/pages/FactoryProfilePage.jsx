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
<<<<<<< HEAD
                    <div className="error-icon">⚠️</div>
=======
                    <div className="error-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                    <div className="error-icon">🏭</div>
=======
                    <div className="error-icon">
                        <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none">
                            <rect x="3" y="8" width="18" height="13" rx="1" />
                            <path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
                            <line x1="7" y1="12" x2="7" y2="12.01" />
                            <line x1="11" y1="12" x2="11" y2="12.01" />
                            <line x1="15" y1="12" x2="15" y2="12.01" />
                            <line x1="7" y1="16" x2="7" y2="16.01" />
                            <line x1="11" y1="16" x2="11" y2="16.01" />
                            <line x1="15" y1="16" x2="15" y2="16.01" />
                        </svg>
                    </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                            <span className="avatar-icon">🏭</span>
=======
                            <span className="avatar-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
                                    <rect x="3" y="8" width="18" height="13" rx="1" />
                                    <path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
                                    <line x1="7" y1="12" x2="7" y2="12.01" />
                                    <line x1="11" y1="12" x2="11" y2="12.01" />
                                    <line x1="15" y1="12" x2="15" y2="12.01" />
                                    <line x1="7" y1="16" x2="7" y2="16.01" />
                                    <line x1="11" y1="16" x2="11" y2="16.01" />
                                    <line x1="15" y1="16" x2="15" y2="16.01" />
                                </svg>
                            </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                        </div>
                        <span className="scale-badge" style={{ backgroundColor: getCapacityColor(factory.capacity) }}>
                            {getCapacityLabel(factory.capacity)}
                        </span>
                        <h1 className="factory-name">{factory.name}</h1>
                        <p className="factory-location">
<<<<<<< HEAD
                            <span className="location-icon">📍</span>
=======
                            <span className="location-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                            {factory.location || 'Location not specified'}
                        </p>
                    </div>
                    <div className="info-card">
                        <h2 className="card-title">About Factory</h2>
                        <p className="about-text">
<<<<<<< HEAD
                            {factory.description || 'Modern sugar processing facility.'}
=======
                            {factory.description || 'Modern sugar processing facility. Information not available for operating hours.'}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                        </p>
                    </div>
                    <div className="info-card">
                        <h2 className="card-title">Contact Information</h2>
                        <div className="contact-list">
                            {factory.contactInfo?.email && (
                                <div className="contact-item">
<<<<<<< HEAD
                                    <span className="contact-icon">📧</span>
=======
                                    <span className="contact-icon">
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="m2 7 10 6 10-6" />
                                        </svg>
                                    </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                                    <span className="contact-icon">📱</span>
=======
                                    <span className="contact-icon">
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                            <line x1="12" y1="18" x2="12.01" y2="18" />
                                        </svg>
                                    </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                                    <span className="contact-icon">🌐</span>
=======
                                    <span className="contact-icon">
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                    </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                    <button className="connect-btn">🌐 Connect & Collaborate</button>
=======
                    <button className="connect-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        Connect & Collaborate
                    </button>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                                    <span className="location-icon">📍</span>
=======
                                    <span className="location-icon">
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
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
=======
                                <span className="collab-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                                        <polyline points="23 4 23 10 17 10" />
                                        <polyline points="1 20 1 14 7 14" />
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                    </svg>
                                </span>
                                Resource Sharing
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v6m0 6v6m6-6h6m-6 0H2" />
                                    </svg>
                                </span>
                                Technical Exchange
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                                Best Practices
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                </span>
                                Logistics Coordination
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
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
                                </span>
                                Innovation Partnership
                            </div>
                            <div className="collab-tag">
                                <span className="collab-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    </svg>
                                </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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