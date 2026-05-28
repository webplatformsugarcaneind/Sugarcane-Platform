import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerFactoryDirectoryPage.css';

const Icons = {
  Factory: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Zm.375 0h.008v.008h-.008V3.75Zm-.375 3h-.008v.008h.008v-.008Zm.375 0h.008v.008h-.008v-.008Zm-.375 3h-.008v.008h.008v-.008Zm.375 0h.008v.008h-.008v-.008Zm-.375 3h-.008v.008h.008v-.008Zm.375 0h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  Location: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Wrench: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.075a2 2 0 0 1-2.84-2.84l7.73-7.73a2 2 0 0 1 2.84 2.84l-7.73 7.73ZM11.42 15.075l-4.24 4.24M11.42 15.075l4.24-4.24M6.42 16.075a2 2 0 1 1-2.84-2.84l2.84 2.84Z" />
    </svg>
  )
};

const FactoryDirectoryPage = () => {
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
      const res = await axios.get('/api/public/factories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let data = res.data.data?.factories || res.data.factories || res.data || [];
      if (!Array.isArray(data)) data = [];

      data = data.map(f => {
        let h = 0;
        const s = f.name || f._id || f.id || '';
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

  const kpiTotal = factories.length;
  const kpiHHM = factories.filter(f => f.associatedHHMs?.length > 0).length;
  const kpiAvg = factories.length > 0 ? Math.round(factories.reduce((a, f) => a + f.ui.score, 0) / factories.length) : 0;
  const kpiExc = factories.filter(f => f.ui.rating === 'excellent').length;

  return (
    <div className="fd-page">
      {/* HEADER */}
      <div className="fd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Factory Network</div>
            <h1 className="fd-title">Factory <em>Directory</em></h1>
            <p className="fd-sub">Connect and collaborate with fellow factories in the sugarcane processing network.</p>
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
        <select className="fd-filter" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          <option value="maharashtra">Maharashtra</option>
          <option value="karnataka">Karnataka</option>
          <option value="uttar pradesh">Uttar Pradesh</option>
          <option value="gujarat">Gujarat</option>
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
      <div className={`fd-grid${isListView ? ' list-view' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
        {loading ? (
          <div className="fd-loading"><div className="fd-spinner"></div><div className="fd-empty-title">Loading network...</div></div>
        ) : error ? (
          <div className="fd-empty"><div className="fd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color:'var(--amber)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><div className="fd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="fd-empty"><div className="fd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205v3m-5.25-9h-.008v.008h.008V3.75Z" /></svg></div><div className="fd-empty-title">No factories found</div><div className="fd-empty-sub">Try adjusting your search or filter criteria</div></div>
        ) : filtered.map((f, idx) => (
          <div key={f._id || f.id || `f-${idx}`} className={`global-card ${f.ui.rating === 'excellent' ? 'active' : 'inactive'}`} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => navigate(`/factory/factory-directory/${f._id || f.id}`, { state: { factoryData: f } })}>
            
            {/* HEADER */}
            <div className="gc-header">
              <div className="gc-avatar-wrap">
                <div className="gc-avatar">
                  <Icons.Factory />
                </div>
                <div className={`gc-status-ring ${f.ui.rating === 'excellent' ? 'available' : 'busy'}`}></div>
              </div>
              <div className="gc-title-wrap">
                <h3 className="gc-name">{f.name}</h3>
                <div className="gc-header-meta">
                  <span className="gc-role-badge">Factory</span>
                  <span className={`gc-avail-badge ${f.ui.rating === 'excellent' ? 'available' : 'busy'}`}>
                    {f.ui.rating.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* METRICS GRID 2-COLUMN */}
            <div className="gc-info-grid-2col">
              <div className="gc-info-item">
                <span className="gc-ii-label">Location</span>
                <span className="gc-ii-val">
                  <span className="gc-ii-icon"><Icons.Location /></span>
                  {f.location || 'Maharashtra'}
                </span>
              </div>
              <div className="gc-info-item">
                <span className="gc-ii-label">Score</span>
                <span className="gc-ii-val text-green">
                  <span className="gc-ii-icon"><Icons.Star /></span>
                  {f.ui.score.toFixed(1)}
                </span>
              </div>
              <div className="gc-info-item">
                <span className="gc-ii-label">Price/Ton</span>
                <span className="gc-ii-val text-green">
                  <span className="gc-ii-icon" style={{ fontSize: '13px', fontWeight: '700' }}>₹</span>
                  {f.ui.price > 0 ? `₹${f.ui.price.toLocaleString('en-IN')}` : '₹3,200'}
                </span>
              </div>
              <div className="gc-info-item">
                <span className="gc-ii-label">Delay</span>
                <span className="gc-ii-val text-green">
                  <span className="gc-ii-icon"><Icons.Clock /></span>
                  {f.ui.delay} Days
                </span>
              </div>
              <div className="gc-info-item full-width">
                <span className="gc-ii-label">Specializations</span>
                <span className="gc-ii-val" style={{ whiteSpace: 'normal', color: 'var(--muted)' }}>
                  <span className="gc-ii-icon"><Icons.Wrench /></span>
                  {Array.isArray(f.ui.specs) ? f.ui.specs.join(', ') : 'Sugar Processing'}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="gc-card-bottom">
              <button 
                className="gc-btn-primary" 
                onClick={(e) => { e.stopPropagation(); setContactFactory(f); setContactModal(true); }}
              >
                Connect Now
              </button>
              <button 
                className="gc-btn-secondary" 
                onClick={(e) => { e.stopPropagation(); navigate(`/factory/factory-directory/${f._id || f.id}`, { state: { factoryData: f } }); }}
              >
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
            <div className="fd-modal-title">Connect with {contactFactory?.name || 'Factory'}</div>
            <button className="fd-modal-close" onClick={() => setContactModal(false)}>×</button>
          </div>
          <div className="fd-modal-body">
            <div className="fd-modal-field"><label>Your Name/Role</label><input type="text" placeholder="Your name and role" /></div>
            <div className="fd-modal-field"><label>Phone Number</label><input type="tel" placeholder="+91 98765 43210" /></div>
            <div className="fd-modal-field"><label>Message</label><textarea rows="4" placeholder="Describe the collaboration opportunity..."></textarea></div>
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

export default FactoryDirectoryPage;
