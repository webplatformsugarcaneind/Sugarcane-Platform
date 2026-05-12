import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ContractRequestModal from '../components/ContractRequestModal';
import './FarmerProfile.css';

/**
 * Premium SVG Icons Mapping
 */
const Icons = {
  Factory: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
  Capacity: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>),
  Contract: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
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
  const [showContractModal, setShowContractModal] = useState(false);

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
        invitationReason: 'Seeking collaboration opportunities for worker placement and operations'
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
        <div style={{ color: '#ff6b6b', fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
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
        <aside className="fp-sidebar">
          <div className="fp-sidebar-profile">
            <div className="fp-avatar-wrap">
              <div className="fp-avatar">{initials}</div>
              <div className="fp-avatar-ring"></div>
            </div>
            <div className="fp-user-name">{factory.name}</div>
            <div className="fp-user-role">
              <span className="fp-role-dot" style={{ background: factory.isActive ? 'var(--green)' : '#e74c3c' }}></span>
              {factory.isActive ? 'Active' : 'Offline'} • {getCapacityLabel(factory.capacity)}
            </div>
          </div>

          <div className="fp-stats-grid">
            <div className="fp-stat-item">
              <div className="fp-stat-val">{factory.capacity || '-'}</div>
              <div className="fp-stat-lbl">Capacity TCD</div>
            </div>
            <div className="fp-stat-item">
              <div className="fp-stat-val">{factory.experience || '-'}</div>
              <div className="fp-stat-lbl">Years Op.</div>
            </div>
          </div>

          <div className="fp-side-nav" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-base btn-primary" onClick={() => { if (factory.contactInfo?.email) window.location.href = `mailto:${factory.contactInfo.email}`; }} style={{ width: '100%' }}>
                📧 Email Factory
              </button>
              {factory.contactInfo?.phone && (
                <button className="btn-base btn-secondary" onClick={() => window.location.href = `tel:${factory.contactInfo.phone}`} style={{ width: '100%' }}>
                  📱 Call Factory
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="fp-main">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fp-page-header">
            <div className="fp-header-left">
              <div className="fp-eyebrow">Factory Profile View</div>
              <h1 className="fp-title">{factory.name}'s <em className="fp-highlight">Profile</em></h1>
              <p className="fp-subtitle">📍 {factory.location}</p>
            </div>
            <div className="fp-header-right">
              <button className="btn-base btn-secondary" onClick={() => navigate('/hhm/associated-factories')}>← Back to Directory</button>
            </div>
          </motion.div>

          {/* Technical Specifications */}
          <section className="fp-card">
            <div className="fp-card-header">
              <div className="fp-card-icon">🏭</div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Technical Specifications</h2>
                <div className="fp-card-sub">Core industrial data and capabilities</div>
              </div>
            </div>
            <div className="fp-card-body">
              <div className="fp-form-grid">
                <div className="fp-field full">
                  <label>About This Factory</label>
                  <textarea readOnly value={factory.description || 'No detailed description provided for this industrial node.'}></textarea>
                </div>
                <div className="fp-field">
                  <label>Crushing Capacity</label>
                  <input type="text" readOnly value={factory.capacity || 'Not specified'} />
                </div>
                <div className="fp-field">
                  <label>Specialization</label>
                  <input type="text" readOnly value={factory.specialization || 'General Sugar Processing'} />
                </div>
                <div className="fp-field">
                  <label>Operating Season</label>
                  <input type="text" readOnly value={factory.operatingSeason || 'Contact for schedule'} />
                </div>
                <div className="fp-field">
                  <label>Current Status</label>
                  <input type="text" readOnly value={factory.isActive ? '✅ Active / Online' : '❌ Inactive / Offline'} style={{ color: factory.isActive ? 'var(--green)' : '#ff6b6b' }} />
                </div>
              </div>
            </div>
          </section>

          {/* Operational Network */}
          {factory.associatedHHMs?.length > 0 && (
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon">👥</div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Operational Network</h2>
                  <div className="fp-card-sub">Currently associated HHM partners</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {factory.associatedHHMs.map((hhm, index) => (
                    <div key={index} style={{ padding: '16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', background: 'var(--green-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: '0.8rem' }}>👤</div>
                      <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{hhm.name}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Partner Node</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Partnership Actions */}
          <section className="fp-card" style={{ background: 'linear-gradient(135deg, rgba(126, 200, 67, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%)' }}>
            <div className="fp-card-header" style={{ borderBottom: 'none' }}>
              <div className="fp-card-icon">🤝</div>
              <div className="fp-card-txt">
                <h2 className="fp-card-title">Partnership & Linkage</h2>
                <div className="fp-card-sub">Manage your industrial collaboration with this unit</div>
              </div>
            </div>
            <div className="fp-card-body" style={{ paddingTop: 0 }}>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                Establish a secure operational link with this unit to begin collaboration, data exchange, and worker placement synchronization.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {isAssociated ? (
                  <button 
                    className="btn-base"
                    onClick={handleRemoveAssociation}
                    disabled={removingAssociation}
                    style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)', flex: 1 }}
                  >
                    {removingAssociation ? 'Terminating...' : 'End Active Contract'}
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn-base btn-primary"
                      onClick={handleSendInvitation}
                      disabled={sendingInvitation}
                      style={{ flex: 1 }}
                    >
                      {sendingInvitation ? 'Sending...' : 'Invite to Link'}
                    </button>
                    <button 
                      className="btn-base btn-secondary"
                      onClick={() => setShowContractModal(true)}
                      style={{ flex: 1 }}
                    >
                      <Icons.Contract /> Request Contract
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <ContractRequestModal 
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        factoryInfo={factory}
      />
    </div>
  );
};

export default HHMSpecificFactoryPage;
