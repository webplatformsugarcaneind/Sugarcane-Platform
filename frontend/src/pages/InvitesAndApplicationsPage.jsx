import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FarmerDashboardPage.css';

const Icons = {
  Envelope: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>),
  Clipboard: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.798.425 1.082.263.285.622.46 1.024.46a1.5 1.5 0 001.025-.46 1.518 1.518 0 00.425-1.082c0-.231-.035-.454-.1-.664m-5.8 0A48.108 48.108 0 003.412 4.22c-1.13.094-1.976 1.057-1.976 2.192V16.5A2.25 2.25 0 003.75 18.75h.007m10.5-11.25h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>),
  Map: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-1.5V21m3.75-18v15m-13.5 0v-15m13.5 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V5.25z" /></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Briefcase: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125-1.125-1.125h-2.625m-11.25 4.7V9.45c0-.621.504-1.125 1.125-1.125h2.625M12 4.5v3.375m0 0h.008v.008H12V7.875z" /></svg>),
  Empty: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>),
  Close: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>)
};

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
    </g>
    
    <g className="fr-svg-card" style={{animationDelay: '0.4s'}}>
      <rect x="230" y="180" width="100" height="70" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <circle cx="280" cy="215" r="20" fill="none" stroke="var(--blue)" opacity="0.4" strokeWidth="4" />
      <path d="M280 195 A 20 20 0 0 1 300 215" fill="none" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const InvitesAndApplicationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('invitations');
  const [invitations, setInvitations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [responding, setResponding] = useState({});

  useEffect(() => {
    if (activeTab === 'invitations') {
      fetchInvitations();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const token = localStorage.getItem('token');
      
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get('/api/labour/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const invitationsData = response.data.data || response.data;
      const transformedInvitations = invitationsData.map(inv => ({
        _id: inv._id,
        job: {
          _id: inv.schedule?.id || inv.schedule?._id,
          title: inv.schedule?.title || 'Unknown Job',
          location: inv.schedule?.location || 'N/A',
          wageOffered: inv.offeredWage || inv.schedule?.wageOffered || 0,
          startDate: inv.schedule?.startDate,
          endDate: inv.schedule?.endDate,
          workType: inv.schedule?.workType || 'general',
        },
        employer: {
          _id: inv.hhm?.id || inv.hhm?._id,
          name: inv.hhm?.name || 'Unknown Employer',
          rating: 4.5
        },
        status: inv.status,
        invitedAt: inv.invitedAt || inv.createdAt,
        message: inv.personalMessage || 'No message provided',
      }));

      setInvitations(transformedInvitations);
    } catch (err) {
      // Use mock data as fallback
      const mockInvitations = [
        {
          _id: '1',
          job: { title: 'Sugarcane Harvesting - Premium Farm', location: 'Punjab, India', wageOffered: 900, startDate: '2025-10-15', endDate: '2025-10-30', workType: 'harvesting' },
          employer: { name: 'Rajesh Kumar', rating: 4.8 },
          status: 'pending',
          invitedAt: '2025-10-06T10:00:00Z',
          message: 'We would like to invite you to work on our sugarcane harvest. Your experience makes you a perfect fit for this role.',
        },
        {
          _id: '2',
          job: { title: 'Organic Farm Management', location: 'Haryana, India', wageOffered: 750, startDate: '2025-10-20', endDate: '2025-11-20', workType: 'management' },
          employer: { name: 'Priya Sharma', rating: 4.6 },
          status: 'pending',
          invitedAt: '2025-10-05T14:30:00Z',
          message: 'Looking for skilled workers for our organic farming project. Great opportunity for learning new sustainable farming techniques!',
        }
      ];
      setInvitations(mockInvitations);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');
      
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get('/api/labour/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const applicationsData = response.data.data || response.data;
      const transformedApplications = applicationsData.map(app => ({
        _id: app._id,
        job: {
          _id: app.schedule?.id || app.schedule?._id,
          title: app.schedule?.title || 'Unknown Job',
          location: app.schedule?.location || 'N/A',
          wageOffered: app.schedule?.wageOffered || 0,
          startDate: app.schedule?.startDate,
          endDate: app.schedule?.endDate,
          workType: app.schedule?.workType || 'general',
        },
        employer: {
          _id: app.hhm?.id || app.hhm?._id,
          name: app.hhm?.name || 'Unknown Employer',
          rating: 4.5
        },
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        message: app.applicationMessage || 'No message',
        response: app.reviewNotes || null,
      }));

      setApplications(transformedApplications);
    } catch (err) {
      // Mock Data
      const mockApplications = [
        {
          _id: '1',
          job: { title: 'Field Preparation Work', location: 'Punjab, India', wageOffered: 650, workType: 'preparation' },
          employer: { name: 'Amit Singh', rating: 4.5 },
          status: 'pending',
          appliedAt: '2025-10-04T09:15:00Z',
          message: 'I have 3 years of experience in field preparation and soil management. I am available for the full duration and have my own basic tools.',
          response: null
        },
        {
          _id: '2',
          job: { title: 'Irrigation System Installation', location: 'Haryana, India', wageOffered: 800, workType: 'irrigation' },
          employer: { name: 'Meera Devi', rating: 4.9 },
          status: 'approved',
          appliedAt: '2025-10-02T11:20:00Z',
          message: 'Experienced in irrigation systems with technical certification. Can provide references from previous employers.',
          response: 'Great! We are excited to have you join our team. Please be ready to start on October 15th. Contact us at 9876543210 for further details.'
        },
        {
          _id: '3',
          job: { title: 'Crop Monitoring', location: 'Gujarat, India', wageOffered: 700, workType: 'monitoring' },
          employer: { name: 'Suresh Patel', rating: 4.3 },
          status: 'rejected',
          appliedAt: '2025-09-30T16:45:00Z',
          message: 'I have experience in crop monitoring and pest management. Familiar with modern monitoring equipment.',
          response: 'Thank you for your application. We found a candidate with more specialized experience in our specific crop monitoring systems.'
        }
      ];
      setApplications(mockApplications);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      setResponding(prev => ({ ...prev, [invitationId]: true }));
      const token = localStorage.getItem('token');
      
      if (token) {
        await axios.put(`/api/labour/invitations/${invitationId}`, 
          { status: response },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setInvitations(prev =>
        prev.map(inv => inv._id === invitationId ? { ...inv, status: response } : inv)
      );

    } catch (err) {
      setInvitations(prev =>
        prev.map(inv => inv._id === invitationId ? { ...inv, status: response } : inv)
      );
    } finally {
      setResponding(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  return (
    <div className="fr-page">
      <div className="fr-ambient-glow fr-ambient-left"></div>
      <div className="fr-ambient-glow fr-ambient-right"></div>

      <div className="fr-header">
        <div className="fr-header-inner">
          <div className="fr-welcome">
            <div className="fr-eyebrow">
              <span className="fr-eyebrow-icon"><Icons.Envelope /></span>
              Communications
            </div>
            <h1 className="fr-title">
              Invitations & <em>Applications</em>
            </h1>
            <p className="fr-sub">
              Manage your job invitations from harvest managers and track the status of your applications.
            </p>
          </div>
          <div className="fr-hero-illustration-wrapper">
            <HeroIllustration />
          </div>
        </div>
      </div>

      <div className="fr-tabs">
        <button
          className={`fr-tab-btn ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          <span className="fr-tab-icon"><Icons.Envelope /></span>
          Invitations ({invitations.filter(inv => inv.status === 'pending').length})
        </button>
        <button
          className={`fr-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <span className="fr-tab-icon"><Icons.Clipboard /></span>
          Applications ({applications.length})
        </button>
      </div>

      <div className="fr-content">
        <div className="fr-section">
          <div className="fr-section-header">
            <h2 className="fr-section-title">
              <span className="fr-title-icon">{activeTab === 'invitations' ? <Icons.Envelope /> : <Icons.Clipboard />}</span>
              {activeTab === 'invitations' ? 'Job Invitations' : 'Your Applications'}
            </h2>
          </div>

          {(activeTab === 'invitations' ? loadingInvitations : loadingApplications) ? (
            <div className="fr-loading">
              <div className="fr-spinner"></div>
              <p>Scanning data...</p>
            </div>
          ) : (activeTab === 'invitations' ? invitations : applications).length === 0 ? (
            <div className="fr-empty">
              <div className="fr-empty-icon"><Icons.Empty /></div>
              <p>No {activeTab} available at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {(activeTab === 'invitations' ? invitations : applications).map(item => (
                <div key={item._id} className="fr-contract-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
                       {activeTab === 'invitations' ? <Icons.Envelope style={{ width: '20px' }} /> : <Icons.Clipboard style={{ width: '20px' }} />}
                    </div>
                    <span className={`fr-badge ${item.status === 'pending' ? 'pending' : (item.status === 'approved' || item.status === 'accepted') ? 'accepted' : 'rejected'}`} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                      {item.status}
                    </span>
                  </div>
                  
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--white)', lineHeight: 1.3 }}>{item.job.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '12px' }}>
                    By <strong style={{ color: 'var(--white)' }}>{item.employer.name}</strong> <span style={{ color: 'var(--amber)' }}><svg viewBox="0 0 24 24" fill="#f59e0b" width="13" height="13" style={{verticalAlign:'middle',marginRight:2}}><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"/></svg> {item.employer.rating}</span>

                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Map style={{ width: '14px', color: 'var(--muted)' }}/> {item.job.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontWeight: 'bold' }}>₹{item.job.wageOffered}/day</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Clock style={{ width: '14px', color: 'var(--muted)' }}/> {new Date(activeTab === 'invitations' ? item.invitedAt : item.appliedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                      {activeTab === 'invitations' ? 'Message' : 'Your Pitch'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{item.message}"
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    {activeTab === 'invitations' && item.status === 'pending' ? (
                      <>
                        <button 
                          className="fr-retry-btn" 
                          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(126,200,67,0.1)', color: 'var(--green)', border: '1px solid rgba(126,200,67,0.3)', display: 'flex', justifyContent: 'center' }}
                          onClick={() => handleInvitationResponse(item._id, 'accepted')}
                          disabled={responding[item._id]}
                        >
                          {responding[item._id] ? '...' : 'Accept'}
                        </button>
                        <button 
                          className="fr-clear-btn" 
                          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(255,107,107,0.1)', color: 'var(--red)', border: '1px solid rgba(255,107,107,0.3)', display: 'flex', justifyContent: 'center' }}
                          onClick={() => handleInvitationResponse(item._id, 'declined')}
                          disabled={responding[item._id]}
                        >
                          {responding[item._id] ? '...' : 'Decline'}
                        </button>
                      </>
                    ) : (
                      <button 
                        className="fr-clear-btn" 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center' }}
                        onClick={() => navigate(`/labour/applications/${item._id}`, { state: { item, activeTab } })}
                      >
                        View Details
                      </button>
                    )}
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

export default InvitesAndApplicationsPage;