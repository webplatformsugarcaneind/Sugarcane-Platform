import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateListingFormNew from '../components/CreateListingFormNew';
import QuickLogin from '../components/QuickLogin';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [myListings, setMyListings] = useState([]);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found.'); return; }
      const params = new URLSearchParams();
      if (filterVariety) params.append('crop_variety', filterVariety);
      if (sortBy && sortBy !== 'createdAt') {
        if (sortBy === 'price') params.append('sort', 'price');
        else if (sortBy === 'quantity') params.append('sort', 'quantity');
        else if (sortBy === 'harvest') params.append('sort', 'harvest');
      }
      const res = await axios.get(`http://localhost:5000/api/listings/marketplace?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setListings(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token'); localStorage.removeItem('user');
        window.location.href = '/login'; return;
      }
      setError(err.response?.data?.message || 'Failed to fetch listings.');
    } finally { setLoading(false); }
  }, [filterVariety, sortBy]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleCreateListing = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const res = await axios.post('http://localhost:5000/api/listings/create', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.data.data && res.data.data._id) setListings(prev => [res.data.data, ...prev]);
      setIsModalOpen(false);
      alert('🎉 Listing created successfully!');
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed to create listing.'}`);
      throw err;
    } finally { setIsSubmitting(false); }
  };

  const handleViewDetails = (listing) => {
    if (!listing?._id) { alert('Listing details not available'); return; }
    navigate(`/farmer/listing/${listing._id}`, { state: { listing } });
  };

  const fetchMyListings = async () => {
    try {
      setMyListingsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/listings/my-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setMyListings(res.data.data || []);
    } catch (err) {
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.data.success) setMyListings(userRes.data.data.user.listings || []);
      } catch (e) { console.error('Fallback failed:', e); }
    } finally { setMyListingsLoading(false); }
  };

  const fetchMyOrders = async () => {
    try {
      setMyOrdersLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/orders/received', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setMyOrders(res.data.data || res.data.orders || []);
    } catch (err) { console.error('Error fetching orders:', err); }
    finally { setMyOrdersLoading(false); }
  };

  const viewMyListings = async () => { await fetchMyListings(); setShowMyListings(true); setShowMyOrders(false); };
  const viewMyOrders = async () => { await fetchMyOrders(); setShowMyOrders(true); setShowMyListings(false); };
  const showAllListings = () => { setShowMyListings(false); setShowMyOrders(false); };

  const handleEditListing = (listing) => navigate(`/farmer/listing/${listing._id}`, { state: { listing } });
  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/listings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchMyListings(); alert('Listing deleted!');
    } catch (err) { alert('Failed to delete listing.'); }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login first'); return; }
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'accepted' }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        let msg = '✅ Order accepted!';
        if (res.data.order?.isPartialFulfillment) msg = `🔄 Partial: ${res.data.order.orderDetails.quantityWanted} of ${res.data.order.originalQuantityRequested} tons`;
        alert(msg); await fetchMyOrders();
      } else alert('❌ ' + res.data.message);
    } catch (e) { alert('❌ Failed to accept order.'); }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login first'); return; }
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'rejected' }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { alert('✅ Order rejected!'); await fetchMyOrders(); }
      else alert('❌ ' + res.data.message);
    } catch (e) { alert('❌ Failed to reject order.'); }
  };

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const fmtPrice = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p);
  const daysUntil = d => { const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)); return diff; };

  const filteredListings = listings.filter(l => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return l.title?.toLowerCase().includes(q) || l.crop_variety?.toLowerCase().includes(q) || l.location?.toLowerCase().includes(q);
  });

  const kpiTotal = listings.length;
  const kpiActive = listings.filter(l => l.status === 'active').length;
  const kpiAvgPrice = listings.length > 0 ? Math.round(listings.reduce((a, l) => a + (l.expected_price_per_ton || 0), 0) / listings.length) : 0;
  const kpiTotalTons = listings.reduce((a, l) => a + (l.quantity_in_tons || 0), 0);

  const activeView = showMyListings ? 'my-listings' : showMyOrders ? 'my-orders' : 'all';

  return (
    <div className="mp-page">
      {/* HEADER */}
      <div className="mp-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Farmer Marketplace</div>
            <h1 className="mp-title">Sugarcane <em>Marketplace</em></h1>
            <p className="mp-sub">Discover, list, and trade quality sugarcane crops — connect directly with buyers across the region.</p>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="mp-kpi-row">
        <div className="mp-kpi g"><div className="mp-kpi-label">Total Listings</div><div className="mp-kpi-val g">{kpiTotal}</div><div className="mp-kpi-sub">In marketplace</div></div>
        <div className="mp-kpi a"><div className="mp-kpi-label">Active Listings</div><div className="mp-kpi-val a">{kpiActive}</div><div className="mp-kpi-sub">Available now</div></div>
        <div className="mp-kpi b"><div className="mp-kpi-label">Avg. Price</div><div className="mp-kpi-val b">{fmtPrice(kpiAvgPrice)}</div><div className="mp-kpi-sub">Per tonne</div></div>
        <div className="mp-kpi g"><div className="mp-kpi-label">Total Quantity</div><div className="mp-kpi-val g">{kpiTotalTons.toLocaleString('en-IN')}</div><div className="mp-kpi-sub">Tonnes listed</div></div>
      </div>

      {/* TOOLBAR */}
      <div className="mp-toolbar">
        <div className="mp-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input type="text" className="mp-search" placeholder="Search by title, variety or location…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="mp-filter" value={filterVariety} onChange={e => setFilterVariety(e.target.value)}>
          <option value="">All Varieties</option>
          <option value="Co 86032">Co 86032</option>
          <option value="Co 238">Co 238</option>
          <option value="Co 0233">Co 0233</option>
          <option value="Co 62175">Co 62175</option>
        </select>
        <select className="mp-filter" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Newest</option>
          <option value="price">Sort: Price</option>
          <option value="quantity">Sort: Quantity</option>
          <option value="harvest">Sort: Harvest Date</option>
        </select>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mp-actions-row">
        <button className={`mp-action-btn ${activeView === 'all' ? 'active' : ''}`} onClick={showAllListings}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          All Listings
        </button>
        <button className="mp-action-btn primary" onClick={() => setIsModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          Add Listing
        </button>
        <button className={`mp-action-btn ${activeView === 'my-listings' ? 'active' : ''}`} onClick={viewMyListings}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          My Listings
        </button>
        <button className={`mp-action-btn ${activeView === 'my-orders' ? 'active' : ''}`} onClick={viewMyOrders}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          My Orders
        </button>
      </div>

      {/* MY LISTINGS */}
      {showMyListings && (
        <>
          <div className="mp-section-header">
            <div className="mp-section-title">📋 My Listings</div>
            <span className="mp-section-count">{myListingsLoading ? '...' : `${myListings.length} listings`}</span>
          </div>
          <div className="mp-grid">
            {myListingsLoading ? (
              <div className="mp-loading"><div className="mp-spinner"></div><div className="mp-empty-title">Loading your listings...</div></div>
            ) : myListings.length === 0 ? (
              <div className="mp-empty"><div className="mp-empty-icon">📝</div><div className="mp-empty-title">No listings yet</div><div className="mp-empty-sub">Create your first listing to get started!</div>
                <button className="mp-action-btn primary" onClick={() => setIsModalOpen(true)}>Create Your First Listing</button>
              </div>
            ) : myListings.map((l, idx) => {
              const total = l.quantity_in_tons * l.expected_price_per_ton;
              return (
                <div key={l._id || idx} className="mp-card" style={{ animation: `mpFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                  <div className="mc-header">
                    <div className="mc-title">{l.title}</div>
                    <span className={`mc-status ${l.status}`}>{l.status?.toUpperCase()}</span>
                  </div>
                  <div className="mc-metrics">
                    <div className="mc-metric"><div className="mc-metric-label">Variety</div><div className="mc-metric-val">{l.crop_variety}</div></div>
                    <div className="mc-metric"><div className="mc-metric-label">Quantity</div><div className="mc-metric-val amber">{l.quantity_in_tons} t</div></div>
                    <div className="mc-metric"><div className="mc-metric-label">Price/Ton</div><div className="mc-metric-val">{fmtPrice(l.expected_price_per_ton)}</div></div>
                  </div>
                  <div className="mc-total"><span className="mc-total-label">Total Value</span><span className="mc-total-val">{fmtPrice(total)}</span></div>
                  <div className="mc-divider"></div>
                  <div className="mc-actions triple">
                    <button className="mp-btn-secondary" onClick={() => handleViewDetails(l)}>👁️ View</button>
                    <button className="mp-btn-primary" onClick={() => handleEditListing(l)}>✏️ Edit</button>
                    <button className="mp-btn-danger" onClick={() => handleDeleteListing(l._id, l.title)}>🗑️ Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MY ORDERS */}
      {showMyOrders && (
        <>
          <div className="mp-section-header">
            <div className="mp-section-title">📦 My Orders</div>
            <span className="mp-section-count">{myOrdersLoading ? '...' : `${myOrders.length} orders`}</span>
          </div>
          <div className="mp-grid">
            {myOrdersLoading ? (
              <div className="mp-loading"><div className="mp-spinner"></div><div className="mp-empty-title">Loading your orders...</div></div>
            ) : myOrders.length === 0 ? (
              <div className="mp-empty"><div className="mp-empty-icon">📦</div><div className="mp-empty-title">No orders yet</div><div className="mp-empty-sub">Share your listings to receive orders!</div></div>
            ) : myOrders.map((o, idx) => (
              <div key={o._id || idx} className="mp-card" style={{ animation: `mpFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                <div className="mc-header">
                  <div className="mc-title">🌾 {o.orderDetails?.quantityWanted || 'N/A'} tons</div>
                  <span className={`mc-status ${o.status}`}>{o.status?.toUpperCase()}</span>
                </div>
                <div className="mc-metrics">
                  <div className="mc-metric"><div className="mc-metric-label">Buyer</div><div className="mc-metric-val">{o.buyerDetails?.name || 'N/A'}</div></div>
                  <div className="mc-metric"><div className="mc-metric-label">Price/Ton</div><div className="mc-metric-val amber">{fmtPrice(o.orderDetails?.proposedPrice || 0)}</div></div>
                  <div className="mc-metric"><div className="mc-metric-label">Total</div><div className="mc-metric-val">{fmtPrice(o.orderDetails?.totalAmount || 0)}</div></div>
                </div>
                <div className="mc-details">
                  <div className="mc-detail-item"><span className="mc-detail-icon">📧</span><span className="mc-detail-text">{o.buyerDetails?.email || 'N/A'}</span></div>
                  {o.orderDetails?.deliveryLocation && (
                    <div className="mc-detail-item"><span className="mc-detail-icon">📍</span><span className="mc-detail-text">{o.orderDetails.deliveryLocation}</span></div>
                  )}
                  <div className="mc-detail-item"><span className="mc-detail-icon">⏱️</span><span className="mc-detail-text">Urgency: <strong>{(o.orderDetails?.urgency || 'normal').toUpperCase()}</strong></span></div>
                </div>
                {o.orderDetails?.message && (
                  <div className="mc-message"><div className="mc-message-label">Message</div><div className="mc-message-text">{o.orderDetails.message}</div></div>
                )}
                {o.isPartialFulfillment && (
                  <div className="mc-partial">⚠️ Partial — Original: {o.originalQuantityRequested}t → Fulfilled: {o.orderDetails?.quantityWanted}t</div>
                )}
                <div className="mc-divider"></div>
                <div className="mc-meta"><div className="mc-meta-item">Created: <strong>{fmtDate(o.createdAt)}</strong></div></div>
                {o.status === 'pending' && (
                  <div className="mc-actions">
                    <button className="mp-btn-accept" onClick={() => handleAcceptOrder(o.orderId)}>✅ Accept</button>
                    <button className="mp-btn-reject" onClick={() => handleRejectOrder(o.orderId)}>❌ Reject</button>
                  </div>
                )}
                {o.status !== 'pending' && <div style={{ paddingBottom: '24px' }}></div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ALL LISTINGS */}
      {!showMyListings && !showMyOrders && (
        <>
          <div className="mp-results-meta">
            <div className="mp-results-count"><strong>{filteredListings.length}</strong> listings available</div>
          </div>
          <div className="mp-grid">
            {loading ? (
              <div className="mp-loading"><div className="mp-spinner"></div><div className="mp-empty-title">Loading marketplace...</div></div>
            ) : error ? (
              <div className="mp-empty"><div className="mp-empty-icon">⚠️</div><div className="mp-empty-title">{error}</div></div>
            ) : filteredListings.length === 0 ? (
              <div className="mp-empty"><div className="mp-empty-icon">📦</div><div className="mp-empty-title">No listings found</div><div className="mp-empty-sub">{listings.length === 0 ? 'Be the first to create a listing!' : 'Try adjusting your search.'}</div>
                <button className="mp-action-btn primary" onClick={() => setIsModalOpen(true)}>Create Listing</button>
              </div>
            ) : filteredListings.map((l, idx) => {
              const days = daysUntil(l.harvest_availability_date);
              const total = l.quantity_in_tons * l.expected_price_per_ton;
              return (
                <div key={l._id || idx} className="mp-card" style={{ animation: `mpFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                  <div className="mc-header">
                    <div className="mc-title">{l.title}</div>
                    <span className="mc-status active">ACTIVE</span>
                  </div>
                  <div className="mc-metrics">
                    <div className="mc-metric"><div className="mc-metric-label">Quantity</div><div className="mc-metric-val">{l.quantity_in_tons} t</div></div>
                    <div className="mc-metric"><div className="mc-metric-label">₹/Ton</div><div className="mc-metric-val amber">{fmtPrice(l.expected_price_per_ton)}</div></div>
                    <div className="mc-metric"><div className="mc-metric-label">Harvest</div><div className="mc-metric-val blue">{days > 0 ? `${days}d` : 'Now'}</div></div>
                  </div>
                  <div className="mc-details">
                    <div className="mc-detail-item"><span className="mc-detail-icon">🌾</span><span className="mc-detail-text">Variety: <strong>{l.crop_variety}</strong></span></div>
                    <div className="mc-detail-item"><span className="mc-detail-icon">📍</span><span className="mc-detail-text">{l.location}</span></div>
                  </div>
                  <div className="mc-total"><span className="mc-total-label">Total Value</span><span className="mc-total-val">{fmtPrice(total)}</span></div>
                  {l.description && <div className="mc-desc">{l.description}</div>}
                  <div className="mc-divider"></div>
                  <div className="mc-meta">
                    <div className="mc-meta-item">👤 <strong>{l.farmer_id?.name || 'Unknown'}</strong></div>
                    <div className="mc-meta-item">Posted <strong>{fmtDate(l.createdAt)}</strong></div>
                  </div>
                  <div className="mc-actions single">
                    <button className="mp-btn-primary" onClick={() => handleViewDetails(l)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE LISTING MODAL */}
      {isModalOpen && (
        <div className="mp-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <div className="mp-modal-title">Create New Listing</div>
              <button className="mp-modal-close" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>×</button>
            </div>
            <div className="mp-modal-body">
              <CreateListingFormNew onSubmit={handleCreateListing} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
