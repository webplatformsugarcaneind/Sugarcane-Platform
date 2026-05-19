import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerFactoryDirectoryPage.css';

const HHMFactoryDirectoryPage = () => {
  const navigate = useNavigate();
  const [factories, setFactories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('score');
  const [isListView, setIsListView] = useState(false);

  // Invitation Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState(null);

  useEffect(() => { fetchFactories(); }, []);

  const fetchFactories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found.'); return; }
      
      const res = await axios.get('/api/public/factories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let data = res.data.data?.factories || res.data.factories || res.data.data || res.data || [];
      if (!Array.isArray(data)) data = [];
      
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
        // Derived operational fields
        const tonnage = 2000 + (h % 8000);
        const onTime = Math.min(99, 55 + (h % 44));
        const reliability = onTime >= 85 ? 'High' : onTime >= 70 ? 'Medium' : 'Low';
        const reliabilityColor = onTime >= 85 ? 'var(--green)' : onTime >= 70 ? 'var(--amber)' : 'var(--red)';
        const statusLabel = rating === 'poor' ? 'Seasonal Closed' : fulfill > 80 ? 'Crushing Active' : contracts > 25 ? 'High Demand' : 'Intake Open';
        const statusColor = rating === 'poor' ? 'red' : fulfill > 80 ? 'green' : contracts > 25 ? 'amber' : 'blue';
        const capacityUsage = Math.min(98, Math.max(45, Math.round((completed / (contracts || 1)) * 100) + (h % 15)));
        const priorityRegion = h % 3 === 0 ? 'Sangli' : h % 3 === 1 ? 'Kolhapur' : 'Pune';
        const pendingReqs = h % 5;
        return { ...f, ui: { price, score, rating, delay, contracts, completed, fulfill, recommended, specs, tonnage, onTime, reliability, reliabilityColor, statusLabel, statusColor, capacityUsage, priorityRegion, pendingReqs } };
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

  const handleInitiatePartnership = (f) => {
    const factoryId = f._id || f.id || f.userId;
    if (!factoryId) {
      alert('Cannot send invitation: Factory ID not found');
      return;
    }
    setSelectedFactory(f);
    setInvitationMessage('');
    setInvitationSuccess(null);
    setShowInviteModal(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedFactory) return;
    const factoryId = selectedFactory._id || selectedFactory.id || selectedFactory.userId;
    setSendingInvitation(true);
    setInvitationSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setInvitationSuccess({ type: 'error', message: 'Please login to send invitations' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      const response = await axios.post('/api/hhm/invite-factory', {
        factoryId: factoryId,
        personalMessage: invitationMessage || `I would like to establish a partnership with ${selectedFactory.name}`,
        invitationReason: 'Seeking collaboration opportunities for labour placement and operations'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.success) {
        setInvitationSuccess({ type: 'success', message: `Partnership invitation sent to ${selectedFactory.name} successfully!` });
        setTimeout(() => { setShowInviteModal(false); setSelectedFactory(null); setInvitationMessage(''); }, 2000);
      }
    } catch (err) {
      setInvitationSuccess({ type: 'error', message: err.response?.data?.message || 'Failed to send invitation. Please try again.' });
    } finally {
      setSendingInvitation(false);
    }
  };

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
            <div className="ph-eyebrow">HHM View</div>
            <h1 className="fd-title">Factory <em>Directory</em></h1>
            <p className="fd-sub">Connect with processing facilities for strategic partnerships and labour placement opportunities.</p>
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
      <div className={`fd-grid${isListView ? ' list-view' : ''}`}>
        {loading ? (
          <div className="fd-loading"><div className="fd-spinner"></div><div className="fd-empty-title">Loading factories...</div></div>
        ) : error ? (
          <div className="fd-empty"><div className="fd-empty-title">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="fd-empty"><div className="fd-empty-title">No factories found</div><div className="fd-empty-sub">Try adjusting your search or filters</div></div>
        ) : filtered.map((f, idx) => (
          <div key={f._id || f.id || `f-${idx}`} className={`fd-card ${f.ui.rating}`} style={{ animation:`fdFadeUp .5s var(--ease-out) both`, animationDelay:`${idx*0.04}s` }}>

            {/* HEADER */}
            <div className="fc-header">
              <div className="fc-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <div className="fc-title-wrap">
                <div className="fc-name">{f.name}</div>
                <div className="fc-location">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {f.location || 'Maharashtra'}
                </div>
              </div>
              <span className={`fd-rating-badge ${f.ui.rating}`}>{f.ui.rating === 'excellent' ? 'EXC' : f.ui.rating === 'good' ? 'GOOD' : 'LOW'}</span>
            </div>

            {/* 4 MINI STATS */}
            <div className="fc-stats-row">
              <div className="fc-stat">
                <div className="fc-stat-val" style={{ color:'var(--green)' }}>₹{(f.ui.price/1000).toFixed(1)}k</div>
                <div className="fc-stat-lbl">/ Ton</div>
              </div>
              <div className="fc-stat">
                <div className="fc-stat-val" style={{ color: fulfillColor(f.ui.fulfill) }}>{f.ui.fulfill.toFixed(0)}%</div>
                <div className="fc-stat-lbl">Fulfill</div>
              </div>
              <div className="fc-stat">
                <div className="fc-stat-val" style={{ color: delayColor(f.ui.delay) }}>{f.ui.delay}d</div>
                <div className="fc-stat-lbl">Delay</div>
              </div>
              <div className="fc-stat">
                <div className="fc-stat-val" style={{ color:'var(--amber)' }}>{f.ui.capacityUsage}%</div>
                <div className="fc-stat-lbl">Usage</div>
              </div>
            </div>

            {/* SLIM FULFILLMENT BAR */}
            <div className="fc-bar-wrap">
              <div className="fc-bar-track"><div className="fc-bar-fill" style={{ width:`${f.ui.fulfill}%`, background: fulfillColor(f.ui.fulfill) }}/></div>
            </div>

            {/* STATUS TAG */}
            <div className="fc-tags-row">
              <span className={`fc-status-pill ${f.ui.statusColor}`}>{f.ui.statusLabel}</span>
            </div>

            {/* DEMAND INSIGHTS */}
            <div className="fc-demand-insights" style={{ padding: '0 16px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--white)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3z"/></svg> 
                Needs {f.ui.tonnage.toLocaleString()} Tons
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> 
                Priority: {f.ui.priorityRegion}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 
                Intake Until Mar 28
              </div>
            </div>

            {/* PARTNERSHIP INFO & FOOTER */}
            <div className="fc-footer" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Active HHMs: <strong style={{ color: 'var(--white)' }}>{f.associatedHHMs?.length || 0}</strong></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Pending: <strong style={{ color: 'var(--amber)' }}>{f.ui.pendingReqs}</strong></div>
              </div>
              <div className="fc-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="fd-btn-contact" onClick={() => handleInitiatePartnership(f)}>Partner</button>
                <button className="fd-btn-profile" onClick={() => navigate(`/hhm/factories/${f._id || f.id}`, { state:{ factoryData:f } })}>Profile</button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* INVITATION MODAL */}
      <div className={`fd-modal-overlay${showInviteModal ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowInviteModal(false); }}>
        <div className="fd-modal">
          <div className="fd-modal-header">
            <div className="fd-modal-title">Invite {selectedFactory?.name || 'Factory'}</div>
            <button className="fd-modal-close" onClick={() => setShowInviteModal(false)}>×</button>
          </div>
          <div className="fd-modal-body">
            {invitationSuccess ? (
              <div style={{ padding: '20px', borderRadius: '12px', background: invitationSuccess.type === 'success' ? 'rgba(126,200,67,.1)' : 'rgba(255,107,107,.1)', color: invitationSuccess.type === 'success' ? 'var(--green)' : 'var(--red)', border: `1px solid ${invitationSuccess.type === 'success' ? 'rgba(126,200,67,.3)' : 'rgba(255,107,107,.3)'}` }}>
                {invitationSuccess.message}
              </div>
            ) : (
              <>
                <div className="fd-modal-field">
                  <label>Message (Optional)</label>
                  <textarea 
                    rows="4" 
                    placeholder="Describe why you want to partner (labour placement, etc.)"
                    value={invitationMessage}
                    onChange={(e) => setInvitationMessage(e.target.value)}
                  ></textarea>
                </div>
                <div className="fd-modal-actions">
                  <button className="fd-modal-cancel" onClick={() => setShowInviteModal(false)} disabled={sendingInvitation}>Cancel</button>
                  <button className="fd-modal-primary" onClick={handleSendInvitation} disabled={sendingInvitation}>
                    {sendingInvitation ? 'Sending...' : 'Send Invitation →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HHMFactoryDirectoryPage;
