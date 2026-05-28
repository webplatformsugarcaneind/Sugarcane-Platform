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
    const isAvailable = labourData.availability === 'Available';

    return (
        <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div className="fp-noise" />
            <div className="fp-bg-glow" />

            <div className="fdb-container">
                <button className="fdb-back-btn" onClick={handleGoBack}>← Back to Labour Management</button>
                
                {/* HERO SECTION */}
                <div className="fdb-hero">
                    <div className="fdb-hero-left">
                        <div className="fdb-hero-header">
                            <div className="fdb-avatar-lg">
                                {initials}
                                <div className="fdb-avatar-ring"></div>
                            </div>
                            <div className="fdb-hero-info">
                                <div className="fdb-hero-title-wrap">
                                    <h1 className="fdb-hero-title">{labourData.name || 'Labour'}</h1>
                                    {labourData.isVerified && <span className="fdb-badge-verified">✓ Verified</span>}
                                </div>
                                <div className="fdb-hero-meta">
                                    <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {labourData.location || 'Location not specified'}</span>
                                    {labourData.phone && (
                                        <>
                                            <span className="fdb-hero-dot">•</span>
                                            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> {labourData.phone}</span>
                                        </>
                                    )}
                                </div>
                                <p className="fdb-hero-tagline">{labourData.bio || 'Labour Professional'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="fdb-hero-right">
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{labourData.rating !== undefined ? labourData.rating.toFixed(1) : '-'}</div>
                                <div className="fdb-stat-lbl">Rating</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{labourData.completedJobs !== undefined ? labourData.completedJobs : '-'}</div>
                                <div className="fdb-stat-lbl">Jobs Done</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{labourData.wageRate || 'N/A'}</div>
                                <div className="fdb-stat-lbl">Wage Rate</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card" style={{ borderColor: isAvailable ? 'rgba(126,200,67,0.3)' : 'rgba(231,76,60,0.3)' }}>
                            <div className="fdb-stat-icon" style={{ color: isAvailable ? 'var(--green)' : '#e74c3c' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val" style={{ color: isAvailable ? 'var(--green)' : '#e74c3c' }}>{labourData.availability || 'Unknown'}</div>
                                <div className="fdb-stat-lbl">Status</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fdb-grid-main">
                    <div className="fdb-grid-left">
                        {/* WORK INFORMATION */}
                        <section className="fdb-section">
                            <h2 className="fdb-section-title">Work Information</h2>
                            <div className="fdb-overview-grid">
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Experience</div>
                                    <div className="fdb-info-val" style={{color: 'var(--green)'}}>{labourData.workExperience || 'Not specified'}</div>
                                </div>
                                <div className="fdb-info-card full-width">
                                    <div className="fdb-info-lbl">Work Preferences</div>
                                    <div className="fdb-info-val">{labourData.workPreferences || 'Not specified'}</div>
                                </div>
                            </div>
                        </section>

                        {/* SKILLS */}
                        {labourData.skills && labourData.skills.length > 0 && (
                            <section className="fdb-section">
                                <h2 className="fdb-section-title">Skills & Expertise</h2>
                                <div className="fdb-overview-grid">
                                    <div className="fdb-info-card full-width">
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            {labourData.skills.map((skill, index) => (
                                                <span key={index} style={{ background: '#101510', border: '1px solid rgba(126,200,67,0.2)', padding: '0.75rem 1.25rem', borderRadius: '8px', color: '#f0f5ec' }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="fdb-grid-right">
                        {/* ACTION PANEL */}
                        <section className="fdb-section" style={{ background: 'rgba(126,200,67,0.05)', borderColor: 'rgba(126,200,67,0.1)' }}>
                            <h2 className="fdb-section-title">Actions</h2>
                            <div className="fdb-analytics-wrap" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                                <button className="fdb-contact-btn" onClick={handleSendInvitation} disabled={!isAvailable} style={{ background: 'var(--green)', color: '#0b0f0b', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.5 }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Job Invite
                                </button>
                                {labourData.email && (
                                    <button className="fdb-contact-btn" onClick={handleContact} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--green)', color: 'var(--green)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Email Labour
                                    </button>
                                )}
                                {labourData.phone && (
                                    <button className="fdb-contact-btn" onClick={() => window.location.href = `tel:${labourData.phone}`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> Call Direct
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HHMLabourProfileViewPage;

