import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';
import './FarmerHHMDirectoryPage.css';

// Set axios base URL
axios.defaults.baseURL = API_BASE_URL;

const Icons = {
  Location: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  Team: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20M3 11.625a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.125 6a2.25 2.25 0 0 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 12.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  )
};

const FactoryHHMDirectoryPage = () => {
  const navigate = useNavigate();
  const { notifications, dismissNotification, notify } = useNotifications();
  const [hhms, setHhms] = useState([]);
  const [filteredHhms, setFilteredHhms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isListView, setIsListView] = useState(false);

  // Invitation modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedHHM, setSelectedHHM] = useState(null);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState(null);

  // Sub-navigation state
  const [activeTab, setActiveTab] = useState('allHHMs');

  // Request and Application states
  const [myRequests, setMyRequests] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Filter and sort function
  const filterAndSortHHMs = useCallback(() => {
    let filtered = [...hhms];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(hhm =>
        hhm.name?.toLowerCase().includes(q) ||
        hhm.username?.toLowerCase().includes(q) ||
        hhm.email?.toLowerCase().includes(q) ||
        hhm.phone?.includes(q) ||
        hhm.specialization?.toLowerCase().includes(q)
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(hhm =>
        hhm.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'username') return (a.username || '').localeCompare(b.username || '');
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
      if (sortBy === 'location') return (a.location || '').localeCompare(b.location || '');
      return 0;
    });

    setFilteredHhms(filtered);
  }, [hhms, searchTerm, selectedLocation, sortBy]);

  useEffect(() => { fetchHHMs(); }, []);
  useEffect(() => { filterAndSortHHMs(); }, [filterAndSortHHMs]);
  useEffect(() => {
    if (activeTab === 'myRequests') fetchMyRequests();
    else if (activeTab === 'receivedApplications') fetchReceivedApplications();
  }, [activeTab]);

  const fetchHHMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found. Please login again.'); return; }
      
      const response = await axios.get('/api/factory/hhms', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const hhmData = response.data.data || response.data.hhms || response.data || [];
      setHhms(Array.isArray(hhmData) ? hhmData : []);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Access denied. Please ensure you are logged in with the correct Factory role.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch HHM directory. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/factory/invitations', { headers: { 'Authorization': `Bearer ${token}` } });
      setMyRequests(response.data.data || []);
    } catch (err) {
      console.error('Error fetching sent invitations:', err);
    } finally { setRequestsLoading(false); }
  };

  const fetchReceivedApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/factory/received-invitations', { headers: { 'Authorization': `Bearer ${token}` } });
      setReceivedApplications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching received invitations:', err);
    } finally { setApplicationsLoading(false); }
  };

  const handleApplicationResponse = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.put(`/api/factory/received-invitations/${applicationId}`, { status }, { headers: { 'Authorization': `Bearer ${token}` } });
      await fetchReceivedApplications();
      setInvitationSuccess(`Application ${status} successfully!`);
      setTimeout(() => setInvitationSuccess(null), 3000);
    } catch (err) {
      setError('Failed to respond to application. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSortBy('name');
  };

  const uniqueLocations = [...new Set(hhms.map(hhm => hhm.location).filter(Boolean))];
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const handleInviteClick = (hhm) => {
    setSelectedHHM(hhm);
    setInvitationMessage('');
    setInvitationSuccess(null);
    setShowInviteModal(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedHHM) return;
    try {
      setSendingInvitation(true);
      const token = localStorage.getItem('token');
      if (!token) { setInvitationSuccess({ type: 'error', message: 'Authentication required. Please login again.' }); return; }
      if (!selectedHHM._id || selectedHHM._id.length !== 24) { setInvitationSuccess({ type: 'error', message: 'Invalid HHM selected. Please refresh the page and try again.' }); return; }
      
      await axios.post('/api/factory/invite-hhm', { hhmId: selectedHHM._id, personalMessage: invitationMessage }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      notify.hhmInvitationSent('Factory', selectedHHM.name);
      setTimeout(() => { setShowInviteModal(false); setSelectedHHM(null); setInvitationMessage(''); }, 2000);
    } catch (err) {
      let errorMessage = 'Failed to send invitation. Please try again.';
      if (err.response?.status === 401) errorMessage = 'Your session has expired. Please login again.';
      else if (err.response?.status === 403) errorMessage = 'You do not have permission to send invitations. Please contact support.';
      else if (err.response?.status === 409) errorMessage = err.response.data.message || 'You have already sent an invitation to this HHM.';
      else if (err.response?.status === 429) errorMessage = err.response.data.message || 'Please wait before sending another invitation to this HHM.';
      else if (err.response?.status === 400) errorMessage = err.response.data.message || 'Invalid invitation request.';
      else if (err.response?.status === 404) errorMessage = 'The selected HHM was not found. Please refresh the page and try again.';
      else if (err.response?.data?.message) errorMessage = err.response.data.message;
      setInvitationSuccess({ type: 'error', message: errorMessage });
    } finally {
      setSendingInvitation(false);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedHHM(null);
    setInvitationMessage('');
    setInvitationSuccess(null);
  };

  const kpiTotal = hhms.length;
  const kpiActive = hhms.filter(h => h.isActive !== false).length;
  const kpiLocations = uniqueLocations.length;
  const kpiRecent = hhms.filter(h => { if (!h.createdAt) return false; const d = new Date(h.createdAt); const now = new Date(); return (now - d) < 30 * 24 * 60 * 60 * 1000; }).length;

  return (
    <div className="hd-page">
      {/* HEADER */}
      <div className="hd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Factory View</div>
            <h1 className="hd-title">HHM <em>Directory</em></h1>
            <p className="hd-sub">Connect with experienced Harvest Managers for efficient crop coordination</p>
          </div>
        </div>
      </div>



      {invitationSuccess && typeof invitationSuccess === 'string' && (
        <div className="hd-success-banner">{invitationSuccess}</div>
      )}

      {activeTab === 'allHHMs' && (
        <>
          <div className="hd-toolbar">
            <div className="hd-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)' }}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search by name, specialization, location…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="hd-search" />
            </div>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="hd-filter">
              <option value="">All Locations</option>
              {uniqueLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="hd-filter">
              <option value="name">Sort: Name A–Z</option>
              <option value="experience">Sort: Experience</option>
              <option value="location">Sort: Location</option>
              <option value="username">Sort: Username</option>
            </select>
            <div className="hd-view-toggle">
              <button className={`hd-vt-btn ${!isListView ? 'active' : ''}`} onClick={() => setIsListView(false)} title="Grid view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <button className={`hd-vt-btn ${isListView ? 'active' : ''}`} onClick={() => setIsListView(true)} title="List view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div className="hd-results-meta">
            <div className="hd-results-count"><strong>{filteredHhms.length}</strong> of {hhms.length} harvest managers found</div>
          </div>

          <div className="hd-grid-premium">
            {loading ? (
              <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading HHM directory...</div></div>
            ) : error ? (
              <div className="hd-empty">
                <div className="hd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color:'var(--amber)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
                <div className="hd-empty-title">Error Loading Directory</div>
                <div className="hd-empty-sub">{error}</div>
                <button onClick={fetchHHMs} className="hd-btn-request" style={{ marginTop: 8 }}>Try Again</button>
              </div>
            ) : filteredHhms.length === 0 ? (
              <div className="hd-empty">
                <div className="hd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                <div className="hd-empty-title">No Harvest Managers Found</div>
                <div className="hd-empty-sub">{(searchTerm || selectedLocation) ? 'Try adjusting your search or filter criteria.' : 'No harvest managers are currently available.'}</div>
                {(searchTerm || selectedLocation) && <button onClick={clearFilters} className="hd-btn-profile" style={{marginTop: 16}}>Clear All Filters</button>}
              </div>
            ) : (
              filteredHhms.map((hhm, idx) => {
                const isAvailable = hhm.isActive !== false;
                const getInitials = n => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';
                
                return (
                  <div key={hhm._id || `hhm-${idx}`} className={`global-card ${isAvailable ? 'active' : 'inactive'}`} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => navigate(`/factory/hhm-directory/${hhm._id}`)}>
                    
                    {/* CARD TOP */}
                    <div className="gc-header">
                      <div className="gc-avatar-wrap">
                        <div className="gc-avatar">{getInitials(hhm.name)}</div>
                        <div className={`gc-status-ring ${isAvailable ? 'available' : 'busy'}`}></div>
                        <div className={`gc-avail-dot ${isAvailable ? 'available' : 'busy'}`}></div>
                      </div>
                      <div className="gc-title-wrap">
                        <h3 className="gc-name">{hhm.name || 'Unknown HHM'}</h3>
                        <div className="gc-header-meta">
                          <span className="gc-role-badge">HHM</span>
                          <span className={`gc-avail-badge ${isAvailable ? 'available' : 'busy'}`}>
                            <span className="gc-avail-indicator"></span>
                            {isAvailable ? 'Available' : 'Engaged'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD MIDDLE (INFO GRID 2-COLUMN) */}
                    <div className="gc-info-grid-2col">
                      <div className="gc-info-item">
                        <span className="gc-ii-label">Location</span>
                        <span className="gc-ii-val">
                          <span className="gc-ii-icon"><Icons.Location /></span>
                          {hhm.location || 'Maharashtra'}
                        </span>
                      </div>
                      <div className="gc-info-item">
                        <span className="gc-ii-label">Team Size</span>
                        <span className="gc-ii-val text-green">
                          <span className="gc-ii-icon"><Icons.Team /></span>
                          {hhm.teamSize || '15'}
                        </span>
                      </div>
                      <div className="gc-info-item">
                        <span className="gc-ii-label">Experience</span>
                        <span className="gc-ii-val">
                          <span className="gc-ii-icon"><Icons.Clock /></span>
                          {hhm.experience || '0 Yrs'}
                        </span>
                      </div>
                      <div className="gc-info-item">
                        <span className="gc-ii-label">Reliability</span>
                        <span className="gc-ii-val text-green">
                          <span className="gc-ii-icon"><Icons.Star /></span>
                          94%
                        </span>
                      </div>
                      <div className="gc-info-item full-width">
                        <span className="gc-ii-label">Contact</span>
                        <span className="gc-ii-val" style={{ color: 'var(--muted)', whiteSpace: 'normal' }}>
                          <span className="gc-ii-icon"><Icons.Phone /></span>
                          {hhm.phone || hhm.email || '+91 98765 43210'}
                        </span>
                      </div>
                    </div>

                    {/* CARD BOTTOM (ACTIONS) */}
                    <div className="gc-card-bottom">
                      <button 
                        className="gc-btn-primary" 
                        disabled={!isAvailable}
                        style={{ opacity: isAvailable ? 1 : 0.6, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                        onClick={(e) => { e.stopPropagation(); handleInviteClick(hhm); }}
                      >
                        Send Invite
                      </button>
                      <button 
                        className="gc-btn-secondary" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/factory/hhm-directory/${hhm._id}`); }}
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <style>{`
        .mp-card { background: #161b16; border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #222; animation: hdFadeUp 0.5s ease-out both; display: flex; flex-direction: column; }
        .mp-card:hover { transform: translateY(-6px); border-color: var(--green); box-shadow: 0 8px 24px -8px rgba(126,200,67,0.3); }
        .mc-header { padding: 20px 20px 0; }
        .mc-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .mc-avatar-glow { width: 44px; height: 44px; border-radius: 12px; background: rgba(126,200,67,0.08); border: 1px solid rgba(126,200,67,0.18); display: flex; align-items: center; justify-content: center; color: var(--green); padding: 8px; box-sizing: border-box; font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; }
        .mc-rating-pill { display: flex; }
        .mc-rating-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 100px; font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; }
        .mc-title-wrap { margin-top: 8px; }
        .mc-name { margin: 0 0 4px 0; font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 800; color: var(--white); line-height: 1.2; }
        .mc-location { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--muted); }
        .mc-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); margin: 16px 20px 0; gap: 0; background: rgba(255,255,255,0.03); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .mc-stat { padding: 10px 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.05); }
        .mc-stat:last-child { border-right: none; }
        .mc-stat-val { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; line-height: 1; color: var(--white); }
        .mc-stat-val.text-green { color: var(--green); }
        .mc-stat-val.text-amber { color: var(--amber); }
        .mc-stat-lbl { font-size: 0.6rem; color: var(--muted-2); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em; }
        .mc-tags-row { padding: 0 20px; margin-top: 14px; display: flex; flex-wrap: wrap; gap: 6px; }
        .mc-status-pill { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 100px; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .mc-status-pill.green { background: rgba(126,200,67,.12); color: var(--green); border: 1px solid rgba(126,200,67,.25); }
        .mc-status-pill.amber { background: rgba(232,168,58,.12); color: var(--amber); border: 1px solid rgba(232,168,58,.25); }
        .mc-status-pill.blue { background: rgba(91,143,255,.12); color: #5b8fff; border: 1px solid rgba(91,143,255,.25); }
        .mc-demand-insights { padding: 0 20px; margin-top: 14px; display: flex; flex-direction: column; gap: 7px; }
        .mc-insight-row { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--white); font-weight: 500; }
        .mc-insight-row.muted { color: var(--muted); font-weight: 400; }
        .mc-insight-row strong { font-weight: 700; }
        .mc-actions-modern { padding: 20px; display: flex; gap: 10px; margin-top: auto; }
        .mc-btn-contact { flex: 1; background: var(--green); color: #0a0f0a; border: none; border-radius: 10px; padding: 12px; font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(126,200,67,0.25); transition: transform 0.2s, box-shadow 0.2s; display:flex; align-items:center; justify-content:center; }
        .mc-btn-contact:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(126,200,67,0.4); }
        .mc-svg-icon { display: inline-flex; align-items: center; justify-content: center; width: 1.1em; height: 1.1em; vertical-align: -0.125em; }
        .mc-svg-icon.text-green { color: var(--green); }
        .mc-svg-icon.text-amber { color: var(--amber); }

        @media (max-width: 1000px) { .hd-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .hd-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .hd-grid { grid-template-columns: repeat(1, 1fr) !important; } }
      `}</style>

      {/* My Requests Tab */}
      {activeTab === 'myRequests' && (
        <div className="hd-section">
          <h2 className="hd-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{verticalAlign:'middle',marginRight:8}}><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> My Sent Invitations</h2>
          {requestsLoading ? (
            <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading your requests...</div></div>
          ) : myRequests.length === 0 ? (
            <div className="hd-empty">
              <div className="hd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg></div>
              <div className="hd-empty-title">No Sent Invitations</div>
              <div className="hd-empty-sub">You haven't sent any invitations to Harvest Managers yet.</div>
            </div>
          ) : (
            <div className="hd-list">
              {myRequests.map((request) => (
                <div key={request._id} className="hd-list-card">
                  <h4>{request.hhmId?.name || request.hhmName || 'Unknown HHM'}</h4>
                  <p><strong>Status:</strong> {request.status}</p>
                  <p><strong>Sent:</strong> {formatDate(request.createdAt)}</p>
                  {request.hhmId?.email && <p><strong>Email:</strong> {request.hhmId.email}</p>}
                  {request.hhmId?.phone && <p><strong>Phone:</strong> {request.hhmId.phone}</p>}
                  {request.message && <p><strong>Message:</strong> {request.message}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Applications Tab */}
      {activeTab === 'receivedApplications' && (
        <div className="hd-section">
          <h2 className="hd-section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{verticalAlign:'middle',marginRight:8}}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-4.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H2" /></svg> Received Applications</h2>
          {applicationsLoading ? (
            <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading applications...</div></div>
          ) : receivedApplications.length === 0 ? (
            <div className="hd-empty">
              <div className="hd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-4.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H2" /></svg></div>
              <div className="hd-empty-title">No Applications Received</div>
              <div className="hd-empty-sub">No Harvest Managers have applied to work with you yet.</div>
            </div>
          ) : (
            <div className="hd-list">
              {receivedApplications.map((application) => (
                <div key={application._id} className="hd-list-card">
                  <h4>{application.hhmId?.name || application.hhmName || 'Unknown HHM'}</h4>
                  <p><strong>Status:</strong> {application.status}</p>
                  <p><strong>Applied:</strong> {formatDate(application.createdAt)}</p>
                  {application.hhmId?.email && <p><strong>Email:</strong> {application.hhmId.email}</p>}
                  {application.hhmId?.phone && <p><strong>Phone:</strong> {application.hhmId.phone}</p>}
                  {application.hhmId?.experience && <p><strong>Experience:</strong> {application.hhmId.experience} years</p>}
                  {application.message && <p><strong>Message:</strong> {application.message}</p>}
                  {application.status === 'pending' && (
                    <div className="hd-app-actions">
                      <button className="hd-btn-accept" onClick={() => handleApplicationResponse(application._id, 'accepted')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{verticalAlign:'middle',marginRight:4}}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Accept</button>
                      <button className="hd-btn-decline" onClick={() => handleApplicationResponse(application._id, 'declined')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{verticalAlign:'middle',marginRight:4}}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && selectedHHM && (
        <div className="hd-modal-overlay" onClick={closeInviteModal}>
          <div className="hd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd-modal-header">
              <h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{verticalAlign:'middle',marginRight:8}}><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> Send Invitation to {selectedHHM.name}</h2>
              <button className="hd-modal-close" onClick={closeInviteModal}>×</button>
            </div>
            <div className="hd-modal-body">
              {invitationSuccess ? (
                <div className={`hd-alert ${invitationSuccess.type === 'success' ? 'success' : 'error'}`}>{invitationSuccess.message}</div>
              ) : (
                <>
                  <div className="hd-preview">
                    <div className="hd-preview-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                    <div className="hd-preview-info">
                      <h3>{selectedHHM.name}</h3>
                      <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{verticalAlign:'middle',marginRight:4,color:'var(--muted-2)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> {selectedHHM.location || 'Location not specified'}</p>
                      <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{verticalAlign:'middle',marginRight:4,color:'var(--muted-2)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> {selectedHHM.email}</p>
                    </div>
                  </div>
                  <div className="hd-form-group">
                    <label htmlFor="invitation-message">Message (Optional)</label>
                    <textarea id="invitation-message" value={invitationMessage} onChange={(e) => setInvitationMessage(e.target.value)} placeholder="Add a personal message to your invitation..." rows="4" className="hd-textarea" />
                    <small className="hd-form-hint">Explain why you'd like to partner with this Harvest Manager</small>
                  </div>
                </>
              )}
            </div>
            {!invitationSuccess && (
              <div className="hd-modal-footer">
                <button className="hd-btn-profile" onClick={closeInviteModal} disabled={sendingInvitation}>Cancel</button>
                <button className="hd-btn-request" onClick={handleSendInvitation} disabled={sendingInvitation}>{sendingInvitation ? 'Sending...' : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{verticalAlign:'middle',marginRight:6}}><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> Send Invitation</>}</button>
              </div>
            )}
          </div>
        </div>
      )}

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} position="top-right" />
    </div>
  );
};

export default FactoryHHMDirectoryPage;
