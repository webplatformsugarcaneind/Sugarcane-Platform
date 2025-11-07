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
                <h1>📥 Received HHM Invitations</h1>
                <p className="subtitle">Partnership requests from Hub Head Managers</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✅</span>
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
                    ⏳ Pending ({statusCounts.pending})
                </button>
                <button
                    className={`filter-tab ${statusFilter === 'accepted' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('accepted')}
                >
                    ✅ Accepted ({statusCounts.accepted})
                </button>
                <button
                    className={`filter-tab ${statusFilter === 'declined' ? 'active' : ''}`}
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
                                        <h3>{invitation.hhmId?.name || 'Unknown HHM'}</h3>
                                        <p className="hhm-experience">
                                            💼 {invitation.hhmId?.experience || 'Experience not specified'}
                                        </p>
                                    </div>
                                    <span className={`status-badge ${getStatusBadgeClass(invitation.status)}`}>
                                        {invitation.status === 'pending' && '⏳ '}
                                        {invitation.status === 'accepted' && '✅ '}
                                        {invitation.status === 'declined' && '❌ '}
                                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-section">
                                        <h4>📧 Contact Information</h4>
                                        <p>✉️ {invitation.hhmId?.email || 'N/A'}</p>
                                        <p>📞 {invitation.hhmId?.phone || 'N/A'}</p>
                                    </div>

                                    {invitation.personalMessage && (
                                        <div className="info-section">
                                            <h4>💬 Message from HHM</h4>
                                            <p className="message-text">{invitation.personalMessage}</p>
                                        </div>
                                    )}

                                    {invitation.invitationReason && (
                                        <div className="info-section">
                                            <h4>📝 Reason for Partnership</h4>
                                            <p className="reason-text">{invitation.invitationReason}</p>
                                        </div>
                                    )}

                                    {invitation.responseMessage && (
                                        <div className="info-section response-section">
                                            <h4>💭 Your Response</h4>
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
                                        <div className="action-buttons">
                                            <button
                                                className="btn-respond btn-accept"
                                                onClick={() => handleRespond(invitation)}
                                                disabled={processingId === invitation._id}
                                            >
                                                {processingId === invitation._id ? 'Processing...' : '📝 Respond'}
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
