import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ListingDetailsPage.css';

/**
 * ListingDetailsPage Component
 * 
 * Professional agricultural marketplace product page
 */
const ListingDetailsPage = () => {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(location.state?.listing || null);
  const [loading, setLoading] = useState(!listing);
  const [error, setError] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [listingOrders, setListingOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Navigation function
  const navigateToMarketplace = () => {
    navigate('/farmer/marketplace');
  };
  
  // Buy form state
  const [buyForm, setBuyForm] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    quantityWanted: '',
    proposedPrice: '',
    deliveryLocation: '',
    message: '',
    urgency: 'normal'
  });

  // Fetch listing details if not provided via state
  useEffect(() => {
    const fetchListingDetails = async () => {
      if (listing) return;
      
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`http://localhost:5000/api/listings/${listingId}`, {
          headers
        });
        
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

  // Fetch orders for this listing
  const fetchListingOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/orders/listing/${listingId}`, {
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

  // Check if current user owns this listing
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userResponse.data.success) {
          const user = userResponse.data.data.user;
          setCurrentUser(user);
          
          if (listing && listing.farmer_id) {
            const listingFarmerId = typeof listing.farmer_id === 'object' 
              ? listing.farmer_id._id 
              : listing.farmer_id;
            
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

  const handleBuyFormChange = (e) => {
    const { name, value } = e.target;
    setBuyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleShowBuyForm = () => {
    if (!listing) return;
    const price = listing.price_details?.price_per_unit || listing.expected_price_per_ton || 0;
    const qty = listing.quantity_available?.value || listing.quantity_in_tons || 0;
    
    setBuyForm(prev => ({
      ...prev,
      quantityWanted: qty,
      proposedPrice: price
    }));
    setShowBuyForm(true);
  };

  const handleSubmitBuyOrder = async (e) => {
    e.preventDefault();
    if (!listing) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to place a buy order');
        navigate('/login');
        return;
      }

      const orderData = {
        listingId: listing._id,
        farmerId: typeof listing.farmer_id === 'object' ? listing.farmer_id._id : listing.farmer_id,
        ...buyForm,
        totalAmount: parseFloat(buyForm.quantityWanted) * parseFloat(buyForm.proposedPrice)
      };

      await axios.post('http://localhost:5000/api/orders/create', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('🎉 Booking inquiry submitted successfully! The farmer will contact you soon.');
      setShowBuyForm(false);
    } catch (err) {
      console.error('Error submitting buy order:', err);
      alert('❌ Failed to submit inquiry. Please try again.');
    }
  };

  const handleShowEditForm = () => {
    navigate(`/farmer/listing/edit/${listingId}`);
  };

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/listings/${listing._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('✅ Listing deleted.');
      navigateToMarketplace();
    } catch (err) {
      alert('❌ Error deleting listing.');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'accepted' }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('✅ Inquiry accepted.');
      fetchListingOrders();
    } catch (error) {
      alert('❌ Error accepting inquiry.');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'rejected' }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('❌ Inquiry rejected.');
      fetchListingOrders();
    } catch (error) {
      alert('❌ Error rejecting inquiry.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(price);
  };

  const nextImage = () => {
    if (!listing?.farm_images) return;
    setCurrentImageIndex((prev) => (prev + 1) % listing.farm_images.length);
  };

  const prevImage = () => {
    if (!listing?.farm_images) return;
    setCurrentImageIndex((prev) => (prev - 1 + listing.farm_images.length) % listing.farm_images.length);
  };

  if (loading) return <div className="ld-loading"><div className="ld-spinner"></div></div>;
  if (error || !listing) return <div className="ld-error"><h2>{error || 'Listing not found'}</h2><button onClick={navigateToMarketplace}>Back to Marketplace</button></div>;

  const farmer = listing.farmer_id;
  const daysUntilHarvest = Math.ceil((new Date(listing.harvest_availability_date) - new Date()) / (1000 * 60 * 60 * 24));
  const pricePerUnit = listing.price_details?.price_per_unit || listing.expected_price_per_ton || 0;
  const quantityAvailable = listing.quantity_available?.value || listing.quantity_in_tons || 0;
  const unit = listing.quantity_available?.unit || 'Guntha';

  return (
    <div className="listing-details-page">
      <div className="ld-container">
        {/* Left Column: Main Info */}
        <div className="ld-main-content">
          <div className="ld-nav">
            <button onClick={navigateToMarketplace} className="ld-back-btn">
              ← Back to Marketplace
            </button>
          </div>

          <div className="ld-hero">
            <div className="ld-main-img">
              {listing.farm_images && listing.farm_images.length > 0 ? (
                <>
                  <img 
                    src={`http://localhost:5000${listing.farm_images[currentImageIndex].url}`} 
                    alt={listing.title} 
                    key={currentImageIndex}
                    className="ld-slide-fade"
                  />
                  
                  {listing.farm_images.length > 1 && (
                    <>
                      <button className="ld-slide-btn prev" onClick={prevImage}>‹</button>
                      <button className="ld-slide-btn next" onClick={nextImage}>›</button>
                      
                      <div className="ld-slide-dots">
                        {listing.farm_images.map((_, i) => (
                          <div 
                            key={i} 
                            className={`ld-slide-dot ${i === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(i)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: '#111' }}>🌾</div>
              )}
              <div className="ld-variety-badge">{listing.sugarcane_variety || listing.crop_variety}</div>
            </div>
            
            <div className="ld-header">
              <div className="ld-title-row">
                <h1 className="ld-title">{listing.title || (listing.crop_variety + ' Sugarcane')}</h1>
                <span className={`ld-status ${listing.status}`}>
                  {listing.status}
                </span>
              </div>

              <div className="ld-summary-strip">
                <div className="ld-summary-item">📍 {listing.location}</div>
                <div className="ld-summary-item">📅 Ready: {daysUntilHarvest > 0 ? formatDate(listing.harvest_availability_date) : 'Now'}</div>
                <div className="ld-summary-item">🌱 {listing.crop_age || '10'} Months Old</div>
                <div className="ld-summary-item">✅ {listing.seed_quality?.disease_free_status || 'Certified Healthy'}</div>
              </div>
            </div>
          </div>

          {/* Quality & Trust Section */}
          <div className="ld-section">
            <h2 className="ld-section-title">✨ Quality & Trust</h2>
            <div className="ld-trust-grid">
              <div className="ld-trust-card">
                <span className="ld-trust-icon">🛡️</span>
                <span className="ld-trust-label">Status</span>
                <span className="ld-trust-val">{listing.seed_quality?.disease_free_status || 'Disease-Free'}</span>
              </div>
              <div className="ld-trust-card">
                <span className="ld-trust-icon">⭐</span>
                <span className="ld-trust-label">Seller Rating</span>
                <span className="ld-trust-val">{listing.sellerRating || '4.8'}/5</span>
              </div>
              <div className="ld-trust-card">
                <span className="ld-trust-icon">🌾</span>
                <span className="ld-trust-label">Successful Sales</span>
                <span className="ld-trust-val">{listing.successfulSales || '24'}+ Sold</span>
              </div>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="ld-section">
            <h2 className="ld-section-title">🚚 Logistics & Delivery</h2>
            <div className="ld-logistics-grid">
              <div className="ld-logistics-item">
                <div className="ld-log-icon">🚛</div>
                <div className="ld-log-info">
                  <h4>Delivery Options</h4>
                  <p>{listing.deliveryAvailable ? `Available within ${listing.delivery_radius || 50}km` : 'Not Available'}</p>
                </div>
              </div>
              <div className="ld-logistics-item">
                <div className="ld-log-icon">🚜</div>
                <div className="ld-log-info">
                  <h4>Self Pickup</h4>
                  <p>{listing.pickupAvailable ? 'Pickup from Farm Site' : 'Not Allowed'}</p>
                </div>
              </div>
              <div className="ld-logistics-item">
                <div className="ld-log-icon">⚡</div>
                <div className="ld-log-info">
                  <h4>Available From</h4>
                  <p>{formatDate(listing.harvest_availability_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="ld-section">
            <h2 className="ld-section-title">📝 Product Details</h2>
            <div className="ld-desc">
              <p><strong>Farming Method:</strong> {listing.farming_method || 'Conventional Agriculture'}</p>
              <p><strong>Irrigation Type:</strong> {listing.irrigation_method || 'Drip Irrigation'}</p>
              <p><strong>Soil Condition:</strong> {listing.soil_type || 'Deep Black Soil'}</p>
              <p><strong>Harvest Condition:</strong> {listing.storage_condition || 'Fresh Field Standing'}</p>
              <br />
              {listing.description || "This premium sugarcane crop is cultivated using optimized agricultural practices. The field is well-maintained with regular nutrition and pest monitoring. Ideal for sugar mills or high-quality seed production."}
            </div>
          </div>

          {/* Gallery */}
          {listing.farm_images && listing.farm_images.length > 1 && (
            <div className="ld-section">
              <h2 className="ld-section-title">📸 Crop Gallery</h2>
              <div className="ld-gallery">
                {listing.farm_images.map((image, index) => (
                  <div key={index} className="ld-gallery-item">
                    <img src={`http://localhost:5000${image.url || image}`} alt={`Farm ${index}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listing Owner Actions */}
          {isOwnListing && (
            <div className="ld-section ld-requests">
              <h2 className="ld-section-title">📋 Active Inquiries ({listingOrders.length})</h2>
              {ordersLoading ? (
                <p>Loading inquiries...</p>
              ) : listingOrders.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No inquiries yet for this listing.</p>
              ) : (
                <div className="ld-request-list">
                  {listingOrders.map((order, index) => (
                    <div key={index} className="ld-request-card">
                      <div className="ld-request-header">
                        <div className="ld-buyer-info">
                          <div className="ld-seller-avatar">👤</div>
                          <div>
                            <p className="ld-buyer-name">{order.buyerDetails?.name || 'Inquirer'}</p>
                            <p className="ld-buyer-meta">{order.buyerDetails?.phone} • {formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`ld-status ${order.status}`}>{order.status}</span>
                      </div>
                      {order.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button className="ld-btn-primary" style={{ padding: '12px', fontSize: '0.85rem' }} onClick={() => handleAcceptOrder(order.orderId)}>Accept</button>
                          <button className="ld-btn-secondary" style={{ margin: 0, padding: '12px', fontSize: '0.85rem', color: 'var(--danger)' }} onClick={() => handleRejectOrder(order.orderId)}>Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Pricing & Action Panel */}
        <div className="ld-sidebar">
          <div className="ld-sticky-panel">
            <div className="ld-card">
              <div className="ld-price-box">
                <span className="ld-price-label">Market Price</span>
                <div className="ld-price-val">
                  {formatPrice(pricePerUnit)}
                  <span className="ld-price-unit">/ {unit.toLowerCase()}</span>
                </div>
              </div>
              
              <div className="ld-qty-strip">
                <span className="ld-qty-label">Total Stock</span>
                <span className="ld-qty-val">{quantityAvailable} {unit}s</span>
              </div>

              {!isOwnListing ? (
                <>
                  <button className="ld-btn-primary" onClick={() => setShowContact(!showContact)}>
                    {showContact ? '📞 View Details' : 'Contact Seller'}
                  </button>
                  <button className="ld-btn-secondary" onClick={handleShowBuyForm}>
                    Send Inquiry
                  </button>
                  <button className="ld-btn-secondary" onClick={() => alert('Listing saved to your favorites!')}>
                    ♡ Save Listing
                  </button>
                  
                  {showContact && (
                    <div className="ld-contact-reveal">
                      <div className="ld-contact-item">
                        <span className="ld-contact-icon">📞</span>
                        <span>{farmer?.phone || '+91 98XXX XXXXX'}</span>
                      </div>
                      <div className="ld-contact-item">
                        <span className="ld-contact-icon">✉️</span>
                        <span>{farmer?.email || 'farmer@example.com'}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button className="ld-btn-primary" onClick={handleShowEditForm}>Edit Listing</button>
                  <button className="ld-btn-secondary" style={{ color: 'var(--danger)' }} onClick={handleDeleteListing}>Delete Listing</button>
                </>
              )}

              {/* Trust Footer in Sticky Card */}
              {!isOwnListing && (
                <div className="ld-seller-card" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div className="ld-seller-profile">
                    <div className="ld-seller-avatar">👤</div>
                    <div className="ld-seller-info">
                      <h3>{farmer?.name || 'Verified Farmer'}</h3>
                      <span className="ld-verified-tag">✅ Verified Premium Seller</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBuyForm && (
        <div className="ld-modal-overlay" onClick={() => setShowBuyForm(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <div className="ld-modal-header">
              <h2 className="ld-title" style={{ fontSize: '1.5rem' }}>Send Inquiry</h2>
              <button className="ld-back-btn" style={{ position: 'static', padding: '5px 10px' }} onClick={() => setShowBuyForm(false)}>✕</button>
            </div>
            <div className="ld-modal-body">
               <form onSubmit={handleSubmitBuyOrder}>
                  <div className="ld-form-group">
                    <label className="ld-label">Your Name</label>
                    <input className="ld-input" type="text" name="buyerName" value={buyForm.buyerName} onChange={handleBuyFormChange} required placeholder="Enter your full name" />
                  </div>
                  <div className="ld-form-group">
                    <label className="ld-label">Quantity Needed ({unit}s)</label>
                    <input className="ld-input" type="number" name="quantityWanted" value={buyForm.quantityWanted} onChange={handleBuyFormChange} required max={quantityAvailable} />
                  </div>
                  <div className="ld-form-group">
                    <label className="ld-label">Proposed Price (per {unit})</label>
                    <input className="ld-input" type="number" name="proposedPrice" value={buyForm.proposedPrice} onChange={handleBuyFormChange} required />
                  </div>
                  <button className="ld-btn-primary" type="submit">Submit Inquiry</button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailsPage;
