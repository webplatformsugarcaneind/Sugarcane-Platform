import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './FarmerDashboardPage.css';

/**
 * Premium SVG Icons for Performance Dashboard
 */
const Icons = {
  Chart: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Clipboard: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.798.425 1.082.263.285.622.46 1.024.46a1.5 1.5 0 001.025-.46 1.518 1.518 0 00.425-1.082c0-.231-.035-.454-.1-.664m-5.8 0A48.108 48.108 0 003.412 4.22c-1.13.094-1.976 1.057-1.976 2.192V16.5A2.25 2.25 0 003.75 18.75h.007m10.5-11.25h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>),
  Envelope: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>),
  Users: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>),
  Factory: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Star: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>),
};

/**
 * Animated Illustration for Performance Hero
 */
const PerformanceIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="perf-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 150) rotate(90) scale(150 200)">
        <stop stopColor="var(--blue)" stopOpacity="0.15" />
        <stop offset="1" stopColor="var(--blue)" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill="url(#perf-glow)" />
    <motion.path 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      d="M50 250 Q100 50 200 200 T350 100" 
      stroke="var(--blue)" 
      strokeWidth="2" 
      strokeDasharray="4 4"
      fill="none"
    />
    <motion.circle 
      animate={{ 
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.6, 0.3] 
      }}
      transition={{ duration: 3, repeat: Infinity }}
      cx="200" cy="200" r="12" fill="var(--blue)" 
    />
    <circle cx="200" cy="200" r="4" fill="var(--blue)" />
  </svg>
);

