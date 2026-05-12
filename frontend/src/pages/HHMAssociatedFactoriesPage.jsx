import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './FarmerDashboardPage.css'; // Utilizing the shared premium styles

/**
 * Premium SVG Icons Mapping
 */
const Icons = {
  Factory: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>),
  Handshake: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Phone: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.864-1.051l-3.21-.535a1.125 1.125 0 0 0-1.226.59l-1.28 2.56a14.62 14.62 0 0 1-7.224-7.224l2.56-1.28a1.125 1.125 0 0 0 .59-1.226l-.535-3.21A1.125 1.125 0 0 0 14.25 6h-1.372A2.25 2.25 0 0 0 10.5 8.25Z" /></svg>),
  Envelope: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>),
  Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>),
  Globe: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" /></svg>),
  Alert: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>),
  Document: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>),
  CheckCircle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
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
    
    <motion.path 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      d="M80 200 L120 160 L180 180 L240 140 L320 200" 
      stroke="url(#path-grad)" 
      strokeWidth="2" 
      fill="none"
    />
    <motion.circle 
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
      cx="200" cy="150" r="40" fill="var(--green)" opacity="0.05" 
    />
    <motion.rect
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      x="180" y="130" width="40" height="40" rx="8" stroke="var(--blue)" strokeWidth="1" opacity="0.2"
    />
  </svg>
);

/**
 * HHMAssociatedFactoriesPage Component
 */
