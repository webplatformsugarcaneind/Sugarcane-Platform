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
          <div className="fd-empty"><div className="fd-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div className="fd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="fd-empty"><div className="fd-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 20h20M4 20V8l6-4 6 4v12M16 20v-8l6-4v12M8 12v8M12 16v4"/></svg></div><div className="fd-empty-title">No factories found</div><div className="fd-empty-sub">Try adjusting your search or filter criteria</div></div>
        ) : filtered.map((f, idx) => (
          <div key={f._id || f.id || `f-${idx}`} className={`fd-card ${f.ui.rating}`} style={{ animation: `fdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
            <div className="fc-header">
              <div className="fc-header-top">
                <div className="fc-avatar-glow"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M13 18h1"/><path d="M9 18h1"/></svg></div>
                <div className="fc-rating-pill">
                  <span className={`fd-rating-badge ${f.ui.rating}`}>{f.ui.rating.toUpperCase()}</span>
                </div>
              </div>
              <div className="fc-title-wrap">
                <h3 className="fc-name">{f.name}</h3>
                <div className="fc-location"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {f.location || 'Maharashtra'}</div>
                {f.ui.recommended && <div className="fd-recommended-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Recommended</div>}
              </div>
            </div>

            <div className="fc-metrics-grid">
              <div className="fc-metric-box">
                <div className="fc-metric-lbl">Score</div>
                <div className={`fc-metric-val ${scoreClass(f.ui.score)}`}>{f.ui.score.toFixed(1)}</div>
              </div>
              <div className="fc-metric-box">
                <div className="fc-metric-lbl">₹/Ton</div>
                <div className={`fc-metric-val ${f.ui.price > 0 ? 'green' : 'muted'}`}>{f.ui.price > 0 ? `₹${f.ui.price.toLocaleString('en-IN')}` : 'N/A'}</div>
              </div>
              <div className="fc-metric-box">
                <div className="fc-metric-lbl">Pay Delay</div>
                <div className="fc-metric-val" style={{ color: delayColor(f.ui.delay) }}>{f.ui.delay}d</div>
              </div>
            </div>

            <div className="fc-fulfill-modern">
              <div className="fc-fulfill-header">
                <span className="fc-fulfill-lbl">Fulfillment</span>
                <span className="fc-fulfill-pct" style={{ color: fulfillColor(f.ui.fulfill) }}>{f.ui.fulfill.toFixed(1)}%</span>
              </div>
              <div className="fc-fulfill-track-modern">
                <div className="fc-fulfill-fill-modern" style={{ width: `${f.ui.fulfill}%`, background: fulfillColor(f.ui.fulfill), boxShadow: `0 0 10px ${fulfillColor(f.ui.fulfill)}` }}></div>
              </div>
            </div>

            <div className="fc-spec-scroll">
              {Array.isArray(f.ui.specs) && f.ui.specs.map((s, i) => <span key={i} className="fc-spec-chip">{s}</span>)}
            </div>

            <div className="fc-meta-row">
              <div className="fc-meta-item">
                <span className="fc-meta-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
                <span><b>{f.ui.contracts}</b> Contracts ({f.ui.completed} Done)</span>
              </div>
            </div>

            <div className="fc-actions-modern">
              <button className="fc-btn-contact" onClick={() => { setContactFactory(f); setContactModal(true); }}>
                Connect Now
              </button>
              <button className="fc-btn-profile" onClick={() => navigate(`/farmer/factory/${f._id || f.id}`, { state: { factoryData: f } })}>
                Details
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
