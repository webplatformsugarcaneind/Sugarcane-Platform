import React,
{
    useState,
    useEffect
}

    from 'react';
import axios from 'axios';
import './FactorySentInvitationsPage.css';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * FactorySentInvitationsPage Component
 * 
 * Allows factories to view and manage invitations sent to HHMs.
 * Track invitation status and cancel pending invitations.
 */
const FactorySentInvitationsPage = () => {
    const [invitations,
        setInvitations] = useState([]);
    const [loading,
        setLoading] = useState(true);
    const [error,
        setError] = useState(null);
    const [activeTab,
        setActiveTab] = useState('all'); // all, pending, accepted, declined
    const [searchTerm,
        setSearchTerm] = useState('');
    const [cancelingId,
        setCancelingId] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }

        , []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');

            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/factory/invitations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Factory invitations response:', response.data);
            setInvitations(response.data.data || []);
        }

        catch (err) {
            console.error('Error fetching invitations:', err);
            setError(err.response?.data?.message || 'Failed to load invitations');
        }

        finally {
            setLoading(false);
        }
    }

        ;

    const handleCancelInvitation = async (invitationId) => {
        const invitation = invitations.find(inv => inv._id === invitationId);
        const isPending = invitation?.status === 'pending';

        const confirmMessage = isPending
            ? 'Are you sure you want to cancel this invitation?'
            : 'Are you sure you want to remove this invitation from the list?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setCancelingId(invitationId);
            const token = localStorage.getItem('token');

            // Always use the backend API to delete/remove the invitation
            await axios.delete(`/api/factory/invitations/${invitationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Remove from local state after successful backend deletion
            setInvitations(prev => prev.filter(inv => inv._id !== invitationId));

            // Show success message based on status
            if (isPending) {
                alert('Invitation cancelled successfully');
            } else {
                alert('Invitation removed successfully');
            }

        } catch (err) {
            console.error('Error processing invitation:', err);

            // Better error handling for different status codes
            if (err.response?.status === 404) {
                alert('Invitation not found. It may have already been removed.');
                // Remove from local state anyway since it doesn't exist on server
                setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
            } else {
                alert(err.response?.data?.message || 'Failed to process invitation');
            }
        } finally {
            setCancelingId(null);
        }
    };

    const getFilteredInvitations = () => {
        let filtered = invitations;

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(inv => inv.status === activeTab);
        }

        // Filter by search
        if (searchTerm) {
            filtered = filtered.filter(inv => inv.hhmId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.hhmId?.location?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.message?.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return filtered;
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

    // eslint-disable-next-line no-unused-vars
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'accepted':
                return 'badge-success';
            case 'declined':
                return 'badge-danger';
            default:
                return 'badge-default';
        }
    };

    const filteredInvitations = getFilteredInvitations();

    if (loading) {
        return (
            <div className="sent-invitations-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading invitations...</p>
                </div>
            </div>
        );
    }

    return (<div className="sent-invitations-page"> {
        /* Header */
    }

        <div className="page-header"> <div className="header-content"> <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Sent Invitations to HHMs</h1> <p>Track and manage your invitations to Harvest Managers</p> </div> </div> {
            /* Filter Tabs */
        }

        <div className="filter-tabs"> <button className={
            `filter-tab $ {
                activeTab==='all'? 'active' : ''
            }

            `
        }

            onClick={
                () => setActiveTab('all')
            }

        > All ( {
                invitations.length
            }

            ) </button> <button className={
                `filter-tab $ {
                activeTab==='pending'? 'active' : ''
            }

            `
            }

                onClick={
                    () => setActiveTab('pending')
                }

            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
                Pending ( {
                    invitations.filter(i => i.status === 'pending').length
                }

                ) </button> <button className={
                    `filter-tab $ {
                activeTab==='accepted'? 'active' : ''
            }

            `
                }

                    onClick={
                        () => setActiveTab('accepted')
                    }

                >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                </svg>
                Accepted ( {
                    invitations.filter(i => i.status === 'accepted').length
                }

                ) </button> <button className={
                    `filter-tab $ {
                activeTab==='declined'? 'active' : ''
            }

            `
                }

                    onClick={
                        () => setActiveTab('declined')
                    }

                >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Declined ( {
                    invitations.filter(i => i.status === 'declined').length
                }

                ) </button> </div> {
            /* Invitations List */
        }

        <div className="invitations-container"> {
            filteredInvitations.length === 0 ? (<div className="empty-state"> <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
            </div> <h3>No Invitations Found</h3> <p> {
                activeTab === 'all'
                    ? "You haven't sent any invitations yet."

                    : `No $ {
                        activeTab
                    }

                    invitations found.`
            }

                </p> </div>) : (<div className="invitations-grid"> {
                    filteredInvitations.map((invitation) => (<div key={
                        invitation._id
                    }

                        className="invitation-card"> <div className="card-header"> <div className="hhm-info"> <div className="hhm-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                                <path d="M12 20v-8m0 0V4m0 8c2 0 3 1 3 3v5m-3-8c-2 0-3 1-3 3v5" />
                                <path d="M9 3s1 1 1 3-1 3-1 3m6-6s-1 1-1 3 1 3 1 3" />
                            </svg>
                        </div> <div className="hhm-details"> <h3> {
                            invitation.hhmId?.name || 'Unknown HHM'
                        }

                        </h3> <p className="hhm-location">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {
                                        invitation.hhmId?.location || 'Location not specified'
                                    }

                                </p> </div> </div> <div className={
                                    `status-badge $ {
                                    getStatusBadgeClass(invitation.status)
                                }

                                `
                                }

                                > {
                                    invitation.status.toUpperCase()
                                }

                            </div> </div> <div className="card-body"> {
                                invitation.message && (<div className="invitation-message"> <strong>Your Message:</strong> <p> {
                                    invitation.message
                                }

                                </p> </div>)
                            }

                            <div className="invitation-meta"> <div className="meta-item"> <span className="meta-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </span> <span className="meta-label">Sent:</span> <span className="meta-value"> {
                                formatDate(invitation.sentAt)
                            }

                                </span> </div> {
                                    invitation.respondedAt && (<div className="meta-item"> <span className="meta-icon">
                                        {invitation.status === 'accepted' ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M9 12l2 2 4-4" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        )}

                                    </span> <span className="meta-label"> {
                                        invitation.status === 'accepted' ? 'Accepted:' : 'Declined:'
                                    }

                                        </span> <span className="meta-value"> {
                                            formatDate(invitation.respondedAt)
                                        }

                                        </span> </div>)
                                }

                                {
                                    invitation.hhmId?.email && (<div className="meta-item"> <span className="meta-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </span> <span className="meta-label">Email:</span> <span className="meta-value"> {
                                        invitation.hhmId.email
                                    }

                                        </span> </div>)
                                }

                            </div> </div> <div className="card-footer"> {
                                invitation.status === 'pending' ? (<button className="btn btn-danger"

                                    onClick={
                                        () => handleCancelInvitation(invitation._id)
                                    }

                                    disabled={
                                        cancelingId === invitation._id
                                    }

                                > {
                                        cancelingId === invitation._id ? 'Canceling...' : (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                    <polyline points="3,6 5,6 21,6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                                Cancel Invitation
                                            </>
                                        )
                                    }

                                </button>) : invitation.status === 'accepted' ? (<div className="footer-with-actions"> <div className="success-message">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9 12l2 2 4-4" />
                                    </svg>
                                    This HHM has accepted your invitation !
                                </div> <button className="btn btn-secondary"

                                    onClick={
                                        () => handleCancelInvitation(invitation._id)
                                    }

                                    disabled={
                                        cancelingId === invitation._id
                                    }

                                    title="Remove this invitation from the list"

                                > {
                                            cancelingId === invitation._id ? 'Removing...' : (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                        <polyline points="3,6 5,6 21,6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                    Remove
                                                </>
                                            )
                                        }

                                    </button> </div>) : (<div className="footer-with-actions"> <div className="declined-message">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                        This HHM declined your invitation
                                    </div> <button className="btn btn-secondary"

                                        onClick={
                                            () => handleCancelInvitation(invitation._id)
                                        }

                                        disabled={
                                            cancelingId === invitation._id
                                        }

                                        title="Remove this invitation from the list"

                                    > {
                                                cancelingId === invitation._id ? 'Removing...' : (
                                                    <>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                                                            <polyline points="3,6 5,6 21,6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        </svg>
                                                        Remove
                                                    </>
                                                )
                                            }

                                        </button> </div>)
                            }

                        </div> </div>))
                }

                </div>)
        }

        </div> </div>);
};

export default FactorySentInvitationsPage;