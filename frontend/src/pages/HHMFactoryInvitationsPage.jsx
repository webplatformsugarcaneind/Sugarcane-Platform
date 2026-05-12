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
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Close: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Phone: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.864-1.051l-3.21-.535a1.125 1.125 0 0 0-1.226.59l-1.28 2.56a14.62 14.62 0 0 1-7.224-7.224l2.56-1.28a1.125 1.125 0 0 0 .59-1.226l-.535-3.21A1.125 1.125 0 0 0 14.25 6h-1.372A2.25 2.25 0 0 0 10.5 8.25Z" /></svg>),
  Alert: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>),
  Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>),
  Filter: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>),
  TrendUp: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307L21.75 8.25m0 0V12m0-3.75H18" /></svg>),
};

/**
 * Animated SVG Illustration for Hero section
 */
const HeroIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="hero-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 150) rotate(90) scale(150 200)">
        <stop stopColor="var(--green)" stopOpacity="0.15" />
        <stop offset="1" stopColor="var(--green)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--green)" />
        <stop offset="100%" stopColor="var(--blue)" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#hero-glow)" />
    
    {/* Abstract Factory Representation */}
    <motion.path 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      d="M100 220V120L150 150L200 120L250 150L300 120V220H100Z" 
      stroke="url(#path-grad)" 
      strokeWidth="2" 
      fill="rgba(126, 200, 67, 0.05)"
    />
    <motion.circle 
      animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
      cx="150" cy="100" r="15" fill="var(--green)" opacity="0.1" 
    />
    <motion.circle 
      animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      cx="250" cy="80" r="20" fill="var(--blue)" opacity="0.1" 
    />
    
    {/* Floating Particles */}
    {[...Array(8)].map((_, i) => (
      <motion.circle
        key={i}
        animate={{ 
          y: [0, -30, 0], 
          x: [0, (i % 2 === 0 ? 10 : -10), 0],
          opacity: [0, 0.4, 0] 
        }}
        transition={{ 
          duration: 3 + i, 
          repeat: Infinity, 
          delay: i * 0.5 
        }}
        cx={120 + i * 20} 
        cy={180 + (i % 3) * 10} 
        r="2" 
        fill="var(--green)"
      />
    ))}
  </svg>
);

const HHMFactoryInvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [filteredInvitations, setFilteredInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({ pending: 0, accepted: 0, declined: 0 });
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvitations();
    }, []);

    useEffect(() => {
        filterInvitations();
    }, [invitations, statusFilter, searchTerm]);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/hhm/factory-invitations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const invitationsData = response.data.data || [];
            setInvitations(invitationsData);
            setStatusCounts(response.data.statusCounts || { pending: 0, accepted: 0, declined: 0 });

        } catch (err) {
            console.error('Error fetching invitations:', err);
            setError(err.response?.data?.message || 'Failed to load invitations');
        } finally {
            setLoading(false);
        }
    };

    const filterInvitations = () => {
        let result = invitations;
        
        if (statusFilter !== 'all') {
            result = result.filter(inv => inv.status === statusFilter);
        }
        
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(inv => 
                (inv.factoryId?.factoryName || inv.factoryId?.name || '').toLowerCase().includes(lowerSearch) ||
                (inv.factoryId?.factoryLocation || inv.factoryId?.location || '').toLowerCase().includes(lowerSearch)
            );
        }
        
        setFilteredInvitations(result);
    };

    const handleRespondClick = (invitation, status) => {
        setSelectedInvitation({ ...invitation, responseAction: status });
        setShowModal(true);
        setResponseMessage('');
    };

    const handleSubmitResponse = async () => {
        if (!selectedInvitation) return;

        try {
            setProcessingId(selectedInvitation._id);
            setError(null);

            const token = localStorage.getItem('token');

            await axios.put(
                `/api/hhm/factory-invitations/${selectedInvitation._id}`,
                {
                    status: selectedInvitation.responseAction,
                    responseMessage: responseMessage
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess(`Invitation ${selectedInvitation.responseAction} successfully!`);
            setShowModal(false);
            setSelectedInvitation(null);
            setResponseMessage('');

            await fetchInvitations();
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error('Error responding to invitation:', err);
            setError(err.response?.data?.message || 'Failed to respond to invitation');
        } finally {
            setProcessingId(null);
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

    if (loading) {
        return (
            <div className="fr-page">
                <div className="fr-loading">
                    <div className="fr-spinner"></div>
                    <p>Loading invitations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fr-page">
            {/* 2026 Background Effects */}
            <div className="fr-ambient-glow fr-ambient-left" style={{ background: 'radial-gradient(circle, rgba(126, 200, 67, 0.08) 0%, transparent 70%)', width: '600px', height: '600px' }}></div>
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
                            <span className="fr-eyebrow-icon"><Icons.Factory /></span>
                            Partnerships & Ecosystem
                        </div>
                        <h1 className="fr-title" style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
                          Factory <em>Invitations</em>
                        </h1>
                        <p className="fr-sub" style={{ fontSize: '1.1rem', maxWidth: '600px', opacity: 0.7 }}>
                          Manage and scale your industrial partnerships through our futuristic 2026 agri-tech interface. Optimize collaborations with top sugar factories.
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
                      <button onClick={() => setError(null)} className="fr-clear-btn" style={{ marginTop: '8px' }}>Dismiss</button>
                  </motion.div>
              )}

              {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fr-empty" 
                    style={{ padding: '16px', marginBottom: '24px', borderColor: 'rgba(126, 200, 67, 0.3)', background: 'rgba(126, 200, 67, 0.05)' }}
                  >
                      <div className="fr-empty-icon" style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'var(--green)' }}><Icons.Check /></div>
                      <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--green)' }}>{success}</h3>
                  </motion.div>
              )}
            </AnimatePresence>

            <div className="fr-section">
                {/* 2026 Filter/Search Bar */}
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
                    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '16px', color: 'var(--muted)', display: 'flex' }}><Icons.Search /></span>
                        <input 
                          type="text" 
                          placeholder="Search industries, locations..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ 
                            width: '100%', 
                            background: 'rgba(0, 0, 0, 0.2)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            borderRadius: '12px', 
                            padding: '12px 16px 12px 48px', 
                            color: 'var(--white)',
                            outline: 'none',
                            fontSize: '0.95rem'
                          }}
                        />
                    </div>
                    
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '200px' }}>
                        <span style={{ position: 'absolute', left: '16px', color: 'var(--muted)', display: 'flex' }}><Icons.Filter /></span>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="fr-select"
                            style={{ 
                              width: '100%', 
                              paddingLeft: '44px', 
                              height: '46px',
                              background: 'rgba(0, 0, 0, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '12px'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>

                {/* Invitations List */}
                <div className="fr-contracts-list">
                    {filteredInvitations.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="fr-empty"
                        >
                            <div className="fr-empty-icon"><Icons.Envelope /></div>
                            <h3>No matches found</h3>
                            <p>Adjust your search or filter to find specific invitations.</p>
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
                                                <div style={{ display: 'flex', width: '28px', height: '28px', color: 'var(--green)', filter: 'drop-shadow(0 0 8px rgba(126, 200, 67, 0.4))' }}>
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
                                            <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>PRODUCTION CAPACITY</span>
                                            <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                {invitation.factoryId?.capacity || 'Standard'}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>RECEIVED DATE</span>
                                            <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                <Icons.Calendar />
                                                {formatDate(invitation.createdAt)}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>FACTORY EMAIL</span>
                                            <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                <Icons.Envelope />
                                                {invitation.factoryId?.email || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>DIRECT CONTACT</span>
                                            <span className="fr-detail-val" style={{ fontSize: '1rem', color: 'var(--white)' }}>
                                                <Icons.Phone />
                                                {invitation.factoryId?.phone || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {invitation.invitationReason && (
                                        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(91, 143, 255, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--blue)' }}>
                                            <div style={{ color: 'var(--blue)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Core Objective</div>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                                                {invitation.invitationReason}
                                            </p>
                                        </div>
                                    )}

                                    {invitation.personalMessage && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(126, 200, 67, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--green)' }}>
                                            <div style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Partnership Proposal</div>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                                                "{invitation.personalMessage}"
                                            </p>
                                        </div>
                                    )}

                                    {invitation.responseMessage && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(232, 168, 58, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--amber)' }}>
                                            <div style={{ color: 'var(--amber)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Your Official Response</div>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                                                "{invitation.responseMessage}"
                                            </p>
                                        </div>
                                    )}

                                    {invitation.status === 'pending' && (
                                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespondClick(invitation, 'accepted')}
                                                disabled={processingId === invitation._id}
                                                style={{ 
                                                  flex: 1,
                                                  padding: '14px 24px', 
                                                  background: 'var(--green)', 
                                                  color: '#000', 
                                                  borderRadius: '100px', 
                                                  border: 'none', 
                                                  fontWeight: '700', 
                                                  cursor: 'pointer',
                                                  boxShadow: '0 8px 24px rgba(126, 200, 67, 0.2)'
                                                }}
                                            >
                                                {processingId === invitation._id ? 'Securing Link...' : 'Accept Partnership'}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02, background: 'rgba(255, 107, 107, 0.2)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleRespondClick(invitation, 'declined')}
                                                disabled={processingId === invitation._id}
                                                style={{ 
                                                  padding: '14px 32px', 
                                                  background: 'rgba(255, 107, 107, 0.1)', 
                                                  color: 'var(--red)', 
                                                  borderRadius: '100px', 
                                                  border: '1px solid rgba(255, 107, 107, 0.2)', 
                                                  fontWeight: '700', 
                                                  cursor: 'pointer'
                                                }}
                                            >
                                                Decline
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Response Modal */}
            <AnimatePresence>
              {showModal && selectedInvitation && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} 
                        onClick={() => setShowModal(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{ 
                          background: 'linear-gradient(180deg, rgba(26, 35, 24, 0.98) 0%, rgba(15, 20, 14, 0.98) 100%)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          borderRadius: '28px', 
                          width: '100%', 
                          maxWidth: '540px', 
                          padding: '40px', 
                          position: 'relative', 
                          boxShadow: '0 32px 64px rgba(0,0,0,0.6)' 
                        }} 
                        onClick={(e) => e.stopPropagation()}
                      >
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                              <h2 style={{ margin: 0, fontFamily: 'Syne', fontSize: '1.8rem', color: 'var(--white)', fontWeight: '800' }}>
                                  {selectedInvitation.responseAction === 'accepted' ? 'Finalize' : 'Confirm'} Decision
                              </h2>
                              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                          </div>

                          <div style={{ marginBottom: '32px' }}>
                              <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5 }}>
                                  You are about to <span style={{ color: selectedInvitation.responseAction === 'accepted' ? 'var(--green)' : 'var(--red)', fontWeight: 'bold' }}>{selectedInvitation.responseAction}</span> the partnership request from <strong>{selectedInvitation.factoryId?.factoryName || selectedInvitation.factoryId?.name}</strong>.
                              </p>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <label style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Official Memo (Optional)</label>
                                  <textarea
                                      value={responseMessage}
                                      onChange={(e) => setResponseMessage(e.target.value)}
                                      placeholder={
                                          selectedInvitation.responseAction === 'accepted'
                                              ? 'Enter your collaboration terms or a welcoming note...'
                                              : 'State the official reason for declining this request...'
                                      }
                                      rows="5"
                                      maxLength="300"
                                      style={{ 
                                        background: 'rgba(0, 0, 0, 0.4)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                                        borderRadius: '16px', 
                                        padding: '16px', 
                                        color: 'var(--white)', 
                                        outline: 'none', 
                                        fontFamily: 'inherit', 
                                        resize: 'none',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.5
                                      }}
                                  />
                                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem', textAlign: 'right', opacity: 0.5 }}>{responseMessage.length}/300</div>
                              </div>
                          </div>

                          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                              <button
                                  onClick={() => setShowModal(false)}
                                  disabled={processingId}
                                  style={{ 
                                    padding: '14px 28px', 
                                    borderRadius: '100px', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                                    background: 'transparent', 
                                    color: 'var(--white)', 
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                  }}
                              >
                                  Cancel
                              </button>
                              <button
                                  onClick={handleSubmitResponse}
                                  disabled={processingId}
                                  style={{ 
                                      padding: '14px 32px', 
                                      borderRadius: '100px', 
                                      border: 'none', 
                                      background: selectedInvitation.responseAction === 'accepted' ? 'var(--green)' : 'rgba(255, 107, 107, 0.2)', 
                                      color: selectedInvitation.responseAction === 'accepted' ? '#000' : 'var(--red)', 
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      boxShadow: selectedInvitation.responseAction === 'accepted' ? '0 8px 24px rgba(126, 200, 67, 0.3)' : 'none'
                                  }}
                              >
                                  {processingId ? 'Synchronizing...' : `Execute ${selectedInvitation.responseAction === 'accepted' ? 'Acceptance' : 'Decline'}`}
                              </button>
                          </div>
                      </motion.div>
                  </div>
              )}
            </AnimatePresence>
        </div>
    );
};

export default HHMFactoryInvitationsPage;
