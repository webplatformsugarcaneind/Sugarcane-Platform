import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FactoryAssociatedHHMsPage.css';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * FactoryAssociatedHHMsPage Component
 * 
 * Displays list of HHMs associated with the factory.
 * Allows viewing HHM details and managing associations.
 */
const FactoryAssociatedHHMsPage = () => {
    const navigate = useNavigate();
    const { notifications, dismissNotification, notify } = useNotifications();
    const [hhms, setHhms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [removingHHMId, setRemovingHHMId] = useState(null);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedHHMToRemove, setSelectedHHMToRemove] = useState(null);

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

    // Remove HHM association
    const handleRemoveHHM = async (hhmId, hhmName) => {
        setSelectedHHMToRemove({ id: hhmId, name: hhmName });
        setShowRemoveModal(true);
    };

    const confirmRemoveHHM = async () => {
        try {
            setRemovingHHMId(selectedHHMToRemove.id);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            console.log(`🗑️ Removing HHM association: ${selectedHHMToRemove.name}`);

            const response = await axios.delete(`/api/factory/associated-hhms/${selectedHHMToRemove.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ HHM removed successfully:', response.data);

            // Update the HHMs list by removing the deleted HHM
            setHhms(prevHhms => prevHhms.filter(hhm => hhm._id !== selectedHHMToRemove.id));

            // Show simple one-line notification
            notify.hhmRemoved(selectedHHMToRemove.name, 'Factory');

        } catch (err) {
            console.error('❌ Error removing HHM:', err);
            setError(err.response?.data?.message || 'Failed to remove HHM association');
        } finally {
            setRemovingHHMId(null);
            setShowRemoveModal(false);
            setSelectedHHMToRemove(null);
        }
    };

    const cancelRemoveHHM = () => {
        setShowRemoveModal(false);
        setSelectedHHMToRemove(null);
    };

    // View HHM Profile
    const handleViewProfile = (hhm) => {
        console.log('👤 Viewing profile for:', hhm.name);
        // Navigate to relative profile page
        navigate(hhm._id);
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
                    <div className="error-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <h3>Error Loading Associated HHMs</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchAssociatedHHMs}>
                        Retry
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
                    <h1>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M12 2v6m0 0 3-3m-3 3-3-3" />
                            <path d="M3 13a9 9 0 0 0 9 9 9 9 0 0 0 9-9" />
                            <path d="m16 16 2 2 4-4" />
                        </svg>
                        Associated Harvest Managers
                    </h1>
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
                        <span className="search-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
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
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none">
                                <path d="M12 2v20M2 7h10M2 12h10M2 17h10" />
                                <path d="M12 2l5 5-5 5m0 0l-5-5 5-5" />
                            </svg>
                        </div>
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
                                    <div className="hhm-avatar">
                                        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                                            <path d="M12 2v20M2 7h10M2 12h10M2 17h10" />
                                            <path d="M12 2l5 5-5 5m0 0l-5-5 5-5" />
                                        </svg>
                                    </div>
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
                                                <span className="detail-icon">
                                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                                        <path d="m2 7 10 6 10-6" />
                                                    </svg>
                                                </span>
                                                <span className="detail-text">{hhm.email}</span>
                                            </div>
                                        )}

                                        {hhm.phone && (
                                            <div className="detail-row">
                                                <span className="detail-icon">
                                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                                        <line x1="12" y1="18" x2="12.01" y2="18" />
                                                    </svg>
                                                </span>
                                                <span className="detail-text">{hhm.phone}</span>
                                            </div>
                                        )}

                                        {hhm.specialization && (
                                            <div className="detail-row">
                                                <span className="detail-icon">
                                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M12 6v6l4 2" />
                                                    </svg>
                                                </span>
                                                <span className="detail-text">{hhm.specialization}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="action-btn secondary"
                                        onClick={() => handleViewProfile(hhm)}
                                        title="View HHM profile"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        View Profile
                                    </button>
                                    <button
                                        className="action-btn danger"
                                        onClick={() => handleRemoveHHM(hhm._id, hhm.name)}
                                        disabled={removingHHMId === hhm._id}
                                        title="Remove HHM from your partnerships"
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            borderColor: '#dc3545'
                                        }}
                                    >
                                        {removingHHMId === hhm._id ? 'Removing...' : (
                                            <>
                                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                                Remove
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notifications */}
            <NotificationToast
                notifications={notifications}
                onDismiss={dismissNotification}
                position="top-right"
            />

            {/* Remove Confirmation Modal */}
            {showRemoveModal && selectedHHMToRemove && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}>
                        <div className="modal-header" style={{
                            textAlign: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <h3 style={{
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '1.5rem'
                            }}>
                                Remove HHM Partnership
                            </h3>
                        </div>

                        <div className="modal-body" style={{
                            textAlign: 'center',
                            marginBottom: '2rem',
                            color: '#6c757d',
                            lineHeight: 1.6
                        }}>
                            <p>
                                Are you sure you want to remove <strong>{selectedHHMToRemove.name}</strong> from your associated HHMs?
                            </p>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                                This will end your partnership and they will no longer have access to your factory services.
                            </p>
                        </div>

                        <div className="modal-actions" style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={cancelRemoveHHM}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '2px solid #6c757d',
                                    background: 'white',
                                    color: '#6c757d',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = '#6c757d';
                                    e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'white';
                                    e.target.style.color = '#6c757d';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveHHM}
                                disabled={removingHHMId === selectedHHMToRemove.id}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '2px solid #dc3545',
                                    background: '#dc3545',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    opacity: removingHHMId === selectedHHMToRemove.id ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.background = '#c82333';
                                        e.target.style.borderColor = '#c82333';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.background = '#dc3545';
                                        e.target.style.borderColor = '#dc3545';
                                    }
                                }}
                            >
                                {removingHHMId === selectedHHMToRemove.id ? 'Removing...' : (
                                    <>
                                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                        Remove HHM
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FactoryAssociatedHHMsPage;
