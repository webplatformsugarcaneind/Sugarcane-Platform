import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css'; // Leverage exact unified CSS

const FactoryProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [factory, setFactory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cursor tracking

    useEffect(() => {
        if (id) {
            fetchFactoryProfile();
        } else {
            setError('No factory ID provided');
            setLoading(false);
        }
    }, [id]);

    const fetchFactoryProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }
            const response = await axios.get(`/api/public/factories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const factoryData = response.data.data?.factory || response.data.factory || response.data;
            setFactory(factoryData);
        } catch (err) {
            console.error('Error fetching factory profile:', err);
            setError(err.response?.data?.message || 'Failed to fetch factory profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: 'var(--green)' }}>Loading factory profile...</div>
          </div>
        );
    }

    if (error || !factory) {
        return (
          <div className="farmer-profile-page" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Factory Not Found'}</div>
            <button className="fp-save-btn" onClick={() => navigate(-1)}>← Go Back</button>
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

    const initials = factory.name ? factory.name.substring(0, 2).toUpperCase() : 'FA';

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
                        <div className="fp-user-name">{factory.name}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot"></span>
                            Factory • {getCapacityLabel(factory.capacity)}
                        </div>
                    </div>

                    <div className="fp-stats-grid">
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{factory.capacity ? factory.capacity.replace(/[^0-9]/g, '') : '-'}</div>
                            <div className="fp-stat-lbl">Capacity</div>
                        </div>
                        <div className="fp-stat-item">
                            <div className="fp-stat-val">{factory.establishedYear ? new Date().getFullYear() - parseInt(factory.establishedYear) : '-'}</div>
                            <div className="fp-stat-lbl">Years Op.</div>
                        </div>
                    </div>

                    <div className="fp-submit-area" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <button className="fp-save-btn" style={{ width: '100%' }}>
                            🌐 Connect & Collaborate
                        </button>
                    </div>
                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Factory Profile</div>
                            <h1 className="fp-title">{factory.name}'s <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">Established {factory.establishedYear || 'Unknown'}</p>
                        </div>
                        <div className="fp-header-right">
                            <button className="fp-save-btn" onClick={() => navigate(-1)} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>← Back</button>
                        </div>
                    </div>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">🏭</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">About Factory</h2>
                                <div className="fp-card-sub">Basic operations and background</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                <div className="fp-field full-width">
                                    <label>Description</label>
                                    <textarea readOnly value={factory.description || 'Modern sugar processing facility.'} rows={3}></textarea>
                                </div>
                                <div className="fp-field">
                                    <label>Processing Capacity</label>
                                    <input type="text" readOnly value={factory.capacity || 'Not specified'} />
                                </div>
                                <div className="fp-field">
                                    <label>Location</label>
                                    <input type="text" readOnly value={factory.location || 'Location not specified'} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="fp-card">
                        <div className="fp-card-header">
                            <div className="fp-card-icon">📞</div>
                            <div className="fp-card-txt">
                                <h2 className="fp-card-title">Contact Information</h2>
                                <div className="fp-card-sub">Reach out to the management</div>
                            </div>
                        </div>
                        <div className="fp-card-body">
                            <div className="fp-form-grid">
                                {factory.contactInfo?.email && (
                                    <div className="fp-field full-width">
                                        <label>Email Address</label>
                                        <input type="email" readOnly value={factory.contactInfo.email} />
                                    </div>
                                )}
                                {factory.contactInfo?.phone && (
                                    <div className="fp-field full-width">
                                        <label>Phone Number</label>
                                        <input type="tel" readOnly value={factory.contactInfo.phone} />
                                    </div>
                                )}
                                {factory.contactInfo?.website && (
                                    <div className="fp-field full-width">
                                        <label>Website</label>
                                        <input type="url" readOnly value={factory.contactInfo.website} />
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

export default FactoryProfilePage;
