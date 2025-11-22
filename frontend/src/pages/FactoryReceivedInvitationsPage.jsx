import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FactoryReceivedInvitationsPage.css';

/**
 * FactoryReceivedInvitationsPage Component
 * 
 * Displays invitations received by Factory from HHMs.
 * Allows Factory to accept or decline partnership requests from HHMs.
 */
const FactoryReceivedInvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [filteredInvitations, setFilteredInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({ pending: 0, accepted: 0, declined: 0 });
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchReceivedInvitations();
    }, []);

    useEffect(() => {
        filterInvitations();
    }, [invitations, statusFilter]);

    const fetchReceivedInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            console.log('📨 Fetching received HHM invitations...');

            const response = await axios.get('/api/factory/received-invitations', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('✅ Received invitations response:', response.data);

            const invitationsData = response.data.data || [];
            setInvitations(invitationsData);

            // Calculate status counts
            const counts = {
                pending: invitationsData.filter(inv => inv.status === 'pending').length,
                accepted: invitationsData.filter(inv => inv.status === 'accepted').length,
                declined: invitationsData.filter(inv => inv.status === 'declined').length
            };
            setStatusCounts(counts);

        } catch (err) {
            console.error('❌ Error fetching received invitations:', err);
            setError(
                err.response?.data?.message ||
                'Failed to load invitations. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const filterInvitations = () => {
        if (statusFilter === 'all') {
            setFilteredInvitations(invitations);
        } else {
            setFilteredInvitations(
                invitations.filter(inv => inv.status === statusFilter)
            );
        }
    };

    const handleRespond = (invitation) => {
        setSelectedInvitation(invitation);
        setShowModal(true);
        setResponseMessage('');
    };

    const submitResponse = async (status) => {
        if (!selectedInvitation) return;

        try {
            setProcessingId(selectedInvitation._id);
            setError(null);

            const token = localStorage.getItem('token');

            const response = await axios.put(
                `/api/factory/received-invitations/${selectedInvitation._id}`,
                {
                    status,
                    responseMessage
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess(`✅ Invitation ${status} successfully!`);
                setShowModal(false);
                fetchReceivedInvitations(); // Refresh the list
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            console.error('Error responding to invitation:', err);
            setError(err.response?.data?.message || `Failed to ${status} invitation`);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-pending';
            case 'accepted':
                return 'badge-accepted';
            case 'declined':
                return 'badge-declined';
            default:
                return 'badge-default';
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="factory-received-invitations-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading invitations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="factory-received-invitations-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Received HHM Invitations
                    </h1>
                    <p>Review and respond to partnership requests from Harvest Managers</p>
                </div>
            </div>

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
                </div>
            )}

            {/* Status Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                >
                    All ({invitations.length})
                </button>
                <button
                    className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Pending ({statusCounts.pending})
                </button>
                <button
                    className={`filter-tab ${statusFilter === 'accepted' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('accepted')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                    Accepted ({statusCounts.accepted})
                </button>
                <button
                    className={`filter-tab ${statusFilter === 'declined' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('declined')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Declined ({statusCounts.declined})
                </button>
            </div>

            {/* Invitations List */}
            <div className="invitations-container">
                {filteredInvitations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17,10 12,15 7,10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </div>
                        <h3>No {statusFilter !== 'all' ? statusFilter : ''} invitations</h3>
                        <p>
                            {statusFilter === 'all'
                                ? "You haven't received any partnership invitations from HHMs yet."
                                : `You have no ${statusFilter} invitations.`}
                        </p>
                    </div>
                ) : (
                    <div className="invitations-grid">
                        {filteredInvitations.map((invitation) => (
                            <div key={invitation._id} className="invitation-card">
                                <div className="card-header">
                                    <div className="hhm-info">
                                        <div className="hhm-avatar">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                                <path d="M12 20v-8m0 0V4m0 8c2 0 3 1 3 3v5m-3-8c-2 0-3 1-3 3v5" />
                                                <path d="M9 3s1 1 1 3-1 3-1 3m6-6s-1 1-1 3 1 3 1 3" />
                                            </svg>
                                        </div>
                                        <div className="hhm-details">
                                            <h3>{invitation.hhmId?.name || 'Unknown HHM'}</h3>
                                            <p className="hhm-location">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {invitation.hhmId?.location || 'Location not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${getStatusBadgeClass(invitation.status)}`}>
                                        {invitation.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-section">
                                        <h4>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                            Contact Information
                                        </h4>
                                        <p>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                            {invitation.hhmId?.email || 'N/A'}
                                        </p>
                                        <p>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            {invitation.hhmId?.phone || 'N/A'}</p>
                                    </div>

                                    {invitation.personalMessage && (
                                        <div className="info-section">
                                            <h4>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                Message from HHM
                                            </h4>
                                            <p className="message-text">{invitation.personalMessage}</p>
                                        </div>
                                    )}

                                    {invitation.invitationReason && (
                                        <div className="info-section">
                                            <h4>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14,2 14,8 20,8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                </svg>
                                                Reason for Partnership
                                            </h4>
                                            <p className="reason-text">{invitation.invitationReason}</p>
                                        </div>
                                    )}

                                    {invitation.responseMessage && (
                                        <div className="info-section response-section">
                                            <h4>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                Your Response
                                            </h4>
                                            <p className="response-text">{invitation.responseMessage}</p>
                                        </div>
                                    )}

                                    <div className="timeline-section">
                                        <div className="timeline-item">
                                            <span className="timeline-label">Received:</span>
                                            <span className="timeline-value">{formatDate(invitation.createdAt)}</span>
                                        </div>
                                        {invitation.respondedAt && (
                                            <div className="timeline-item">
                                                <span className="timeline-label">Responded:</span>
                                                <span className="timeline-value">{formatDate(invitation.respondedAt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {invitation.status === 'pending' && (
                                        <div className="card-footer">
                                            <button
                                                className="action-button accept-button"
                                                onClick={() => handleRespond(invitation)}
                                                disabled={processingId === invitation._id}
                                            >
                                                {processingId === invitation._id ? (
                                                    <>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                            <circle cx="12" cy="12" r="10" />
                                                            <polyline points="12,6 12,12 16,14" />
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M9 12l2 2 4-4" />
                                                        </svg>
                                                        Accept & Respond
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="action-button decline-button"
                                                onClick={() => handleRespond(invitation)}
                                                disabled={processingId === invitation._id}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {showModal && selectedInvitation && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Respond to Invitation</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>HHM:</strong> {selectedInvitation.hhmId?.name}</p>
                            <div className="form-group">
                                <label>Response Message (Optional)</label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    placeholder="Add a message to your response..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-decline"
                                onClick={() => submitResponse('declined')}
                                disabled={processingId}
                            >
                                ❌ Decline
                            </button>
                            <button
                                className="btn btn-accept"
                                onClick={() => submitResponse('accepted')}
                                disabled={processingId}
                            >
                                ✅ Accept Partnership
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FactoryReceivedInvitationsPage;