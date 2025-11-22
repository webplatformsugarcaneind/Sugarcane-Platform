import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HHMAssociatedFactoriesPage.css';

/**
 * HHMAssociatedFactoriesPage Component
 * 
 * Displays list of factories associated with the HHM.
 * Allows HHM to view factory details and disconnect from factories.
 */
const HHMAssociatedFactoriesPage = () => {
    const navigate = useNavigate();
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFactories, setFilteredFactories] = useState([]);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchAssociatedFactories();
    }, []);

    useEffect(() => {
        filterFactories();
    }, [factories, searchTerm]);

    const fetchAssociatedFactories = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/hhm/associated-factories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const factoriesData = response.data.data || [];
            setFactories(factoriesData);

        } catch (err) {
            console.error('Error fetching associated factories:', err);
            setError(err.response?.data?.message || 'Failed to load associated factories');
        } finally {
            setLoading(false);
        }
    };

    const filterFactories = () => {
        if (!searchTerm.trim()) {
            setFilteredFactories(factories);
        } else {
            const filtered = factories.filter(factory => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (factory.factoryName || factory.name || '').toLowerCase().includes(searchLower) ||
                    (factory.factoryLocation || '').toLowerCase().includes(searchLower) ||
                    (factory.email || '').toLowerCase().includes(searchLower)
                );
            });
            setFilteredFactories(filtered);
        }
    };

    const handleDisconnectClick = (factory) => {
        setSelectedFactory(factory);
        setShowDisconnectModal(true);
    };

    const handleConfirmDisconnect = async () => {
        if (!selectedFactory) return;

        try {
            setProcessingId(selectedFactory._id);
            setError(null);

            const token = localStorage.getItem('token');

            await axios.delete(
                `/api/hhm/associated-factories/${selectedFactory._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess(`Disconnected from ${selectedFactory.factoryName || selectedFactory.name} successfully!`);
            setShowDisconnectModal(false);
            setSelectedFactory(null);

            // Refresh factories list
            await fetchAssociatedFactories();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error('Error disconnecting from factory:', err);
            setError(err.response?.data?.message || 'Failed to disconnect from factory');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDetails = (factoryId) => {
        navigate(`/hhm/factories/${factoryId}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="associated-factories-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading associated factories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="associated-factories-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <rect x="4" y="8" width="6" height="14" />
                            <rect x="14" y="8" width="6" height="14" />
                            <path d="M4 8 L7 3 L10 8" />
                            <path d="M14 8 L17 3 L20 8" />
                        </svg>
                        My Associated Factories
                    </h1>
                    <p>Manage your partnerships with factories you're working with</p>
                </div>
                <div className="header-stats">
                    <div className="stat-box">
                        <span className="stat-number">{factories.length}</span>
                        <span className="stat-label">Active Partnerships</span>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </span>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="alert-close">×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </span>
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="alert-close">×</button>
                </div>
            )}

            {/* Search Bar */}
            {factories.length > 0 && (
                <div className="search-section">
                    <div className="search-bar">
                        <span className="search-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by factory name, location, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                ×
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Factories List */}
            <div className="factories-container">
                {filteredFactories.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            {searchTerm ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                                    <rect x="4" y="8" width="6" height="14" />
                                    <rect x="14" y="8" width="6" height="14" />
                                    <path d="M4 8 L7 3 L10 8" />
                                    <path d="M14 8 L17 3 L20 8" />
                                </svg>
                            )}
                        </div>
                        <h3>
                            {searchTerm
                                ? 'No factories found'
                                : factories.length === 0
                                    ? 'No associated factories yet'
                                    : 'No matching factories'}
                        </h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Accept factory invitations to build partnerships'}
                        </p>
                        {!searchTerm && factories.length === 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/hhm/factory-invitations')}
                            >
                                📨 View Factory Invitations
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="factories-grid">
                        {filteredFactories.map((factory) => (
                            <div key={factory._id} className="factory-card">
                                <div className="card-header">
                                    <div className="factory-avatar">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                            <rect x="4" y="8" width="6" height="14" />
                                            <rect x="14" y="8" width="6" height="14" />
                                            <path d="M4 8 L7 3 L10 8" />
                                            <path d="M14 8 L17 3 L20 8" />
                                        </svg>
                                    </div>
                                    <div className="factory-main-info">
                                        <h3>{factory.factoryName || factory.name || 'Unknown Factory'}</h3>
                                        <p className="factory-location">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {factory.factoryLocation || 'Location not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {/* Capacity */}
                                    {factory.capacity && (
                                        <div className="info-row">
                                            <span className="info-label">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                                    <circle cx="12" cy="12" r="3" />
                                                    <path d="M12 1v6m0 6v6m8.66-11.5l-5.2 3m-6.92 4l-5.2 3m0-12l5.2 3m6.92 4l5.2 3" />
                                                </svg>
                                                Capacity:
                                            </span>
                                            <span className="info-value">{factory.capacity}</span>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {factory.experience && (
                                        <div className="info-row">
                                            <span className="info-label">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                Experience:
                                            </span>
                                            <span className="info-value">{factory.experience}</span>
                                        </div>
                                    )}

                                    {/* Partnership Since */}
                                    <div className="info-row">
                                        <span className="info-label">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                            Partnership Since:
                                        </span>
                                        <span className="info-value">{formatDate(factory.createdAt)}</span>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="contact-section">
                                        <h4>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            Contact:
                                        </h4>
                                        <div className="contact-details">
                                            {factory.email && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                            <polyline points="22,6 12,13 2,6" />
                                                        </svg>
                                                    </span>
                                                    <a href={`mailto:${factory.email}`}>{factory.email}</a>
                                                </div>
                                            )}
                                            {factory.phone && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                                            <line x1="12" y1="18" x2="12.01" y2="18" />
                                                        </svg>
                                                    </span>
                                                    <a href={`tel:${factory.phone}`}>{factory.phone}</a>
                                                </div>
                                            )}
                                            {factory.contactInfo?.website && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="2" y1="12" x2="22" y2="12" />
                                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                                        </svg>
                                                    </span>
                                                    <a
                                                        href={factory.contactInfo.website.startsWith('http')
                                                            ? factory.contactInfo.website
                                                            : `https://${factory.contactInfo.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Visit Website
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleViewDetails(factory._id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14,2 14,8 20,8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                        View Details
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDisconnectClick(factory)}
                                        disabled={processingId === factory._id}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                            <rect x="11" y="2" width="2" height="10" rx="1" />
                                            <path d="M17 8C19.2091 9.53695 20.5 11.9632 20.5 14.7143C20.5 19.1307 16.9706 22.7143 12.6176 22.7143C8.26474 22.7143 4.73535 19.1307 4.73535 14.7143C4.73535 11.9632 6.02636 9.53695 8.23535 8" />
                                        </svg>
                                        Disconnect
                                    </button>
                            </div>
                            </div>
                ))}
            </div>
                )}
        </div>

            {/* Disconnect Confirmation Modal */ }
    {
        showDisconnectModal && selectedFactory && (
            <div className="modal-overlay" onClick={() => setShowDisconnectModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                                <rect x="11" y="2" width="2" height="10" rx="1" />
                                <path d="M17 8C19.2091 9.53695 20.5 11.9632 20.5 14.7143C20.5 19.1307 16.9706 22.7143 12.6176 22.7143C8.26474 22.7143 4.73535 19.1307 4.73535 14.7143C4.73535 11.9632 6.02636 9.53695 8.23535 8" />
                            </svg>
                            Disconnect from Factory
                        </h2>
                        <button className="modal-close" onClick={() => setShowDisconnectModal(false)}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="warning-box">
                            <span className="warning-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </span>
                            <div>
                                <p className="warning-title">Are you sure?</p>
                                <p className="warning-text">
                                    You're about to disconnect from <strong>{selectedFactory.factoryName || selectedFactory.name}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="disconnect-info">
                            <h4>What happens when you disconnect?</h4>
                            <ul>
                                <li>You'll be removed from this factory's associated HHMs list</li>
                                <li>This factory will be removed from your associated factories</li>
                                <li>You can reconnect by accepting a new invitation from them</li>
                            </ul>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowDisconnectModal(false)}
                            disabled={processingId}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleConfirmDisconnect}
                            disabled={processingId}
                        >
                            {processingId ? 'Disconnecting...' : 'Confirm Disconnect'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
        </div >
    );
};

export default HHMAssociatedFactoriesPage;
