import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FarmerProfile.css'; // Leverage unified Dark Mode CSS

const FarmerProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const farmerData = location.state?.farmerData || null;

    // Cursor tracking

    const handleGoBack = () => navigate(-1);

    if (!farmerData) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>Farmer Profile Not Found</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const initials = farmerData.name ? farmerData.name.substring(0, 2).toUpperCase() : 'F';

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
                        <div className="fp-user-name">{farmerData.name || 'Unknown Farmer'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot"></span>
                            Farmer
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{farmerData.farmSize ? String(farmerData.farmSize).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Acres</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{farmerData.experience ? String(farmerData.experience).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Years Exp.</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={() => { if (farmerData.email) window.location.href = `mailto:${farmerData.email}`; }} style={{ width: '100%' }}>
                            📧 Send Email
                        </button>
                        {farmerData.phone && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `tel:${farmerData.phone}`} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                                📱 Call
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Farmer Profile</div>
                            <h1 className="fp-title">{farmerData.name || 'Farmer'}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">@{farmerData.username || 'unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Directory</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🚜</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Farm Details</h2>
                                <div className="fp-card-sub">Agricultural information and expertise</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Description</label>
                                    <textarea readOnly value={farmerData.description || 'No description available'} rows={3}></textarea>
                                </div>
                                <div className="fp-field">
                                    <label>Farm Size</label>
                                    <input type="text" readOnly value={farmerData.farmSize ? `${farmerData.farmSize} acres` : 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Crop Types</label>
                                    <input type="text" readOnly value={farmerData.cropTypes || 'Sugarcane'} />
                                </div>
                                <div className="fp-field">
                                    <label>Experience</label>
                                    <input type="text" readOnly value={farmerData.experience || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Certification</label>
                                    <input type="text" readOnly value={farmerData.certification || 'Standard'} />
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
                                    <label>Email</label>
                                    <input type="email" readOnly value={farmerData.email || 'Not available'} />
                                </div>
                                <div className="fp-field">
                                    <label>Phone</label>
                                    <input type="text" readOnly value={farmerData.phone || 'Not available'} />
                                </div>
                                <div className="fp-field full-width">
                                    <label>Location</label>
                                    <input type="text" readOnly value={farmerData.location || 'Not specified'} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default FarmerProfileViewPage;
