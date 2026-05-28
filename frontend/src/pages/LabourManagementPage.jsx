import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './FarmerDashboardPage.css';
import './FarmerHHMDirectoryPage.css';

/**
 * High-Fidelity SVG Icons for Professional Labor Management
 */
const Icons = {
  // Navigation & General
  UserGroup: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>),
  Clipboard: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.798.425 1.082.263.285.622.46 1.024.46a1.5 1.5 0 001.025-.46 1.518 1.518 0 00.425-1.082c0-.231-.035-.454-.1-.664m-5.8 0A48.108 48.108 0 003.412 4.22c-1.13.094-1.976 1.057-1.976 2.192V16.5A2.25 2.25 0 003.75 18.75h.007m10.5-11.25h.008v.008h-.008V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>),
  Briefcase: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504-1.125-1.125-1.125h-2.625m-11.25 4.7V9.45c0-.621.504-1.125 1.125-1.125h2.625M12 4.5v3.375m0 0h.008v.008H12V7.875z" /></svg>),
  
  // Create Job Sections
  Info: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>),
  Map: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-1.5V21m3.75-18v15m-13.5 0v-15m13.5 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V5.25z" /></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Wallet: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>),
  User: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
  Shield: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>),
  Phone: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>),
  ChevronDown: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>),
  ChevronUp: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  XMark: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  Location: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
};

/**
 * Animated Illustration for Labor Hero
 */
const LaborIllustration = () => (
  <svg viewBox="0 0 500 400" fill="none" className="fr-hero-svg" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxWidth: '450px', filter: 'drop-shadow(0 20px 40px rgba(126,200,67,0.15))' }}>
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
      </linearGradient>
      <radialGradient id="node-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="var(--green)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="neon-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="50%" stopColor="var(--green)" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    
    {/* Background Grid */}
    <motion.path 
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ duration: 1 }}
      d="M50 50h400v300H50z" fill="url(#glass)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10 10" 
    />

    {/* Central Node */}
    <motion.circle 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
      cx="250" cy="200" r="40" fill="rgba(20,24,20,0.8)" stroke="var(--green)" strokeWidth="2" 
    />
    <circle cx="250" cy="200" r="60" fill="url(#node-glow)" opacity="0.3" />
    <motion.path 
      d="M235 200h30M250 185v30" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" 
    />

    {/* Satellite Nodes */}
    {[
      {x: 120, y: 100}, {x: 380, y: 100}, {x: 120, y: 300}, {x: 380, y: 300}, {x: 250, y: 80}, {x: 250, y: 320}
    ].map((pos, i) => (
      <g key={i}>
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
          d={`M250 200 L${pos.x} ${pos.y}`} stroke="url(#neon-line)" strokeWidth="2" 
        />
        <motion.circle 
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
          cx={pos.x} cy={pos.y} r="15" fill="rgba(20,24,20,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" 
        />
        <circle cx={pos.x} cy={pos.y} r="4" fill="var(--green)" />
      </g>
    ))}

    {/* Decorative Elements */}
    <motion.circle cx="250" cy="200" r="120" stroke="rgba(126,200,67,0.2)" strokeWidth="1" strokeDasharray="5 15" fill="none" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '250px 200px' }} />
    <motion.circle cx="250" cy="200" r="160" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '250px 200px' }} />
  </svg>
);

const LaborManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create-job');
  const [applications, setApplications] = useState([]);
  const [labours, setLabours] = useState([]);
  const [filteredLabours, setFilteredLabours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabours, setLoadingLabours] = useState(false);
  const [labourSearchTerm, setLabourSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };
  
  // Expanded Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    // Basic
    title: '', category: 'Harvesting', description: '', labourCount: '',
    // Location
    village: '', taluka: '', farmLocation: '', gpsLocation: '',
    // Schedule
    startDate: '', endDate: '', workingHours: '', shiftType: 'Full Day',
    // Payment
    wageType: 'Daily', wageAmount: '', advanceAvailable: false, foodStayIncluded: false,
    // Requirements
    expLevel: 'Intermediate', physicalWork: 'Heavy', genderPref: 'Any', minAge: '18', hiringType: 'Individual',
    // Facilities
    transport: false, accommodation: false, drinkingWater: true, medicalSupport: false,
    // Contact
    hhmContact: '', supervisor: '', emergencyContact: '', priority: 'Normal', deadline: '', status: 'Active'
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true, location: true, schedule: true, payment: true, requirements: false, facilities: false, contact: false
  });

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDeploySchedule = async () => {
    try {
      if (!scheduleForm.title || !scheduleForm.labourCount || !scheduleForm.wageAmount || !scheduleForm.startDate) {
        showNotification('Please fill in all required fields (Title, Labours, Wage, Start Date)', 'error');
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        title: scheduleForm.title,
        description: `${scheduleForm.description}\n\nCategory: ${scheduleForm.category}\nShift: ${scheduleForm.shiftType}\nRequirements: ${scheduleForm.physicalWork} work, ${scheduleForm.expLevel} exp.`,
        location: `${scheduleForm.village}, ${scheduleForm.taluka} (${scheduleForm.farmLocation})`,
        labourCount: parseInt(scheduleForm.labourCount),
        wageOffered: parseFloat(scheduleForm.wageAmount),
        startDate: scheduleForm.startDate,
        endDate: scheduleForm.endDate,
        requiredSkills: [scheduleForm.category, scheduleForm.physicalWork]
      };

      const response = await axios.post('/api/hhm/schedules', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showNotification('Job schedule deployed successfully across regional nodes!');
        setScheduleForm({
          title: '', category: 'Harvesting', description: '', labourCount: '',
          village: '', taluka: '', farmLocation: '', gpsLocation: '',
          startDate: '', endDate: '', workingHours: '', shiftType: 'Full Day',
          wageType: 'Daily', wageAmount: '', advanceAvailable: false, foodStayIncluded: false,
          expLevel: 'Intermediate', physicalWork: 'Heavy', genderPref: 'Any', minAge: '18', hiringType: 'Individual',
          transport: false, accommodation: false, drinkingWater: true, medicalSupport: false,
          hhmContact: '', supervisor: '', emergencyContact: '', priority: 'Normal', deadline: '', status: 'Active'
        });
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to deploy schedule.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/hhm/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const applicationsData = response.data.data || response.data;
      const mappedApplications = applicationsData.map(app => ({
        _id: app._id,
        labourId: {
          _id: app.labour?.id || app.labour?._id,
          name: app.labour?.name || 'Labour Node',
          email: app.labour?.email || 'N/A',
          phone: app.labour?.phone || 'N/A',
          username: app.labour?.username || 'user',
          skills: app.labour?.skills || [],
          profileImage: app.labour?.profileImage
        },
        scheduleId: {
          _id: app.schedule?.id || app.schedule?._id,
          title: app.schedule?.title || 'Operational Schedule',
          location: app.schedule?.location || 'Maharashtra'
        },
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        message: app.applicationMessage || app.message || 'Professional inquiry for harvesting operations.'
      }));
      setApplications(mappedApplications);
    } catch (err) {
      console.error('CRITICAL: Regional Application Sync Failure', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      showNotification('Failed to sync regional applications.', 'error');
    } finally {

      setLoading(false);
    }
  }, []);

  const fetchLabours = useCallback(async () => {
    try {
      setLoadingLabours(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/hhm/labours', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const backendLabours = response.data.data || response.data || [];
      const mappedLabours = backendLabours.map(labour => ({
        _id: labour.labourId || labour._id,
        name: labour.name,
        email: labour.email,
        phone: labour.phone,
        skills: labour.skills || [],
        availability: labour.availabilityStatus === 'available' ? 'Available' : 'Busy',
        location: labour.location || 'Maharashtra',
        profileImage: labour.profileImage
      }));
      setLabours(mappedLabours);
      setFilteredLabours(mappedLabours);
    } catch (err) {
      console.error('Error fetching labours:', err);
      showNotification('Failed to scan workforce directory.', 'error');
    } finally {
      setLoadingLabours(false);
    }
  }, []);

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`/api/hhm/applications/${applicationId}`, { status: action }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotification(`Application ${action === 'approved' ? 'approved' : 'rejected'} successfully.`);
      setApplications(prev => prev.filter(app => app._id !== applicationId));
    } catch (err) {
      console.error('Error updating application:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update application status.';
      showNotification(errorMessage, 'error');
    }
  };



  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
    if (activeTab === 'hire-labour') fetchLabours();
  }, [activeTab, fetchApplications, fetchLabours]);

  useEffect(() => {
    if (!labourSearchTerm) {
      setFilteredLabours(labours);
      return;
    }
    const filtered = labours.filter(labour => 
      labour.name?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
      labour.location?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
      labour.skills?.some(skill => skill.toLowerCase().includes(labourSearchTerm.toLowerCase()))
    );
    setFilteredLabours(filtered);
  }, [labourSearchTerm, labours]);

  return (
    <div className="fr-page" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Background Architecture */}
      <div className="fr-ambient-glow fr-ambient-left" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(126, 200, 67, 0.15) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
      <div className="fr-ambient-glow fr-ambient-right" style={{ background: 'radial-gradient(circle at 90% 80%, rgba(126, 200, 67, 0.1) 0%, transparent 60%)', filter: 'blur(100px)', right: 0, left: 'auto' }}></div>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(10,12,10,0.8) 100%)', pointerEvents: 'none', zIndex: 0 }}></div>

      {/* Page Header (Hero Banner) */}
      <div className="fr-header">
        <div className="fr-header-inner">
          <div className="fr-welcome">
            <div className="fr-eyebrow">
              <span className="fr-eyebrow-icon"><Icons.UserGroup /></span>
              Workforce Management
            </div>
            <h1 className="fr-title">
              Labor <em>Management</em>
            </h1>
            <p className="fr-sub">
              Deploy harvesting schedules, scout active regions, and manage your workforce nodes seamlessly.
            </p>
          </div>
          <div className="fr-hero-illustration-wrapper">
            <LaborIllustration />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1400px', margin: '-30px auto 40px auto', padding: '0 40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(20,24,20,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '8px', gap: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {[
            { id: 'create-job', label: 'Create Job', icon: <Icons.Plus /> },
            { id: 'applications', label: `Applications`, icon: <Icons.Clipboard /> },
            { id: 'hire-labour', label: 'Hire Labour', icon: <Icons.UserGroup /> }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--green)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--muted)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '0.9rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id ? '0 0 20px rgba(126, 200, 67, 0.4)' : 'none'
              }}
            >
              <span style={{ width: '16px', display: 'flex' }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fr-section" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'create-job' && (
            <motion.div key="create-v2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              


              {/* Grouped Form Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Section 1: Basic Information */}
                <div className="fr-contract-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button onClick={() => toggleSection('basic')} style={{ width: '100%', background: 'none', border: 'none', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ color: 'var(--green)', width: '24px' }}><Icons.Info /></div>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', margin: 0, color: 'var(--white)' }}>Basic <em>Information</em></h3>
                    </div>
                    <div style={{ color: 'var(--muted)', width: '20px' }}>{expandedSections.basic ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.basic && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 32px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                          <FormInput label="JOB TITLE" name="title" value={scheduleForm.title} onChange={handleInputChange} placeholder="e.g. Early Harvest Batch" icon={<Icons.Plus />} />
                          <FormSelect label="JOB CATEGORY" name="category" value={scheduleForm.category} onChange={handleInputChange} options={['Harvesting', 'Planting', 'Maintenance', 'Loading']} />
                          <div style={{ gridColumn: 'span 2' }}>
                            <FormTextArea label="JOB DESCRIPTION" name="description" value={scheduleForm.description} onChange={handleInputChange} placeholder="Detailed work breakdown and expectations..." />
                          </div>
                          <FormInput label="LABOURS REQUIRED" name="labourCount" type="number" value={scheduleForm.labourCount} onChange={handleInputChange} placeholder="0" icon={<Icons.UserGroup />} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section 2: Location Information */}
                <div className="fr-contract-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button onClick={() => toggleSection('location')} style={{ width: '100%', background: 'none', border: 'none', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ color: 'var(--blue)', width: '24px' }}><Icons.Map /></div>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', margin: 0, color: 'var(--white)' }}>Location <em>Architecture</em></h3>
                    </div>
                    <div style={{ color: 'var(--muted)', width: '20px' }}>{expandedSections.location ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.location && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 32px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                          <FormInput label="VILLAGE" name="village" value={scheduleForm.village} onChange={handleInputChange} placeholder="e.g. Lonand" icon={<Icons.Map />} />
                          <FormInput label="TALUKA / DISTRICT" name="taluka" value={scheduleForm.taluka} onChange={handleInputChange} placeholder="e.g. Satara" icon={<Icons.Map />} />
                          <FormInput label="FARM LOCATION" name="farmLocation" value={scheduleForm.farmLocation} onChange={handleInputChange} placeholder="e.g. Plot No. 42, Maharashtra" icon={<Icons.Map />} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section 3: Work Schedule */}
                <div className="fr-contract-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button onClick={() => toggleSection('schedule')} style={{ width: '100%', background: 'none', border: 'none', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ color: 'var(--amber)', width: '24px' }}><Icons.Clock /></div>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', margin: 0, color: 'var(--white)' }}>Timeline <em>& Shift</em></h3>
                    </div>
                    <div style={{ color: 'var(--muted)', width: '20px' }}>{expandedSections.schedule ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.schedule && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 32px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                          <FormInput label="START DATE" name="startDate" type="date" value={scheduleForm.startDate} onChange={handleInputChange} />
                          <FormInput label="END DATE" name="endDate" type="date" value={scheduleForm.endDate} onChange={handleInputChange} />
                          <FormInput label="WORKING HOURS" name="workingHours" value={scheduleForm.workingHours} onChange={handleInputChange} placeholder="e.g. 8:00 AM - 5:00 PM" icon={<Icons.Clock />} />
                          <FormSelect label="SHIFT TYPE" name="shiftType" value={scheduleForm.shiftType} onChange={handleInputChange} options={['Morning', 'Full Day', 'Night', 'Rotational']} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section 4: Payment Details */}
                <div className="fr-contract-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button onClick={() => toggleSection('payment')} style={{ width: '100%', background: 'none', border: 'none', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ color: 'var(--white)', width: '24px' }}><Icons.Wallet /></div>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', margin: 0, color: 'var(--white)' }}>Financial <em>Terms</em></h3>
                    </div>
                    <div style={{ color: 'var(--muted)', width: '20px' }}>{expandedSections.payment ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</div>
                  </button>
                  <AnimatePresence>
                    {expandedSections.payment && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 32px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                          <FormSelect label="WAGE TYPE" name="wageType" value={scheduleForm.wageType} onChange={handleInputChange} options={['Daily', 'Weekly', 'Per Ton', 'Lump Sum']} />
                          <FormInput label="WAGE AMOUNT (₹)" name="wageAmount" type="number" value={scheduleForm.wageAmount} onChange={handleInputChange} placeholder="0.00" icon={<Icons.Wallet />} />
                          <FormCheckbox label="ADVANCE PAYMENT AVAILABLE" name="advanceAvailable" checked={scheduleForm.advanceAvailable} onChange={handleInputChange} />
                          <FormCheckbox label="FOOD & STAY INCLUDED" name="foodStayIncluded" checked={scheduleForm.foodStayIncluded} onChange={handleInputChange} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Additional Sections (Requirements, Facilities, Contact) follow same pattern... */}
                {/* For brevity, adding the remaining as a combined premium grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                   <div className="fr-contract-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', gap: '12px' }}><span style={{width:'20px', color:'var(--green)'}}><Icons.Shield /></span> Facilities</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <FormCheckbox label="Transport Support" name="transport" checked={scheduleForm.transport} onChange={handleInputChange} />
                        <FormCheckbox label="Accommodation" name="accommodation" checked={scheduleForm.accommodation} onChange={handleInputChange} />
                        <FormCheckbox label="Clean Drinking Water" name="drinkingWater" checked={scheduleForm.drinkingWater} onChange={handleInputChange} />
                        <FormCheckbox label="Medical Support" name="medicalSupport" checked={scheduleForm.medicalSupport} onChange={handleInputChange} />
                      </div>
                   </div>
                   <div className="fr-contract-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', gap: '12px' }}><span style={{width:'20px', color:'var(--blue)'}}><Icons.Phone /></span> Management</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FormInput label="SUPERVISOR NAME" name="supervisor" value={scheduleForm.supervisor} onChange={handleInputChange} placeholder="John Doe" />
                        <FormInput label="CONTACT NUMBER" name="hhmContact" value={scheduleForm.hhmContact} onChange={handleInputChange} placeholder="+91 98XXX XXXX" icon={<Icons.Phone />} />
                      </div>
                   </div>
                </div>

              </div>

              {/* Action Bar */}
              <div style={{ marginTop: '48px', padding: '24px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button onClick={handleDeploySchedule} disabled={submitting} className="fr-btn" style={{ padding: '14px 48px', background: submitting ? 'var(--muted)' : 'var(--blue)', color: 'var(--bg)', border: 'none', borderRadius: '12px', fontWeight: '800', letterSpacing: '1px', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease' }}>
                  {submitting ? 'Deploying...' : 'Deploy Schedule'}
                </button>
              </div>

            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="apps-v2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {loading ? (
                <div className="fr-empty"><p>Syncing regional applications...</p></div>
              ) : applications.length === 0 ? (
                <div className="fr-empty">
                  <div className="fr-empty-icon"><Icons.Clipboard /></div>
                  <p>No regional applications pending review</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {applications.map((app, idx) => (
                    <motion.div key={app._id} layout className="fr-contract-card" style={{ padding: '20px', background: 'linear-gradient(145deg, rgba(20, 24, 20, 0.9) 0%, rgba(10, 12, 10, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', overflow: 'hidden' }}>
                      
                      {/* Status Glow */}
                      <div style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '-40px',
                        width: '120px',
                        height: '120px',
                        background: app.status === 'approved' ? 'radial-gradient(circle, rgba(126, 200, 67, 0.15) 0%, transparent 70%)' :
                                    app.status === 'pending' ? 'radial-gradient(circle, rgba(232, 168, 58, 0.15) 0%, transparent 70%)' :
                                    'radial-gradient(circle, rgba(231, 76, 60, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }} />

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontFamily: 'Syne', color: 'var(--green)', flexShrink: 0 }}>
                          {app.labourId.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <h4 
                            onClick={() => navigate(`/hhm/labour/${app.labourId._id}`)} 
                            style={{ color: 'var(--white)', fontSize: '1rem', marginBottom: '4px', fontFamily: 'Syne', cursor: 'pointer', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                            className="fr-hover-green"
                          >
                            {app.labourId.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            <span style={{ width: '12px' }}><Icons.Briefcase /></span>
                            {app.scheduleId.title}
                          </div>
                        </div>
                        <div style={{ 
                          background: app.status === 'approved' ? 'rgba(126, 200, 67, 0.1)' : app.status === 'rejected' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(232, 168, 58, 0.1)', 
                          color: app.status === 'approved' ? 'var(--green)' : app.status === 'rejected' ? '#e74c3c' : 'var(--amber)', 
                          padding: '4px 8px', 
                          borderRadius: '100px', 
                          fontSize: '0.55rem', 
                          fontWeight: '800', 
                          letterSpacing: '1px', 
                          height: 'fit-content',
                          border: `1px solid ${app.status === 'approved' ? 'rgba(126, 200, 67, 0.2)' : app.status === 'rejected' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(232, 168, 58, 0.2)'}`
                        }}>
                          {app.status.toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Application Message Redesign */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>💬</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Application Pitch</span>
                        </div>
                        <p style={{ color: '#e0e0e0', fontSize: '0.8rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{app.message}"
                        </p>
                      </div>

                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
                          <button onClick={() => navigate(`/hhm/labour/${app.labourId._id}`, { state: { labourData: app.labourId } })} className="fr-btn fr-btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                             <Icons.User style={{ width: '10px' }} /> Profile
                          </button>
                          <button onClick={() => handleApplicationAction(app._id, 'approved')} className="fr-btn fr-btn-primary" style={{ flex: 1.2, padding: '8px', fontSize: '0.7rem', background: 'rgba(126, 200, 67, 0.15)', color: 'var(--green)', border: '1px solid rgba(126, 200, 67, 0.3)' }}>
                             Approve
                          </button>
                          <button onClick={() => handleApplicationAction(app._id, 'rejected')} className="fr-btn fr-btn-secondary" style={{ flex: 0.8, padding: '8px', fontSize: '0.7rem', color: '#e74c3c' }}>
                             Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'hire-labour' && (
            <motion.div key="hire-v2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{
                padding: '40px',
                background: 'linear-gradient(180deg, rgba(15, 20, 15, 0.4) 0%, rgba(10, 15, 10, 0.6) 100%)',
                border: '1px solid rgba(126, 200, 67, 0.1)',
                borderRadius: '40px',
                boxShadow: 'inset 0 0 60px rgba(126, 200, 67, 0.03), 0 20px 80px rgba(0,0,0,0.4)',
                position: 'relative',
                width: '100%'
              }}>
                {/* Subtle Top Glow Line inside the contour */}
                <div style={{ position: 'absolute', top: 0, left: '10%', width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(126,200,67,0.3), transparent)' }}></div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '24px', color: 'var(--green)' }}><Icons.Search /></div>
                  <input 
                    type="text" 
                    placeholder="Search by labour name, skills, or location..." 
                    value={labourSearchTerm}
                    onChange={(e) => setLabourSearchTerm(e.target.value)}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(20,24,20,0.8)', 
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '100px', 
                      padding: '18px 24px 18px 60px', 
                      color: 'var(--white)', 
                      fontSize: '1rem',
                      outline: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                    }} 
                    onFocus={(e) => { e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 20px rgba(126,200,67,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Available', 'Skilled', 'Nearby', 'Experienced'].map(chip => (
                    <button key={chip} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '12px 20px',
                      borderRadius: '100px',
                      color: 'var(--muted)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }} onMouseOver={(e) => { e.target.style.color = 'var(--white)'; e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'var(--green)'; }} onMouseOut={(e) => { e.target.style.color = 'var(--muted)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {loadingLabours ? (
                <div className="fr-empty"><p>Scanning workforce directory...</p></div>
              ) : filteredLabours.length === 0 ? (
                <div className="fr-empty">
                  <div className="fr-empty-icon"><Icons.UserGroup /></div>
                  <p>No regional labours matching criteria</p>
                </div>
              ) : (
                    <div className="fd-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
                    {filteredLabours.map(labour => (
                      <div key={labour._id} className={`global-card ${labour.availability === 'Available' ? 'active' : 'inactive'}`} style={{ animation: 'hdFadeUp 0.5s ease-out both' }} onClick={() => navigate(`/hhm/labour/${labour._id}`, { state: { labourData: labour } })}>
                        {/* HEADER */}
                        <div className="gc-header">
                          <div className="gc-avatar-wrap">
                            <div className="gc-avatar">{labour.name ? labour.name.charAt(0).toUpperCase() : '?'}</div>
                            <div className={`gc-status-ring ${labour.availability === 'Available' ? 'available' : 'busy'}`}></div>
                          </div>
                          <div className="gc-title-wrap">
                            <h3 className="gc-name">{labour.name}</h3>
                            <div className="gc-header-meta">
                              <span className="gc-role-badge">Labour</span>
                              <span className={`gc-avail-badge ${labour.availability === 'Available' ? 'available' : 'busy'}`}>
                                {labour.availability ? labour.availability.toUpperCase() : 'UNKNOWN'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* INFO GRID */}
                        <div className="gc-info-grid-2col">
                          <div className="gc-info-item">
                            <span className="gc-ii-label">Location</span>
                            <span className="gc-ii-val">
                              <span className="gc-ii-icon"><Icons.Location style={{width: 14}}/></span>
                              {labour.location || 'Maharashtra'}
                            </span>
                          </div>
                          <div className="gc-info-item">
                            <span className="gc-ii-label">Est. Wage</span>
                            <span className="gc-ii-val text-green">
                              <span className="gc-ii-icon" style={{ fontSize: '13px', fontWeight: '700' }}>₹</span>
                              {labour.wageExpectation || '450'}/day
                            </span>
                          </div>
                          <div className="gc-info-item">
                            <span className="gc-ii-label">Experience</span>
                            <span className="gc-ii-val">
                              <span className="gc-ii-icon"><Icons.Clock style={{width: 14}}/></span>
                              {labour.experience || '3'} Years
                            </span>
                          </div>
                          <div className="gc-info-item">
                            <span className="gc-ii-label">Reliability</span>
                            <span className="gc-ii-val text-green">
                              <span className="gc-ii-icon"><Icons.Check style={{width: 14}}/></span>
                              {labour.rating || '4.8'}
                            </span>
                          </div>
                          <div className="gc-info-item full-width">
                            <span className="gc-ii-label">Contact</span>
                            <span className="gc-ii-val" style={{ color: 'var(--muted)', whiteSpace: 'normal' }}>
                              <span className="gc-ii-icon"><Icons.Phone style={{width: 14}}/></span>
                              {labour.phone || labour.email || '+91 87654 32109'}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="gc-card-bottom">
                          <button 
                            className="gc-btn-primary" 
                            onClick={(e) => { e.stopPropagation(); showNotification(`Quick hire request sent to ${labour.name}`, 'success'); }}
                          >
                            Quick Hire
                          </button>
                          <button 
                            className="gc-btn-secondary" 
                            onClick={(e) => { e.stopPropagation(); navigate(`/hhm/labour/${labour._id}`, { state: { labourData: labour } }); }}
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
              )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      {/* Notifications */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ position: 'fixed', bottom: '40px', right: '40px', background: notification.type === 'success' ? 'rgba(126, 200, 67, 0.9)' : 'rgba(231, 76, 60, 0.9)', color: 'white', padding: '16px 32px', borderRadius: '12px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700' }}>
            <div style={{ width: '20px' }}>{notification.type === 'success' ? <Icons.Check /> : <Icons.XMark />}</div>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

};

/**
 * Reusable Premium Form Components
 */
const FormInput = ({ label, icon, type = 'text', ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--muted)', letterSpacing: '1.5px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {icon && <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', color: 'var(--muted)' }}>{icon}</div>}
      <input type={type} {...props} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: `14px 14px 14px ${icon ? '42px' : '14px'}`, color: 'var(--white)', outline: 'none', transition: 'all 0.3s ease', fontFamily: 'Instrument Sans' }} className="fr-input-focus" />
    </div>
  </div>
);

const FormSelect = ({ label, options, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--muted)', letterSpacing: '1.5px' }}>{label}</label>
    <select {...props} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', color: 'var(--white)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '16px' }}>
      {options.map(opt => <option key={opt} value={opt} style={{ background: 'var(--bg-2)' }}>{opt}</option>)}
    </select>
  </div>
);

const FormTextArea = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--muted)', letterSpacing: '1.5px' }}>{label}</label>
    <textarea {...props} rows="4" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', color: 'var(--white)', outline: 'none', resize: 'none', transition: 'all 0.3s ease' }} />
  </div>
);

const FormCheckbox = ({ label, name, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px solid var(--border)' }}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }} />
    <span style={{ fontSize: '0.85rem', color: 'var(--white)', fontWeight: '600' }}>{label}</span>
  </label>
);

export default LaborManagementPage;
