import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FarmerProfile.css'; // Leverage exact unified CSS

const HHMWorkerProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get worker data from navigation state
    const workerData = location.state?.workerData || null;

    // Cursor tracking

    const handleGoBack = () => navigate(-1);

    const handleContact = () => {
        if (workerData?.email) {
            const subject = encodeURIComponent('Work Opportunity from HHM');
            const body = encodeURIComponent(
                `Hello ${workerData.name || 'there'},\n\nI am an HHM and would like to discuss potential work opportunities with you. Please let me know your availability.\n\nBest regards`
            );
            window.location.href = `mailto:${workerData.email}?subject=${subject}&body=${body}`;
        }
    };

    const handleSendInvitation = () => {
        navigate('/hhm/labor', { 
            state: { 
                openInviteModal: true, 
                selectedWorker: workerData 
            } 
        });
    };

    if (!workerData) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>Worker Profile Not Found</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const initials = workerData.name ? workerData.name.substring(0, 2).toUpperCase() : 'W';

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
                        <div className="fp-user-name">{workerData.name || 'Worker'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: workerData.availability === 'Available' ? '#4caf50' : '#e74c3c' }}></span>
                            {workerData.availability || 'Status Unknown'}
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{workerData.rating !== undefined ? workerData.rating.toFixed(1) : '-'}</div>
                            <div className="fp-stat-lbl">Rating ⭐</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{workerData.completedJobs !== undefined ? workerData.completedJobs : '-'}</div>
                            <div className="fp-stat-lbl">Jobs Done</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={handleSendInvitation} disabled={workerData.availability !== 'Available'} style={{ width: '100%', opacity: workerData.availability === 'Available' ? 1 : 0.5 }}>
                            📤 Send Job Invite
                        </button>
                        {workerData.email && (
                            <button className="fp-save-btn" onClick={handleContact} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                                📧 Contact Worker
                            </button>
                        )}
                        {workerData.phone && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `tel:${workerData.phone}`} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                                📱 Call
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Worker Profile</div>
                            <h1 className="fp-title">{workerData.name}'s <em className="fp-highlight">Profile</em></h1>
                            <div className="fp-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📍 {workerData.location || 'Location not specified'}</span>
                                {workerData.isVerified && <span style={{ background: 'rgba(126,200,67,0.1)', color: 'var(--green)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>✓ Verified</span>}
                            </div>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Labor Management</button>
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
                                {workerData.bio && (
                                    <div className="fp-field full-width">
                                        <label>About</label>
                                        <textarea readOnly value={workerData.bio} rows={3}></textarea>
                                    </div>
                                )}
                                <div className="fp-field">
                                    <label>Experience</label>
                                    <input type="text" readOnly value={workerData.workExperience || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Wage Rate</label>
                                    <input type="text" readOnly value={workerData.wageRate || 'Not specified'} />
                                </div>
                                {workerData.workPreferences && (
                                    <div className="fp-field full-width">
                                        <label>Work Preferences</label>
                                        <input type="text" readOnly value={workerData.workPreferences} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    
                    {workerData.skills && workerData.skills.length > 0 && (
                        <section className="fp-card">
                            <div className="fp-card-header">
                                <div className="fp-card-icon">🛠️</div>
                                <div className="fp-card-txt">
                                    <h2 className="fp-card-title">Skills & Expertise</h2>
                                    <div className="fp-card-sub">Abilities of this worker</div>
                                </div>
                            </div>
                            <div className="fp-card-body">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {workerData.skills.map((skill, index) => (
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
                                {workerData.email && (
                                    <div className="fp-field">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={workerData.email} />
                                    </div>
                                )}
                                {workerData.phone && (
                                    <div className="fp-field">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={workerData.phone} />
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

export default HHMWorkerProfileViewPage;
