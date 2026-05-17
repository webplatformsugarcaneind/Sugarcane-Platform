import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FarmerProfile.css'; // Leverage unified Dark Mode CSS

const FactoryHHMProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const hhmData = location.state?.hhmData || null;

    // Cursor tracking

    const handleGoBack = () => navigate(-1);

    const handleContact = () => {
        if (hhmData?.email) {
            const subject = encodeURIComponent('Partnership Opportunity');
            const body = encodeURIComponent(
                `Hello ${hhmData.name || 'there'},\n\nWe are a factory interested in establishing a partnership with your operations. We would like to discuss potential collaboration opportunities.\n\nBest regards`
            );
            window.location.href = `mailto:${hhmData.email}?subject=${subject}&body=${body}`;
        }
    };

    const handleRequestPartnership = () => {
        alert('Partnership request sent!');
    };

    if (!hhmData) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>HHM Profile Not Found</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const initials = hhmData.name ? hhmData.name.substring(0, 2).toUpperCase() : 'HH';

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
                        <div className="fp-user-name">{hhmData.name || 'Unknown HHM'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot"></span>
                            Hub Head Manager
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={handleRequestPartnership} style={{ width: '100%' }}>
                            🤝 Request Partnership
                        </button>
                        <button className="fp-save-btn" onClick={handleContact} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                            📧 Contact
                        </button>
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">HM Profile</div>
                            <h1 className="fp-title">{hhmData.name || 'HHM'}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">@{hhmData.username || 'unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Directory</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">💼</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Professional Information</h2>
                                <div className="fp-card-sub">Managerial details and background</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Location</label>
                                    <input type="text" readOnly value={hhmData.location || 'Location Unknown'} />
                                </div>
                                <div className="fp-field full-width">
                                    <label>Description</label>
                                    <textarea readOnly value={hhmData.description || 'Experienced Hub Head Manager coordinating agricultural operations and factory partnerships.'} rows={3}></textarea>
                                </div>
                                {hhmData.createdAt && (
                                    <div className="fp-field">
                                        <label>Member Since</label>
                                        <input type="text" readOnly value={new Date(hhmData.createdAt).toLocaleDateString()} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    
                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🤝</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Partnership Information</h2>
                                <div className="fp-card-sub">Available services</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <div style={{ background: 'rgba(126,200,67,0.1)', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', margin: '0.5rem 0' }}>✅ Available for factory partnerships</div>
                                    <div style={{ background: '#101510', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', margin: '0.5rem 0', border: '1px solid rgba(255,255,255,0.05)' }}>👥 Labour coordination and management services</div>
                                    <div style={{ background: '#101510', padding: '1rem', borderRadius: '8px', color: '#f0f5ec', margin: '0.5rem 0', border: '1px solid rgba(255,255,255,0.05)' }}>🌾 Agricultural operations expertise</div>
                                </div>
                            </div>
                        </div>
                    </section>

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
                                <div className="fp-field">
                                    <label>Email Address</label>
                                    <input type="email" readOnly value={hhmData.email || 'Not available'} />
                                </div>
                                <div className="fp-field">
                                    <label>Phone Number</label>
                                    <input type="text" readOnly value={hhmData.phone || 'Not available'} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default FactoryHHMProfileViewPage;
