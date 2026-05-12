import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './FarmerDashboardPage.css';

/**
 * Premium SVG Icons Mapping
 */
const Icons = {
  Factory: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>),
  Envelope: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>),
  EnvelopeOpen: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Close: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Phone: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.864-1.051l-3.21-.535a1.125 1.125 0 0 0-1.226.59l-1.28 2.56a14.62 14.62 0 0 1-7.224-7.224l2.56-1.28a1.125 1.125 0 0 0 .59-1.226l-.535-3.21A1.125 1.125 0 0 0 14.25 6h-1.372A2.25 2.25 0 0 0 10.5 8.25Z" /></svg>),
  Alert: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>),
  Filter: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>),
  PaperPlane: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>),
};

/**
 * Animated SVG Illustration for Hero section
 */
const HeroIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="hero-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 150) rotate(90) scale(150 200)">
        <stop stopColor="var(--amber)" stopOpacity="0.1" />
        <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill="url(#hero-glow)" />
    <motion.path 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
      d="M50 150 Q200 50 350 150" 
      stroke="var(--amber)" 
      strokeWidth="1" 
      opacity="0.3"
      fill="none"
    />
    <motion.circle 
      animate={{ 
        x: [0, 300, 0],
        opacity: [0, 0.8, 0] 
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      cx="50" cy="150" r="4" fill="var(--amber)" 
    />
    <motion.rect
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      x="150" y="100" width="100" height="100" rx="20" stroke="rgba(232, 168, 58, 0.1)" strokeWidth="1" fill="none"
    />
  </svg>
);

const HHMSentFactoryInvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [filteredInvitations, setFilteredInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({ pending: 0, accepted: 0, declined: 0 });

    useEffect(() => {
        fetchSentInvitations();
    }, []);

    useEffect(() => {
        filterInvitations();
    }, [invitations, statusFilter]);

    const fetchSentInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/hhm/my-factory-invitations', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const invitationsData = response.data.data || [];
            setInvitations(invitationsData);

            const counts = {
                pending: invitationsData.filter(inv => inv.status === 'pending').length,
                accepted: invitationsData.filter(inv => inv.status === 'accepted').length,
                declined: invitationsData.filter(inv => inv.status === 'declined').length
            };
            setStatusCounts(counts);

        } catch (err) {
            console.error('Error fetching sent invitations:', err);
            setError(err.response?.data?.message || 'Failed to load sent invitations.');
        } finally {
            setLoading(false);
        }
    };

    const filterInvitations = () => {
        if (statusFilter === 'all') {
            setFilteredInvitations(invitations);
        } else {
            setFilteredInvitations(
                invitations.filter(inv => inv.status === statusFilter)
            );
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'pending';
            case 'accepted': return 'accepted';
            case 'declined': return 'rejected';
            default: return '';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
          case 'pending': return <Icons.Clock />;
          case 'accepted': return <Icons.Check />;
          case 'declined': return <Icons.Close />;
          default: return <Icons.Clock />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="fr-page">
                <div className="fr-loading">
                    <div className="fr-spinner"></div>
                    <p>Syncing outgoing links...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fr-page">
            {/* 2026 Background Effects */}
            <div className="fr-ambient-glow fr-ambient-left" style={{ background: 'radial-gradient(circle, rgba(232, 168, 58, 0.08) 0%, transparent 70%)', width: '600px', height: '600px' }}></div>
            <div className="fr-ambient-glow fr-ambient-right" style={{ background: 'radial-gradient(circle, rgba(91, 143, 255, 0.08) 0%, transparent 70%)', width: '500px', height: '500px' }}></div>
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.03, pointerEvents: 'none' }}></div>

            {/* Header / Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fr-header"
            >
                <div className="fr-header-inner" style={{ minHeight: '240px', alignItems: 'center' }}>
                    <div className="fr-welcome">
                        <div className="fr-eyebrow">
                            <span className="fr-eyebrow-icon"><Icons.PaperPlane /></span>
                            Outgoing Requests
                        </div>
                        <h1 className="fr-title" style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
                          Sent <em>Invitations</em>
                        </h1>
                        <p className="fr-sub" style={{ fontSize: '1.1rem', maxWidth: '600px', opacity: 0.7 }}>
                          Track and monitor the status of your partnership proposals. Manage your outreach to top industrial units in real-time.
                        </p>
                    </div>
                    <div className="fr-hero-illustration-wrapper">
                        <HeroIllustration />
                    </div>
                </div>
            </motion.div>

            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fr-empty" 
                    style={{ padding: '16px', marginBottom: '24px', borderColor: 'rgba(255, 107, 107, 0.3)', background: 'rgba(255, 107, 107, 0.05)' }}
                  >
                      <div className="fr-empty-icon fr-error" style={{ width: '32px', height: '32px', margin: '0 auto 8px' }}><Icons.Alert /></div>
                      <h3 className="fr-error-text" style={{ fontSize: '1rem', margin: 0 }}>{error}</h3>
                  </motion.div>
              )}
            </AnimatePresence>

            <div className="fr-section">
                {/* 2026 Filter Bar */}
                <div className="fr-filter-bar" style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '16px', 
                  padding: '16px 24px', 
                  display: 'flex', 
                  gap: '20px', 
                  alignItems: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Icons.Filter />
                        Filter Pipeline:
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'pending', 'accepted', 'declined'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                style={{ 
                                  padding: '8px 16px', 
                                  borderRadius: '100px', 
                                  background: statusFilter === status ? 'rgba(255, 255, 255, 0.1)' : 'transparent', 
                                  border: '1px solid',
                                  borderColor: statusFilter === status ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                  color: statusFilter === status ? 'var(--white)' : 'var(--muted)',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  transition: 'all 0.3s ease',
                                  textTransform: 'capitalize'
                                }}
                            >
                                {status} ({status === 'all' ? invitations.length : statusCounts[status]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invitations List */}
                <div className="fr-contracts-list">
                    {filteredInvitations.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fr-empty">
                            <div className="fr-empty-icon"><Icons.EnvelopeOpen /></div>
                            <h3>No matches in pipeline</h3>
                            <p>Adjust your filters or initiate new partnership requests.</p>
                        </motion.div>
                    ) : (
                        <div className="fr-contract-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                            {filteredInvitations.map((invitation, index) => (
                                <motion.div 
                                  key={invitation._id} 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ x: 5 }}
                                  className="fr-contract-card"
                                  style={{ 
                                    padding: '24px', 
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
                                  }}
                                >
                                    <div className="fr-contract-top" style={{ marginBottom: '24px' }}>
                                        <div className="fr-contract-info-main">
                                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: '700' }}>
                                                <div style={{ display: 'flex', width: '28px', height: '28px', color: 'var(--amber)', filter: 'drop-shadow(0 0 8px rgba(232, 168, 58, 0.4))' }}>
                                                    <Icons.Factory />
                                                </div>
                                                {invitation.factoryId?.factoryName || invitation.factoryId?.name || 'Unknown Factory'}
                                            </h4>
                                            <span className="fr-contract-date" style={{ fontSize: '0.95rem', opacity: 0.6 }}>
                                                <Icons.Location />
                                                {invitation.factoryId?.factoryLocation || invitation.factoryId?.location || 'Location not specified'}
                                            </span>
                                        </div>
                                        <span className={`fr-badge ${getStatusBadgeClass(invitation.status)}`} style={{ padding: '8px 16px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {getStatusIcon(invitation.status)}
                                            {invitation.status}
                                        </span>
                                    </div>

                                    <div className="fr-contract-grid" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>SENT ON</span>
                                            <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                <Icons.Calendar />
                                                {formatDate(invitation.createdAt)}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>FACTORY CONTACT</span>
                                            <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                <Icons.Envelope />
                                                {invitation.factoryId?.email || 'N/A'}
                                            </span>
                                        </div>
                                        {invitation.respondedAt && (
                                          <div className="fr-detail-item">
                                              <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>RESPONSE RECEIVED</span>
                                              <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                  <Icons.Check />
                                                  {formatDate(invitation.respondedAt)}
                                              </span>
                                          </div>
                                        )}
                                    </div>

                                    {invitation.personalMessage && (
                                        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(91, 143, 255, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--blue)' }}>
                                            <div style={{ color: 'var(--blue)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Your Outreach Message</div>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                                                "{invitation.personalMessage}"
                                            </p>
                                        </div>
                                    )}

                                    {invitation.responseMessage && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(126, 200, 67, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--green)' }}>
                                            <div style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Factory's Official Feedback</div>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                                                "{invitation.responseMessage}"
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HHMSentFactoryInvitationsPage;
