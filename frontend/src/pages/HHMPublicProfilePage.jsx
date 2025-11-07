import React,
{
    useState,
    useEffect
}

    from 'react';

import {
    useParams,
    useNavigate
}

    from 'react-router-dom';
import axios from 'axios';
import './HHMPublicProfilePage.css';

axios.defaults.baseURL = 'http://localhost:5000';

/**
 * HHMPublicProfilePage Component
 * Displays detailed public profile of an HHM
 */
const HHMPublicProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hhm, setHhm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitationMessage, setInvitationMessage] = useState('');
    const [sendingInvitation, setSendingInvitation] = useState(false);

    useEffect(() => {
        fetchHHMProfile();
    }, [id]);

    const fetchHHMProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            console.log('Fetching HHM profile for ID:', id);
            console.log('Token exists:', !!token);

            const response = await axios.get(`/api/factory/hhms/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('HHM Profile Response:', response.data);
            setHhm(response.data.data || response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching HHM profile:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to load HHM profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvitation = async () => {
        if (!hhm) return;

        try {
            setSendingInvitation(true);
            const token = localStorage.getItem('token');

            await axios.post('/api/factory/invite-hhm', {
                hhmId: hhm._id,
                message: invitationMessage
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('✅ Invitation sent successfully!');
            setShowInviteModal(false);
            setInvitationMessage('');
        } catch (err) {
            console.error('Error sending invitation:', err);
            alert(err.response?.data?.message || '❌ Failed to send invitation');
        } finally {
            setSendingInvitation(false);
        }
    };

    if (loading) {
        return (<div className="profile-page"> <div className="loading-container"> <div className="spinner"></div> <p>Loading profile...</p> </div> </div>);
    }

    if (error || !hhm) {
        return (<div className="profile-page"> <div className="error-container"> <div className="error-icon">⚠️</div> <h2>Profile Not Found</h2> <p> {
            error || 'Unable to load HHM profile'
        }

        </p> <button className="btn btn-primary" onClick={
            () => navigate(-1)
        }

        > ← Go Back </button> </div> </div>);
    }

    return (<div className="profile-page"> {
        /* Header */
    }

        <div className="profile-header-section"> <button className="back-button" onClick={
            () => navigate(-1)
        }

        > ← Back </button> <div className="profile-header-content"> <div className="profile-avatar-large"> <span className="avatar-icon">🌾</span> </div> <div className="profile-title"> <h1> {
            hhm.name
        }

        </h1> <p className="username">@{hhm.username || 'unknown'}</p> {
                hhm.location && <p className="location">📍 {
                    hhm.location
                }

                </p>
            }

        </div> <div className="profile-actions"> <button className="btn btn-primary"

            onClick={
                () => setShowInviteModal(true)
            }

        > 📨 Send Invitation </button> </div> </div> </div> {
            /* Main Content */
        }

        <div className="profile-content"> {
            /* Contact Information */
        }

            <div className="profile-card"> <h2 className="card-title">📞 Contact Information</h2> <div className="info-grid"> <div className="info-item"> <span className="info-label">📧 Email</span> <span className="info-value"> {
                hhm.email || 'Not provided'
            }

            </span> </div> <div className="info-item"> <span className="info-label">📱 Phone</span> <span className="info-value"> {
                hhm.phone || 'Not provided'
            }

            </span> </div> <div className="info-item"> <span className="info-label">📍 Location</span> <span className="info-value"> {
                hhm.location || 'Not specified'
            }

            </span> </div> </div> </div> {
                /* Professional Information */
            }

            <div className="profile-card"> <h2 className="card-title">💼 Professional Information</h2> <div className="info-grid"> <div className="info-item"> <span className="info-label">🎯 Experience</span> <span className="info-value"> {
                hhm.experience || 'Not specified'
            }

                years</span> </div> <div className="info-item"> <span className="info-label">🌟 Specialization</span> <span className="info-value"> {
                    hhm.specialization || 'Not specified'
                }

                </span> </div> <div className="info-item"> <span className="info-label">👥 Team Size</span> <span className="info-value"> {
                    hhm.teamSize || 'Not specified'
                }

                </span> </div> {
                    hhm.managementExperience && (<div className="info-item"> <span className="info-label">📊 Management Experience</span> <span className="info-value"> {
                        hhm.managementExperience
                    }

                    </span> </div>)
                }

            </div> </div> {
                /* Services Offered */
            }

            {
                hhm.servicesOffered && hhm.servicesOffered.length > 0 && (<div className="profile-card"> <h2 className="card-title">🛠️ Services Offered</h2> <div className="tags-container"> {
                    hhm.servicesOffered.map((service, index) => (<span key={
                        index
                    }

                        className="tag"> {
                            service
                        }

                    </span>))
                }

                </div> </div>)
            }

            {
                /* Certifications */
            }

            {
                hhm.certifications && hhm.certifications.length > 0 && (<div className="profile-card"> <h2 className="card-title">🏆 Certifications</h2> <ul className="certifications-list"> {
                    hhm.certifications.map((cert, index) => (<li key={
                        index
                    }

                    >✓ {
                            cert
                        }

                    </li>))
                }

                </ul> </div>)
            }

            {
                /* About/Description */
            }

            {
                hhm.description && (<div className="profile-card"> <h2 className="card-title">📝 About</h2> <p className="description"> {
                    hhm.description
                }

                </p> </div>)
            }

        </div> {
            /* Invitation Modal */
        }

        {
            showInviteModal && (<div className="modal-overlay" onClick={
                () => setShowInviteModal(false)
            }

            > <div className="modal-content" onClick={
                (e) => e.stopPropagation()
            }

            > <div className="modal-header"> <h2>📨 Send Invitation to {
                hhm.name
            }

            </h2> <button className="modal-close" onClick={
                () => setShowInviteModal(false)
            }

            >×</button> </div> <div className="modal-body"> <div className="form-group"> <label htmlFor="invitation-message">Message (Optional)</label> <textarea id="invitation-message"

                value={
                    invitationMessage
                }

                onChange={
                    (e) => setInvitationMessage(e.target.value)
                }

                placeholder="Add a personal message to your invitation..."
                rows="4"
                className="invitation-textarea"

            /> <small className="form-hint"> Explain why you'd like to partner with this Harvest Manager
                </small> </div> </div> <div className="modal-footer"> <button className="btn btn-secondary"
                    onClick={
                        () => setShowInviteModal(false)
                    }

                    disabled={
                        sendingInvitation
                    }

                > Cancel </button> <button className="btn btn-primary"

                    onClick={
                        handleSendInvitation
                    }

                    disabled={
                        sendingInvitation
                    }

                > {
                                sendingInvitation ? 'Sending...' : '📨 Send Invitation'
                            }

                        </button> </div> </div> </div>)
        }

    </div>);
}

    ;

export default HHMPublicProfilePage;