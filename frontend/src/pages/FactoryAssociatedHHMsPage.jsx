import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FactoryAssociatedHHMsPage.css';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';

// Set axios base URL
axios.defaults.baseURL = API_BASE_URL;

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

            const response = await axios.delete(`/api/factory/associated-hhms/${selectedHHMToRemove.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setHhms(prevHhms => prevHhms.filter(hhm => hhm._id !== selectedHHMToRemove.id));
            notify.hhmRemoved(selectedHHMToRemove.name, 'Factory');

        } catch (err) {
            console.error('Error removing HHM:', err);
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

    const handleViewProfile = (hhm) => {
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
            <div className="hd-page">
                <div className="hd-loading">
                    <div className="hd-spinner"></div>
                    <div className="hd-empty-title">Loading associated HHMs...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hd-page">
                <div className="hd-empty">
                    <div className="hd-empty-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: 'var(--amber)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    </div>
                    <div className="hd-empty-title">Error Loading Associated HHMs</div>
                    <div className="hd-empty-sub">{error}</div>
                    <button className="hd-btn-request" onClick={fetchAssociatedHHMs}>
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="hd-page">
            {/* Header */}
            <div className="hd-header">
                <div className="ph-top" style={{ alignItems: 'center' }}>
                    <div className="fah-header-left">
                        <div className="ph-eyebrow">Factory Partnerships</div>
                        <h1 className="hd-title">Associated <em>Harvest Managers</em></h1>
                        <p className="hd-sub">Manage your partnerships with Harvest Managers</p>
                    </div>
                    <div className="hc-role-badge" style={{ fontSize: '0.82rem', padding: '8px 18px' }}>
                        {hhms.length} Active Partnerships
                    </div>
                </div>
            </div>

            {/* Search */}
            {hhms.length > 0 && (
                <div className="hd-toolbar">
                    <div className="hd-search-wrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)' }}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                        <input
                            type="text"
                            placeholder="Search by name, location, or specialization…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="hd-search"
                        />
                    </div>
                </div>
            )}

            {/* HHMs Grid */}
            <div>
                {filteredHHMs.length === 0 ? (
                    <div className="hd-empty">
                        <div className="hd-empty-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: 'var(--green)'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                        </div>
                        <div className="hd-empty-title">
                            {searchTerm ? 'No Matching HHMs Found' : 'No Associated HHMs'}
                        </div>
                        <div className="hd-empty-sub">
                            {searchTerm
                                ? 'Try adjusting your search criteria.'
                                : 'You haven\'t partnered with any Harvest Managers yet. Send invitations to start building partnerships!'}
                        </div>
                    </div>
                ) : (
                    <div className="hd-grid">
                        {filteredHHMs.map((hhm, idx) => (
                            <div key={hhm._id} className="hd-card active" style={{ animation: `hdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                                <div className="hc-header">
                                    <div className="hc-avatar">👤</div>
                                    <div className="hc-title-wrap">
                                        <div className="hc-name">{hhm.name || 'Unknown Name'}</div>
                                        <div className="hc-username">@{hhm.username || 'unknown'}</div>
                                        <div className="hc-role-badge">Partner</div>
                                    </div>
                                    <div className="hc-status">
                                        <span className="hd-status-badge active">
                                            ACTIVE
                                        </span>
                                    </div>
                                </div>

                                {/* Contact details */}
                                <div className="hc-contact">
                                    {hhm.location && (
                                        <div className="hc-contact-item">
                                            <span className="hc-contact-icon">📍</span>
                                            <span className="hc-contact-text">{hhm.location}</span>
                                        </div>
                                    )}
                                    {hhm.email && (
                                        <div className="hc-contact-item">
                                            <span className="hc-contact-icon">📧</span>
                                            <span className="hc-contact-text">{hhm.email}</span>
                                        </div>
                                    )}
                                    {hhm.phone && (
                                        <div className="hc-contact-item">
                                            <span className="hc-contact-icon">📱</span>
                                            <span className="hc-contact-text">{hhm.phone}</span>
                                        </div>
                                    )}
                                    {hhm.specialization && (
                                        <div className="hc-contact-item">
                                            <span className="hc-contact-icon">🎯</span>
                                            <span className="hc-contact-text">{hhm.specialization}</span>
                                        </div>
                                    )}
                                    {hhm.experience && (
                                        <div className="hc-contact-item">
                                            <span className="hc-contact-icon"><svg viewBox="0 0 24 24" fill="#f59e0b" width="15" height="15" style={{verticalAlign:'middle'}}><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"/></svg></span>

                                            <span className="hc-contact-text">{hhm.experience} years exp.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="hc-divider"></div>

                                <div className="hc-actions">
                                    <button
                                        className="hd-btn-profile"
                                        onClick={() => handleViewProfile(hhm)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        View Profile
                                    </button>
                                    <button
                                        className="hd-btn-danger"
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
                <div className="hd-modal-overlay" onClick={cancelRemoveHHM}>
                    <div className="hd-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="hd-modal-icon">⚠️</div>
                        <div className="hd-modal-title">Remove HHM Partnership</div>
                        <div className="hd-modal-body">
                            Are you sure you want to remove <strong>{selectedHHMToRemove.name}</strong> from your associated HHMs?
                        </div>
                        <div className="hd-modal-warn">
                            This will end your partnership and they will no longer have access to your factory services.
                        </div>
                        <div className="hd-modal-actions">
                            <button className="hd-btn-profile" onClick={cancelRemoveHHM}>
                                Cancel
                            </button>
                            <button
                                className="hd-btn-danger"
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
