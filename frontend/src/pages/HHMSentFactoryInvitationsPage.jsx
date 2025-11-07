import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HHMSentFactoryInvitationsPage.css';

/**
 * HHMSentFactoryInvitationsPage Component
 * 
 * Displays invitations sent by HHM to Factories.
 * Shows status of partnership requests sent to factories.
 */
const HHMSentFactoryInvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [filteredInvitations, setFilteredInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({ pending: 0, accepted: 0, declined: 0 });

    useEffect(() => {
        fetchSentInvitations();
    }, []);

    useEffect(() => {
        filterInvitations();
    }, [invitations, statusFilter]);

    const fetchSentInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            console.log('📤 Fetching sent factory invitations...');

            const response = await axios.get('/api/hhm/my-factory-invitations', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('✅ Sent invitations response:', response.data);

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
            console.error('❌ Error fetching sent invitations:', err);
            setError(
                err.response?.data?.message ||
                'Failed to load sent invitations. Please try again.'
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
            <div className="hhm-sent-invitations-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading sent invitations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hhm-sent-invitations-page">
            <div className="page-header">
                <h1>📤 Sent Factory Invitations</h1>
                <p className="subtitle">Track partnership requests you've sent to factories</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    <span>{error}</span>
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
                        <h3>No {statusFilter !== 'all' ? statusFilter : ''} invitations found</h3>
                        <p>
                            {statusFilter === 'all'
                                ? "You haven't sent any partnership invitations to factories yet."
                                : `You have no ${statusFilter} invitations.`}
                        </p>
                    </div>
                ) : (
                    <div className="invitations-grid">
                        {filteredInvitations.map((invitation) => (
                            <div key={invitation._id} className="invitation-card">
                                <div className="card-header">
                                    <div className="factory-info">
                                        <h3>{invitation.factoryId?.factoryName || invitation.factoryId?.name || 'Unknown Factory'}</h3>
                                        <p className="factory-location">
                                            📍 {invitation.factoryId?.factoryLocation || invitation.factoryId?.location || 'Location not specified'}
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
                                        <p>✉️ {invitation.factoryId?.email || 'N/A'}</p>
                                        <p>📞 {invitation.factoryId?.phone || 'N/A'}</p>
                                    </div>

                                    {invitation.personalMessage && (
                                        <div className="info-section">
                                            <h4>💬 Your Message</h4>
                                            <p className="message-text">{invitation.personalMessage}</p>
                                        </div>
                                    )}

                                    {invitation.invitationReason && (
                                        <div className="info-section">
                                            <h4>📝 Reason</h4>
                                            <p className="reason-text">{invitation.invitationReason}</p>
                                        </div>
                                    )}

                                    {invitation.responseMessage && (
                                        <div className="info-section response-section">
                                            <h4>💭 Factory's Response</h4>
                                            <p className="response-text">{invitation.responseMessage}</p>
                                        </div>
                                    )}

                                    <div className="timeline-section">
                                        <div className="timeline-item">
                                            <span className="timeline-label">Sent:</span>
                                            <span className="timeline-value">{formatDate(invitation.createdAt)}</span>
                                        </div>
                                        {invitation.respondedAt && (
                                            <div className="timeline-item">
                                                <span className="timeline-label">Responded:</span>
                                                <span className="timeline-value">{formatDate(invitation.respondedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HHMSentFactoryInvitationsPage;
