import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FactoryAssociatedHHMsPage.css';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * FactoryAssociatedHHMsPage Component
 * 
 * Displays list of HHMs associated with the factory.
 * Allows viewing HHM details and managing associations.
 */
const FactoryAssociatedHHMsPage = () => {
    const [hhms, setHhms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAssociatedHHMs();
    }, []);

    const fetchAssociatedHHMs = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/factory/associated-hhms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Associated HHMs response:', response.data);
            setHhms(response.data.data || []);
        } catch (err) {
            console.error('Error fetching associated HHMs:', err);
            setError(err.response?.data?.message || 'Failed to load associated HHMs');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredHHMs = () => {
        if (!searchTerm) return hhms;

        return hhms.filter(hhm =>
            hhm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hhm.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hhm.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hhm.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleContact = (hhm) => {
        if (hhm.email) {
            window.location.href = `mailto:${hhm.email}`;
        }
    };

    const handleCall = (hhm) => {
        if (hhm.phone) {
            window.location.href = `tel:${hhm.phone}`;
        }
    };

    const filteredHHMs = getFilteredHHMs();

    if (loading) {
        return (
            <div className="associated-hhms-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading associated HHMs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="associated-hhms-page">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Associated HHMs</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchAssociatedHHMs}>
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="associated-hhms-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>🤝 Associated Harvest Managers</h1>
                    <p>Manage your partnerships with Harvest Managers</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge">
                        {hhms.length} Active Partnerships
                    </div>
                </div>
            </div>

            {/* Search */}
            {hhms.length > 0 && (
                <div className="search-section">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, location, or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            )}

            {/* HHMs Grid */}
            <div className="hhms-container">
                {filteredHHMs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🌾</div>
                        <h3>
                            {searchTerm ? 'No Matching HHMs Found' : 'No Associated HHMs'}
                        </h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search criteria.'
                                : 'You haven\'t partnered with any Harvest Managers yet. Send invitations to start building partnerships!'}
                        </p>
                    </div>
                ) : (
                    <div className="hhms-grid">
                        {filteredHHMs.map((hhm) => (
                            <div key={hhm._id} className="hhm-card">
                                <div className="card-header">
                                    <div className="hhm-avatar">🌾</div>
                                    <div className="hhm-basic-info">
                                        <h3>{hhm.name || 'Unknown Name'}</h3>
                                        <p className="hhm-username">@{hhm.username || 'unknown'}</p>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="hhm-stats">
                                        {hhm.experience && (
                                            <div className="stat-item">
                                                <span className="stat-icon">⭐</span>
                                                <span className="stat-value">{hhm.experience} yrs</span>
                                            </div>
                                        )}
                                        {hhm.location && (
                                            <div className="stat-item">
                                                <span className="stat-icon">📍</span>
                                                <span className="stat-value">{hhm.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="hhm-details">
                                        {hhm.email && (
                                            <div className="detail-row">
                                                <span className="detail-icon">📧</span>
                                                <span className="detail-text">{hhm.email}</span>
                                            </div>
                                        )}

                                        {hhm.phone && (
                                            <div className="detail-row">
                                                <span className="detail-icon">📱</span>
                                                <span className="detail-text">{hhm.phone}</span>
                                            </div>
                                        )}

                                        {hhm.specialization && (
                                            <div className="detail-row">
                                                <span className="detail-icon">🎯</span>
                                                <span className="detail-text">{hhm.specialization}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="action-btn primary"
                                        onClick={() => handleContact(hhm)}
                                        disabled={!hhm.email}
                                    >
                                        📧 Email
                                    </button>
                                    <button
                                        className="action-btn secondary"
                                        onClick={() => handleCall(hhm)}
                                        disabled={!hhm.phone}
                                    >
                                        📱 Call
                                    </button>
                                    <button className="action-btn secondary">
                                        👤 View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FactoryAssociatedHHMsPage;
