import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const HHMLabourProfileViewPage = () => {
    const { labourId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [labourData, setLabourData] = useState(location.state?.labourData || null);
    const [loading, setLoading] = useState(!labourData);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!labourData && labourId) {
            fetchLabourDetails();
        }
    }, [labourId]);

    const fetchLabourDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/hhm/labour/${labourId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setLabourData(response.data.data);
            } else {
                setError('Labour profile not found');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load labour profile');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => navigate(-1);

    const handleContact = () => {
        if (labourData?.email) {
            const subject = encodeURIComponent('Work Opportunity from HHM');
            const body = encodeURIComponent(
                `Hello ${labourData.name || 'there'},\n\nI am an HHM and would like to discuss potential work opportunities with you. Please let me know your availability.\n\nBest regards`
            );
            window.location.href = `mailto:${labourData.email}?subject=${subject}&body=${body}`;
        }
    };

    const handleSendInvitation = () => {
        navigate('/hhm/labor', { 
            state: { 
                openInviteModal: true, 
                selectedLabour: labourData 
            } 
        });
    };

    if (loading) {
        return (
            <div className="farmer-profile-page" style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                background: '#0b0f0b' 
            }}>
                <style>{`
                    .fp-loader {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 20px;
                    }
                    .fp-loader-spinner {
                        width: 50px;
                        height: 50px;
                        border: 3px solid rgba(126, 200, 67, 0.1);
                        border-top-color: #7ec843;
                        border-radius: 50%;
                        animation: fp-spin 1s linear infinite;
                    }
                    @keyframes fp-spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
                <div className="fp-loader">
                    <div className="fp-loader-spinner"></div>
                    <div style={{ color: 'var(--green)', marginTop: '1rem', fontFamily: 'Syne' }}>Syncing Labour Data...</div>
                </div>
            </div>
        );
    }

    if (error || !labourData) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '3rem', marginBottom: '1.5rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'Syne' }}>{error || 'Labour Profile Not Found'}</div>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>The labour might have been removed or the link is invalid.</p>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const initials = labourData.name ? labourData.name.substring(0, 2).toUpperCase() : 'W';

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
                        <div className="fp-user-name">{labourData.name || 'Labour'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: labourData.availability === 'Available' ? '#4caf50' : '#e74c3c' }}></span>
                            {labourData.availability || 'Status Unknown'}
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{labourData.rating !== undefined ? labourData.rating.toFixed(1) : '-'}</div>
                            <div className="fp-stat-lbl">Rating ⭐</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{labourData.completedJobs !== undefined ? labourData.completedJobs : '-'}</div>
                            <div className="fp-stat-lbl">Jobs Done</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={handleSendInvitation} disabled={labourData.availability !== 'Available'} style={{ width: '100%', opacity: labourData.availability === 'Available' ? 1 : 0.5 }}>
                            📤 Send Job Invite
                        </button>
                        {labourData.email && (
                            <button className="fp-save-btn" onClick={handleContact} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                                📧 Contact Labour
                            </button>
                        )}
                        {labourData.phone && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `tel:${labourData.phone}`} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                                📱 Call
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Labour Profile</div>
                            <h1 className="fp-title">{labourData.name}'s <em className="fp-highlight">Profile</em></h1>
                            <div className="fp-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📍 {labourData.location || 'Location not specified'}</span>
                                {labourData.isVerified && <span style={{ background: 'rgba(126,200,67,0.1)', color: 'var(--green)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>✓ Verified</span>}
                            </div>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Labour Management</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">💼</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Work Information</h2>
                                <div className="fp-card-sub">Experience and preferences</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                {labourData.bio && (
                                    <div className="fp-field full-width">
                                        <label>About</label>
                                        <textarea readOnly value={labourData.bio} rows={3}></textarea>
                                    </div>
                                )}
                                <div className="fp-field">
                                    <label>Experience</label>
                                    <input type="text" readOnly value={labourData.workExperience || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Wage Rate</label>
                                    <input type="text" readOnly value={labourData.wageRate || 'Not specified'} />
                                </div>
                                {labourData.workPreferences && (
                                    <div className="fp-field full-width">
                                        <label>Work Preferences</label>
                                        <input type="text" readOnly value={labourData.workPreferences} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    
                    {labourData.skills && labourData.skills.length > 0 && (
                        <section className="fp-card">
                            <div className="fp-card-header">
                                <div className="fp-card-icon">🛠️</div>
                                <div className="fp-card-txt">
                                    <h2 className="fp-card-title">Skills & Expertise</h2>
                                    <div className="fp-card-sub">Abilities of this labour</div>
                                </div>
                            </div>
                            <div className="fp-card-body">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {labourData.skills.map((skill, index) => (
                                        <span key={index} style={{ background: '#101510', border: '1px solid rgba(126,200,67,0.2)', padding: '0.75rem 1.25rem', borderRadius: '8px', color: '#f0f5ec' }}>
                                            {skill}
                                        </span>
                                    ))}
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
                                {labourData.email && (
                                    <div className="fp-field">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={labourData.email} />
                                    </div>
                                )}
                                {labourData.phone && (
                                    <div className="fp-field">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={labourData.phone} />
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

export default HHMLabourProfileViewPage;
