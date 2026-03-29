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
                    <h1>🏭 My Associated Factories</h1>
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
                    <span className="alert-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="alert-close">×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✅</span>
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="alert-close">×</button>
                </div>
            )}

            {/* Search Bar */}
            {factories.length > 0 && (
                <div className="search-section">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
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
                            {searchTerm ? '🔍' : '🏭'}
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
                                    <div className="factory-avatar">🏭</div>
                                    <div className="factory-main-info">
                                        <h3>{factory.factoryName || factory.name || 'Unknown Factory'}</h3>
                                        <p className="factory-location">
                                            📍 {factory.factoryLocation || 'Location not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {/* Capacity */}
                                    {factory.capacity && (
                                        <div className="info-row">
                                            <span className="info-label">⚙️ Capacity:</span>
                                            <span className="info-value">{factory.capacity}</span>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {factory.experience && (
                                        <div className="info-row">
                                            <span className="info-label">📅 Experience:</span>
                                            <span className="info-value">{factory.experience}</span>
                                        </div>
                                    )}

                                    {/* Partnership Since */}
                                    <div className="info-row">
                                        <span className="info-label">🤝 Partnership Since:</span>
                                        <span className="info-value">{formatDate(factory.createdAt)}</span>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="contact-section">
                                        <h4>📞 Contact:</h4>
                                        <div className="contact-details">
                                            {factory.email && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">📧</span>
                                                    <a href={`mailto:${factory.email}`}>{factory.email}</a>
                                                </div>
                                            )}
                                            {factory.phone && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">📱</span>
                                                    <a href={`tel:${factory.phone}`}>{factory.phone}</a>
                                                </div>
                                            )}
                                            {factory.contactInfo?.website && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">🌐</span>
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
                                        📋 View Details
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDisconnectClick(factory)}
                                        disabled={processingId === factory._id}
                                    >
                                        🔓 Disconnect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Disconnect Confirmation Modal */}
            {showDisconnectModal && selectedFactory && (
                <div className="modal-overlay" onClick={() => setShowDisconnectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔓 Disconnect from Factory</h2>
                            <button className="modal-close" onClick={() => setShowDisconnectModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="warning-box">
                                <span className="warning-icon">⚠️</span>
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
            )}
        </div>
    );
};

export default HHMAssociatedFactoriesPage;
