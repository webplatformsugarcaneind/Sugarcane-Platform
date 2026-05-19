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
    <div className="farmer-profile-page">
      <div className="fp-noise" />
      <div className="fp-bg-glow" />

      <div className="fp-layout-shell">
        {/* Sidebar */}
        <aside className="fp-sidebar" style={{ gap: '20px' }}>
          <div className="fp-sidebar-profile">
            <div className="fp-avatar-wrap">
              <div className="fp-avatar">{initials}</div>
              <div className="fp-avatar-ring"></div>
            </div>
            <div className="fp-user-name" style={{ fontSize: '1.25rem' }}>{factory.name}</div>
          </div>


          
          <div style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Current Status</span>
              <span style={{ color: factory.isActive ? 'var(--green)' : 'var(--red)', fontSize: '0.8rem', fontWeight: 'bold' }}>{factory.isActive ? 'Active Node' : 'Offline'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Service Region</span>
              <span style={{ color: 'var(--white)', fontSize: '0.8rem', fontWeight: 'bold' }}>Western MH</span>
            </div>
          </div>


        </aside>

        {/* Main Content */}
        <main className="fp-main">
          {/* Hero Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div className="fp-header-left">
              <h1 className="fp-title" style={{ fontSize: '2.2rem', marginBottom: '16px' }}>{factory.name}</h1>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{ padding: '6px 14px', borderRadius: '24px', background: 'rgba(126, 200, 67, 0.1)', color: 'var(--green)', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(126, 200, 67, 0.2)' }}>Crushing Active</span>
                <span style={{ padding: '6px 14px', borderRadius: '24px', background: 'rgba(255, 171, 0, 0.1)', color: 'var(--amber)', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(255, 171, 0, 0.2)' }}>High Demand</span>
                <span style={{ padding: '6px 14px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--border)' }}>📍 {factory.location || 'Pune, Maharashtra'}</span>
              </div>
              <p className="fp-subtitle" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Live operations and logistics coordination node.</p>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--white)' }}>{factory.capacity || '2,500'} TCD</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Capacity (Tonnes Crushed / Day)</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--white)' }}>{factory.experience || '15'} Years</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Years Active</div>
                </div>
              </div>
            </div>
            <div className="fp-header-right">
              <button className="btn-base btn-secondary" onClick={() => navigate('/hhm/factories')}>← Directory</button>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Operations Overview */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}><Icons.Factory /></div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Operations Overview</h2>
                  <div className="fp-card-sub">Live intake and crushing metrics</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Current Intake Status</span>
                    <strong style={{ color: 'var(--green)' }}>Open</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Required Tonnage This Week</span>
                    <strong style={{ color: 'var(--white)' }}>4,500 Tons</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Daily Capacity Usage</span>
                    <strong style={{ color: 'var(--amber)' }}>88%</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Peak Intake Hours</span>
                    <strong style={{ color: 'var(--white)' }}>06:00 - 10:00</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Current Queue Time</span>
                    <strong style={{ color: 'var(--red)' }}>2.5 Hrs</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Intake Deadline</span>
                    <strong style={{ color: 'var(--white)' }}>March 28, 2026</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Cane Operations Section */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}><Icons.Capacity /></div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Cane Operations</h2>
                  <div className="fp-card-sub">HHM supply metrics</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Needs This Week</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--white)' }}>4,500T</div>
                  </div>
                  <div style={{ background: 'rgba(126, 200, 67, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(126, 200, 67, 0.2)' }}>
                    <div style={{ color: 'var(--green)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Intake Status</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--green)' }}>OPEN</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Priority Region</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--amber)' }}>Sangli</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Fulfillment</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--white)' }}>92%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Sugar Recovery Rate</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--white)' }}>11.8%</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Settlement Reliability Section */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}><span style={{ color:'var(--green)' }}>₹</span></div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Settlement Reliability</h2>
                  <div className="fp-card-sub">Financial performance & FRP</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Avg Settlement Days</span>
                    <strong style={{ color: 'var(--white)' }}>14 Days</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>On-Time Payment %</span>
                    <strong style={{ color: 'var(--green)' }}>95%</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Last FRP Update</span>
                    <strong style={{ color: 'var(--white)' }}>₹3,150 / Ton (Mar)</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Payment Reliability</span>
                    <strong style={{ color: 'var(--green)' }}>EXCELLENT</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Pending Settlements</span>
                    <strong style={{ color: 'var(--amber)' }}>12 Batches</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Logistics Support Section */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}><Icons.Location /></div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Logistics Support</h2>
                  <div className="fp-card-sub">Infrastructure & transport</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Transport Support</span>
                    <strong style={{ color: 'var(--white)' }}>Available (50km)</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Nearby Weighbridge</span>
                    <strong style={{ color: 'var(--white)' }}>Active (2km)</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Cane Yard Capacity</span>
                    <strong style={{ color: 'var(--white)' }}>5,000 Tons</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Service Coverage Regions</span>
                    <strong style={{ color: 'var(--white)' }}>Pune, Satara, Sangli</strong>
                  </div>
                  <div className="fp-field-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Truck Waiting Time</span>
                    <strong style={{ color: 'var(--white)' }}>45 Mins</strong>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Partnership Operations Section */}
          <section className="fp-card" style={{ marginBottom: '20px' }}>
            <div className="fp-card-header">
              <div className="fp-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}><Icons.Users /></div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Partnership Operations</h2>
                <div className="fp-card-sub">Active collaborations and success rates</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Active HHMs</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--white)' }}>{factory.associatedHHMs?.length || 24}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Requests</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--amber)' }}>4</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Priority Supply Routes</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--white)' }}>NH-48 Corridor</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Contract Completion</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--green)' }}>94%</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Buttons */}
          <section className="fp-card" style={{ background: 'linear-gradient(135deg, rgba(126, 200, 67, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%)', borderColor: 'rgba(126, 200, 67, 0.2)' }}>
            <div className="fp-card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '24px' }}>
              {isAssociated ? (
                <button 
                  className="btn-base"
                  onClick={handleRemoveAssociation}
                  disabled={removingAssociation}
                  style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)', flex: 1, padding: '16px' }}
                >
                  {removingAssociation ? 'Terminating Link...' : 'Sever Active Link'}
                </button>
              ) : (
                <button 
                  className="btn-base btn-primary"
                  onClick={() => navigate(`/hhm/factories/${id}/propose-contract`)}
                  style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span style={{ width: '18px', height: '18px' }}><Icons.Contract /></span> Propose Contract
                </button>
              )}
            </div>
          </section>
        </main>
      </div>


    </div>
  );
};

export default HHMSpecificFactoryPage;
