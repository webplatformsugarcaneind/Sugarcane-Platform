import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css'; // Leverage unified Dark Mode CSS

const HHMFarmerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cursor tracking

    const fetchFarmerProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get(`/api/hhm/farmer/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFarmer(response.data.data || response.data.farmer);
        } catch (err) {
            console.error('Error fetching farmer profile:', err);
            setError(err.response?.data?.message || 'Failed to load farmer profile');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchFarmerProfile();
    }, [id, fetchFarmerProfile]);

    const handleBackToDirectory = () => navigate('/hhm/farmers');

    const handleContactFarmer = () => {
        if (farmer?.email) {
            window.location.href = `mailto:${farmer.email}`;
        } else if (farmer?.phone) {
            window.location.href = `tel:${farmer.phone}`;
        } else {
            alert('No contact information available for this farmer.');
        }
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: 'var(--green)' }}>Loading Farmer Profile...</div>
          </div>
        );
    }

    if (error || !farmer) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Farmer Not Found'}</div>
            <button className="fp-save-btn" onClick={handleBackToDirectory}>← Back to Directory</button>
          </div>
        );
    }

    const initials = farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'F';

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
                        <div className="fp-user-name">{farmer.name || 'Unknown Farmer'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: farmer.isActive ? '#4caf50' : '#e74c3c' }}></span>
                            Farmer • {farmer.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{farmer.farmSize ? String(farmer.farmSize).replace(/[^0-9.]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Acres</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{farmer.experience ? String(farmer.experience).replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Years Exp.</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={handleContactFarmer} style={{ width: '100%' }}>
                            📧 Contact Farmer
                        </button>
                        {farmer.phone && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `tel:${farmer.phone}`} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                                📱 Call Farmer
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Farmer Profile</div>
                            <h1 className="fp-title">{farmer.name}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">📍 {farmer.location || 'Location not specified'} • @{farmer.username || 'unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleBackToDirectory} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Directory</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🚜</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Farm Information</h2>
                                <div className="fp-card-sub">Agricultural background and scope</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Description</label>
                                    <textarea readOnly value={farmer.description || 'No description available'} rows={3}></textarea>
                                </div>
                                <div className="fp-field">
                                    <label>Farm Size</label>
                                    <input type="text" readOnly value={farmer.farmSize ? `${farmer.farmSize} acres` : 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Farm Type</label>
                                    <input type="text" readOnly value={farmer.farmType || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Experience</label>
                                    <input type="text" readOnly value={farmer.experience ? `${farmer.experience} years` : 'Not specified'} />
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
                                {farmer.email && (
                                    <div className="fp-field">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={farmer.email} />
                                    </div>
                                )}
                                {farmer.phone && (
                                    <div className="fp-field">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={farmer.phone} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">ℹ️</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Additional Information</h2>
                                <div className="fp-card-sub">System details and dates</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field">
                                    <label>Member Since</label>
                                    <input type="text" readOnly value={farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'} />
                                </div>
                                <div className="fp-field">
                                    <label>Last Updated</label>
                                    <input type="text" readOnly value={farmer.updatedAt ? new Date(farmer.updatedAt).toLocaleDateString() : 'N/A'} />
                                </div>
                                <div className="fp-field full-width">
                                    <label>User ID</label>
                                    <input type="text" readOnly style={{ fontFamily: 'monospace' }} value={farmer._id} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HHMFarmerProfilePage;
