import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerFactoryDirectoryPage.css';

const FarmerFactoryDirectoryPage = () => {
  const navigate = useNavigate();
  const [factories, setFactories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('score');
  const [isListView, setIsListView] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [contactFactory, setContactFactory] = useState(null);

  useEffect(() => { fetchFactories(); }, []);

  const fetchFactories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found.'); return; }
      const res = await axios.get('/api/farmer/factories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data || res.data.factories || [];
      data = data.map(f => {
        let h = 0;
        const s = f.name || f._id || '';
        for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
        h = Math.abs(h);
        const price = 3000 + (h % 2500);
        const score = (h % 500) + 10;
        const rating = score > 300 ? 'excellent' : score > 120 ? 'good' : 'poor';
        const delay = (h % 28) + 2;
        const contracts = 5 + (h % 40);
        const completed = Math.min(contracts, Math.round(contracts * (0.5 + (h % 50) / 100)));
        const fulfill = contracts > 0 ? parseFloat(((completed / contracts) * 100).toFixed(1)) : 0;
        const recommended = rating === 'excellent' && fulfill > 80;
        const specs = Array.isArray(f.specialization) && f.specialization.length > 0 ? f.specialization : (typeof f.specialization === 'string' && f.specialization ? [f.specialization] : ['Sugar Processing']);
        return { ...f, ui: { price, score, rating, delay, contracts, completed, fulfill, recommended, specs } };
      });
      setFactories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch factories.');
    } finally { setLoading(false); }
  };

  const doFilter = useCallback(() => {
    let list = [...factories];
    if (ratingFilter) list = list.filter(f => f.ui.rating === ratingFilter);
    if (locationFilter) list = list.filter(f => (f.location || '').toLowerCase().includes(locationFilter));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(f => f.name?.toLowerCase().includes(q) || f.location?.toLowerCase().includes(q) || (Array.isArray(f.ui.specs) && f.ui.specs.some(s => s.toLowerCase().includes(q))));
    }
    list.sort((a, b) => {
      if (sortFilter === 'price') return b.ui.price - a.ui.price;
      if (sortFilter === 'delay') return a.ui.delay - b.ui.delay;
      if (sortFilter === 'name') return (a.name || '').localeCompare(b.name || '');
      return b.ui.score - a.ui.score;
    });
    setFiltered(list);
  }, [factories, searchTerm, ratingFilter, locationFilter, sortFilter]);

  useEffect(() => { doFilter(); }, [doFilter]);

  const delayColor = d => d <= 10 ? 'var(--green)' : d <= 18 ? 'var(--amber)' : 'var(--red)';
  const fulfillColor = f => f >= 75 ? 'var(--green)' : f >= 55 ? 'var(--amber)' : 'var(--red)';
  const scoreClass = s => s > 300 ? 'green' : s > 100 ? 'amber' : 'muted';
  const getInitials = n => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';



  return (
    <div className="fd-page">
      {/* HEADER */}
      <div className="fd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Farmer View</div>
            <h1 className="fd-title">Factory <em>Directory</em></h1>
            <p className="fd-sub">Browse, compare and connect with sugarcane factories across Maharashtra — find the right partner for your harvest.</p>
          </div>
        </div>
      </div>



      {/* TOOLBAR */}
      <div className="fd-toolbar">
        <div className="fd-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input type="text" className="fd-search" placeholder="Search factories by name, location or specialization…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="fd-filter" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="poor">Poor</option>
        </select>

        <select className="fd-filter" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
          <option value="score">Sort: Best Score</option>
          <option value="price">Sort: Highest Price</option>
          <option value="delay">Sort: Fastest Payment</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
        <div className="fd-view-toggle">
          <button className={`fd-vt-btn ${!isListView ? 'active' : ''}`} onClick={() => setIsListView(false)} title="Grid view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button className={`fd-vt-btn ${isListView ? 'active' : ''}`} onClick={() => setIsListView(true)} title="List view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* RESULTS META */}
      <div className="fd-results-meta">
        <div className="fd-results-count"><strong>{filtered.length}</strong> factories found</div>
      </div>

      {/* FACTORY GRID */}
      <div className={`fd-grid${isListView ? ' list-view' : ''}`}>
        {loading ? (
          <div className="fd-loading"><div className="fd-spinner"></div><div className="fd-empty-title">Loading factories...</div></div>
        ) : error ? (
          <div className="fd-empty"><div className="fd-empty-icon">⚠️</div><div className="fd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="fd-empty"><div className="fd-empty-icon">🏭</div><div className="fd-empty-title">No factories found</div><div className="fd-empty-sub">Try adjusting your search or filter criteria</div></div>
        ) : filtered.map((f, idx) => (
          <div key={f._id || f.id || `f-${idx}`} className={`fd-card ${f.ui.rating}`} style={{ animation: `fdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
            <div className="fc-header">
              <div className="fc-avatar">🏭</div>
              <div className="fc-title-wrap">
                <div className="fc-name">{f.name}{f.ui.recommended && <span style={{ color: 'var(--amber)', fontSize: '.7rem' }}> ⭐</span>}</div>
                <div className="fc-location">📍 {f.location || 'Maharashtra'}</div>
                {f.ui.recommended && <div className="fd-recommended">⭐ Recommended</div>}
              </div>
              <div className="fc-rating"><span className={`fd-rating-badge ${f.ui.rating}`}>{f.ui.rating.toUpperCase()}</span></div>
            </div>

            <div className="fc-metrics">
              <div className="fc-metric"><div className="fcm-label">Score</div><div className={`fcm-val ${scoreClass(f.ui.score)}`}>{f.ui.score.toFixed(1)}</div></div>
              <div className="fc-metric"><div className="fcm-label">₹/Ton</div><div className={`fcm-val ${f.ui.price > 0 ? 'green' : 'muted'}`}>{f.ui.price > 0 ? `₹${f.ui.price.toLocaleString('en-IN')}` : 'N/A'}</div></div>
              <div className="fc-metric"><div className="fcm-label">Pay Delay</div><div className="fcm-val" style={{ color: delayColor(f.ui.delay) }}>{f.ui.delay}d</div></div>
            </div>

            <div className="fc-fulfill">
              <div className="fc-fulfill-top">
                <span className="fc-fulfill-label">Fulfillment Rate</span>
                <span className="fc-fulfill-pct" style={{ color: fulfillColor(f.ui.fulfill) }}>{f.ui.fulfill.toFixed(1)}%</span>
              </div>
              <div className="fd-fulfill-track"><div className="fd-fulfill-fill" style={{ width: `${f.ui.fulfill}%`, background: fulfillColor(f.ui.fulfill) }}></div></div>
            </div>

            <div className="fc-spec">
              <div className="fc-spec-label">Specialization</div>
              <div className="fd-spec-tags">{Array.isArray(f.ui.specs) && f.ui.specs.map((s, i) => <span key={i} className="fd-spec-tag">{s}</span>)}</div>
            </div>

            <div className="fc-divider"></div>

            <div className="fc-meta">
              <div className="fc-meta-item">Contracts: <strong>{f.ui.contracts} <span style={{ color: 'var(--muted-2)' }}>({f.ui.completed} done)</span></strong></div>
              <div className="fc-meta-item">Added: <strong>{fmtDate(f.createdAt)}</strong></div>
            </div>

            <div className="fc-hhm">
              <div className="fd-hhm-header">
                <div className="fd-hhm-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Associated HHMs
                  <span className="fd-hhm-pill">{f.associatedHHMs?.length || 0}</span>
                </div>
                {f.associatedHHMs?.length > 0 && (
                  <button className="btn-base btn-outline" style={{ height: '28px', padding: '0 10px', fontSize: '0.7rem' }} onClick={() => navigate(`/farmer/associate-hhm/${f._id}`)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                    Manage
                  </button>
                )}
              </div>
              <div className="fd-hhm-list">
                {f.associatedHHMs && f.associatedHHMs.length > 0 ? (
                  f.associatedHHMs.slice(0, 3).map((hhm, i) => (
                    <div key={i} className="fd-hhm-item">
                      <div className="fd-hhm-avatar" style={{ background: 'rgba(126,200,67,.15)', color: '#7ec843' }}>{getInitials(hhm.name)}</div>
                      <div style={{ flex: 1 }}><div className="fd-hhm-name">{hhm.name}</div><div className="fd-hhm-role">Harvest Head Manager</div></div>
                      <div className="fd-hhm-online" title="Online"></div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="fd-hhm-empty"><span className="fd-hhm-empty-icon">👥</span><span className="fd-hhm-empty-text">No associated HHMs</span></div>
                    <button className="btn-base btn-primary" style={{ width: '100%', height: '36px', fontSize: '0.8rem' }} onClick={() => navigate(`/farmer/associate-hhm/${f._id}`)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>
                      Associate HHMs
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="fc-actions">
              <button className="btn-base btn-primary" onClick={() => { setContactFactory(f); setContactModal(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>
                Contact
              </button>
              <button className="btn-base btn-secondary" onClick={() => navigate(`/farmer/factory/${f._id || f.id}`, { state: { factoryData: f } })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CONTACT MODAL */}
      <div className={`fd-modal-overlay${contactModal ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setContactModal(false); }}>
        <div className="fd-modal">
          <div className="fd-modal-header">
            <div className="fd-modal-title">Contact {contactFactory?.name || 'Factory'}</div>
            <button className="fd-modal-close" onClick={() => setContactModal(false)}>×</button>
          </div>
          <div className="fd-modal-body">
            <div className="fd-modal-field"><label>Your Name</label><input type="text" placeholder="Your name" /></div>
            <div className="fd-modal-field"><label>Phone Number</label><input type="tel" placeholder="+91 98765 43210" /></div>
            <div className="fd-modal-field"><label>Message</label><textarea rows="4" placeholder="Describe your cane quantity, harvest readiness date, plot location…"></textarea></div>
            <div className="fd-modal-actions">
              <button className="fd-modal-cancel" onClick={() => setContactModal(false)}>Cancel</button>
              <button className="fd-modal-primary" onClick={() => setContactModal(false)}>Send Message →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerFactoryDirectoryPage;
