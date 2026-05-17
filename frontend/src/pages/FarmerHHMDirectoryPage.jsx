import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerHHMDirectoryPage.css';

const FarmerHHMDirectoryPage = () => {
  const navigate = useNavigate();
  const [hhms, setHhms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
        h.location?.toLowerCase().includes(q)
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
            <div className="ph-eyebrow">Farmer View</div>
            <h1 className="hd-title">HHM <em>Directory</em></h1>
            <p className="hd-sub">Find the right Harvest Manager for your cane deliveries — check availability, team size, and location at a glance.</p>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="hd-kpi-row">
        <div className="hd-kpi g"><div className="hd-kpi-label">Total HHMs</div><div className="hd-kpi-val g">{kpiTotal}</div><div className="hd-kpi-sub">In directory</div></div>
        <div className="hd-kpi a"><div className="hd-kpi-label">Available</div><div className="hd-kpi-val a">{kpiAvailable}</div><div className="hd-kpi-sub">Ready to coordinate</div></div>
        <div className="hd-kpi b"><div className="hd-kpi-label">Locations</div><div className="hd-kpi-val b">{kpiLocations}</div><div className="hd-kpi-sub">Regions covered</div></div>
        <div className="hd-kpi g"><div className="hd-kpi-label">With Team</div><div className="hd-kpi-val g">{kpiWithTeam}</div><div className="hd-kpi-sub">Has labours listed</div></div>
      </div>

      {/* TOOLBAR */}
      <div className="hd-toolbar">
        <div className="hd-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input type="text" className="hd-search" placeholder="Search by name or location…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <select className="hd-filter" value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">✅ Available</option>
          <option value="busy">🔴 Busy</option>
        </select>
        <select className="hd-filter" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
          <option value="name">Sort: Name A–Z</option>
          <option value="location">Sort: Location</option>
          <option value="labour">Sort: Most Labours</option>
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

      {/* RESULTS META */}
      <div className="hd-results-meta">
        <div className="hd-results-count"><strong>{filtered.length}</strong> of {hhms.length} Harvest Managers found</div>
      </div>

      {/* GRID */}
      <div className={`hd-grid${isListView ? ' list-view' : ''}`}>
        {loading ? (
          <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading HHM directory...</div></div>
        ) : error ? (
          <div className="hd-empty"><div className="hd-empty-icon">⚠️</div><div className="hd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">👥</div><div className="hd-empty-title">No HHMs found</div><div className="hd-empty-sub">Try adjusting your search or filter criteria</div></div>
        ) : filtered.map((hhm, idx) => {
          const isAvailable = hhm.isActive !== false;
          const labours = parseLabours(hhm.teamSize);
          const experience = hhm.managementExperience;

          return (
            <div
              key={hhm._id || `hhm-${idx}`}
              className={`hd-card ${isAvailable ? 'active' : 'inactive'}`}
              style={{ animation: `hdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}
            >
              {/* ── TOP: Avatar + Identity + Availability ── */}
              <div className="hc-header">
                <div className="hc-avatar-wrap">
                  <div className="hc-avatar">{getInitials(hhm.name)}</div>
                  <span className={`hc-avail-dot ${isAvailable ? 'available' : 'busy'}`} title={isAvailable ? 'Available' : 'Busy'} />
                </div>
                <div className="hc-title-wrap">
                  <div className="hc-name">{hhm.name || 'Unknown'}</div>
                  <div className="hc-header-meta">
                    <span className="hc-role-badge">Harvest Manager</span>
                    <span className={`hc-avail-badge ${isAvailable ? 'available' : 'busy'}`}>
                      <span className="hc-avail-indicator" />
                      {isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── INFO GRID: Location · Labours · Experience ── */}
              <div className="hc-info-grid">
                {hhm.location && (
                  <div className="hc-info-row">
                    <span className="hc-info-icon">📍</span>
                    <span className="hc-info-label">Location</span>
                    <span className="hc-info-val">{hhm.location}</span>
                  </div>
                )}
                {labours !== null && (
                  <div className="hc-info-row">
                    <span className="hc-info-icon">👷</span>
                    <span className="hc-info-label">Team Size</span>
                    <span className="hc-info-val">{labours}</span>
                  </div>
                )}
                {experience && (
                  <div className="hc-info-row">
                    <span className="hc-info-icon">⭐</span>
                    <span className="hc-info-label">Experience</span>
                    <span className="hc-info-val">{experience} yrs</span>
                  </div>
                )}
                {!hhm.location && labours === null && !experience && (
                  <div className="hc-info-empty">Profile details not filled</div>
                )}
              </div>

              <div className="hc-divider" />

              {/* ── ACTIONS ── */}
              <div className="hc-actions">
                <button
                  className={`btn-base btn-primary ${!isAvailable ? 'disabled' : ''}`}
                  onClick={() => navigate(`/farmer/hhms/${hhm._id}/contract`)}
                  disabled={!isAvailable}
                  title={!isAvailable ? 'This HHM is currently busy' : 'Send a contract request'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Send Request
                </button>
                <button className="btn-base btn-secondary" onClick={() => navigate(`/farmer/hhm-directory/${hhm._id}`)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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

export default FarmerHHMDirectoryPage;
