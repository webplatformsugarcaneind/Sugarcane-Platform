import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerHHMDirectoryPage.css';

const LabourHHMDirectoryPage = () => {
  const navigate = useNavigate();
  const [hhms, setHhms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('name');
  const [isListView, setIsListView] = useState(false);

  useEffect(() => { fetchHHMs(); }, []);

  const fetchHHMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found. Please login again.'); return; }
      const res = await axios.get('/api/labour/hhms', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = res.data.data || [];
      setHhms(data);
    } catch (err) {
      let msg = 'Failed to load HHM directory';
      if (err.response?.status === 401) msg = 'Authentication failed. Please login again.';
      else if (err.response?.status === 403) msg = 'You do not have permission to access this directory.';
      else if (err.response?.data?.message) msg = err.response.data.message;
      setError(msg);
    } finally { setLoading(false); }
  };

  const doFilter = useCallback(() => {
    let list = [...hhms];
    if (locationFilter) list = list.filter(h => (h.location || '').toLowerCase().includes(locationFilter));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(h =>
        h.name?.toLowerCase().includes(q) ||
        h.username?.toLowerCase().includes(q) ||
        h.email?.toLowerCase().includes(q) ||
        h.phone?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortFilter === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortFilter === 'username') return (a.username || '').localeCompare(b.username || '');
      if (sortFilter === 'email') return (a.email || '').localeCompare(b.email || '');
      if (sortFilter === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });
    setFiltered(list);
  }, [hhms, searchTerm, locationFilter, sortFilter]);

  useEffect(() => { doFilter(); }, [doFilter]);

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const handleContact = (hhm) => {
    if (hhm.email) {
      const subject = encodeURIComponent('Work Opportunity Inquiry');
      const body = encodeURIComponent(`Hello ${hhm.name || 'there'},\n\nI am a labour looking for employment opportunities and found your contact through the HHM Directory.\n\nBest regards`);
      window.location.href = `mailto:${hhm.email}?subject=${subject}&body=${body}`;
    }
  };

  const uniqueLocations = [...new Set(hhms.map(h => h.location).filter(Boolean))];
  const kpiTotal = hhms.length;
  const kpiActive = hhms.filter(h => h.isActive !== false).length;
  const kpiLocations = uniqueLocations.length;
  const kpiRecent = hhms.filter(h => {
    if (!h.createdAt) return false;
    const d = new Date(h.createdAt);
    const now = new Date();
    return (now - d) < 30 * 24 * 60 * 60 * 1000;
  }).length;

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
    Alert: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    )
  };

  const getInitials = n => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';

  return (
    <div className="hd-page">
      {/* HEADER */}
      <div className="hd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Labour View</div>
            <h1 className="hd-title">HHM <em>Directory</em></h1>
            <p className="hd-sub">Find Harvest Head Managers in your area — connect with coordinators for work opportunities and employment.</p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="global-toolbar">
        <div className="global-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input type="text" className="global-search" placeholder="Search by name, username, email or phone…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <select className="global-filter" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {uniqueLocations.map((loc, i) => <option key={i} value={loc.toLowerCase()}>📍 {loc}</option>)}
        </select>
        <select className="global-filter" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
          <option value="name">Sort: Name A–Z</option>
          <option value="username">Sort: Username</option>
          <option value="email">Sort: Email</option>
          <option value="newest">Sort: Newest</option>
        </select>
        <button className="global-filter-btn" onClick={() => { setSearchTerm(''); setLocationFilter(''); setSortFilter('name'); }}>Reset</button>
      </div>

      {/* RESULTS META */}
      <div className="hd-results-meta">
        <div className="hd-results-count"><strong>{filtered.length}</strong> of {hhms.length} HHMs found</div>
      </div>

      {/* GRID */}
      <div className="hd-grid-premium">
        {loading ? (
          <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading HHM directory...</div></div>
        ) : error ? (
          <div className="hd-empty"><div className="hd-empty-icon" style={{ width: '48px', height: '48px', color: 'var(--amber)', display: 'inline-block' }}><Icons.Alert /></div><div className="hd-empty-title">{error}</div><button className="gc-btn-secondary" onClick={fetchHHMs} style={{ marginTop: '16px', maxWidth: '200px' }}>Try Again</button></div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon" style={{ width: '48px', height: '48px', color: 'var(--green)', display: 'inline-block' }}><Icons.Team /></div><div className="hd-empty-title">No HHMs found</div><div className="hd-empty-sub">Try adjusting your search or filter criteria</div></div>
        ) : filtered.map((hhm, idx) => {
          const isAvailable = hhm.isActive !== false;
          
          return (
            <div key={hhm._id || `hhm-${idx}`} className={`global-card ${isAvailable ? 'active' : 'inactive'}`} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => navigate(hhm._id)}>
              
              {/* CARD TOP */}
              <div className="gc-header">
                <div className="gc-avatar-wrap">
                  <div className="gc-avatar">{getInitials(hhm.name)}</div>
                  <div className={`gc-status-ring ${isAvailable ? 'available' : 'busy'}`}></div>
                  <div className={`gc-avail-dot ${isAvailable ? 'available' : 'busy'}`}></div>
                </div>
                <div className="gc-title-wrap">
                  <h3 className="gc-name">{hhm.name || 'Unknown Name'}</h3>
                  <div className="gc-header-meta">
                    <span className="gc-role-badge">Harvest Manager</span>
                    <span className={`gc-avail-badge ${isAvailable ? 'available' : 'busy'}`}>
                      <span className="gc-avail-indicator"></span>
                      {isAvailable ? 'Active' : 'Inactive'}
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
                  <span className="gc-ii-label">Experience</span>
                  <span className="gc-ii-val">
                    <span className="gc-ii-icon"><Icons.Clock /></span>
                    {hhm.experience || '0 Yrs'}
                  </span>
                </div>
                <div className="gc-info-item full-width">
                  <span className="gc-ii-label">Member Since</span>
                  <span className="gc-ii-val">
                    <span className="gc-ii-icon"><Icons.Star /></span>
                    {fmtDate(hhm.createdAt)}
                  </span>
                </div>
              </div>

              {/* CARD BOTTOM (ACTIONS) */}
              <div className="gc-card-bottom">
                <button 
                  className="gc-btn-primary" 
                  disabled={!hhm.email}
                  style={{ opacity: hhm.email ? 1 : 0.6, cursor: hhm.email ? 'pointer' : 'not-allowed' }}
                  onClick={(e) => { e.stopPropagation(); handleContact(hhm); }}
                >
                  Contact Email
                </button>
                <button 
                  className="gc-btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); navigate(hhm._id); }}
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LabourHHMDirectoryPage;
