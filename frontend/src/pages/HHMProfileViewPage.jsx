import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css'; // Leverage exact unified CSS

// Set axios base URL
axios.defaults.baseURL = API_BASE_URL;

const HHMProfileViewPage = () => {
    const { hhmId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [hhm, setHhm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cursor tracking

    const fetchHHMProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                return;
            }
            const response = await axios.get(`/api/hhm/profile/${hhmId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHhm(response.data.data);
        } catch (err) {
            console.error('Error fetching HHM profile:', err);
            setError('Failed to load HHM profile');
        } finally {
            setLoading(false);
        }
    }, [hhmId]);

    useEffect(() => {
        if (location.state?.hhmData) {
            setHhm(location.state.hhmData);
            setLoading(false);
        } else if (hhmId) {
            fetchHHMProfile();
        } else {
            setError('HHM ID not provided');
            setLoading(false);
        }
    }, [hhmId, location.state, fetchHHMProfile]);

    const handleGoBack = () => navigate(-1);

    const handleSendRequest = async (hhmId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to send a request');
                return;
            }
            const confirmed = window.confirm(`Send a partnership request to ${hhm.name}?\n\nThis will notify the HHM about your interest in working together.`);
            if (!confirmed) return;

            const response = await axios.post('/api/farmer/send-request', {
                hhmId: hhmId,
                message: `Hi ${hhm.name}, I would like to partner with you for harvest management services.`
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                alert('✅ Request sent successfully! The HHM will be notified.');
            } else {
                alert('❌ Failed to send request. Please try again.');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already sent')) {
                alert('ℹ️ You have already sent a request to this HHM.');
            } else {
                alert('❌ Error sending request. Please try again later.');
            }
        }
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: 'var(--green)' }}>Loading HHM Profile...</div>
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
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'HHM Profile Not Found'}</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
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
                        <div className="fp-user-name">{hhm.name || 'Unknown Manager'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot"></span>
                            {hhm.role?.toUpperCase() || 'Hub Head Manager'}
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{hhm.experience ? String(hhm.experience).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Years Exp.</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{hhm.managementExperience ? String(hhm.managementExperience).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Years Mgmt.</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={() => handleSendRequest(hhm._id)} style={{ width: '100%' }}>
                            👥 Send Request
                        </button>
                        {hhm.email && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `mailto:${hhm.email}`} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                                📧 Contact Manager
                            </button>
                        )}
                        {hhm.phone && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `tel:${hhm.phone}`} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                                📱 Call
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">HM Profile</div>
                            <h1 className="fp-title">{hhm.name}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">📍 {hhm.location || 'Location not specified'} • @{hhm.username || 'unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">💼</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Professional Details</h2>
                                <div className="fp-card-sub">Expertise and background</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                {hhm.bio && (
                                    <div className="fp-field full-width">
                                        <label>Bio</label>
                                        <textarea readOnly value={hhm.bio} rows={3}></textarea>
                                    </div>
                                )}
                                <div className="fp-field">
                                    <label>Experience</label>
                                    <input type="text" readOnly value={hhm.experience ? `${hhm.experience} years` : 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Specialization</label>
                                    <input type="text" readOnly value={hhm.specialization || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Management Experience</label>
                                    <input type="text" readOnly value={hhm.managementExperience ? `${hhm.managementExperience} years` : 'Not specified'} />
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {(hhm.skills || hhm.certifications) && (
                        <section className="fp-card">
                            <div className="fp-card-header">
                                <div className="fp-card-icon">📋</div>
                                <div className="fp-card-txt">
                                    <h2 className="fp-card-title">Additional Information</h2>
                                    <div className="fp-card-sub">Skills and certifications</div>
                                </div>
                            </div>
                            <div className="fp-card-body">
                                <div className="fp-form-grid">
                                    {hhm.skills && (
                                        <div className="fp-field full-width">
                                            <label>Skills</label>
                                            <div style={{ background: '#101510', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {hhm.skills}
                                            </div>
                                        </div>
                                    )}
                                    {hhm.certifications && (
                                        <div className="fp-field full-width">
                                            <label>Certifications</label>
                                            <div style={{ background: '#101510', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {hhm.certifications}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">📞</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Contact Information</h2>
                                <div className="fp-card-sub">Get in touch directly</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                {hhm.email && (
                                    <div className="fp-field">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={hhm.email} />
                                    </div>
                                )}
                                {hhm.phone && (
                                    <div className="fp-field">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={hhm.phone} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HHMProfileViewPage;
