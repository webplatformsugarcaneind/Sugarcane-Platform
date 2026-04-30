import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CRUSHING_STATUS, getCrushingStatusDisplay, DEFAULT_CRUSHING_STATUS } from '../constants/crushingStatus.js';
import './FarmerProfile.css'; // Leverage exact unified CSS

const FactoryProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Get factory data from navigation state or fallback
    const [factoryData, setFactoryData] = useState(location.state?.factoryData || null);
    const [loading, setLoading] = useState(!factoryData);
    const [error, setError] = useState(null);

    const fetchFactoryData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login.');
                return;
            }
            const res = await axios.get(`/api/farmer/factories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data || res.data.factory || res.data;
            setFactoryData(data);
        } catch (err) {
            console.error('Error fetching factory data:', err);
            setError(err.response?.data?.message || 'Failed to fetch factory details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!factoryData && id) {
            fetchFactoryData();
        }
    }, [factoryData, id, fetchFactoryData]);

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div className="fp-spinner" style={{ borderTopColor: 'var(--green)' }}></div>
            <div style={{ color: '#f0f5ec', marginLeft: '1rem' }}>Loading Factory Details...</div>
          </div>
        );
    }

    if (error || !factoryData) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Factory Profile Not Found'}</div>
            <button className="fp-save-btn" onClick={handleGoBack}>← Go Back</button>
          </div>
        );
    }

    const getCapacityLabel = (capacity) => {
        if (!capacity) return 'Unknown';
        const numericCapacity = Number(capacity.replace(/[^0-9]/g, ''));
        if (numericCapacity < 1000) return 'Small Scale';
        if (numericCapacity < 5000) return 'Medium Scale';
        return 'Large Scale';
    };

    const initials = factoryData.name ? factoryData.name.substring(0, 2).toUpperCase() : 'FA';
    const crushingStatus = factoryData.crushingStatus || DEFAULT_CRUSHING_STATUS;

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
                        <div className="fp-user-name">{factoryData.name || 'Unknown Factory'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: crushingStatus === CRUSHING_STATUS.ON ? '#4caf50' : '#e74c3c' }}></span>
                            {crushingStatus === CRUSHING_STATUS.ON ? 'ACTIVE' : 'INACTIVE'} • {getCapacityLabel(factoryData.capacity)}
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{factoryData.capacity ? factoryData.capacity.replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Capacity TCD</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{factoryData.establishedYear ? new Date().getFullYear() - parseInt(factoryData.establishedYear) : '-'}</div>
                            <div className="fp-stat-lbl">Years Op.</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" onClick={() => { if (factoryData.contactInfo?.email) window.location.href = `mailto:${factoryData.contactInfo.email}`; }} style={{ width: '100%' }}>
                            📧 Email Factory
                        </button>
                        {factoryData.contactInfo?.phone && (
                            <button className="fp-save-btn" onClick={() => window.location.href = `tel:${factoryData.contactInfo.phone}`} style={{ width: '100%', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)' }}>
                                📱 Call Factory
                            </button>
                        )}
                        {factoryData.contactInfo?.website && (
                            <button className="fp-save-btn" onClick={() => window.open(factoryData.contactInfo.website.startsWith('http') ? factoryData.contactInfo.website : `https://${factoryData.contactInfo.website}`, '_blank')} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                                🌐 Visit Website
                            </button>
                        )}
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Factory Profile</div>
                            <h1 className="fp-title">{factoryData.name}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">📍 {factoryData.location || 'Location not specified'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={handleGoBack} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back to Directory</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🏭</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Technical Specifications</h2>
                                <div className="fp-card-sub">Core operations and capabilities</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Description</label>
                                    <textarea readOnly value={factoryData.description || 'No description provided.'} rows={3}></textarea>
                                </div>
                                <div className="fp-field">
                                    <label>Processing Capacity</label>
                                    <input type="text" readOnly value={factoryData.capacity || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Crushing Status</label>
                                    <input type="text" readOnly style={{ color: crushingStatus === CRUSHING_STATUS.ON ? '#4caf50' : '#e74c3c' }} value={`${getCrushingStatusDisplay(crushingStatus).icon} ${crushingStatus === CRUSHING_STATUS.ON ? 'ACTIVE' : 'INACTIVE'}`} />
                                </div>
                                <div className="fp-field">
                                    <label>Operation Schedule</label>
                                    <input type="text" readOnly value={factoryData.operatingSeason || 'Contact for schedule'} />
                                </div>
                                <div className="fp-field">
                                    <label>Established</label>
                                    <input type="text" readOnly value={factoryData.establishedYear || 'Not specified'} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🤝</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Collaboration Opportunities</h2>
                                <div className="fp-card-sub">Available partnerships</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {['🔄 Resource Sharing', '⚙️ Technical Exchange', '📊 Best Practices', '🚚 Logistics Coordination', '🌾 Supply Chain Integration', '💡 Innovation Partnerships'].map(tag => (
                                    <span key={tag} style={{ background: '#101510', border: '1px solid rgba(126,200,67,0.2)', padding: '0.75rem 1.25rem', borderRadius: '8px', color: '#f0f5ec' }}>{tag}</span>
                                ))}
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
                                {factoryData.contactInfo?.email && (
                                    <div className="fp-field">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={factoryData.contactInfo.email} />
                                    </div>
                                )}
                                {factoryData.contactInfo?.phone && (
                                    <div className="fp-field">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={factoryData.contactInfo.phone} />
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

export default FactoryProfileViewPage;
