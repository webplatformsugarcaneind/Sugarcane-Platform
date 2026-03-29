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

        <div className="page-header"> <div className="header-content"> <h1>📨 Sent Invitations to HHMs</h1> <p>Track and manage your invitations to Harvest Managers</p> </div> </div> {
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

            > ⏳ Pending ( {
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

                > ✅ Accepted ( {
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

                > ❌ Declined ( {
                    invitations.filter(i => i.status === 'declined').length
                }

                ) </button> </div> {
            /* Invitations List */
        }

        <div className="invitations-container"> {
            filteredInvitations.length === 0 ? (<div className="empty-state"> <div className="empty-icon">📭</div> <h3>No Invitations Found</h3> <p> {
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

                    className="invitation-card"> <div className="card-header"> <div className="hhm-info"> <div className="hhm-avatar">🌾</div> <div className="hhm-details"> <h3> {
                        invitation.hhmId?.name || 'Unknown HHM'
                    }

                    </h3> <p className="hhm-location"> 📍 {
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

                        <div className="invitation-meta"> <div className="meta-item"> <span className="meta-icon">📅</span> <span className="meta-label">Sent:</span> <span className="meta-value"> {
                            formatDate(invitation.sentAt)
                        }

                        </span> </div> {
                                invitation.respondedAt && (<div className="meta-item"> <span className="meta-icon"> {
                                    invitation.status === 'accepted' ? '✅' : '❌'
                                }

                                </span> <span className="meta-label"> {
                                    invitation.status === 'accepted' ? 'Accepted:' : 'Declined:'
                                }

                                    </span> <span className="meta-value"> {
                                        formatDate(invitation.respondedAt)
                                    }

                                    </span> </div>)
                            }

                            {
                                invitation.hhmId?.email && (<div className="meta-item"> <span className="meta-icon">📧</span> <span className="meta-label">Email:</span> <span className="meta-value"> {
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
                                    cancelingId === invitation._id ? 'Canceling...' : '🗑️ Cancel Invitation'
                                }

                            </button>) : invitation.status === 'accepted' ? (<div className="footer-with-actions"> <div className="success-message"> ✅ This HHM has accepted your invitation ! </div> <button className="btn btn-secondary"

                                onClick={
                                    () => handleCancelInvitation(invitation._id)
                                }

                                disabled={
                                    cancelingId === invitation._id
                                }

                                title="Remove this invitation from the list"

                            > {
                                    cancelingId === invitation._id ? 'Removing...' : '🗑️ Remove'
                                }

                            </button> </div>) : (<div className="footer-with-actions"> <div className="declined-message"> ❌ This HHM declined your invitation </div> <button className="btn btn-secondary"

                                onClick={
                                    () => handleCancelInvitation(invitation._id)
                                }

                                disabled={
                                    cancelingId === invitation._id
                                }

                                title="Remove this invitation from the list"

                            > {
                                    cancelingId === invitation._id ? 'Removing...' : '🗑️ Remove'
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