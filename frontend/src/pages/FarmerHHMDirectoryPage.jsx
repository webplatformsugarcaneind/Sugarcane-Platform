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
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(h =>
        h.name?.toLowerCase().includes(q) ||
        h.username?.toLowerCase().includes(q) ||
        h.email?.toLowerCase().includes(q) ||
        h.phone?.includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortFilter === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortFilter === 'username') return (a.username || '').localeCompare(b.username || '');
      if (sortFilter === 'email') return (a.email || '').localeCompare(b.email || '');
      return 0;
    });
    setFiltered(list);
  }, [hhms, searchTerm, locationFilter, sortFilter]);

  useEffect(() => { doFilter(); }, [doFilter]);

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const getInitials = n => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';

  const uniqueLocations = [...new Set(hhms.map(h => h.location).filter(Boolean))];
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
            <div className="ph-eyebrow">Farmer View</div>
            <h1 className="hd-title">HHM <em>Directory</em></h1>
            <p className="hd-sub">Connect with Harvest Head Managers in your network — find the right coordinator for your cane deliveries.</p>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="hd-kpi-row">
        <div className="hd-kpi g"><div className="hd-kpi-label">Total HHMs</div><div className="hd-kpi-val g">{kpiTotal}</div><div className="hd-kpi-sub">In directory</div></div>
        <div className="hd-kpi a"><div className="hd-kpi-label">Active HHMs</div><div className="hd-kpi-val a">{kpiActive}</div><div className="hd-kpi-sub">Ready to coordinate</div></div>
        <div className="hd-kpi b"><div className="hd-kpi-label">Locations</div><div className="hd-kpi-val b">{kpiLocations}</div><div className="hd-kpi-sub">Regions covered</div></div>
        <div className="hd-kpi g"><div className="hd-kpi-label">New This Month</div><div className="hd-kpi-val g">{kpiRecent}</div><div className="hd-kpi-sub">Recently joined</div></div>
      </div>

      {/* TOOLBAR */}
      <div className="hd-toolbar">
        <div className="hd-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input type="text" className="hd-search" placeholder="Search by name, username, email or phone…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="hd-filter" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {uniqueLocations.map((loc, i) => <option key={i} value={loc.toLowerCase()}>📍 {loc}</option>)}
        </select>
        <select className="hd-filter" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
          <option value="name">Sort: Name A–Z</option>
          <option value="username">Sort: Username</option>
          <option value="email">Sort: Email</option>
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
        <div className="hd-results-count"><strong>{filtered.length}</strong> of {hhms.length} HHMs found</div>
      </div>

      {/* GRID */}
      <div className={`hd-grid${isListView ? ' list-view' : ''}`}>
        {loading ? (
          <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading HHM directory...</div></div>
        ) : error ? (
          <div className="hd-empty"><div className="hd-empty-icon">⚠️</div><div className="hd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">👥</div><div className="hd-empty-title">No HHMs found</div><div className="hd-empty-sub">Try adjusting your search or filter criteria</div></div>
        ) : filtered.map((hhm, idx) => (
          <div key={hhm._id || `hhm-${idx}`} className={`hd-card ${hhm.isActive !== false ? 'active' : 'inactive'}`} style={{ animation: `hdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
            <div className="hc-header">
              <div className="hc-avatar">👤</div>
              <div className="hc-title-wrap">
                <div className="hc-name">{hhm.name || 'Unknown Name'}</div>
                <div className="hc-username">@{hhm.username}</div>
                <div className="hc-role-badge">Harvest Manager</div>
              </div>
              <div className="hc-status">
                <span className={`hd-status-badge ${hhm.isActive !== false ? 'active' : 'inactive'}`}>
                  {hhm.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            <div className="hc-contact">
              {hhm.email && (
                <div className="hc-contact-item">
                  <span className="hc-contact-icon">📧</span>
                  <span className="hc-contact-text">{hhm.email}</span>
                </div>
              )}
              {hhm.phone && (
                <div className="hc-contact-item">
                  <span className="hc-contact-icon">📱</span>
                  <span className="hc-contact-text">{hhm.phone}</span>
                </div>
              )}
              {hhm.location && (
                <div className="hc-contact-item">
                  <span className="hc-contact-icon">📍</span>
                  <span className="hc-contact-text">{hhm.location}</span>
                </div>
              )}
            </div>

            <div className="hc-divider"></div>

            <div className="hc-meta">
              <div className="hc-meta-item">Member since: <strong>{fmtDate(hhm.createdAt)}</strong></div>
            </div>

            <div className="hc-actions">
              <button className="hd-btn-request" onClick={() => navigate(`/farmer/hhms/${hhm._id}/contract`)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Send Request
              </button>
              <button className="hd-btn-profile" onClick={() => navigate(`/farmer/hhm-directory/${hhm._id}`)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerHHMDirectoryPage;
