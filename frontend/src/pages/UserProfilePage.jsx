import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css';

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- VIEWPORT THEMING (Match FarmerProfile exact styles) ---
    useEffect(() => {
        document.body.style.backgroundColor = '#0b0f0b';
        document.body.classList.add('fp-active-theme');
        
        return () => {
            document.body.style.backgroundColor = '';
            document.body.classList.remove('fp-active-theme');
        };
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/users/profile/${userId}`);
                if (response.data.success) {
                    setUser(response.data.data);
                } else {
                    throw new Error(response.data.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error.response?.data?.message || 'Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUserProfile();
    }, [userId]);

    const handleGoBack = () => navigate(-1);

    const handleSendRequest = () => {
        const targetId = user._id || user.id;
        navigate(`/farmer/hhms/${targetId}/contract`);
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b' }}>
            <div style={{ color: 'var(--green)' }}>Loading Profile...</div>
          </div>
        );
    }

    if (error || !user) {
        return (
          <div className="farmer-profile-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b' }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Profile Not Found'}</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'US';
    const isHHM = user.role === 'HHM' || user.profileType === 'hhm';
    
    // Fake data fallbacks for demonstration if DB fields are empty
    const rating = user.rating || "4.8";
    const completedJobs = user.completedJobs || "42";
    const activeJobs = user.activeJobs || "3";
    const priceRange = user.priceRange || "₹1500 - ₹2500 / acre";
    
    const workerTypes = user.workerTypes && user.workerTypes.length > 0 ? user.workerTypes : ['Sugarcane Cutting', 'Loading', 'Transport'];
    const workingAreas = user.workingAreas && user.workingAreas.length > 0 ? user.workingAreas : [user.location];
    const workHistory = user.workHistory && user.workHistory.length > 0 ? user.workHistory : [
        { cropType: 'Sugarcane', location: user.location || 'Local Area', status: 'Completed', date: new Date() }
    ];

    return (
        <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div className="fp-noise" />
            <div className="fp-bg-glow" />
            
            <div className="fp-layout-shell">
                <aside className="fp-sidebar">
                    <div className="fp-sidebar-profile">
                        <div className="fp-avatar-wrap">
                            <div className="fp-avatar">{initials}</div>
                            <div className="fp-avatar-ring"></div>
                        </div>
                        <div className="fp-user-name">{user.name}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: user.isActive ? 'var(--green)' : 'var(--amber)' }}></span>
                            {isHHM ? 'Harvest Manager' : user.role}
                        </div>
                        
                        {isHHM && (
                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <span style={{ background: 'rgba(126,200,67,0.1)', color: 'var(--green)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {user.isActive ? 'AVAILABLE' : 'BUSY'}
                                </span>
                                <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    ⭐ {rating}
                                </span>
                            </div>
                        )}
                    </div>

                    {isHHM && (
                        <div className="fp-stats-grid">
                            <div className="fp-stat-item">
                                <div className="fp-stat-val">{user.managementExperience ? String(user.managementExperience).replace(/[^0-9]/g, '') : '5+'}</div>
                                <div className="fp-stat-lbl">Yrs Exp</div>
                            </div>
                            <div className="fp-stat-item">
                                <div className="fp-stat-val">{completedJobs}</div>
                                <div className="fp-stat-lbl">Jobs Done</div>
                            </div>
                        </div>
                    )}

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="btn-base btn-primary" onClick={handleSendRequest} style={{ width: '100%' }}>
                            <span className="btn-icon">🤝</span> Send Request
                        </button>
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Public Profile</div>
                            <h1 className="fp-title">{user.name}'s <em className="fp-highlight">Profile</em></h1>
                        </div>
                        <div className="fp-header-right">
                            <button className="btn-base btn-secondary" onClick={handleGoBack}>
                                <span className="btn-icon">←</span> Back
                            </button>
                        </div>
                    </div>

                    {isHHM ? (
                        <>
                            {/* 2. LOCATION SECTION */}
                            <section className="fp-card">
                                <div className="fp-card-header" style={{ paddingBottom: '16px' }}>
                                    <div className="fp-card-icon">📍</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Location & Area</h2>
                                    </div>
                                </div>
                                <div className="fp-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base Location</div>
                                        <div style={{ color: 'var(--white)', fontSize: '1.05rem', fontWeight: '500' }}>{user.location || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Working Areas</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {workingAreas.map((area, idx) => (
                                                <span key={idx} style={{ background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>{area}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. TEAM & CAPACITY */}
                            <section className="fp-card">
                                <div className="fp-card-header" style={{ paddingBottom: '16px' }}>
                                    <div className="fp-card-icon">👥</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Team & Capacity</h2>
                                    </div>
                                </div>
                                <div className="fp-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Workers</div>
                                        <div style={{ color: 'var(--white)', fontSize: '1.4rem', fontWeight: '600' }}>{user.teamSize || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Active Jobs</div>
                                        <div style={{ color: 'var(--amber)', fontSize: '1.4rem', fontWeight: '600' }}>{activeJobs} Active</div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worker Types Available</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {workerTypes.map((type, idx) => (
                                                <span key={idx} style={{ background: 'rgba(126,200,67,0.1)', color: 'var(--green)', border: '1px solid rgba(126,200,67,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>✓ {type}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. PRICING */}
                            <section className="fp-card">
                                <div className="fp-card-header" style={{ paddingBottom: '16px' }}>
                                    <div className="fp-card-icon">💰</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Pricing Estimates</h2>
                                    </div>
                                </div>
                                <div className="fp-card-body" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Cost</div>
                                        <div style={{ color: 'var(--white)', fontSize: '1.2rem', fontWeight: '500' }}>{priceRange}</div>
                                    </div>
                                    <div>
                                        {user.isNegotiable !== false && (
                                            <span style={{ background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>🤝 Negotiable based on field conditions</span>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* 6. WORK HISTORY */}
                            <section className="fp-card">
                                <div className="fp-card-header" style={{ paddingBottom: '16px' }}>
                                    <div className="fp-card-icon">📋</div>
                                    <div className="fp-card-txt">
                                        <h2 className="fp-card-title">Recent Work History</h2>
                                    </div>
                                </div>
                                <div className="fp-card-body" style={{ padding: '0' }}>
                                    {workHistory.map((job, idx) => (
                                        <div key={idx} style={{ padding: '16px 24px', borderBottom: idx < workHistory.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ color: 'var(--white)', fontWeight: '500', marginBottom: '4px' }}>{job.cropType} Harvesting</div>
                                                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>📍 {job.location}</div>
                                            </div>
                                            <div style={{ background: 'rgba(126,200,67,0.1)', color: 'var(--green)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                                {job.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        /* Fallback for non-HHM users */
                        <section className="fp-card">
                            <div className="fp-card-header">
                                <div className="fp-card-icon">📄</div>
                                <div className="fp-card-txt">
                                    <h2 className="fp-card-title">User Details</h2>
                                </div>
                            </div>
                            <div className="fp-card-body">
                                <div className="fp-form-grid">
                                    {user.location && (
                                        <div className="fp-field">
                                            <label>Location</label>
                                            <input type="text" readOnly value={user.location} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserProfilePage;
