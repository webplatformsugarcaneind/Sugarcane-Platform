import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateListingFormNew from '../components/CreateListingFormNew';
import QuickLogin from '../components/QuickLogin';
import './MarketplacePage.css';

/**
 * Premium SVG Icons
 */
const Icons = {
  Sprout: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.974 0-5.749-.536-8.227-1.5" /></svg>),
  CheckCircle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Crop: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" /></svg>),
  HandHarvest: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M7.151 7.15a3 3 0 00-4.029 3.758A3 3 0 003 14.908V16.5h1.591a3 3 0 003.992-3.992A3 3 0 0012.342 8.48l-5.191-1.33z" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>),
  Truck: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25v5.25m0-5.25a4.632 4.632 0 0 0-3.32-3.321C9.624 3.75 8.163 3.75 6.75 3.75h-1.5c-1.413 0-2.874 0-4.23.167a4.632 4.632 0 0 0-3.32 3.322v5.25" /></svg>),
  Store: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75v-3.75a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>),
  User: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>),
  Star: () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>)
};

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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--green)', opacity: 0.6 }}>
              <div style={{ width: '64px', height: '64px' }}><Icons.Crop /></div>
            </div>
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
                <div className="mc-img-placeholder" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--green)', opacity: 0.2 }}>
                  <div style={{ width: '48px', height: '48px' }}><Icons.Crop /></div>
                </div>
              )}
              <div className="mc-badge">{l.sugarcane_variety || l.crop_variety}</div>
            </div>
            
            <div className="mc-content">
              <div className="mc-header">
                <h3 className="mc-title">
                  {l.sugarcane_variety || l.crop_variety || 'Sugarcane'} {l.crop_type || 'Seed Cane'}
                </h3>
                <div className="mc-qty-badge">{l.quantity_available?.value || l.quantity_in_tons || 0} {l.quantity_available?.unit || 'Gunthas'}</div>
              </div>
              
              <div className="mc-info-grid">
                <div className="mc-info-item">
                  <div className="mc-ii-label">Location</div>
                  <div className="mc-ii-val">{l.delivery_location || l.location || 'Not specified'}</div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Asking Price</div>
                  <div className="mc-ii-val text-green">
                    {fmtPrice(l.price_details?.price_per_unit || l.expected_price_per_ton || 0)}
                    <span style={{ fontSize: '0.85em', opacity: 0.8 }}> / {l.quantity_available?.unit || 'Guntha'}</span>
                  </div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Seller</div>
                  <div className="mc-ii-val mc-seller-grid-val">
                    {l.farmer_id?.name || l.farmer_name || 'Verified Farmer'}
                    {(l.isVerifiedFarmer || l.isVerified) && <span className="mc-verified" title="Verified"><Icons.CheckCircle /></span>}
                  </div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Crop Age</div>
                  <div className="mc-ii-val">{l.crop_age ? `${l.crop_age} months` : 'Fresh Harvest'}</div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Harvest Type</div>
                  <div className="mc-ii-val">{l.harvest_method || 'Standard'}</div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Logistics</div>
                  <div className="mc-ii-val">
                    {l.deliveryAvailable || l.delivery_method === 'Farmer Delivery' || l.delivery_method === 'Both' ? 'Delivery' : ''}
                    {l.deliveryAvailable || l.delivery_method === 'Farmer Delivery' || l.delivery_method === 'Both' ? (l.pickupAvailable || l.delivery_method === 'Pickup' || l.delivery_method === 'Both' ? ' • ' : '') : ''}
                    {l.pickupAvailable || l.delivery_method === 'Pickup' || l.delivery_method === 'Both' ? 'Pickup' : ''}
                  </div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Quality</div>
                  <div className={`mc-ii-val ${l.seed_quality?.disease_free_status === 'Certified Disease-Free' ? 'text-green' : ''}`}>
                    {l.seed_quality?.disease_free_status === 'Certified Disease-Free' ? 'Disease-Free' : 'Standard'}
                  </div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-ii-label">Rating</div>
                  <div className="mc-ii-val">
                    <span className="mc-rating-inline" style={{ marginLeft: 0 }}><Icons.Star /> {l.sellerRating || '4.8'} / 5.0</span>
                  </div>
                </div>
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
        .mp-card { background: #161b16; border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #222; animation: mpFadeUp 0.5s ease-out both; }
        .mp-card:hover { transform: translateY(-6px); border-color: var(--green); box-shadow: 0 8px 24px -8px rgba(126,200,67,0.3); }
        .mc-img-wrap { height: 170px; position: relative; background: #000; }
        .mc-img-wrap img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: opacity 0.3s; }
        .mp-card:hover img { opacity: 1; }
        .mc-badge { position: absolute; top: 12px; left: 12px; background: var(--green); color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.75rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .mc-content { padding: 18px; }
        
        .mc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 8px; }
        .mc-title { margin: 0; font-size: 1.1rem; font-weight: 800; line-height: 1.3; color: #fff; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .mc-qty-badge { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; color: #aaa; white-space: nowrap; }
        
        .mc-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .mc-info-item { display: flex; flex-direction: column; gap: 2px; }
        .mc-info-item.full-width { grid-column: 1 / -1; }
        .mc-ii-label { font-size: 0.65rem; color: var(--muted-2); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .mc-ii-val { font-size: 0.85rem; color: var(--white); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mc-ii-val.text-green { color: var(--green); font-weight: 600; }
        
        .mc-seller-grid-val { display: flex; align-items: center; gap: 4px; }
        .mc-verified { color: var(--blue); width: 12px; height: 12px; display: inline-flex; }
        .mc-rating-inline { display: inline-flex; align-items: center; gap: 3px; font-weight: 700; font-size: 0.75rem; color: var(--amber); margin-left: 4px; }
        .mc-rating-inline svg { width: 10px; height: 10px; }
        
        .mc-btn-view { width: 100%; padding: 10px; background: #1a1f1a; border: 1px solid #333; color: #fff; font-weight: 600; font-size: 0.85rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .mp-card:hover .mc-btn-view { background: var(--green); color: #000; border-color: var(--green); }
        
        .mp-action-btn { background: #1a1f1a; border: 1px solid #333; color: #fff; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .mp-action-btn.active { border-color: var(--green); background: rgba(126,200,67,0.15); color: var(--green); }
        .mp-action-btn:hover { background: #222; }
        .mc-svg-icon { display: inline-flex; align-items: center; justify-content: center; width: 1.1em; height: 1.1em; vertical-align: -0.125em; }
      `}</style>
    </div>
  );
};

export default MarketplacePage;
