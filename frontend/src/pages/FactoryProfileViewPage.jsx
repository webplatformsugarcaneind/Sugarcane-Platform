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
            <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
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

            <div className="fdb-container">
                <button className="fdb-back-btn" onClick={handleGoBack}>← Back to Directory</button>
                
                {/* 1. HERO SECTION */}
                <div className="fdb-hero">
                    <div className="fdb-hero-left">
                        <div className="fdb-hero-header">
                            <div className="fdb-avatar-lg">
                                {initials}
                                <div className="fdb-avatar-ring"></div>
                            </div>
                            <div className="fdb-hero-info">
                                <div className="fdb-hero-title-wrap">
                                    <h1 className="fdb-hero-title">{factoryData.name}</h1>
                                    <span className="fdb-badge-verified">✓ Verified</span>
                                </div>
                                <div className="fdb-hero-meta">
                                    <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {factoryData.location || 'Maharashtra, India'}</span>
                                    <span className="fdb-hero-dot">•</span>
                                    <span className={`fdb-status-text ${crushingStatus === CRUSHING_STATUS.ON ? 'active' : ''}`}>
                                        <span className="fdb-status-dot" style={{ background: crushingStatus === CRUSHING_STATUS.ON ? '#4caf50' : '#e74c3c' }}></span>
                                        {crushingStatus === CRUSHING_STATUS.ON ? 'ACTIVE CRUSHING' : 'MAINTENANCE'}
                                    </span>
                                </div>
                                <p className="fdb-hero-tagline">Premium Sugar Processing & Refining Facility</p>
                            </div>
                        </div>
                    </div>
                    <div className="fdb-hero-right">
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{factoryData.capacity ? factoryData.capacity.replace(/[^0-9]/g, '') : '2500'} <span className="fdb-stat-unit">TCD</span></div>
                                <div className="fdb-stat-lbl">Crushing Capacity</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">98<span className="fdb-stat-unit">%</span></div>
                                <div className="fdb-stat-lbl">Payment Reliability</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">{factoryData.associatedHHMs?.length || 4}</div>
                                <div className="fdb-stat-lbl">Active HHM Partners</div>
                            </div>
                        </div>
                        <div className="fdb-stat-card">
                            <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                            <div className="fdb-stat-data">
                                <div className="fdb-stat-val">4.8<span className="fdb-stat-unit">/5</span></div>
                                <div className="fdb-stat-lbl">Farmer Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fdb-grid-main">
                    <div className="fdb-grid-left">
                        {/* 2. FACTORY OVERVIEW SECTION */}
                        <section className="fdb-section">
                            <h2 className="fdb-section-title">Factory Overview</h2>
                            <div className="fdb-overview-grid">
                                <div className="fdb-info-card full-width">
                                    <div className="fdb-info-lbl">About Factory</div>
                                    <div className="fdb-info-val text-content">{factoryData.description || 'A modern sugar manufacturing facility focused on high-yield extraction and farmer-friendly procurement processes. Committed to timely payments and efficient logistics.'}</div>
                                </div>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Processing Capacity</div>
                                    <div className="fdb-info-val">{factoryData.capacity || 'Not specified'}</div>
                                </div>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Operational Season</div>
                                    <div className="fdb-info-val">{factoryData.operatingSeason || 'Oct - April'}</div>
                                </div>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Crushing Status</div>
                                    <div className="fdb-info-val" style={{ color: crushingStatus === CRUSHING_STATUS.ON ? '#4caf50' : '#e74c3c' }}>
                                        {crushingStatus === CRUSHING_STATUS.ON ? 'Active & Receiving' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="fdb-info-card">
                                    <div className="fdb-info-lbl">Years Operational</div>
                                    <div className="fdb-info-val">{factoryData.establishedYear ? new Date().getFullYear() - parseInt(factoryData.establishedYear) : '15'} Years</div>
                                </div>
                                <div className="fdb-info-card full-width">
                                    <div className="fdb-info-lbl">Processing Specialization</div>
                                    <div className="fdb-tags">
                                        {['White Crystal Sugar', 'Bagasse Power', 'Ethanol Production'].map(tag => (
                                            <span key={tag} className="fdb-tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ASSOCIATED HHMS SECTION */}
                        <section className="fdb-section">
                            <div className="fdb-hhm-header">
                                <h2 className="fdb-section-title" style={{ margin: 0 }}>Associated HHMs</h2>
                                <span className="fdb-hhm-count">{factoryData.associatedHHMs?.length || 0} Active</span>
                            </div>
                            
                            <div className="fdb-hhm-grid">
                                {factoryData.associatedHHMs && factoryData.associatedHHMs.length > 0 ? (
                                    factoryData.associatedHHMs.map((hhm, i) => (
                                        <div key={i} className="fdb-hhm-card">
                                            <div className="fdb-hhm-avatar">{hhm?.name ? hhm.name.substring(0, 2).toUpperCase() : '??'}</div>
                                            <div className="fdb-hhm-info">
                                                <div className="fdb-hhm-name">{hhm?.name || 'Unknown HHM'}</div>
                                                <div className="fdb-hhm-role">Harvest Manager</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="fdb-hhm-empty">
                                        <div className="fdb-hhm-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                                        <div className="fdb-hhm-empty-text">No Harvest Head Managers currently associated.</div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 3. FARMER BENEFITS SECTION */}
                        <section className="fdb-section">
                            <h2 className="fdb-section-title">Why Farmers Choose Us</h2>
                            <div className="fdb-benefits-grid">
                                <div className="fdb-benefit-card">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    <span>Faster 14-Day Payments</span>
                                </div>
                                <div className="fdb-benefit-card">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>
                                    <span>Reliable Unloading Process</span>
                                </div>
                                <div className="fdb-benefit-card">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    <span>Seamless HHM Coordination</span>
                                </div>
                                <div className="fdb-benefit-card">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                                    <span>Harvest & Transport Support</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="fdb-grid-right">
                        {/* 4. FACTORY ANALYTICS SECTION */}
                        <section className="fdb-section">
                            <h2 className="fdb-section-title">Operational Analytics</h2>
                            <div className="fdb-analytics-wrap">
                                <div className="fdb-analytic-item">
                                    <div className="fdb-analytic-head">
                                        <span>On-Time Payment Rate</span>
                                        <span className="fdb-analytic-pct">96%</span>
                                    </div>
                                    <div className="fdb-progress-bar"><div className="fdb-progress-fill" style={{ width: '96%' }}></div></div>
                                </div>
                                <div className="fdb-analytic-item">
                                    <div className="fdb-analytic-head">
                                        <span>Contract Fulfillment</span>
                                        <span className="fdb-analytic-pct">88%</span>
                                    </div>
                                    <div className="fdb-progress-bar"><div className="fdb-progress-fill" style={{ width: '88%' }}></div></div>
                                </div>
                                <div className="fdb-analytic-item">
                                    <div className="fdb-analytic-head">
                                        <span>Current Operational Load</span>
                                        <span className="fdb-analytic-pct amber">High</span>
                                    </div>
                                    <div className="fdb-progress-bar"><div className="fdb-progress-fill amber" style={{ width: '85%' }}></div></div>
                                </div>
                                <div className="fdb-analytic-stats">
                                    <div className="fdb-astat">
                                        <div className="fdb-astat-val">45m</div>
                                        <div className="fdb-astat-lbl">Avg Unload Time</div>
                                    </div>
                                    <div className="fdb-astat">
                                        <div className="fdb-astat-val">A+</div>
                                        <div className="fdb-astat-lbl">Trust Score</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. CONTACT & ACTION AREA */}
                        <section className="fdb-section">
                            <div className="fdb-action-panel">
                                <button className="fdb-btn-primary" onClick={() => { if (factoryData.contactInfo?.email) window.location.href = `mailto:${factoryData.contactInfo.email}`; }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>
                                    Contact Factory
                                </button>
                                <button className="fdb-btn-secondary">
                                    Send Partnership Request
                                </button>
                                <button className="fdb-btn-secondary" onClick={() => navigate(`/farmer/hhm-directory?search=${encodeURIComponent(factoryData.name)}`)}>
                                    View associated HHMs
                                </button>
                                
                                <div className="fdb-contact-meta">
                                    {factoryData.contactInfo?.email && <div className="fdb-citem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> {factoryData.contactInfo.email}</div>}
                                    {factoryData.contactInfo?.phone && <div className="fdb-citem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> {factoryData.contactInfo.phone}</div>}
                                    <div className="fdb-citem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Operations: 24/7 Season</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FactoryProfileViewPage;
