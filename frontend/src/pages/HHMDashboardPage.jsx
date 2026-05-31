import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HHMJobRequestsTab from '../components/HHMJobRequestsTab';
import './FarmerDashboardPage.css'; // Utilizing the shared premium styles

// Configure axios base URL
axios.defaults.baseURL = API_BASE_URL;

/**
 * Premium SVG Icons
 */
const Icons = {
  Sprout: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.974 0-5.749-.536-8.227-1.5" /></svg>),
  Chart: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>),
  List: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Clipboard: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>),
  Labour: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>),
  Envelope: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>),
  EnvelopeOpen: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>),
  Factory: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg>),
  Bell: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>),
  Empty: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>),
  Alert: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>)
};

/**
 * Animated Vector Illustration for Hero section
 */
const HeroIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg">
    <path className="fr-svg-path" d="M50 250C100 250 150 150 200 150C250 150 300 200 350 100" stroke="url(#gradient-line)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="350" cy="100" r="8" fill="var(--blue)" className="fr-svg-dot" />
    <circle cx="200" cy="150" r="6" fill="var(--surface)" stroke="var(--green)" strokeWidth="3" className="fr-svg-dot" style={{animationDelay: '0.5s'}} />
    <defs>
      <linearGradient id="gradient-line" x1="50" y1="250" x2="350" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--green)" stopOpacity="0.2" />
        <stop offset="0.5" stopColor="var(--blue)" />
        <stop offset="1" stopColor="var(--blue)" />
      </linearGradient>
    </defs>
    
    <g className="fr-svg-card">
      <rect x="70" y="80" width="80" height="120" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <rect x="85" y="100" width="50" height="6" rx="3" fill="var(--blue)" opacity="0.6" />
      <rect x="85" y="120" width="30" height="6" rx="3" fill="var(--muted)" />
      <rect x="85" y="140" width="40" height="6" rx="3" fill="var(--muted)" />
      <circle cx="110" cy="170" r="16" fill="var(--green)" opacity="0.2" />
      <path d="M104 170L108 174L116 166" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    
    <g className="fr-svg-card" style={{animationDelay: '0.4s'}}>
      <rect x="230" y="180" width="100" height="70" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <circle cx="280" cy="215" r="20" fill="none" stroke="var(--blue)" opacity="0.4" strokeWidth="4" />
      <path d="M280 195 A 20 20 0 0 1 300 215" fill="none" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const HHMDashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Fetch dashboard data from API
        const response = await axios.get('/api/hhm/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDashboardData(response.data.data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(response.data?.data?.notifications || response.data?.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchDashboardData();
    fetchNotifications();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete('/api/notifications/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  return (
    <div className="fr-page">
      {/* Background ambient glows integrated organically into layout */}
      <div className="fr-ambient-glow fr-ambient-left"></div>
      <div className="fr-ambient-glow fr-ambient-right"></div>

      {/* Page Header (Hero Banner) */}
      <div className="fr-header">
        <div className="fr-header-inner">
          <div className="fr-welcome">
            <div className="fr-eyebrow">
              <span className="fr-eyebrow-icon"><Icons.Labour /></span>
              HHM Dashboard
            </div>
            <h1 className="fr-title">
              Welcome back, <em>{user?.name || 'Manager'}</em>
            </h1>
            <p className="fr-sub">
              Manage your job schedules, track farmer requests, and coordinate with labours and factories.
            </p>
          </div>
          <div className="fr-hero-illustration-wrapper">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="fr-tabs">
        <button 
          className={`fr-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="fr-tab-icon"><Icons.Chart /></span>
          Overview
        </button>
        <button 
          className={`fr-tab-btn ${activeTab === 'job-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('job-requests')}
        >
          <span className="fr-tab-icon"><Icons.Clipboard /></span>
          Farmer Job Requests
        </button>
      </div>

      {/* Tab Content */}
      <div className="fr-content">
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats Row */}
            {loading ? (
              <div className="fr-loading">
                <div className="fr-spinner"></div>
                <p>Loading dashboard data...</p>
              </div>
            ) : error ? (
              <div className="fr-empty">
                <div className="fr-empty-icon fr-error"><Icons.Alert /></div>
                <h3 className="fr-error-text">Error Loading Dashboard</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="fr-retry-btn" style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="fr-stats-row">





              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="fr-section">
              <div className="fr-section-header">
                <h2 className="fr-section-title">
                  <span className="fr-title-icon"><Icons.List /></span>
                  Quick Actions
                </h2>
              </div>
              
              <div className="fr-contract-grid" style={{ marginBottom: 0 }}>
                <div className="fr-contract-card" style={{ cursor: 'pointer', textAlign: 'center', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => navigate('/hhm/factory-invitations')}>
                  <div style={{ color: 'var(--blue)', marginBottom: '16px', width: '44px', height: '44px' }}><Icons.Envelope /></div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.1rem', marginBottom: '8px' }}>Received Invitations</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>View and respond to factory collaborations</p>
                </div>

                <div className="fr-contract-card" style={{ cursor: 'pointer', textAlign: 'center', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => navigate('/hhm/sent-factory-invitations')}>
                  <div style={{ color: 'var(--amber)', marginBottom: '16px', width: '44px', height: '44px' }}><Icons.EnvelopeOpen /></div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.1rem', marginBottom: '8px' }}>Sent Invitations</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>View invitations you sent to factories</p>
                </div>

                <div className="fr-contract-card" style={{ cursor: 'pointer', textAlign: 'center', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => navigate('/hhm/associated-factories')}>
                  <div style={{ color: 'var(--green)', marginBottom: '16px', width: '44px', height: '44px' }}><Icons.Factory /></div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.1rem', marginBottom: '8px' }}>My Factories</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>Manage your associated factories</p>
                </div>

                <div className="fr-contract-card" style={{ cursor: 'pointer', textAlign: 'center', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => navigate('/hhm/performance')}>
                  <div style={{ color: 'var(--blue)', marginBottom: '16px', width: '44px', height: '44px' }}><Icons.Chart /></div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.1rem', marginBottom: '8px' }}>Performance</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>Track your success metrics and KPIs</p>
                </div>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="fr-section">
              <div className="fr-section-header">
                <h2 className="fr-section-title">
                  <span className="fr-title-icon"><Icons.Bell /></span>
                  Recent Activity
                </h2>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="fr-clear-btn">
                    Clear All
                  </button>
                )}
              </div>
              
              {notificationsLoading ? (
                <div className="fr-loading">
                  <div className="fr-spinner"></div>
                  <p>Loading alerts...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="fr-empty">
                  <div className="fr-empty-icon"><Icons.Empty /></div>
                  <p>No recent activity. You're all caught up!</p>
                </div>
              ) : (
                <div className="fr-notif-grid">
                  {notifications.map((notif) => (
                    <div key={notif._id} className="fr-notif-card">
                      {!notif.isRead && <div className="fr-notif-unread" />}
                      <div className="fr-notif-header">
                        <span className="fr-notif-type">{notif.type?.replace(/_/g, ' ')}</span>
                        <span className={`fr-priority ${getPriorityClass(notif.priority)}`}>
                          {notif.priority || 'Normal'}
                        </span>
                      </div>
                      <p className="fr-notif-msg">{notif.message}</p>
                      <div className="fr-notif-footer">
                        <span className="fr-footer-icon"><Icons.Calendar /></span>
                        {formatDate(notif.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'job-requests' && (
          <HHMJobRequestsTab />
        )}
      </div>

      
    </div>
  );
};

export default HHMDashboardPage;
