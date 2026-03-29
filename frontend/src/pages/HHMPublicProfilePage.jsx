import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContractRequestModal from '../components/ContractRequestModal';
import FarmerJobRequestModal from '../components/FarmerJobRequestModal';
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
    const [isAssociated, setIsAssociated] = useState(false);
    const [checkingAssociation, setCheckingAssociation] = useState(false);
    const [removingAssociation, setRemovingAssociation] = useState(false);
    
    // Contract request state
    const [showContractModal, setShowContractModal] = useState(false);
    const [sendingContractRequest, setSendingContractRequest] = useState(false);
    
    // Farmer job request state
    const [showJobRequestModal, setShowJobRequestModal] = useState(false);
    const [sendingJobRequest, setSendingJobRequest] = useState(false);
    
    // User role state
    const [userRole, setUserRole] = useState('');

    const fetchHHMProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Get user role to determine the correct API endpoint
            const userData = localStorage.getItem('user');
            let currentUserRole = '';
            if (userData) {
                const user = JSON.parse(userData);
                currentUserRole = user.role || '';
            }

            console.log('Fetching HHM profile for ID:', id);
            console.log('Token exists:', !!token);
            console.log('User role:', currentUserRole);

            // Use different endpoints based on user role
            let apiEndpoint;
            if (currentUserRole === 'farmer' || currentUserRole === 'Farmer') {
                apiEndpoint = `/api/farmer/hhms/${id}`;
            } else if (currentUserRole === 'factory' || currentUserRole === 'Factory') {
                apiEndpoint = `/api/factory/hhms/${id}`;
            } else {
                // Default to public endpoint or farmer endpoint
                apiEndpoint = `/api/farmer/hhms/${id}`;
            }

            console.log('Using API endpoint:', apiEndpoint);

            const response = await axios.get(apiEndpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('HHM Profile Response:', response.data);
            setHhm(response.data.data || response.data.hhm || response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching HHM profile:', err);
            console.error('Error response:', err.response?.data);
            
            if (err.response?.status === 401) {
                setError('Please login to view HHM profiles');
                navigate('/login');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view this profile.');
            } else if (err.response?.status === 404) {
                setError('HHM not found');
            } else {
                setError(err.response?.data?.message || 'Failed to load HHM profile');
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const checkAssociation = useCallback(async () => {
        try {
            setCheckingAssociation(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('/api/factory/associated-hhms', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const associatedHHMs = response.data.data || [];
            const isAlreadyAssociated = associatedHHMs.some(associatedHHM => associatedHHM._id === id);
            setIsAssociated(isAlreadyAssociated);
        } catch (err) {
            console.error('Error checking association:', err);
            // If we can't check association, default to showing invite option
            setIsAssociated(false);
        } finally {
            setCheckingAssociation(false);
        }
    }, [id]);

    useEffect(() => {
        // Get user role from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role || '');
        }
        
        const fetchData = async () => {
            await fetchHHMProfile();
            await checkAssociation();
        };
        fetchData();
    }, [fetchHHMProfile, checkAssociation]);

    const handleRemoveAssociation = async () => {
        if (!hhm) return;
        
        // Show confirmation dialog
        const confirmRemoval = window.confirm(
            `Are you sure you want to end the contract/association with ${hhm.name}? This action cannot be undone.`
        );
        
        if (!confirmRemoval) return;
        
        try {
            setRemovingAssociation(true);
            const token = localStorage.getItem('token');

            await axios.delete(`/api/factory/associated-hhms/${hhm._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('✅ Association removed successfully!');
            setIsAssociated(false); // Update the state to show invite option again
        } catch (err) {
            console.error('Error removing association:', err);
            console.error('Error response data:', err.response?.data);
            
            let errorMessage = 'Failed to remove association';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status) {
                errorMessage = `Failed to remove association (Error ${err.response.status})`;
            }
            
            alert(`❌ ${errorMessage}`);
        } finally {
            setRemovingAssociation(false);
        }
    };

    const handleSendInvitation = async () => {
        if (!hhm) return;
        
        // Prevent multiple concurrent requests
        if (sendingInvitation) return;

        try {
            setSendingInvitation(true);
            const token = localStorage.getItem('token');

            await axios.post('/api/contracts/invite', {
                hhm_id: hhm._id,
                title: 'Partnership Invitation',
                initial_message: invitationMessage || 'We would like to invite you to join our factory as a partner.',
                priority: 'medium'
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
            console.error('Error response data:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            let errorMessage = 'Failed to send invitation';
            
            if (err.response?.data?.message) {
                const backendMessage = err.response.data.message;
                if (backendMessage.includes('pending invitation')) {
                    errorMessage = 'You have already sent a pending invitation to this HHM. Please wait for their response.';
                } else if (backendMessage.includes('already associated')) {
                    errorMessage = 'This HHM is already associated with your factory.';
                } else if (backendMessage.includes('invitation conflict')) {
                    errorMessage = 'There seems to be a pending invitation for this HHM. Please try again in a few moments.';
                } else {
                    errorMessage = backendMessage;
                }
            } else if (err.response?.status) {
                errorMessage = `Failed to send invitation (Error ${err.response.status})`;
            }
            
            alert(`❌ ${errorMessage}`);
        } finally {
            setSendingInvitation(false);
        }
    };

    // Handle contract request submission
    const handleContractRequest = async (requestData) => {
        try {
            setSendingContractRequest(true);
            const token = localStorage.getItem('token');

            console.log('Sending contract request:', requestData);

            await axios.post('/api/contracts/request', requestData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('✅ Contract request sent successfully! The factory will review your proposal.');
            setShowContractModal(false);
        } catch (err) {
            console.error('Error sending contract request:', err);
            console.error('Error response data:', err.response?.data);
            
            let errorMessage = 'Failed to send contract request';
            
            if (err.response?.data?.message) {
                const backendMessage = err.response.data.message;
                if (backendMessage.includes('active contract')) {
                    errorMessage = 'You already have an active contract negotiation with this factory. Please wait for it to be resolved.';
                } else {
                    errorMessage = backendMessage;
                }
            } else if (err.response?.status) {
                errorMessage = `Failed to send contract request (Error ${err.response.status})`;
            }
            
            alert(`❌ ${errorMessage}`);
            throw err; // Re-throw to prevent modal from closing
        } finally {
            setSendingContractRequest(false);
        }
    };

    // Handle farmer job request submission
    const handleJobRequest = async (requestData) => {
        try {
            setSendingJobRequest(true);
            const token = localStorage.getItem('token');

            console.log('Sending farmer job request:', requestData);

            // Send request to our farmer-contract API
            await axios.post('/api/farmer-contracts/request', {
                hhm_id: hhm._id,
                contract_details: {
                    farmLocation: requestData.farmLocation,
                    workType: requestData.workType,
                    requirements: requestData.requirements,
                    paymentTerms: requestData.paymentTerms,
                    startDate: requestData.startDate,
                    additionalNotes: requestData.additionalNotes
                },
                duration_days: requestData.duration_days,
                grace_period_days: requestData.grace_period_days
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            alert('✅ Job request sent successfully! The HHM will review your proposal.');
            setShowJobRequestModal(false);
        } catch (err) {
            console.error('Error sending job request:', err);
            console.error('Error response data:', err.response?.data);
            
            let errorMessage = 'Failed to send job request';
            
            if (err.response?.data?.message) {
                const backendMessage = err.response.data.message;
                if (backendMessage.includes('pending request')) {
                    errorMessage = 'You already have a pending job request with this HHM. Please wait for their response.';
                } else if (backendMessage.includes('active contract')) {
                    errorMessage = 'You already have an active contract with this HHM.';
                } else {
                    errorMessage = backendMessage;
                }
            } else if (err.response?.status) {
                errorMessage = `Failed to send job request (Error ${err.response.status})`;
            }
            
            alert(`❌ ${errorMessage}`);
            throw err; // Re-throw to prevent modal from closing
        } finally {
            setSendingJobRequest(false);
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

        </div> <div className="profile-actions"> 
            {/* Show different buttons based on user role */}
            {userRole === 'Factory' && (
                <>
                    {isAssociated ? (
                        <button 
                            className="btn btn-danger"
                            onClick={handleRemoveAssociation}
                            disabled={removingAssociation || checkingAssociation}
                        >
                            {removingAssociation ? '🔄 Removing...' : '🚫 End Contract'}
                        </button>
                    ) : (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowInviteModal(true)}
                            disabled={checkingAssociation}
                        >
                            📨 Invite to Join
                        </button>
                    )}
                </>
            )}
            
            {/* Contract Request button for HHMs */}
            {userRole === 'HHM' && (
                <button 
                    className="btn btn-success"
                    onClick={() => setShowContractModal(true)}
                    disabled={sendingContractRequest}
                >
                    📋 Request Contract
                </button>
            )}

            {/* Job Request button for Farmers */}
            {userRole === 'Farmer' && (
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowJobRequestModal(true)}
                    disabled={sendingJobRequest}
                >
                    🌾 Send Job Request
                </button>
            )}
        </div> </div> </div> {
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
                hhm.servicesOffered && (<div className="profile-card"> <h2 className="card-title">🛠️ Services Offered</h2> <div className="tags-container"> {
                    // Handle servicesOffered as string (split by comma) or array
                    Array.isArray(hhm.servicesOffered) 
                        ? hhm.servicesOffered.map((service, index) => (<span key={index} className="tag"> {service} </span>))
                        : hhm.servicesOffered.includes(',') 
                        ? hhm.servicesOffered.split(',').map((service, index) => (<span key={index} className="tag"> {service.trim()} </span>))
                        : (<span className="tag"> {hhm.servicesOffered} </span>)
                }

                </div> </div>)
            }

            {
                /* Certifications */
            }

            {
                hhm.certifications && (<div className="profile-card"> <h2 className="card-title">🏆 Certifications</h2> <ul className="certifications-list"> {
                    // Handle certifications as string (split by comma) or array
                    Array.isArray(hhm.certifications)
                        ? hhm.certifications.map((cert, index) => (<li key={index}>✓ {cert}</li>))
                        : hhm.certifications.includes(',')
                        ? hhm.certifications.split(',').map((cert, index) => (<li key={index}>✓ {cert.trim()}</li>))
                        : (<li>✓ {hhm.certifications}</li>)
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

            > <div className="modal-header"> <h2>📨 Invite {
                hhm.name
            } to Join

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

        {/* Contract Request Modal for HHMs */}
        {showContractModal && (
            <ContractRequestModal
                isOpen={showContractModal}
                onClose={() => setShowContractModal(false)}
                factoryInfo={hhm} // Note: In this context, we're viewing HHM profile, but requesting contract with factory
                onSubmit={handleContractRequest}
                loading={sendingContractRequest}
            />
        )}

        {/* Job Request Modal for Farmers */}
        {showJobRequestModal && (
            <FarmerJobRequestModal
                isOpen={showJobRequestModal}
                onClose={() => setShowJobRequestModal(false)}
                hhmInfo={hhm}
                onSubmit={handleJobRequest}
                loading={sendingJobRequest}
            />
        )}

    </div>);
}

    ;

export default HHMPublicProfilePage;