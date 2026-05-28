import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import './FarmerProfile.css';

/**
 * Premium SVG Icons Mapping
 */
const Icons = {
  Factory: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>),
  Location: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
  Capacity: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>),
  Contract: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>),
  Check: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Warning: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>),
  Email: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>),
  Phone: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>),
  Users: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>),
  User: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
  Partnership: () => (<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>)
};

const HHMSpecificFactoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssociated, setIsAssociated] = useState(false);
  const [checkingAssociation, setCheckingAssociation] = useState(false);
  const [removingAssociation, setRemovingAssociation] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);


  const fetchFactoryDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/public/factories/${id}`);
      if (response.data.success) {
        setFactory(response.data.data?.factory || response.data.factory || null);
      } else {
        throw new Error('Failed to fetch factory details');
      }
    } catch (err) {
      console.error('Error fetching factory details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load factory details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkAssociation = useCallback(async () => {
    try {
      setCheckingAssociation(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/hhm/associated-factories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const associatedFactories = response.data.data || [];
      setIsAssociated(associatedFactories.some(associatedFactory => associatedFactory._id === id));
    } catch (err) {
      console.error('Error checking association:', err);
      setIsAssociated(false);
    } finally {
      setCheckingAssociation(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFactoryDetails();
    checkAssociation();
  }, [fetchFactoryDetails, checkAssociation]);

  const handleSendInvitation = async () => {
    if (!factory || sendingInvitation) return;
    try {
      setSendingInvitation(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/hhm/invite-factory', {
        factoryId: factory._id || factory.id,
        personalMessage: `I would like to establish a partnership with ${factory.name}`,
        invitationReason: 'Seeking collaboration opportunities for labour placement and operations'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Invitation sent successfully!');
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed to send invitation'}`);
    } finally {
      setSendingInvitation(false);
    }
  };

  const handleRemoveAssociation = async () => {
    if (!factory || removingAssociation) return;
    if (!window.confirm(`Are you sure you want to end the contract with ${factory.name}?`)) return;
    try {
      setRemovingAssociation(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/hhm/associated-factories/${factory._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Contract ended successfully!');
      setIsAssociated(false);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed to remove association'}`);
    } finally {
      setRemovingAssociation(false);
    }
  };

  const getCapacityLabel = (capacity) => {
    const num = Number(capacity);
    if (!num) return 'Unknown Scale';
    if (num < 1000) return 'Small Scale';
    if (num < 5000) return 'Medium Scale';
    return 'Large Scale';
  };

  if (loading) {
    return (
      <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="fp-spinner" style={{ borderTopColor: 'var(--green)' }}></div>
        <div style={{ color: 'var(--white)', marginLeft: '1rem' }}>Syncing Industrial Node...</div>
      </div>
    );
  }

  if (error || !factory) {
    return (
      <div className="farmer-profile-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#ff6b6b', width: '48px', height: '48px', marginBottom: '1rem' }}><Icons.Warning /></div>
        <h3 style={{ color: 'var(--white)', marginBottom: '1rem' }}>{error || 'Factory Profile Not Found'}</h3>
        <button className="fp-save-btn" onClick={() => navigate('/hhm/associated-factories')}>← Back to Network</button>
      </div>
    );
  }

  const initials = factory.name ? factory.name.substring(0, 2).toUpperCase() : 'FA';

  return (
    <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
      <div className="fp-noise" />
      <div className="fp-bg-glow" />

      <div className="fdb-container">
        <button className="fdb-back-btn" onClick={() => navigate('/hhm/factories')}>← Directory</button>

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
                            {factory.isActive && <span className="fdb-badge-verified">✓ Active Node</span>}
                        </div>
                        <div className="fdb-hero-meta">
                            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {factory.location || 'Pune, Maharashtra'}</span>
                            <span className="fdb-hero-dot">•</span>
                            <span style={{ color: 'var(--amber)' }}>High Demand</span>
                            <span className="fdb-hero-dot">•</span>
                            <span style={{ color: 'var(--green)' }}>Crushing Active</span>
                        </div>
                        <p className="fdb-hero-tagline">Live operations and logistics coordination node.</p>
                    </div>
                </div>
            </div>
            <div className="fdb-hero-right">
                <div className="fdb-stat-card">
                    <div className="fdb-stat-icon"><Icons.Capacity /></div>
                    <div className="fdb-stat-data">
                        <div className="fdb-stat-val">{factory.capacity || '2,500'} <span className="fdb-stat-unit">TCD</span></div>
                        <div className="fdb-stat-lbl">Capacity</div>
                    </div>
                </div>
                <div className="fdb-stat-card">
                    <div className="fdb-stat-icon"><Icons.Factory /></div>
                    <div className="fdb-stat-data">
                        <div className="fdb-stat-val">{factory.experience || '15'} <span className="fdb-stat-unit">Yrs</span></div>
                        <div className="fdb-stat-lbl">Active Operations</div>
                    </div>
                </div>
                <div className="fdb-stat-card">
                    <div className="fdb-stat-icon"><Icons.Users /></div>
                    <div className="fdb-stat-data">
                        <div className="fdb-stat-val">{factory.associatedHHMs?.length || 24}</div>
                        <div className="fdb-stat-lbl">Active HHMs</div>
                    </div>
                </div>
                <div className="fdb-stat-card">
                    <div className="fdb-stat-icon" style={{ color: 'var(--green)' }}>₹</div>
                    <div className="fdb-stat-data">
                        <div className="fdb-stat-val">14 <span className="fdb-stat-unit">Days</span></div>
                        <div className="fdb-stat-lbl">Avg Settlement</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="fdb-grid-main">
            <div className="fdb-grid-left">
                {/* OPERATIONS OVERVIEW */}
                <section className="fdb-section">
                    <h2 className="fdb-section-title">Operations Overview</h2>
                    <div className="fdb-overview-grid">
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Intake Status</div>
                            <div className="fdb-info-val" style={{color: 'var(--green)'}}>Open</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Required This Week</div>
                            <div className="fdb-info-val">4,500 Tons</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Capacity Usage</div>
                            <div className="fdb-info-val" style={{color: 'var(--amber)'}}>88%</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Peak Hours</div>
                            <div className="fdb-info-val">06:00 - 10:00</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Queue Time</div>
                            <div className="fdb-info-val" style={{color: '#ff6b6b'}}>2.5 Hrs</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Intake Deadline</div>
                            <div className="fdb-info-val">March 28, 2026</div>
                        </div>
                    </div>
                </section>

                {/* CANE OPERATIONS */}
                <section className="fdb-section">
                    <h2 className="fdb-section-title">Cane Operations</h2>
                    <div className="fdb-overview-grid">
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Needs This Week</div>
                            <div className="fdb-info-val">4,500T</div>
                        </div>
                        <div className="fdb-info-card" style={{ background: 'rgba(126,200,67,0.05)', border: '1px solid rgba(126,200,67,0.2)' }}>
                            <div className="fdb-info-lbl" style={{ color: 'var(--green)' }}>Intake Status</div>
                            <div className="fdb-info-val" style={{ color: 'var(--green)' }}>OPEN</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Priority Region</div>
                            <div className="fdb-info-val" style={{ color: 'var(--amber)' }}>Sangli</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Fulfillment</div>
                            <div className="fdb-info-val">92%</div>
                        </div>
                        <div className="fdb-info-card full-width">
                            <div className="fdb-info-lbl">Sugar Recovery Rate</div>
                            <div className="fdb-info-val">11.8%</div>
                        </div>
                    </div>
                </section>
                
                {/* LOGISTICS */}
                <section className="fdb-section">
                    <h2 className="fdb-section-title">Logistics Support</h2>
                    <div className="fdb-overview-grid">
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Transport Support</div>
                            <div className="fdb-info-val">Available (50km)</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Nearby Weighbridge</div>
                            <div className="fdb-info-val">Active (2km)</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Cane Yard Capacity</div>
                            <div className="fdb-info-val">5,000 Tons</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Service Coverage</div>
                            <div className="fdb-info-val">Pune, Satara, Sangli</div>
                        </div>
                        <div className="fdb-info-card full-width">
                            <div className="fdb-info-lbl">Truck Waiting Time</div>
                            <div className="fdb-info-val">45 Mins</div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="fdb-grid-right">
                {/* ACTION PANEL */}
                <section className="fdb-section" style={{ background: isAssociated ? 'rgba(255, 107, 107, 0.05)' : 'rgba(126,200,67,0.05)', borderColor: isAssociated ? 'rgba(255, 107, 107, 0.1)' : 'rgba(126,200,67,0.1)' }}>
                    <h2 className="fdb-section-title">{isAssociated ? 'Manage Contract' : 'Propose Partnership'}</h2>
                    <div className="fdb-analytics-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {isAssociated ? (
                            <button 
                                className="fdb-contact-btn"
                                onClick={handleRemoveAssociation}
                                disabled={removingAssociation}
                                style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                {removingAssociation ? 'Terminating Link...' : 'Sever Active Link'}
                            </button>
                        ) : (
                            <button 
                                className="fdb-contact-btn"
                                onClick={() => navigate(`/hhm/factories/${id}/propose-contract`)}
                                style={{ background: 'var(--green)', color: '#0b0f0b', border: 'none', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <Icons.Contract /> Propose Contract
                            </button>
                        )}
                        <button className="fdb-contact-btn" onClick={handleSendInvitation} disabled={sendingInvitation} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                            <Icons.Email /> {sendingInvitation ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </section>

                {/* SETTLEMENT RELIABILITY */}
                <section className="fdb-section">
                    <h2 className="fdb-section-title">Financial Performance</h2>
                    <div className="fdb-overview-grid">
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Avg Settlement</div>
                            <div className="fdb-info-val">14 Days</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">On-Time Payment</div>
                            <div className="fdb-info-val" style={{color: 'var(--green)'}}>95%</div>
                        </div>
                        <div className="fdb-info-card full-width">
                            <div className="fdb-info-lbl">Last FRP Update</div>
                            <div className="fdb-info-val">₹3,150 / Ton (Mar)</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Reliability</div>
                            <div className="fdb-info-val" style={{color: 'var(--green)'}}>EXCELLENT</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Pending</div>
                            <div className="fdb-info-val" style={{color: 'var(--amber)'}}>12 Batches</div>
                        </div>
                    </div>
                </section>

                {/* PARTNERSHIP OPERATIONS */}
                <section className="fdb-section">
                    <h2 className="fdb-section-title">Partnership Operations</h2>
                    <div className="fdb-overview-grid">
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Active HHMs</div>
                            <div className="fdb-info-val">{factory.associatedHHMs?.length || 24}</div>
                        </div>
                        <div className="fdb-info-card">
                            <div className="fdb-info-lbl">Pending Requests</div>
                            <div className="fdb-info-val" style={{color: 'var(--amber)'}}>4</div>
                        </div>
                        <div className="fdb-info-card full-width">
                            <div className="fdb-info-lbl">Priority Supply Routes</div>
                            <div className="fdb-info-val">NH-48 Corridor</div>
                        </div>
                        <div className="fdb-info-card full-width">
                            <div className="fdb-info-lbl">Contract Completion</div>
                            <div className="fdb-info-val" style={{color: 'var(--green)'}}>94%</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HHMSpecificFactoryPage;
