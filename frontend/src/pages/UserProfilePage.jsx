import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css'; // Inheriting unified framework

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cursor Effect

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

    const handleContact = () => {
        if (user?.email) {
            const subject = encodeURIComponent('Contact from Sugarcane Platform');
            const body = encodeURIComponent(`Hello ${user.name || 'there'},\n\nI found your profile on the platform and would like to get in touch.\n\nBest regards`);
            window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
        }
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div style={{ color: 'var(--green)' }}>Loading Profile...</div>
          </div>
        );
    }

    if (error || !user) {
        return (
          <div className="farmer-profile-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Profile Not Found'}</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'US';

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
                        <div className="fp-user-name">{user.name || 'User Profile'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: '#4caf50' }}></span>
                            {user.role || 'Member'}
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={handleContact} style={{ width: '100%' }}>
                            📧 Contact User
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
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">📄</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">User Details</h2>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                {user.email && (
                                    <div className="fp-field">
                                        <label>Email</label>
                                        <input type="email" readOnly value={user.email} />
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="fp-field">
                                        <label>Phone</label>
                                        <input type="tel" readOnly value={user.phone} />
                                    </div>
                                )}
                                {user.location && (
                                    <div className="fp-field">
                                        <label>Location</label>
                                        <input type="text" readOnly value={user.location} />
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

export default UserProfilePage;
