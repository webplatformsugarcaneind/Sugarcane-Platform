import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FarmerHHMDirectoryPage.css';

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
  Factory: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Zm.375 0h.008v.008h-.008V3.75Zm-.375 3h-.008v.008h.008v-.008Zm.375 0h.008v.008h-.008v-.008Zm-.375 3h-.008v.008h.008v-.008Zm.375 0h.008v.008h-.008v-.008Zm-.375 3h-.008v.008h.008v-.008Zm.375 0h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
};

const FarmerHHMDirectoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hhms, setHhms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('search') || '');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('name');
  const [availFilter, setAvailFilter] = useState('');
  const [isListView, setIsListView] = useState(false);

  useEffect(() => { fetchHHMs(); }, []);

  const fetchHHMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found. Please login again.'); return; }
      const res = await axios.get('/api/farmer/hhms', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = res.data.data || res.data.hhms || [];
      setHhms(data);
    } catch (err) {
      console.error('Error fetching HHMs:', err);
      setError(err.response?.data?.message || 'Failed to fetch HHM directory.');
    } finally { setLoading(false); }
  };



  const doFilter = useCallback(() => {
    let list = [...hhms];
    if (locationFilter) list = list.filter(h => (h.location || '').toLowerCase().includes(locationFilter));
    if (availFilter === 'available') list = list.filter(h => h.isActive !== false);
    if (availFilter === 'busy') list = list.filter(h => h.isActive === false);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(h =>
        h.name?.toLowerCase().includes(q) ||
        h.location?.toLowerCase().includes(q) ||
        (h.associatedFactories && h.associatedFactories.some(f => f.name?.toLowerCase().includes(q)))
      );
    }
    list.sort((a, b) => {
      if (sortFilter === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortFilter === 'location') return (a.location || '').localeCompare(b.location || '');
      if (sortFilter === 'labour') return (parseInt(b.teamSize) || 0) - (parseInt(a.teamSize) || 0);
      return 0;
    });
    setFiltered(list);
  }, [hhms, searchTerm, locationFilter, sortFilter, availFilter]);

  useEffect(() => { doFilter(); }, [doFilter]);

  const getInitials = n => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';

  // Handles both "12" and "30-35 labours" formats from DB
  const parseLabours = val => {
    if (!val) return null;
    const trimmed = val.trim();
    // If it's already a descriptive string (contains letters), use it directly
    if (/[a-zA-Z]/.test(trimmed)) return trimmed;
    const n = parseInt(trimmed);
    return isNaN(n) ? null : `${n} labours`;
  };

  const uniqueLocations = [...new Set(hhms.map(h => h.location).filter(Boolean))];
  const kpiTotal = hhms.length;
  const kpiAvailable = hhms.filter(h => h.isActive !== false).length;
  const kpiLocations = uniqueLocations.length;
  const kpiWithTeam = hhms.filter(h => h.teamSize).length;

  return (
    <div className="hd-page">
      {/* HEADER */}
      <div className="hd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Workforce Intelligence</div>
            <h1 className="hd-title">HHM <em>Directory</em></h1>
            <p className="hd-sub">Find and coordinate with premium Harvest Head Managers across Maharashtra.</p>
          </div>
        </div>
      </div>



      {/* SEARCH & FILTER SECTION */}
      <div className="global-toolbar">
        <div className="global-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input type="text" className="global-search" placeholder="Search by HHM name, location, or associated factory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <select className="global-filter" value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
          <option value="">Status: All</option>
          <option value="available">Status: Available</option>
          <option value="busy">Status: Busy</option>
        </select>
        <select className="global-filter" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
          <option value="name">Sort: Name A-Z</option>
          <option value="location">Sort: Location</option>
          <option value="labour">Sort: Team Size</option>
        </select>
        <button className="global-filter-btn" onClick={() => { setSearchTerm(''); setAvailFilter(''); setSortFilter('name'); }}>Reset</button>
      </div>

      {/* RESULTS META */}
      <div className="hd-results-meta">
        <div className="hd-results-count"><strong>{filtered.length}</strong> Operational HHMs matching criteria</div>
      </div>

      {/* GRID */}
      <div className="hd-grid-premium">
        {loading ? (
          <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading workforce data...</div></div>
        ) : error ? (
          <div className="hd-empty"><div className="hd-empty-icon" style={{ width: '48px', height: '48px', color: 'var(--amber)', display: 'inline-block' }}><Icons.Alert /></div><div className="hd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon" style={{ width: '48px', height: '48px', color: 'var(--green)', display: 'inline-block' }}><Icons.Team /></div><div className="hd-empty-title">No HHMs found</div><div className="hd-empty-sub">Adjust your search or filter criteria</div></div>
        ) : filtered.map((hhm, idx) => {
          const isAvailable = hhm.isActive !== false;
          const labours = parseLabours(hhm.teamSize);
          const experience = hhm.managementExperience;
          const factoryNames = hhm.associatedFactories && hhm.associatedFactories.length > 0 
            ? (hhm.associatedFactories.length > 1 
                ? `${hhm.associatedFactories[0].name} & +${hhm.associatedFactories.length - 1} more` 
                : hhm.associatedFactories[0].name)
            : 'Independent Contractor';

          return (
            <div key={hhm._id || `hhm-${idx}`} className={`global-card ${isAvailable ? 'active' : 'inactive'}`} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => navigate(`/farmer/hhm-directory/${hhm._id}`)}>
              
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
                    {labours || '24'}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">Experience</span>
                  <span className="gc-ii-val">
                    <span className="gc-ii-icon"><Icons.Clock /></span>
                    {experience || '0 Yrs'}
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
                  <span className="gc-ii-label">Associated Factory</span>
                  <span className="gc-ii-val" style={{ color: 'var(--muted)', whiteSpace: 'normal' }}>
                    <span className="gc-ii-icon"><Icons.Factory /></span>
                    {factoryNames}
                  </span>
                </div>
              </div>

              {/* CARD BOTTOM (ACTIONS) */}
              <div className="gc-card-bottom">
                <button 
                  className="gc-btn-primary" 
                  disabled={!isAvailable}
                  style={{ opacity: isAvailable ? 1 : 0.6, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                  onClick={(e) => { e.stopPropagation(); if (isAvailable) navigate(`/farmer/hhms/${hhm._id}/contract`); }}
                >
                  Request Contract
                </button>
                <button 
                  className="gc-btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); navigate(`/farmer/hhm-directory/${hhm._id}`); }}
                >
                  Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmerHHMDirectoryPage;
