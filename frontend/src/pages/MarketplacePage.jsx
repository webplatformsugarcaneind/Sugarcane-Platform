import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
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
  Star: () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Scale: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M6 8l-3 4 3 4M18 8l3 4-3 4" /></svg>)
};

const MarketplacePage = () => {
  const { t } = useTranslation();
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
      if (!token) { setError(t('marketplace.loginRequired')); return; }
      const params = new URLSearchParams();
      if (filterVariety) params.append('crop_variety', filterVariety);
      
      const res = await axios.get(`${API_BASE_URL}/api/listings/marketplace?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || t('marketplace.failedFetch'));
    } finally { setLoading(false); }
  }, [filterVariety, sortBy, t]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleCreateListing = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/listings/create`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, axios handles FormData
        }
      });
      setIsModalOpen(false);
      fetchListings();
      alert(t('marketplace.createSuccess'));
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || t('marketplace.createFailed')}`);
    } finally { setIsSubmitting(false); }
  };

  const handleViewDetails = (listing) => navigate(`/farmer/listing/${listing._id}`, { state: { listing } });

  const fetchMyListings = async () => {
    try {
      setMyListingsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/listings/my-listings`, {
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
            <div className="ph-eyebrow">{t('marketplace.farmerMarketplace')}</div>
            <h1 className="mp-title">{t('marketplace.sugarcaneTitle')} <em>{t('marketplace.marketplaceTitle')}</em></h1>
            <p className="mp-sub">{t('marketplace.sub')}</p>
          </div>
          <button className="btn-base btn-primary" onClick={() => navigate('/farmer/listing/create')}>{t('marketplace.addListing')}</button>
        </div>
      </div>

      <div className="mp-toolbar">
        <input type="text" className="mp-search" placeholder={t('marketplace.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button className={`mp-action-btn ${!showMyListings ? 'active' : ''}`} onClick={showAllListings}>{t('marketplace.allListings')}</button>
        <button className={`mp-action-btn ${showMyListings ? 'active' : ''}`} onClick={viewMyListings}>{t('marketplace.myListings')}</button>
      </div>

      <div className="global-grid">
        {loading ? (
          <div className="mp-loading-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
            <div className="mp-spinner" style={{ border: '4px solid rgba(126,200,67,0.1)', borderTop: '4px solid var(--green)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 20px', animation: 'mpSpin 1s linear infinite' }}></div>
            <p style={{ color: '#888' }}>{t('marketplace.searchingDeals')}</p>
          </div>
        ) : (showMyListings ? myListings : filteredListings).length === 0 ? (
          <div className="mp-empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', background: '#161b16', borderRadius: '20px', border: '1px dashed #333' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--green)', opacity: 0.6 }}>
              <div style={{ width: '64px', height: '64px' }}><Icons.Crop /></div>
            </div>
            <h3>{t('marketplace.noListings')}</h3>
            <p style={{ color: '#888', marginBottom: '25px' }}>{t('marketplace.beFirstList')}</p>
            <button className="btn-base btn-primary" onClick={() => navigate('/farmer/listing/create')}>{t('marketplace.createNewListing')}</button>
          </div>
        ) : (showMyListings ? myListings : filteredListings).map((l, i) => {
          return (
            <div key={l._id} className={`global-card inactive`} onClick={() => handleViewDetails(l)}>




              {/* INFO GRID (2 COLUMN) */}
              <div className="gc-info-grid-2col">
                <div className="gc-info-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="gc-ii-label">Crop</span>
                  <span className="gc-ii-val" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'var(--white)' }}>
                    <span className="mc-svg-icon text-green" style={{ marginRight: '6px' }}><Icons.Sprout /></span>
                    {l.sugarcane_variety || l.crop_variety || 'Sugarcane'} {l.crop_type || 'Seed Cane'}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">{t('marketplace.seller')}</span>
                  <span className="gc-ii-val" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mc-svg-icon text-green" style={{ marginRight: '6px' }}><Icons.User /></span>
                    {l.farmer_id?.name || l.farmer_name || t('marketplace.verifiedFarmer')}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">Location</span>
                  <span className="gc-ii-val" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mc-svg-icon" style={{ marginRight: '6px' }}><Icons.Location /></span>
                    {l.delivery_location || l.location || t('farmerContracts.notSpecified')}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">Price</span>
                  <span className="gc-ii-val text-green" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mc-svg-icon text-green" style={{ marginRight: '6px' }}><Icons.Store /></span>
                    {fmtPrice(l.price_details?.price_per_unit || l.expected_price_per_ton || 0)} / {l.quantity_available?.unit || 'Guntha'}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">Qty</span>
                  <span className="gc-ii-val" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mc-svg-icon" style={{ marginRight: '6px' }}><Icons.Scale /></span>
                    {l.quantity_available?.value || l.quantity_in_tons || 0} {l.quantity_available?.unit || 'Gunthas'}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">Age</span>
                  <span className="gc-ii-val" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mc-svg-icon text-amber" style={{ marginRight: '6px' }}><Icons.Clock /></span>
                    {l.crop_age ? `${l.crop_age}mo` : 'Fresh'}
                  </span>
                </div>
                <div className="gc-info-item">
                  <span className="gc-ii-label">Harvest</span>
                  <span className="gc-ii-val" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mc-svg-icon text-green" style={{ marginRight: '6px' }}><Icons.HandHarvest /></span>
                    {l.harvest_method === 'Manual' ? t('marketplace.manual') : t('marketplace.machine')}
                  </span>
                </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="gc-card-bottom">
                <button className="gc-btn-primary" style={{ gridColumn: '1 / -1' }} onClick={(e) => { e.stopPropagation(); handleViewDetails(l); }}>{t('marketplace.viewDetails')}</button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes mpSpin { to { transform: rotate(360deg); } }
        @keyframes mpFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .mp-page { padding: 40px 24px; background: #0b0f0b; min-height: 100vh; color: #fff; width: 100%; box-sizing: border-box; }
        .mp-title em { color: var(--green); font-style: normal; }
        .mp-toolbar { display: flex; gap: 20px; margin: 30px 0; }
        .mp-search { flex: 1; background: #1a1f1a; border: 1px solid #333; padding: 15px 25px; border-radius: 12px; color: #fff; font-size: 1rem; transition: border-color 0.2s; }
        .mp-search:focus { border-color: var(--green); outline: none; background: #222; }
      `}</style>
    </div>
  );
};

export default MarketplacePage;
