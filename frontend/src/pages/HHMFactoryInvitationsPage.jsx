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
                    <h1 >🏭 Factory Partnership Invitations</h1>
                    <p>Manage invitations from factories seeking partnership with your services</p>
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
                    🕐 Pending ({statusCounts.pending})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('accepted')}
                >
                    ✅ Accepted ({statusCounts.accepted})
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'declined' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('declined')}
                >
                    ❌ Declined ({statusCounts.declined})
                </button>
            </div>

            {/* Invitations List */}
            <div className="invitations-container">
                {filteredInvitations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
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
                                        <div className="factory-avatar">🏭</div>
                                        <div>
                                            <h3>{invitation.factoryId?.factoryName || invitation.factoryId?.name || 'Unknown Factory'}</h3>
                                            <p className="factory-location">
                                                📍 {invitation.factoryId?.factoryLocation || invitation.factoryId?.location || 'Location not specified'}
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
                                            <h4>💬 Message from Factory:</h4>
                                            <p className="message-text">{invitation.personalMessage}</p>
                                        </div>
                                    )}

                                    {invitation.invitationReason && (
                                        <div className="reason-section">
                                            <h4>📋 Invitation Reason:</h4>
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
                                        <h4>📞 Contact Information:</h4>
                                        <div className="contact-details">
                                            {invitation.factoryId?.email && (
                                                <div className="contact-item">
                                                    <span>📧</span>
                                                    <a href={`mailto:${invitation.factoryId.email}`}>{invitation.factoryId.email}</a>
                                                </div>
                                            )}
                                            {invitation.factoryId?.phone && (
                                                <div className="contact-item">
                                                    <span>📱</span>
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
                                            ✅ Accept Partnership
                                        </button>
                                        <button
                                            className="btn btn-decline"
                                            onClick={() => handleRespondClick(invitation, 'declined')}
                                            disabled={processingId === invitation._id}
                                        >
                                            ❌ Decline
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
                                {selectedInvitation.responseAction === 'accepted' ? '✅ Accept' : '❌ Decline'} Invitation
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
                                        ✅ By accepting, you'll be added to this factory's associated HHMs list,
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
