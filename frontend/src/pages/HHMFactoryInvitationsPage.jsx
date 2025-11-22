import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HHMFactoryInvitationsPage.css';

/**
 * HHMFactoryInvitationsPage Component
 * 
 * Displays factory invitations received by HHM.
 * Allows HHM to accept or reject partnership invitations from factories.
 */
const HHMFactoryInvitationsPage = () => {
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
        fetchInvitations();
    }, []);

    useEffect(() => {
        filterInvitations();
    }, [invitations, statusFilter]);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/hhm/factory-invitations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const invitationsData = response.data.data || [];
            setInvitations(invitationsData);
            setStatusCounts(response.data.statusCounts || { pending: 0, accepted: 0, declined: 0 });

        } catch (err) {
            console.error('Error fetching invitations:', err);
            setError(err.response?.data?.message || 'Failed to load invitations');
        } finally {
            setLoading(false);
        }
    };

    const filterInvitations = () => {
        if (statusFilter === 'all') {
            setFilteredInvitations(invitations);
        } else {
            setFilteredInvitations(invitations.filter(inv => inv.status === statusFilter));
        }
    };

    const handleRespondClick = (invitation, status) => {
        setSelectedInvitation({ ...invitation, responseAction: status });
        setShowModal(true);
        setResponseMessage('');
    };

    const handleSubmitResponse = async () => {
        if (!selectedInvitation) return;

        try {
            setProcessingId(selectedInvitation._id);
            setError(null);

            const token = localStorage.getItem('token');

            const response = await axios.put(
                `/api/hhm/factory-invitations/${selectedInvitation._id}`,
                {
                    status: selectedInvitation.responseAction,
                    responseMessage: responseMessage
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess(`Invitation ${selectedInvitation.responseAction} successfully!`);
            setShowModal(false);
            setSelectedInvitation(null);
            setResponseMessage('');

            // Refresh invitations
            await fetchInvitations();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error('Error responding to invitation:', err);
            setError(err.response?.data?.message || 'Failed to respond to invitation');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'accepted': return 'status-accepted';
            case 'declined': return 'status-declined';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="invitations-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading invitations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="invitations-page">
            {/* Header */}
            <div className="page-header" style={{ background: 'linear-gradient(135deg, #2c5f2d 0%, #4a7c59 100%)' }}>
                <div className="header-content">
                    <h1>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                            <rect x="3" y="8" width="18" height="13" rx="1" />
                            <path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
                            <line x1="7" y1="12" x2="7" y2="12.01" />
                            <line x1="11" y1="12" x2="11" y2="12.01" />
                            <line x1="15" y1="12" x2="15" y2="12.01" />
                            <line x1="7" y1="16" x2="7" y2="16.01" />
                            <line x1="11" y1="16" x2="11" y2="16.01" />
                            <line x1="15" y1="16" x2="15" y2="16.01" />
                        </svg>
                        Factory Partnership Invitations
                    </h1>
                    <p>Manage invitations from factories seeking partnership with your services</p>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
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
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </span>
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="alert-close">×</button>
                </div>
            )}

            {/* Status Filters */}
            <div className="status-filters">
                <button
                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                >
                    All ({invitations.length})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Pending ({statusCounts.pending})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('accepted')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Accepted ({statusCounts.accepted})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'declined' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('declined')}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Declined ({statusCounts.declined})
                </button>
            </div>

            {/* Invitations List */}
            <div className="invitations-container">
                {filteredInvitations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <h3>No {statusFilter !== 'all' ? statusFilter : ''} invitations</h3>
                        <p>
                            {statusFilter === 'pending'
                                ? 'You don\'t have any pending factory invitations at the moment.'
                                : `No ${statusFilter} invitations to display.`}
                        </p>
                    </div>
                ) : (
                    <div className="invitations-grid">
                        {filteredInvitations.map((invitation) => (
                            <div key={invitation._id} className="invitation-card">
                                <div className="card-header">
                                    <div className="factory-info">
                                        <div className="factory-avatar">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
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
                                        <div>
                                            <h3>{invitation.factoryId?.factoryName || invitation.factoryId?.name || 'Unknown Factory'}</h3>
                                            <p className="factory-location">
                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {invitation.factoryId?.factoryLocation || invitation.factoryId?.location || 'Location not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${getStatusBadgeClass(invitation.status)}`}>
                                        {invitation.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="card-body">
                                    {invitation.personalMessage && (
                                        <div className="message-section">
                                            <h4>
                                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                Message from Factory:
                                            </h4>
                                            <p className="message-text">{invitation.personalMessage}</p>
                                        </div>
                                    )}

                                    {invitation.invitationReason && (
                                        <div className="reason-section">
                                            <h4>
                                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10 9 9 9 8 9" />
                                                </svg>
                                                Invitation Reason:
                                            </h4>
                                            <p>{invitation.invitationReason}</p>
                                        </div>
                                    )}

                                    <div className="details-grid">
                                        {invitation.factoryId?.capacity && (
                                            <div className="detail-item">
                                                <span className="detail-label">Capacity:</span>
                                                <span className="detail-value">{invitation.factoryId.capacity}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="detail-label">Sent:</span>
                                            <span className="detail-value">{formatDate(invitation.createdAt)}</span>
                                        </div>
                                        {invitation.respondedAt && (
                                            <div className="detail-item">
                                                <span className="detail-label">Responded:</span>
                                                <span className="detail-value">{formatDate(invitation.respondedAt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {invitation.responseMessage && (
                                        <div className="response-section">
                                            <h4>Your Response:</h4>
                                            <p>{invitation.responseMessage}</p>
                                        </div>
                                    )}

                                    <div className="contact-info">
                                        <h4>
                                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            Contact Information:
                                        </h4>
                                        <div className="contact-details">
                                            {invitation.factoryId?.email && (
                                                <div className="contact-item">
                                                    <span>
                                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                                            <path d="m2 7 10 6 10-6" />
                                                        </svg>
                                                    </span>
                                                    <a href={`mailto:${invitation.factoryId.email}`}>{invitation.factoryId.email}</a>
                                                </div>
                                            )}
                                            {invitation.factoryId?.phone && (
                                                <div className="contact-item">
                                                    <span>
                                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                                            <line x1="12" y1="18" x2="12.01" y2="18" />
                                                        </svg>
                                                    </span>
                                                    <a href={`tel:${invitation.factoryId.phone}`}>{invitation.factoryId.phone}</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {invitation.status === 'pending' && (
                                    <div className="card-actions">
                                        <button
                                            className="btn btn-accept"
                                            onClick={() => handleRespondClick(invitation, 'accepted')}
                                            disabled={processingId === invitation._id}
                                        >
                                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Accept Partnership
                                        </button>
                                        <button
                                            className="btn btn-decline"
                                            onClick={() => handleRespondClick(invitation, 'declined')}
                                            disabled={processingId === invitation._id}
                                        >
                                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                            Decline
                                        </button>
                                    </div>
                                )}
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
                            <h2>
                                {selectedInvitation.responseAction === 'accepted' ? (
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                )}
                                {selectedInvitation.responseAction === 'accepted' ? 'Accept' : 'Decline'} Invitation
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-factory-name">
                                {selectedInvitation.factoryId?.factoryName || selectedInvitation.factoryId?.name}
                            </p>

                            <div className="form-group">
                                <label>Response Message (Optional):</label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    placeholder={
                                        selectedInvitation.responseAction === 'accepted'
                                            ? 'Add a message for the factory (e.g., "Looking forward to working together!")'
                                            : 'Optionally explain why you\'re declining this invitation'
                                    }
                                    rows="4"
                                    maxLength="300"
                                />
                                <small>{responseMessage.length}/300 characters</small>
                            </div>

                            {selectedInvitation.responseAction === 'accepted' && (
                                <div className="confirmation-note">
                                    <p>
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        By accepting, you'll be added to this factory's associated HHMs list,
                                        and they'll be added to your associated factories.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                disabled={processingId}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${selectedInvitation.responseAction === 'accepted' ? 'btn-accept' : 'btn-decline'}`}
                                onClick={handleSubmitResponse}
                                disabled={processingId}
                            >
                                {processingId ? 'Processing...' : `Confirm ${selectedInvitation.responseAction === 'accepted' ? 'Accept' : 'Decline'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HHMFactoryInvitationsPage;
