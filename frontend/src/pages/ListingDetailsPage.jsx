import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerProfile.css'; // Use global profile CSS for unified layout
import './ListingDetailsPage.css'; // Keep for any listing-specific minor overrides (like the slider dots)

/**
 * ListingDetailsPage Component
 * 
 * Professional agricultural marketplace product page (Unified Aesthetics)
 */
const ListingDetailsPage = () => {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(location.state?.listing || null);
  const [loading, setLoading] = useState(!listing);
  const [error, setError] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [listingOrders, setListingOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const navigateToMarketplace = () => {
    navigate('/farmer/marketplace');
  };
  


  useEffect(() => {
    const fetchListingDetails = async () => {
      if (listing) return;
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`/api/listings/${listingId}`, { headers });
        if (response.data.success) {
          setListing(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError(err.response?.data?.message || 'Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };
    if (listingId) {
      fetchListingDetails();
    }
  }, [listingId, listing]);

  const fetchListingOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/orders/listing/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setListingOrders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching listing orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const userResponse = await axios.get('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userResponse.data.success) {
          const user = userResponse.data.data.user;
          setCurrentUser(user);
          if (listing && listing.farmer_id) {
            const listingFarmerId = typeof listing.farmer_id === 'object' ? listing.farmer_id._id : listing.farmer_id;
            if (listingFarmerId === user.id) {
              setIsOwnListing(true);
              fetchListingOrders();
            }
          }
        }
      } catch (err) {
        console.error('Error checking user:', err);
      }
    };
    checkCurrentUser();
  }, [listing, fetchListingOrders]);

  const handleSendInquiryClick = () => {
    if (!listing) return;
    navigate(`/farmer/listing/inquiry/${listingId}`, { state: { listing } });
  };

  const handleShowEditForm = () => navigate(`/farmer/listing/edit/${listingId}`);

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/listings/${listing._id}`, { headers: { 'Authorization': `Bearer ${token}` }});
      alert('✅ Listing deleted.');
      navigateToMarketplace();
    } catch (err) {
      alert('❌ Error deleting listing.');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${orderId}/status`, { status: 'accepted' }, { headers: { 'Authorization': `Bearer ${token}` }});
      alert('✅ Inquiry accepted.');
      fetchListingOrders();
    } catch (error) {
      alert('❌ Error accepting inquiry.');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${orderId}/status`, { status: 'rejected' }, { headers: { 'Authorization': `Bearer ${token}` }});
      alert('❌ Inquiry rejected.');
      fetchListingOrders();
    } catch (error) {
      alert('❌ Error rejecting inquiry.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const nextImage = () => {
    if (!listing?.farm_images) return;
    setCurrentImageIndex((prev) => (prev + 1) % listing.farm_images.length);
  };

  const prevImage = () => {
    if (!listing?.farm_images) return;
    setCurrentImageIndex((prev) => (prev - 1 + listing.farm_images.length) % listing.farm_images.length);
  };

  if (loading) {
      return (
        <div className="farmer-profile-page" style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
        }}>
          <div className="fp-spinner" style={{ borderTopColor: 'var(--green)' }}></div>
          <div style={{ color: '#f0f5ec', marginLeft: '1rem' }}>Loading Listing...</div>
        </div>
      );
  }

  if (error || !listing) {
      return (
        <div className="farmer-profile-page" style={{ 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
          background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
        }}>
          <div style={{ color: '#ff6b6b', fontSize: '2rem', marginBottom: '1rem' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
          <div style={{ color: '#f0f5ec', marginBottom: '2rem' }}>{error || 'Listing Not Found'}</div>
          <button className="fp-save-btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      );
  }

  const farmer = listing.farmer_id;
  const daysUntilHarvest = Math.ceil((new Date(listing.harvest_availability_date) - new Date()) / (1000 * 60 * 60 * 24));
  const pricePerUnit = listing.price_details?.price_per_unit || listing.expected_price_per_ton || 0;
  const quantityAvailable = listing.quantity_available?.value || listing.quantity_in_tons || 0;
  const unit = listing.quantity_available?.unit || 'Guntha';

  return (
    <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
        <div className="fp-noise" />
        <div className="fp-bg-glow" />

        <div className="fdb-container">
            <button className="fdb-back-btn" onClick={navigateToMarketplace}>← Back to Marketplace</button>
            
            {/* HERO SECTION WITH CAROUSEL */}
            <div className="fdb-hero">
                <div className="fdb-hero-left">
                    <div className="fdb-hero-header">
                        <div className="fdb-hero-info" style={{ width: '100%' }}>
                            <div className="fdb-hero-title-wrap">
                                <h1 className="fdb-hero-title">{listing.title || (listing.crop_variety + ' Sugarcane')}</h1>
                                <span className="fdb-badge-verified" style={{ textTransform: 'capitalize' }}>✓ {listing.status}</span>
                            </div>
                            <div className="fdb-hero-meta">
                                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {listing.location}</span>
                                <span className="fdb-hero-dot">•</span>
                                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'text-bottom', marginRight: '4px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.974 0-5.749-.536-8.227-1.5" /></svg>{listing.crop_age || '10'} Months Old</span>
                            </div>
                            <p className="fdb-hero-tagline">{listing.description || 'Premium sugarcane crop cultivated using optimized agricultural practices.'}</p>
                        </div>
                    </div>
                </div>

                <div className="fdb-hero-right">
                    <div className="fdb-stat-card">
                        <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                        <div className="fdb-stat-data">
                            <div className="fdb-stat-val">{formatPrice(pricePerUnit).replace('.00','').replace('₹','')} <span className="fdb-stat-unit">₹/{unit.toLowerCase()}</span></div>
                            <div className="fdb-stat-lbl">Market Price</div>
                        </div>
                    </div>
                    <div className="fdb-stat-card">
                        <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
                        <div className="fdb-stat-data">
                            <div className="fdb-stat-val">{quantityAvailable} <span className="fdb-stat-unit">{unit}s</span></div>
                            <div className="fdb-stat-lbl">Total Stock</div>
                        </div>
                    </div>
                    <div className="fdb-stat-card">
                        <div className="fdb-stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                        <div className="fdb-stat-data">
                            <div className="fdb-stat-val">{daysUntilHarvest > 0 ? `${daysUntilHarvest}` : '0'} <span className="fdb-stat-unit">Days</span></div>
                            <div className="fdb-stat-lbl">{daysUntilHarvest > 0 ? 'Until Ready' : 'Ready Now'}</div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="fdb-grid-main">
                <div className="fdb-grid-left">
                    {/* PRODUCT DETAILS SECTION */}
                    <section className="fdb-section">
                        <h2 className="fdb-section-title">Product Details</h2>
                        <div className="fdb-overview-grid">
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Farming Method</div>
                                <div className="fdb-info-val">{listing.farming_method || 'Conventional Agriculture'}</div>
                            </div>
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Irrigation Type</div>
                                <div className="fdb-info-val">{listing.irrigation_method || 'Drip Irrigation'}</div>
                            </div>
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Soil Condition</div>
                                <div className="fdb-info-val">{listing.soil_type || 'Deep Black Soil'}</div>
                            </div>
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Harvest Condition</div>
                                <div className="fdb-info-val">{listing.storage_condition || 'Fresh Field Standing'}</div>
                            </div>
                        </div>
                    </section>

                    {/* LOGISTICS SECTION */}
                    <section className="fdb-section">
                        <h2 className="fdb-section-title">Logistics & Delivery</h2>
                        <div className="fdb-benefits-grid">
                            <div className="fdb-benefit-card">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                <span>{listing.deliveryAvailable ? `Delivery within ${listing.delivery_radius || 50}km` : 'Delivery Not Available'}</span>
                            </div>
                            <div className="fdb-benefit-card">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                <span>{listing.pickupAvailable ? 'Self Pickup Allowed' : 'Pickup Not Allowed'}</span>
                            </div>
                            <div className="fdb-benefit-card">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <span>Available {formatDate(listing.harvest_availability_date)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Inquiries */}
                    {isOwnListing && (
                        <section className="fdb-section">
                            <div className="fdb-hhm-header">
                                <h2 className="fdb-section-title" style={{ margin: 0 }}>Active Inquiries</h2>
                                <span className="fdb-hhm-count">{listingOrders.length}</span>
                            </div>
                            
                            <div className="fdb-hhm-grid">
                                {ordersLoading ? (
                                    <div style={{ padding: '20px', color: 'var(--muted)' }}>Loading...</div>
                                ) : listingOrders.length === 0 ? (
                                    <div className="fdb-hhm-empty">
                                        <div className="fdb-hhm-empty-text">No inquiries yet for this listing.</div>
                                    </div>
                                ) : (
                                    listingOrders.map((order, index) => (
                                        <div key={index} className="fdb-hhm-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div className="fdb-hhm-avatar" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(126,200,67,0.1)', color: 'var(--green)', borderRadius: '50%' }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                                    </div>
                                                    <div className="fdb-hhm-info">
                                                        <div className="fdb-hhm-name">{order.buyerDetails?.name || 'Inquirer'}</div>
                                                        <div className="fdb-hhm-role">{order.buyerDetails?.phone} • {formatDate(order.createdAt)}</div>
                                                    </div>
                                                </div>
                                                <span className="fdb-tag" style={{ background: order.status === 'pending' ? 'rgba(255,193,7,0.15)' : 'rgba(126,200,67,0.15)', color: order.status === 'pending' ? '#ffc107' : 'var(--green)', textTransform: 'capitalize' }}>{order.status}</span>
                                            </div>
                                            <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ color: 'var(--muted)' }}>Quantity Requested:</span>
                                                    <span style={{ color: 'var(--white)', fontWeight: 'bold' }}>{order.quantityWanted} {unit}s</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--muted)' }}>Proposed Price:</span>
                                                    <span style={{ color: 'var(--white)', fontWeight: 'bold' }}>₹{order.proposedPrice} /{unit}</span>
                                                </div>
                                            </div>
                                            {order.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                    <button onClick={() => handleAcceptOrder(order.orderId)} style={{ flex: 1, padding: '10px', background: 'var(--green)', color: '#0b0f0b', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Accept</button>
                                                    <button onClick={() => handleRejectOrder(order.orderId)} style={{ flex: 1, padding: '10px', background: 'rgba(220,53,69,0.15)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <div className="fdb-grid-right">
                    {/* SELLER PANEL */}
                    <section className="fdb-section" style={{ background: 'rgba(126,200,67,0.05)', borderColor: 'rgba(126,200,67,0.1)' }}>
                        <h2 className="fdb-section-title">Buy & Connect</h2>
                        <div className="fdb-analytics-wrap" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                            {!isOwnListing ? (
                                <>
                                    <button className="fdb-contact-btn" onClick={handleSendInquiryClick} style={{ background: 'var(--green)', color: '#0b0f0b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Inquiry
                                    </button>
                                    <button className="fdb-contact-btn" onClick={() => setShowContact(!showContact)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg> {showContact ? 'Hide Details' : 'Contact Seller'}
                                    </button>

                                    {showContact && (
                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                <span style={{ color: 'var(--green)', display: 'flex' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg></span>
                                                <span style={{ color: 'var(--white)', fontWeight: 'bold' }}>{farmer?.phone || '+91 98XXX XXXXX'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: 'var(--green)', display: 'flex' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                                                <span style={{ color: 'var(--white)', fontWeight: 'bold' }}>{farmer?.email || 'farmer@example.com'}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button className="fdb-contact-btn" onClick={handleShowEditForm} style={{ background: 'var(--green)', color: '#0b0f0b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Listing
                                    </button>
                                    <button className="fdb-contact-btn" onClick={handleDeleteListing} style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', color: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M10 11v6 M14 11v6"/></svg> Delete Listing
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                    
                    <section className="fdb-section">
                        <h2 className="fdb-section-title">Seller Profile</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '4px 0' }}>
                            <div className="fdb-avatar-lg" style={{ width: '60px', height: '60px', fontSize: '1.2rem' }}>
                                {(farmer?.name || 'V').substring(0, 2).toUpperCase()}
                                <div className="fdb-avatar-ring"></div>
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--white)' }}>{farmer?.name || 'Verified Farmer'}</h3>
                                <span className="fdb-tag" style={{ background: 'rgba(126,200,67,0.15)', color: 'var(--green)', border: 'none', padding: '4px 10px' }}>✓ Premium Seller</span>
                            </div>
                        </div>
                        <div className="fdb-overview-grid" style={{ marginTop: '20px' }}>
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Seller Rating</div>
                                <div className="fdb-info-val" style={{color: 'var(--green)'}}><svg viewBox="0 0 24 24" fill="#f59e0b" width="13" height="13" style={{verticalAlign:'middle',marginRight:2}}><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"/></svg> {listing.sellerRating || '4.8'}/5</div>

                            </div>
                            <div className="fdb-info-card">
                                <div className="fdb-info-lbl">Successful Sales</div>
                                <div className="fdb-info-val">{listing.successfulSales || '24'}+ Sold</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>


    </div>
  );
};

export default ListingDetailsPage;
