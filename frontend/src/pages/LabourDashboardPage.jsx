import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FarmerDashboardPage.css'; // Utilizing the shared premium styles

const Icons = {
  Search: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>),
  Briefcase: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125-1.125-1.125h-2.625m-11.25 4.7V9.45c0-.621.504-1.125 1.125-1.125h2.625M12 4.5v3.375m0 0h.008v.008H12V7.875z" /></svg>),
  Map: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-1.5V21m3.75-18v15m-13.5 0v-15m13.5 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V5.25z" /></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Wallet: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>),
  UserGroup: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  Empty: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>),
  Refresh: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>),
  List: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>),
  Bell: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>),
  Calendar: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
};

const DashboardIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg">
    <path className="fr-svg-path" d="M50 250C100 250 150 150 200 150C250 150 300 200 350 100" stroke="url(#gradient-line)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="350" cy="100" r="8" fill="var(--amber)" className="fr-svg-dot" />
    <circle cx="200" cy="150" r="6" fill="var(--surface)" stroke="var(--green)" strokeWidth="3" className="fr-svg-dot" style={{animationDelay: '0.5s'}} />
    <defs>
      <linearGradient id="gradient-line" x1="50" y1="250" x2="350" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--green)" stopOpacity="0.2" />
        <stop offset="0.5" stopColor="var(--amber)" />
        <stop offset="1" stopColor="var(--amber)" />
      </linearGradient>
    </defs>
    
    <g className="fr-svg-card">
      <rect x="70" y="80" width="80" height="120" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <rect x="85" y="100" width="50" height="6" rx="3" fill="var(--amber)" opacity="0.6" />
      <rect x="85" y="120" width="30" height="6" rx="3" fill="var(--muted)" />
      <rect x="85" y="140" width="40" height="6" rx="3" fill="var(--muted)" />
      <circle cx="110" cy="170" r="16" fill="var(--green)" opacity="0.2" />
      <path d="M104 170L108 174L116 166" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    
    <g className="fr-svg-card" style={{animationDelay: '0.4s'}}>
      <rect x="230" y="180" width="100" height="70" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <circle cx="280" cy="215" r="20" fill="none" stroke="var(--amber)" opacity="0.4" strokeWidth="4" />
      <path d="M280 195 A 20 20 0 0 1 300 215" fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const LabourDashboardPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState({});
  const [activeTab, setActiveTab] = useState('available');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    fetchJobs();
    fetchNotifications();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/labour/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJobs(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Use mock data as fallback for development
      const mockJobs = [
        {
          _id: '1',
          title: 'Sugarcane Harvesting - Premium Farm',
          description: 'Looking for experienced labours for sugarcane harvesting. Must have own tools and transportation.',
          location: 'Punjab, India',
          wageOffered: 900,
          labourCount: 15,
          startDate: '2025-10-15',
          endDate: '2025-10-30',
          workType: 'harvesting',
          requiredSkills: ['harvesting', 'equipment operation'],
          workingHours: '6 AM - 5 PM',
          employer: {
            name: 'Rajesh Kumar',
            rating: 4.8
          },
          postedAt: '2025-10-05'
        },
        {
          _id: '2',
          title: 'Organic Farm Field Preparation',
          description: 'Prepare fields for organic crop planting. Experience with soil management preferred.',
          location: 'Haryana, India',
          wageOffered: 750,
          labourCount: 8,
          startDate: '2025-10-12',
          endDate: '2025-10-25',
          workType: 'preparation',
          requiredSkills: ['soil preparation', 'planting'],
          workingHours: '7 AM - 4 PM',
          employer: {
            name: 'Priya Sharma',
            rating: 4.6
          },
          postedAt: '2025-10-04'
        },
        {
          _id: '3',
          title: 'Irrigation System Installation',
          description: 'Install and setup drip irrigation systems. Technical knowledge required.',
          location: 'Gujarat, India',
          wageOffered: 1200,
          labourCount: 5,
          startDate: '2025-10-18',
          endDate: '2025-11-02',
          workType: 'irrigation',
          requiredSkills: ['irrigation', 'technical setup'],
          workingHours: '8 AM - 6 PM',
          employer: {
            name: 'Suresh Patel',
            rating: 4.9
          },
          postedAt: '2025-10-03'
        }
      ];
      setJobs(mockJobs);
      setError('Using sample data - API connection failed');
    } finally {
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
      // Fallback mock data
      setNotifications([
        { _id: '1', type: 'Application Update', priority: 'high', message: 'Your application for "Sugarcane Harvesting" was approved.', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '2', type: 'New Job Alert', priority: 'medium', message: 'A new job matching your skills was posted nearby.', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
    } finally {
      setNotificationsLoading(false);
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
      setNotifications([]);
    }
  };

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

  const handleApply = async (jobId) => {
    try {
      setApplying(prev => ({ ...prev, [jobId]: true }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const job = jobs.find(j => j._id === jobId);
      if (!job) throw new Error('Job not found');

      const applicationData = {
        scheduleId: jobId,
        applicationMessage: 'I am interested in this position and believe my skills and experience make me a good fit for this role.',
        labourSkills: job.requiredSkills || [],
        experience: 'Experienced in agricultural work',
        expectedWage: job.wageOffered || 0,
        availability: 'full-time'
      };

      await axios.post('/api/labour/applications', applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Application submitted successfully!');
      
      setJobs(prev =>
        prev.map(job =>
          job._id === jobId ? { ...job, hasApplied: true } : job
        )
      );

    } catch (err) {
      console.error('Error applying for job:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application';
      alert(`Error: ${errorMessage}`);
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const appliedJobsCount = jobs.filter(job => job.hasApplied).length;
  const availableJobsCount = jobs.length - appliedJobsCount;

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
              <span className="fr-eyebrow-icon"><Icons.UserGroup /></span>
              Labour Dashboard
            </div>
            <h1 className="fr-title">
              Welcome back, <em>{user?.name || 'Worker'}</em>
            </h1>
            <p className="fr-sub">
              Browse available job schedules, apply to new opportunities, and manage your work contracts seamlessly.
            </p>
          </div>
          <div className="fr-hero-illustration-wrapper">
            <DashboardIllustration />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="fr-tabs">
        <button 
          className={`fr-tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <span className="fr-tab-icon"><Icons.List /></span>
          Available Jobs
        </button>
        <button 
          className={`fr-tab-btn ${activeTab === 'applied' ? 'active' : ''}`}
          onClick={() => setActiveTab('applied')}
        >
          <span className="fr-tab-icon"><Icons.Briefcase /></span>
          My Applications
        </button>
      </div>

      <div className="fr-content">


        {error && (
          <div className="fr-empty" style={{ padding: '20px', marginBottom: '24px', backgroundColor: 'rgba(232, 168, 58, 0.1)', borderColor: 'rgba(232, 168, 58, 0.3)' }}>
            <p style={{ color: 'var(--amber)', margin: 0, fontWeight: 500 }}>⚠️ {error}</p>
          </div>
        )}

        <div className="fr-section">
          <div className="fr-section-header">
            <h2 className="fr-section-title">
              <span className="fr-title-icon"><Icons.List /></span>
              {activeTab === 'available' ? 'Job Listings' : 'Your Applications'}
            </h2>
            <button className="fr-clear-btn" onClick={fetchJobs} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Refresh style={{ width: '16px' }} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="fr-loading">
              <div className="fr-spinner"></div>
              <p>Scanning regional job opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="fr-empty">
              <div className="fr-empty-icon"><Icons.Empty /></div>
              <h3 className="fr-error-text" style={{ color: 'var(--muted)' }}>No Jobs Found</h3>
              <p>Check back later for new operational opportunities.</p>
            </div>
          ) : (
            <div className="fr-contract-grid">
              {jobs
                .filter(job => activeTab === 'available' ? !job.hasApplied : job.hasApplied)
                .map(job => {
                const employerInfo = job.hhmId || job.employer || {};
                const employerName = employerInfo.name || employerInfo.companyName || 'Unknown Employer';
                const employerRating = employerInfo.rating || 'N/A';

                return (
                  <div key={job._id} className="fr-contract-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="fr-contract-top">
                      <div className="fr-contract-info-main">
                        <h4>{job.title || 'Operational Schedule'}</h4>
                        <div className="fr-contract-date">
                          <span>By {employerName}</span>
                          {employerRating !== 'N/A' && <span style={{ color: 'var(--amber)', fontWeight: 'bold' }}><svg viewBox="0 0 24 24" fill="#f59e0b" width="13" height="13" style={{verticalAlign:'middle',marginRight:2}}><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"/></svg> {employerRating}</span>}

                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)', fontFamily: 'Syne' }}>
                          ₹{job.wageOffered || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>/ day</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div className="fr-detail-item">
                        <span className="fr-detail-label">Location</span>
                        <span className="fr-detail-val"><Icons.Map /> {job.location || 'Not specified'}</span>
                      </div>
                      <div className="fr-detail-item">
                        <span className="fr-detail-label">Requirement</span>
                        <span className="fr-detail-val"><Icons.UserGroup /> {job.labourCount || '0'} Labours</span>
                      </div>
                      <div className="fr-detail-item">
                        <span className="fr-detail-label">Duration</span>
                        <span className="fr-detail-val"><Icons.Clock /> 
                          {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'TBD'} - {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <div className="fr-detail-item">
                        <span className="fr-detail-label">Work Type</span>
                        <span className="fr-detail-val" style={{ textTransform: 'capitalize' }}><Icons.Briefcase /> {job.workType || 'General'}</span>
                      </div>
                    </div>

                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <span className="fr-detail-label" style={{ display: 'block', marginBottom: '8px' }}>Required Skills</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {job.requiredSkills.map((skill, index) => (
                            <span key={`${job._id}-skill-${index}`} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--white)' }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px', flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {job.description || 'No detailed description provided for this operational schedule.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                      {job.hasApplied || job.applicationStatus ? (
                        <button className="fr-retry-btn" style={{ flex: 1, background: 'rgba(126,200,67,0.1)', color: 'var(--green)', border: '1px solid rgba(126,200,67,0.3)', cursor: 'default' }} disabled>
                          Applied ✓
                        </button>
                      ) : (
                        <button 
                          className="fr-retry-btn" 
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          onClick={() => handleApply(job._id)}
                          disabled={applying[job._id]}
                        >
                          {applying[job._id] ? 'Submitting...' : 'Apply Now'}
                        </button>
                      )}
                      <button className="fr-clear-btn" style={{ padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {jobs.filter(job => activeTab === 'available' ? !job.hasApplied : job.hasApplied).length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                  No {activeTab === 'available' ? 'available' : 'applied'} jobs to display.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Feed */}
        <div className="fr-section" style={{ marginTop: '32px' }}>
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
                    <span className="fr-footer-icon"><Icons.Calendar style={{ width: '14px' }} /></span>
                    {formatDate(notif.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabourDashboardPage;
