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
            <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48" style={{verticalAlign:'middle'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
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

            <div className="fdb-container">
                <button className="fdb-back-btn" onClick={() => navigate(-1)}>← Back</button>
                
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
                                    <h1 className="fdb-hero-title">{factory.name}</h1>
                                </div>
                                <div className="fdb-hero-meta">
                                    <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {factory.location || 'Location not specified'}</span>
                                    <span className="fdb-hero-dot">•</span>
                                    <span>{getCapacityLabel(factory.capacity)}</span>
                                </div>
                                <p className="fdb-hero-tagline">Established {factory.establishedYear || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="fdb-hero-right">
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{factory.capacity ? factory.capacity.replace(/[^0-9]/g, '') : '-'}</div>
                                <div className="fdb-stat-lbl">Capacity</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{factory.establishedYear ? new Date().getFullYear() - parseInt(factory.establishedYear) : '-'}</div>
                                <div className="fdb-stat-lbl">Years Op.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fdb-grid-main">
                    <div className="fdb-grid-left">
                        {/* ABOUT FACTORY */}
                        <section className="fdb-section">
                            <h2 className="fdb-section-title">About Factory</h2>
                            <div className="fdb-overview-grid">
                                {factory.description && (
                                    <div className="fdb-info-card full-width">
                                        <div className="fdb-info-lbl">Description</div>
                                        <div className="fdb-info-val" style={{ whiteSpace: 'pre-wrap' }}>{factory.description}</div>
                                    </div>
                                )}
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Processing Capacity</div>
                                    <div className="fdb-info-val">{factory.capacity || 'Not specified'}</div>
                                </div>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Location</div>
                                    <div className="fdb-info-val">{factory.location || 'Location not specified'}</div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="fdb-grid-right">
                        {/* ACTIONS */}
                        <section className="fdb-section" style={{ background: 'rgba(126,200,67,0.05)', borderColor: 'rgba(126,200,67,0.1)' }}>
                            <h2 className="fdb-section-title">Actions</h2>
                            <div className="fdb-analytics-wrap" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                                <button className="fdb-contact-btn" style={{ background: 'var(--green)', color: '#0b0f0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> Connect & Collaborate
                                </button>
                            </div>
                        </section>

                        {/* CONTACT INFO */}
                        <section className="fdb-section">
                            <h2 className="fdb-section-title">Contact Information</h2>
                            <div className="fdb-overview-grid">
                                {factory.contactInfo?.email && (
                                    <div className="fdb-info-card full-width">
                                        <div className="fdb-info-lbl">Email Address</div>
                                        <div className="fdb-info-val"><a href={`mailto:${factory.contactInfo.email}`} style={{ color: 'var(--white)', textDecoration: 'none' }}>{factory.contactInfo.email}</a></div>
                                    </div>
                                )}
                                {factory.contactInfo?.phone && (
                                    <div className="fdb-info-card full-width">
                                        <div className="fdb-info-lbl">Phone Number</div>
                                        <div className="fdb-info-val"><a href={`tel:${factory.contactInfo.phone}`} style={{ color: 'var(--white)', textDecoration: 'none' }}>{factory.contactInfo.phone}</a></div>
                                    </div>
                                )}
                                {factory.contactInfo?.website && (
                                    <div className="fdb-info-card full-width">
                                        <div className="fdb-info-lbl">Website</div>
                                        <div className="fdb-info-val"><a href={factory.contactInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'none' }}>{factory.contactInfo.website}</a></div>
                                    </div>
                                )}
                                {!factory.contactInfo?.email && !factory.contactInfo?.phone && !factory.contactInfo?.website && (
                                    <div className="fdb-info-card full-width">
                                        <div className="fdb-info-val" style={{ color: 'var(--muted)' }}>No contact information available.</div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FactoryProfilePage;
