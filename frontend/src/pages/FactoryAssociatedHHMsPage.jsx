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
            <div className="fah-page">
                <div className="fah-empty">
                    <div className="fah-spinner"></div>
                    <div className="fah-empty-title">Loading associated HHMs...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fah-page">
                <div className="fah-empty">
                    <div className="fah-empty-icon">⚠️</div>
                    <div className="fah-empty-title">Error Loading Associated HHMs</div>
                    <div className="fah-empty-sub">{error}</div>
                    <button className="fah-btn-primary" onClick={fetchAssociatedHHMs}>
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fah-page">
            {/* Header */}
            <div className="fah-header">
                <div className="fah-header-left">
                    <div className="fah-eyebrow">Factory Partnerships</div>
                    <h1 className="fah-title">Associated <em>Harvest Managers</em></h1>
                    <p className="fah-sub">Manage your partnerships with Harvest Managers</p>
                </div>
                <div className="fah-stat-badge">
                    {hhms.length} Active Partnerships
                </div>
            </div>

            {/* Search */}
            {hhms.length > 0 && (
                <div className="fah-toolbar">
                    <div className="fah-search-wrap">
                        <span className="fah-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, location, or specialization…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="fah-search"
                        />
                    </div>
                </div>
            )}

            {/* HHMs Grid */}
            <div>
                {filteredHHMs.length === 0 ? (
                    <div className="fah-empty">
                        <div className="fah-empty-icon">🌾</div>
                        <div className="fah-empty-title">
                            {searchTerm ? 'No Matching HHMs Found' : 'No Associated HHMs'}
                        </div>
                        <div className="fah-empty-sub">
                            {searchTerm
                                ? 'Try adjusting your search criteria.'
                                : 'You haven\'t partnered with any Harvest Managers yet. Send invitations to start building partnerships!'}
                        </div>
                    </div>
                ) : (
                    <div className="fah-grid">
                        {filteredHHMs.map((hhm, idx) => (
                            <div key={hhm._id} className="fah-card" style={{ animation: `fahFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                                <div className="fah-card-header">
                                    <div className="fah-avatar">🌾</div>
                                    <div className="fah-card-title">
                                        <div className="fah-card-name">{hhm.name || 'Unknown Name'}</div>
                                        <div className="fah-card-username">@{hhm.username || 'unknown'}</div>
                                    </div>
                                </div>

                                {/* Quick stats */}
                                {(hhm.experience || hhm.location) && (
                                    <div className="fah-stats">
                                        {hhm.experience && (
                                            <div className="fah-stat">
                                                <span className="fah-stat-icon">⭐</span>
                                                {hhm.experience} yrs
                                            </div>
                                        )}
                                        {hhm.location && (
                                            <div className="fah-stat">
                                                <span className="fah-stat-icon">📍</span>
                                                {hhm.location}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Contact details */}
                                <div className="fah-contact">
                                    {hhm.email && (
                                        <div className="fah-contact-item">
                                            <span className="fah-contact-icon">📧</span>
                                            <span className="fah-contact-text">{hhm.email}</span>
                                        </div>
                                    )}
                                    {hhm.phone && (
                                        <div className="fah-contact-item">
                                            <span className="fah-contact-icon">📱</span>
                                            <span className="fah-contact-text">{hhm.phone}</span>
                                        </div>
                                    )}
                                    {hhm.specialization && (
                                        <div className="fah-contact-item">
                                            <span className="fah-contact-icon">🎯</span>
                                            <span className="fah-contact-text">{hhm.specialization}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="fah-divider"></div>

                                <div className="fah-actions">
                                    <button
                                        className="fah-btn-secondary"
                                        onClick={() => handleViewProfile(hhm)}
                                    >
                                        👤 View Profile
                                    </button>
                                    <button
                                        className="fah-btn-danger"
                                        onClick={() => handleRemoveHHM(hhm._id, hhm.name)}
                                        disabled={removingHHMId === hhm._id}
                                    >
                                        {removingHHMId === hhm._id ? '🔄 Removing...' : '🗑️ Remove'}
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
                <div className="fah-modal-overlay" onClick={cancelRemoveHHM}>
                    <div className="fah-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fah-modal-icon">⚠️</div>
                        <div className="fah-modal-title">Remove HHM Partnership</div>
                        <div className="fah-modal-body">
                            Are you sure you want to remove <strong>{selectedHHMToRemove.name}</strong> from your associated HHMs?
                        </div>
                        <div className="fah-modal-warn">
                            This will end your partnership and they will no longer have access to your factory services.
                        </div>
                        <div className="fah-modal-actions">
                            <button className="fah-btn-secondary" onClick={cancelRemoveHHM}>
                                Cancel
                            </button>
                            <button
                                className="fah-btn-danger"
                                onClick={confirmRemoveHHM}
                                disabled={removingHHMId === selectedHHMToRemove.id}
                            >
                                {removingHHMId === selectedHHMToRemove.id ? '🔄 Removing...' : '🗑️ Remove HHM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FactoryAssociatedHHMsPage;