const HHMPerformancePage = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please log in.');
                return;
            }
            const response = await axios.get('/api/hhm/my-performance', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPerformanceData(response.data.data);
        } catch (err) {
            console.error('Error fetching performance data:', err);
            setError(err.response?.data?.message || 'Failed to sync metrics');
        } finally {
            setLoading(false);
        }
    };

    const getRatingInfo = (successRate) => {
        if (successRate >= 80) return { label: 'ELITE NODE', color: 'var(--green)', icon: '🏆' };
        if (successRate >= 60) return { label: 'OPTIMIZED', color: 'var(--blue)', icon: '⚡' };
        if (successRate >= 40) return { label: 'STABLE', color: 'var(--amber)', icon: '📊' };
        return { label: 'INERT', color: 'var(--red)', icon: '⚠️' };
    };

    if (loading) {
        return (
            <div className="fr-page">
                <div className="fr-loading">
                    <div className="fr-spinner"></div>
                    <p>Syncing performance metrics...</p>
                </div>
            </div>
        );
    }

    if (error || !performanceData) {
        return (
            <div className="fr-page">
                <div className="fr-empty" style={{ margin: '100px auto', maxWidth: '500px' }}>
                    <div className="fr-empty-icon" style={{ color: 'var(--red)' }}><Icons.Chart /></div>
                    <h3>Performance Sync Error</h3>
                    <p>{error}</p>
                    <button className="fr-btn fr-btn-primary" onClick={fetchPerformanceData} style={{ marginTop: '24px' }}>
                        Retry Sync
                    </button>
                </div>
            </div>
        );
    }

    const rating = getRatingInfo(performanceData.metrics.successRate);

    return (
        <div className="fr-page">
            {/* Background Architecture */}
            <div className="fr-ambient-glow fr-ambient-left" style={{ background: 'radial-gradient(circle, rgba(91, 143, 255, 0.08) 0%, transparent 70%)' }}></div>
            <div className="fr-ambient-glow fr-ambient-right" style={{ background: 'radial-gradient(circle, rgba(126, 200, 67, 0.06) 0%, transparent 70%)' }}></div>
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.03, pointerEvents: 'none' }}></div>

            {/* Hero Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fr-header">
                <div className="fr-header-inner">
                    <div className="fr-welcome">
                        <div className="fr-eyebrow">Operational Analytics</div>
                        <h1 className="fr-title" style={{ fontSize: '3.5rem' }}>
                            Performance <em>Dashboard</em>
                        </h1>
                        <p className="fr-subtitle">Track your performance metrics and achievements</p>
                    </div>
                    <div className="fr-hero-illustration-wrapper">
                        <PerformanceIllustration />
                    </div>
                </div>
            </motion.div>

            <div className="fr-section">
                {/* Score Architecture */}
                <div className="fr-contract-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '48px' }}>
                    {/* Overall Success Score */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fr-contract-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '24px' }}>
                            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <motion.circle 
                                    cx="50" cy="50" r="45" fill="none" 
                                    stroke={rating.color} 
                                    strokeWidth="8" 
                                    strokeDasharray="283"
                                    initial={{ strokeDashoffset: 283 }}
                                    animate={{ strokeDashoffset: 283 - (283 * performanceData.metrics.successRate) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'Syne', color: 'var(--white)' }}>
                                    {performanceData.metrics.successRate.toFixed(0)}%
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted)', letterSpacing: '1px' }}>SUCCESS RATE</div>
                            </div>
                        </div>
                        <div style={{ background: rating.color, color: 'var(--bg)', padding: '6px 16px', borderRadius: '100px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '12px' }}>
                            {rating.label}
                        </div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
                            Aggregated network efficiency score
                        </p>
                    </motion.div>

                    {/* Secondary Metrics Grid */}
                    <div className="fr-contract-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>




                        <motion.div whileHover={{ y: -5 }} className="fr-contract-card" style={{ padding: '24px', background: 'rgba(126, 200, 67, 0.05)', border: '1px solid rgba(126, 200, 67, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ color: 'var(--green)', width: '28px' }}><Icons.Envelope /></div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--white)' }}>{performanceData.invitations.sent}</div>
                            </div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>INVITATIONS</div>
                        </motion.div>


                    </div>
                </div>

                {/* Additional Insights Section */}
                <h2 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginBottom: '32px' }}>Network <em>Insights</em></h2>
                <div className="fr-contract-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                    {[
                        { label: 'ASSOCIATED FACTORIES', val: performanceData.metrics.associatedFactories, icon: <Icons.Factory />, color: 'var(--blue)' },
                        { label: 'ACTIVE CONTRACTS', val: performanceData.metrics.activeJobs, icon: <Icons.Clipboard />, color: 'var(--green)' },
                        { label: 'AVG RESPONSE TIME', val: `${performanceData.metrics.avgResponseTimeHours}h`, icon: <Icons.Clock />, color: 'var(--amber)' },
                        { label: 'PEER RANKING', val: '#12', icon: <Icons.Star />, color: 'var(--white)' },
                    ].map((insight, i) => (
                        <div key={i} className="fr-contract-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: insight.color }}>
                                {insight.icon}
                            </div>
                            <div>
                                <div style={{ color: 'var(--muted)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>{insight.label}</div>
                                <div style={{ color: 'var(--white)', fontSize: '1.4rem', fontWeight: '800' }}>{insight.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance Breakdown Architecture */}
                <div className="fr-contract-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                    {/* Status Pipelines */}
                    <div className="fr-contract-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontFamily: 'Syne', fontSize: '1.4rem', marginBottom: '24px' }}>Application <em>Processing</em></h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {[
                                { label: 'Approved', count: performanceData.applications.approved, total: performanceData.applications.total, color: 'var(--green)' },
                                { label: 'Pending', count: performanceData.applications.pending, total: performanceData.applications.total, color: 'var(--amber)' },
                                { label: 'Rejected', count: performanceData.applications.rejected, total: performanceData.applications.total, color: 'var(--red)' },
                            ].map((row, i) => {
                                const pct = row.total > 0 ? (row.count / row.total) * 100 : 0;
                                return (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--white)', fontWeight: '700' }}>{row.label}</span>
                                            <span style={{ color: 'var(--muted)' }}>{row.count} ({pct.toFixed(1)}%)</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                style={{ height: '100%', background: row.color, borderRadius: '100px', boxShadow: `0 0 10px ${row.color}44` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Industrial Reach */}
                    <div className="fr-contract-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontFamily: 'Syne', fontSize: '1.4rem', marginBottom: '24px' }}>Network <em>Reach</em></h3>
                        <div style={{ padding: '24px', background: 'rgba(91, 143, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(91, 143, 255, 0.08)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--blue)', fontFamily: 'Syne', marginBottom: '8px' }}>
                                Top 5%
                            </div>
                            <div style={{ color: 'var(--white)', fontWeight: '700', marginBottom: '12px' }}>Regional Node Efficiency</div>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                                Your node is performing better than 95% of active managers in your region. Maintain your current response time to secure Elite status.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: '64px', textAlign: 'center' }}>
                    <button className="fr-btn fr-btn-secondary" onClick={fetchPerformanceData} style={{ padding: '14px 40px' }}>
                        Sync Real-time Metrics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HHMPerformancePage;
