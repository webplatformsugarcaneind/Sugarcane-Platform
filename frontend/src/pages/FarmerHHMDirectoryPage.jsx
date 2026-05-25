import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FarmerHHMDirectoryPage.css';

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
          <div className="hd-empty"><div className="hd-empty-icon">⚠️</div><div className="hd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">👥</div><div className="hd-empty-title">No HHMs found</div><div className="hd-empty-sub">Adjust your search or filter criteria</div></div>
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
            <div key={hhm._id || `hhm-${idx}`} className={`hhm-card-premium ${!isAvailable ? 'busy' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              
              {/* TOP SECTION */}
              <div className="hhm-card-top">
                <div className="hhm-avatar-box">
                  {getInitials(hhm.name)}
                  <div className={`hhm-status-ring ${isAvailable ? 'available' : 'busy'}`}></div>
                </div>
                <div className="hhm-identity">
                  <div className="hhm-name">{hhm.name || 'Unknown HHM'}</div>
                  <div className="hhm-badges">
                    <span className={`hhm-badge-status ${isAvailable ? 'available' : 'busy'}`}>
                      <span className="hhm-dot"></span>
                      {isAvailable ? 'Available' : 'Engaged'}
                    </span>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION */}
              <div className="hhm-card-middle">
                <div className="hhm-info-item">
                  <div className="hhm-ii-label">Location</div>
                  <div className="hhm-ii-val">{hhm.location || 'Not specified'}</div>
                </div>
                <div className="hhm-info-item">
                  <div className="hhm-ii-label">Team Size</div>
                  <div className="hhm-ii-val">{labours || 'Not specified'}</div>
                </div>
                <div className="hhm-info-item">
                  <div className="hhm-ii-label">Experience</div>
                  <div className="hhm-ii-val">{experience ? (experience.toLowerCase().includes('year') || experience.toLowerCase().includes('yr') ? experience : `${experience} yrs`) : 'Not specified'}</div>
                </div>
                <div className="hhm-info-item">
                  <div className="hhm-ii-label">Reliability</div>
                  <div className="hhm-ii-val text-green">94% Reliable</div>
                </div>
                
                <div className="hhm-info-item full-width mt-1">
                  <div className="hhm-ii-label">Associated Factory</div>
                  <div className="hhm-ii-val factory-val">{factoryNames}</div>
                </div>
              </div>

              {/* BOTTOM SECTION */}
              <div className="hhm-card-bottom">
                <button 
                  className="hhm-btn-primary"
                  onClick={() => navigate(`/farmer/hhms/${hhm._id}/contract`)}
                  disabled={!isAvailable}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Send Request
                </button>
                <button 
                  className="hhm-btn-secondary"
                  onClick={() => navigate(`/farmer/hhm-directory/${hhm._id}`)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
