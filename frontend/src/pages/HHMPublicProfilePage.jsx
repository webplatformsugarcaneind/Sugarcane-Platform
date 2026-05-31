import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContractRequestModal from '../components/ContractRequestModal';
import FarmerJobRequestModal from '../components/FarmerJobRequestModal';
import './FarmerProfile.css'; // Leverage unified Dark Mode CSS

axios.defaults.baseURL = API_BASE_URL;

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

    // Cursor tracking

    const fetchHHMProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            let currentUserRole = '';
            if (userData) {
                const user = JSON.parse(userData);
                currentUserRole = user.role || '';
            }

            let apiEndpoint;
            if (currentUserRole === 'farmer' || currentUserRole === 'Farmer') {
                apiEndpoint = `/api/farmer/hhms/${id}`;
            } else if (currentUserRole === 'factory' || currentUserRole === 'Factory') {
                apiEndpoint = `/api/factory/hhms/${id}`;
            } else {
                apiEndpoint = `/api/farmer/hhms/${id}`;
            }

            const response = await axios.get(apiEndpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHhm(response.data.data || response.data.hhm || response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching HHM profile:', err);
            if (err.response?.status === 401) {
                setError('Please login to view HHM profiles');
                navigate('/login');
            } else if (err.response?.status === 403) {
                setError('Access denied.');
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
                headers: { Authorization: `Bearer ${token}` }
            });

            const associatedHHMs = response.data.data || [];
            const isAlreadyAssociated = associatedHHMs.some(associatedHHM => associatedHHM._id === id);
            setIsAssociated(isAlreadyAssociated);
        } catch (err) {
            console.error('Error checking association:', err);
            setIsAssociated(false);
        } finally {
            setCheckingAssociation(false);
        }
    }, [id]);

    useEffect(() => {
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
        const confirmRemoval = window.confirm(
            `Are you sure you want to end the contract/association with ${hhm.name}?`
        );
        if (!confirmRemoval) return;
        
        try {
            setRemovingAssociation(true);
            const token = localStorage.getItem('token');
            await axios.delete(`/api/factory/associated-hhms/${hhm._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Association removed successfully!');
            setIsAssociated(false);
        } catch (err) {
            console.error('Error removing association:', err);
            let errorMessage = err.response?.data?.message || 'Failed to remove association';
            alert(`❌ ${errorMessage}`);
        } finally {
            setRemovingAssociation(false);
        }
    };

    const handleSendInvitation = async () => {
        if (!hhm || sendingInvitation) return;
        try {
            setSendingInvitation(true);
            const token = localStorage.getItem('token');
            await axios.post('/api/contracts/invite', {
                hhm_id: hhm._id,
                title: 'Partnership Invitation',
                initial_message: invitationMessage || 'We would like to invite you.',
                priority: 'medium'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Invitation sent successfully!');
            setShowInviteModal(false);
            setInvitationMessage('');
        } catch (err) {
            console.error('Error sending invitation:', err);
            let errorMessage = err.response?.data?.message || 'Failed to send invitation';
            alert(`❌ ${errorMessage}`);
        } finally {
            setSendingInvitation(false);
        }
    };

    const handleContractRequest = async (requestData) => {
        try {
            setSendingContractRequest(true);
            const token = localStorage.getItem('token');
            await axios.post('/api/contracts/request', requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Contract request sent successfully!');
            setShowContractModal(false);
        } catch (err) {
            console.error('Error sending contract request:', err);
            let errorMessage = err.response?.data?.message || 'Failed to send request';
            alert(`❌ ${errorMessage}`);
            throw err;
        } finally {
            setSendingContractRequest(false);
        }
    };

    const handleJobRequest = async (requestData) => {
        try {
            setSendingJobRequest(true);
            const token = localStorage.getItem('token');
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
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            alert('✅ Job request sent successfully!');
            setShowJobRequestModal(false);
        } catch (err) {
            console.error('Error sending job request:', err);
            let errorMessage = err.response?.data?.message || 'Failed to send request';
            alert(`❌ ${errorMessage}`);
            throw err;
        } finally {
            setSendingJobRequest(false);
        }
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: 'var(--green)' }}>Loading Profile...</div>
          </div>
        );
    }

    if (error || !hhm) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Profile Not Found'}</div>
            <button className="fp-save-btn" onClick={() => navigate(-1)}>← Go Back</button>
          </div>
        );
    }

    const initials = hhm.name ? hhm.name.substring(0, 2).toUpperCase() : 'HH';

    return (
        <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div className="fp-noise" />
            <div className="fp-bg-glow" />

            <div className="fp-layout-shell">
                <aside className="fp-sidebar" >
                    <div className="fp-sidebar-profile">
                        <div className="fp-avatar-wrap">
                            <div className="fp-avatar">{initials}</div>
                            <div className="fp-avatar-ring"></div>
                        </div>
                        <div className="fp-user-name">{hhm.name}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot"></span>
                            Harvest Manager
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{hhm.experience ? String(hhm.experience).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Years Exp</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{hhm.teamSize ? String(hhm.teamSize).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Team Size</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        {userRole === 'Factory' && (
                            <>
                                {isAssociated ? (
                                    <button className="fp-save-btn" onClick={handleRemoveAssociation} disabled={removingAssociation || checkingAssociation} style={{ width: '100%', background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
                                        {removingAssociation ? '🔄 Removing...' : '🚫 End Contract'}
                                    </button>
                                ) : (
                                    <button className="fp-save-btn" onClick={() => setShowInviteModal(true)} disabled={checkingAssociation} style={{ width: '100%' }}>
                                        📨 Invite to Join
                                    </button>
                                )}
                            </>
                        )}
                        
                        {userRole === 'HHM' && (
                            <button className="fp-save-btn" onClick={() => setShowContractModal(true)} disabled={sendingContractRequest} style={{ width: '100%' }}>
                                📋 Request Contract
                            </button>
                        )}

                        {userRole === 'Farmer' && (
                            <button className="fp-save-btn" onClick={() => setShowJobRequestModal(true)} disabled={sendingJobRequest} style={{ width: '100%' }}>
                                🌾 Send Job Request
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">HM Profile</div>
                            <h1 className="fp-title">{hhm.name}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">@{hhm.username || 'unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={() => navigate(-1)} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">📞</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Contact Information</h2>
                                <div className="fp-card-sub">Get in touch with this manager</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Email Address</label>
                                    <input type="email" readOnly value={hhm.email || 'Not provided'} />
                                </div>
                                <div className="fp-field">
                                    <label>Phone Number</label>
                                    <input type="tel" readOnly value={hhm.phone || 'Not provided'} />
                                </div>
                                <div className="fp-field">
                                    <label>Location</label>
                                    <input type="text" readOnly value={hhm.location || 'Not specified'} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">💼</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Professional Information</h2>
                                <div className="fp-card-sub">Experience and operations details</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Services Offered</label>
                                    <input type="text" readOnly value={Array.isArray(hhm.servicesOffered) ? hhm.servicesOffered.join(', ') : (hhm.servicesOffered || 'Not specified')} />
                                </div>
                                <div className="fp-field full-width">
                                    <label>Specialization</label>
                                    <input type="text" readOnly value={hhm.specialization || 'Not specified'} />
                                </div>
                                {hhm.certifications && (
                                    <div className="fp-field full-width">
                                        <label>Certifications</label>
                                        <input type="text" readOnly value={Array.isArray(hhm.certifications) ? hhm.certifications.join(', ') : hhm.certifications} />
                                    </div>
                                )}
                                {hhm.description && (
                                    <div className="fp-field full-width">
                                        <label>About</label>
                                        <textarea readOnly value={hhm.description} rows={3}></textarea>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* Models remain intact */}
            {showInviteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#151d14', border: '1px solid rgba(126,200,67,0.2)', padding: '2rem', borderRadius: '15px', maxWidth: '500px', width: '100%' }}>
                        <h2 style={{ color: '#f0f5ec', marginBottom: '1rem' }}>📨 Invite to Join</h2>
                        <textarea 
                            value={invitationMessage} 
                            onChange={(e) => setInvitationMessage(e.target.value)} 
                            placeholder="Add a personal message..." 
                            rows="4" 
                            style={{ width: '100%', background: '#0b0f0b', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f5ec', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }} 
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowInviteModal(false)} style={{ background: 'transparent', color: '#f0f5ec', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>Cancel</button>
                            <button onClick={handleSendInvitation} disabled={sendingInvitation} className="fp-save-btn">
                                {sendingInvitation ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showContractModal && (
                <ContractRequestModal
                    isOpen={showContractModal}
                    onClose={() => setShowContractModal(false)}
                    factoryInfo={hhm}
                    onSubmit={handleContractRequest}
                    loading={sendingContractRequest}
                />
            )}

            {showJobRequestModal && (
                <FarmerJobRequestModal
                    isOpen={showJobRequestModal}
                    onClose={() => setShowJobRequestModal(false)}
                    hhmInfo={hhm}
                    onSubmit={handleJobRequest}
                    loading={sendingJobRequest}
                />
            )}
        </div>
    );
};

export default HHMPublicProfilePage;