const HHMAssociatedFactoriesPage = () => {
    const navigate = useNavigate();
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFactories, setFilteredFactories] = useState([]);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchAssociatedFactories();
    }, []);

    useEffect(() => {
        filterFactories();
    }, [factories, searchTerm]);

    const fetchAssociatedFactories = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await axios.get('/api/hhm/associated-factories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const factoriesData = response.data.data || [];
            setFactories(factoriesData);

        } catch (err) {
            console.error('Error fetching associated factories:', err);
            setError(err.response?.data?.message || 'Failed to load associated factories');
        } finally {
            setLoading(false);
        }
    };

    const filterFactories = () => {
        if (!searchTerm.trim()) {
            setFilteredFactories(factories);
        } else {
            const filtered = factories.filter(factory => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (factory.factoryName || factory.name || '').toLowerCase().includes(searchLower) ||
                    (factory.factoryLocation || '').toLowerCase().includes(searchLower) ||
                    (factory.email || '').toLowerCase().includes(searchLower)
                );
            });
            setFilteredFactories(filtered);
        }
    };

    const handleDisconnectClick = (factory) => {
        setSelectedFactory(factory);
        setShowDisconnectModal(true);
    };

    const handleConfirmDisconnect = async () => {
        if (!selectedFactory) return;

        try {
            setProcessingId(selectedFactory._id);
            setError(null);

            const token = localStorage.getItem('token');

            await axios.delete(
                `/api/hhm/associated-factories/${selectedFactory._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess(`Disconnected from ${selectedFactory.factoryName || selectedFactory.name} successfully!`);
            setShowDisconnectModal(false);
            setSelectedFactory(null);

            await fetchAssociatedFactories();
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error('Error disconnecting from factory:', err);
            setError(err.response?.data?.message || 'Failed to disconnect from factory');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDetails = (factoryId) => {
        navigate(`/hhm/associated-factories/${factoryId}`);
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
                    <p>Syncing industrial network...</p>
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
                            <span className="fr-eyebrow-icon"><Icons.Handshake /></span>
                            Partnerships
                        </div>
                        <h1 className="fr-title" style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
                          Associated <em>Factories</em>
                        </h1>
                        <p className="fr-sub" style={{ fontSize: '1.1rem', maxWidth: '600px', opacity: 0.7 }}>
                          Oversee your active industrial collaborations. Manage technical links and operational partnerships with sugar manufacturing units.
                        </p>
                    </div>
                    <div className="fr-hero-illustration-wrapper" style={{ opacity: 0.8, transform: 'scale(0.85)', transformOrigin: 'right center' }}>
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

              {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fr-empty" 
                    style={{ padding: '16px', marginBottom: '24px', borderColor: 'rgba(126, 200, 67, 0.3)', background: 'rgba(126, 200, 67, 0.05)' }}
                  >
                      <div className="fr-empty-icon" style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'var(--green)' }}><Icons.CheckCircle /></div>
                      <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--green)' }}>{success}</h3>
                  </motion.div>
              )}
            </AnimatePresence>

            <div className="fr-section">
                {/* 2026 Search Bar */}
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
                        <span style={{ position: 'absolute', left: '16px', color: 'var(--muted)', display: 'flex', transform: 'scale(0.85)' }}><Icons.Search /></span>
                        <input 
                          type="text" 
                          placeholder="Search your industrial network..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ 
                            width: '100%', 
                            background: 'rgba(0, 0, 0, 0.2)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            borderRadius: '12px', 
                            padding: '10px 16px 10px 44px', 
                            color: 'var(--white)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            style={{ position: 'absolute', right: '16px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Clear
                          </button>
                        )}
                    </div>
                </div>

                {/* Factories List */}
                <div className="fr-contracts-list">
                    {filteredFactories.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fr-empty">
                            <div className="fr-empty-icon">
                                {searchTerm ? <Icons.Search /> : <Icons.Factory />}
                            </div>
                            <h3>
                                {searchTerm ? 'No results found' : 'No active partnerships'}
                            </h3>
                            <p>
                                {searchTerm ? 'Try refining your search parameters.' : 'Your industrial network is currently offline.'}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="fr-contract-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                            {filteredFactories.map((factory, index) => (
                                <motion.div 
                                  key={factory._id} 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ y: -5 }}
                                  className="fr-contract-card"
                                  style={{ 
                                    padding: '24px', 
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                >
                                    <div className="fr-contract-top" style={{ marginBottom: '24px' }}>
                                        <div className="fr-contract-info-main">
                                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: '700' }}>
                                                <div style={{ display: 'flex', width: '22px', height: '22px', color: 'var(--green)', filter: 'drop-shadow(0 0 6px rgba(126, 200, 67, 0.3))' }}>
                                                    <Icons.Factory />
                                                </div>
                                                {factory.factoryName || factory.name || 'Unknown Factory'}
                                            </h4>
                                            <span className="fr-contract-date" style={{ fontSize: '0.95rem', opacity: 0.6 }}>
                                                <Icons.Location />
                                                {factory.factoryLocation || 'Location not specified'}
                                            </span>
                                        </div>
                                        <div style={{ width: '32px', height: '32px', background: 'rgba(126, 200, 67, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', transform: 'scale(0.85)' }}>
                                          <Icons.CheckCircle />
                                        </div>
                                    </div>

                                    <div className="fr-contract-grid" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>PARTNERSHIP START</span>
                                            <span className="fr-detail-val" style={{ fontSize: '0.95rem', color: 'var(--white)' }}>
                                                <Icons.Calendar />
                                                {formatDate(factory.createdAt)}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>CAPACITY</span>
                                            <span className="fr-detail-val" style={{ fontSize: '0.95rem', color: 'var(--white)' }}>
                                                {factory.capacity || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>EMAIL CONTACT</span>
                                            <span className="fr-detail-val" style={{ fontSize: '0.95rem', color: 'var(--white)' }}>
                                                <Icons.Envelope />
                                                {factory.email || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="fr-detail-item">
                                            <span className="fr-detail-label" style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>OPERATIONAL PHONE</span>
                                            <span className="fr-detail-val" style={{ fontSize: '0.95rem', color: 'var(--white)' }}>
                                                <Icons.Phone />
                                                {factory.phone || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', gap: '12px' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.08)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleViewDetails(factory._id)}
                                            style={{ 
                                              flex: 1,
                                              padding: '12px 20px', 
                                              background: 'rgba(255, 255, 255, 0.05)', 
                                              color: 'var(--white)', 
                                              borderRadius: '100px', 
                                              border: '1px solid rgba(255, 255, 255, 0.1)', 
                                              fontWeight: '700', 
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '8px'
                                            }}
                                        >
                                            <div style={{ width: '16px', height: '16px' }}><Icons.Document /></div>
                                            View Factory
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02, background: 'rgba(255, 107, 107, 0.2)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleDisconnectClick(factory)}
                                            disabled={processingId === factory._id}
                                            style={{ 
                                              flex: 1,
                                              padding: '12px 20px', 
                                              background: 'rgba(255, 107, 107, 0.1)', 
                                              color: 'var(--red)', 
                                              borderRadius: '100px', 
                                              border: '1px solid rgba(255, 107, 107, 0.2)', 
                                              fontWeight: '700', 
                                              cursor: 'pointer'
                                            }}
                                        >
                                            End Contract
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Disconnect Modal */}
            <AnimatePresence>
              {showDisconnectModal && selectedFactory && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} 
                        onClick={() => setShowDisconnectModal(false)}
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
                                  End Contract
                              </h2>
                              <button onClick={() => setShowDisconnectModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                          </div>

                          <div style={{ marginBottom: '32px' }}>
                              <div style={{ display: 'flex', gap: '20px', background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
                                  <div style={{ color: 'var(--red)', width: '32px', height: '32px', flexShrink: 0 }}><Icons.Alert /></div>
                                  <div>
                                      <p style={{ margin: '0 0 8px 0', color: 'var(--white)', fontWeight: '800', fontSize: '1.1rem' }}>End this Contract?</p>
                                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                          You are about to end the active contract with <strong>{selectedFactory.factoryName || selectedFactory.name}</strong>. This action is reversible only through a new invitation.
                                      </p>
                                  </div>
                              </div>

                              <div>
                                  <h4 style={{ color: 'var(--white)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operational Impact</h4>
                                  <ul style={{ color: 'var(--muted)', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                                      <li>Immediate removal from factory's associated network.</li>
                                      <li>Termination of active data synchronization pipelines.</li>
                                      <li>Archiving of current partnership history.</li>
                                  </ul>
                              </div>
                          </div>

                          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                              <button
                                  onClick={() => setShowDisconnectModal(false)}
                                  disabled={processingId}
                                  style={{ padding: '14px 28px', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'transparent', color: 'var(--white)', cursor: 'pointer', fontWeight: '600' }}
                              >
                                  Abort
                              </button>
                              <button
                                  onClick={handleConfirmDisconnect}
                                  disabled={processingId}
                                  style={{ 
                                      padding: '14px 32px', 
                                      borderRadius: '100px', 
                                      border: 'none', 
                                      background: 'rgba(255, 107, 107, 0.2)', 
                                      color: 'var(--red)', 
                                      fontWeight: '800',
                                      cursor: 'pointer'
                                  }}
                              >
                                  {processingId ? 'Terminating...' : 'End Contract'}
                              </button>
                          </div>
                      </motion.div>
                  </div>
              )}
            </AnimatePresence>
        </div>
    );
};

export default HHMAssociatedFactoriesPage;
