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
      if (!token) { setError('Please login to view listings.'); return; }
      const params = new URLSearchParams();
      if (filterVariety) params.append('crop_variety', filterVariety);
      
      const res = await axios.get(`http://localhost:5000/api/listings/marketplace?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch listings.');
    } finally { setLoading(false); }
  }, [filterVariety, sortBy]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleCreateListing = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/listings/create', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, axios handles FormData
        }
      });
      setIsModalOpen(false);
      fetchListings();
      alert('🎉 Listing created successfully!');
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed to create listing.'}`);
    } finally { setIsSubmitting(false); }
  };

  const handleViewDetails = (listing) => navigate(`/farmer/listing/${listing._id}`, { state: { listing } });

  const fetchMyListings = async () => {
    try {
      setMyListingsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/listings/my-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyListings(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setMyListingsLoading(false); }
  };

  const viewMyListings = async () => { await fetchMyListings(); setShowMyListings(true); setShowMyOrders(false); };
  const showAllListings = () => { setShowMyListings(false); setShowMyOrders(false); };

  const filteredListings = listings.filter(l => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const title = (l.title || "").toLowerCase();
    const variety = (l.sugarcane_variety || l.crop_variety || "").toLowerCase();
    const loc = (l.delivery_location || l.location || "").toLowerCase();
    return title.includes(q) || variety.includes(q) || loc.includes(q);
  });

  const fmtPrice = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="mp-page">
      <div className="mp-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Farmer Marketplace</div>
            <h1 className="mp-title">Sugarcane <em>Marketplace</em></h1>
            <p className="mp-sub">Direct trade platform for premium sugarcane and seeds.</p>
          </div>
          <button className="btn-base btn-primary" onClick={() => navigate('/farmer/listing/create')}>+ Add Listing</button>
        </div>
      </div>

      <div className="mp-toolbar">
        <input type="text" className="mp-search" placeholder="Search variety, location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button className={`mp-action-btn ${!showMyListings ? 'active' : ''}`} onClick={showAllListings}>All Listings</button>
        <button className={`mp-action-btn ${showMyListings ? 'active' : ''}`} onClick={viewMyListings}>My Listings</button>
      </div>

      <div className="mp-grid">
        {loading ? (
          <div className="mp-loading-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
            <div className="mp-spinner" style={{ border: '4px solid rgba(126,200,67,0.1)', borderTop: '4px solid var(--green)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 20px', animation: 'mpSpin 1s linear infinite' }}></div>
            <p style={{ color: '#888' }}>Searching for the best sugarcane deals...</p>
          </div>
        ) : (showMyListings ? myListings : filteredListings).length === 0 ? (
          <div className="mp-empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', background: '#161b16', borderRadius: '20px', border: '1px dashed #333' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌾</div>
            <h3>No Listings Available</h3>
            <p style={{ color: '#888', marginBottom: '25px' }}>Be the first to list your sugarcane crop and connect with buyers!</p>
            <button className="btn-base btn-primary" onClick={() => navigate('/farmer/listing/create')}>+ Create New Listing</button>
          </div>
        ) : (showMyListings ? myListings : filteredListings).map((l, i) => (
          <div key={l._id} className="mp-card" onClick={() => handleViewDetails(l)}>
            <div className="mc-img-wrap">
              {l.farm_images?.[0]?.url ? (
                <img src={`http://localhost:5000${l.farm_images[0].url}`} alt={l.sugarcane_variety || l.crop_variety} />
              ) : (
                <div className="mc-img-placeholder">🌾</div>
              )}
              <div className="mc-badge">{l.sugarcane_variety || l.crop_variety}</div>
            </div>
            
            <div className="mc-content">
              <h3 className="mc-title">
                {l.sugarcane_variety || l.crop_variety || 'Sugarcane'} {l.crop_type || 'Seed Cane'}
              </h3>
              
              <div className="mc-price-row">
                <div className="mc-price-val">
                  {fmtPrice(l.price_details?.price_per_unit || l.expected_price_per_ton || 0)}
                  <span className="mc-unit">/ {l.quantity_available?.unit || 'Guntha'}</span>
                </div>
                <div className="mc-qty-val">Available: {l.quantity_available?.value || l.quantity_in_tons || 0} {l.quantity_available?.unit || 'Gunthas'}</div>
              </div>

              <div className="mc-tags">
                {l.qualityTags && l.qualityTags.length > 0 ? (
                  l.qualityTags.map((tag, idx) => <span key={idx} className="mc-tag">{tag}</span>)
                ) : (
                  <>
                    {l.seed_quality?.disease_free_status === 'Certified Disease-Free' && <span className="mc-tag">✅ Disease-Free</span>}
                    {l.crop_age && <span className="mc-tag">🌱 {l.crop_age}mo Old</span>}
                    {l.harvest_method === 'Manual' && <span className="mc-tag">🌾 Hand Harvested</span>}
                    {!l.crop_age && <span className="mc-tag">🌱 Fresh Harvest</span>}
                  </>
                )}
              </div>

              <div className="mc-loc-row">
                <div className="mc-loc">📍 {l.delivery_location || l.location}</div>
                <div className="mc-delivery">
                  {l.deliveryAvailable || l.delivery_method === 'Farmer Delivery' || l.delivery_method === 'Both' ? '🚚 Delivery' : ''}
                  {l.pickupAvailable || l.delivery_method === 'Pickup' || l.delivery_method === 'Both' ? ' • Pickup' : ''}
                </div>
              </div>

              <div className="mc-seller-row">
                <div className="mc-seller-info">
                  <span className="mc-seller-name">👤 {l.farmer_id?.name || l.farmer_name || 'Verified Farmer'}</span>
                  {(l.isVerifiedFarmer || l.isVerified) && <span className="mc-verified" title="Verified">✅</span>}
                </div>
                <div className="mc-seller-rating">⭐ {l.sellerRating || '4.8'}</div>
              </div>

              <button className="mc-btn-view" onClick={(e) => { e.stopPropagation(); handleViewDetails(l); }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes mpSpin { to { transform: rotate(360deg); } }
        @keyframes mpFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .mp-page { padding: 40px 24px; background: #0b0f0b; min-height: 100vh; color: #fff; width: 100%; box-sizing: border-box; }
        .mp-title em { color: var(--green); font-style: normal; }
        .mp-toolbar { display: flex; gap: 20px; margin: 30px 0; }
        .mp-search { flex: 1; background: #1a1f1a; border: 1px solid #333; padding: 15px 25px; border-radius: 12px; color: #fff; font-size: 1rem; transition: border-color 0.2s; }
        .mp-search:focus { border-color: var(--green); outline: none; background: #222; }
        .mp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px; }
        @media (max-width: 1000px) { .mp-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .mp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .mp-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); } }
        .mp-card { background: #161b16; border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #222; animation: mpFadeUp 0.5s ease-out both; }
        .mp-card:hover { transform: translateY(-8px); border-color: var(--green); box-shadow: 0 10px 30px -10px rgba(126,200,67,0.3); }
        .mc-img-wrap { height: 220px; position: relative; background: #000; }
        .mc-img-wrap img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: opacity 0.3s; }
        .mp-card:hover img { opacity: 1; }
        .mc-badge { position: absolute; top: 20px; left: 20px; background: var(--green); color: #000; padding: 6px 14px; border-radius: 30px; font-weight: bold; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .mc-content { padding: 25px; }
        .mc-title { margin: 0 0 15px; font-size: 1.3rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mc-metrics { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 12px; background: #1a1f1a; border-radius: 12px; }
        .mc-price { color: var(--green); font-weight: 800; font-size: 1.2rem; }
        .mc-loc { color: #888; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
        .mp-action-btn { background: #1a1f1a; border: 1px solid #333; color: #fff; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .mp-action-btn.active { border-color: var(--green); background: rgba(126,200,67,0.15); color: var(--green); }
        .mp-action-btn:hover { background: #222; }
      `}</style>
    </div>
  );
};

export default MarketplacePage;
