import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * ListingDetailsPage Component
 * 
 * Detailed view of a single crop listing with buy functionality
 */
const ListingDetailsPage = () => {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(location.state?.listing || null);
  const [loading, setLoading] = useState(!listing);
  const [error, setError] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [_currentUser, setCurrentUser] = useState(null);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [listingOrders, setListingOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Edit form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    crop_variety: '',
    quantity_in_tons: '',
    expected_price_per_ton: '',
    harvest_availability_date: '',
    location: '',
    description: '',
    status: 'active'
  });
  const [isUpdating, setIsUpdating] = useState(false);
  
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
      if (listing) return; // Already have listing data
      
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get(`http://localhost:5000/api/listings/${listingId}`, {
          headers
        });
        
        setListing(response.data.data);
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

  // Fetch orders for this listing (only for listing owner)
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
          
          // Check if this user owns the listing
          if (listing && listing.farmer_id) {
            // farmer_id can be either an object with _id or a string ID
            const listingFarmerId = typeof listing.farmer_id === 'object' 
              ? listing.farmer_id._id 
              : listing.farmer_id;
            
            if (listingFarmerId === user.id) {
              setIsOwnListing(true);
              // Fetch orders for this listing if user owns it
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
    setBuyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowBuyForm = () => {
    if (!listing) return;
    
    setBuyForm(prev => ({
      ...prev,
      quantityWanted: listing.quantity_in_tons,
      proposedPrice: listing.expected_price_per_ton
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
        farmerId: listing.farmer_id._id,
        ...buyForm,
        totalAmount: parseFloat(buyForm.quantityWanted) * parseFloat(buyForm.proposedPrice)
      };

      await axios.post('http://localhost:5000/api/orders/create', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('🎉 Buy order submitted successfully! The farmer will contact you soon.');
      setShowBuyForm(false);
      setBuyForm({
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        quantityWanted: '',
        proposedPrice: '',
        deliveryLocation: '',
        message: '',
        urgency: 'normal'
      });

    } catch (err) {
      console.error('Error submitting buy order:', err);
      alert('❌ Failed to submit buy order. Please try again.');
    }
  };

  // Edit form handlers
  const handleShowEditForm = () => {
    if (!listing) return;
    
    // Pre-fill the edit form with current listing data
    setEditForm({
      title: listing.title || '',
      crop_variety: listing.crop_variety || '',
      quantity_in_tons: listing.quantity_in_tons?.toString() || '',
      expected_price_per_ton: listing.expected_price_per_ton?.toString() || '',
      harvest_availability_date: listing.harvest_availability_date ? listing.harvest_availability_date.split('T')[0] : '',
      location: listing.location || '',
      description: listing.description || '',
      status: listing.status || 'active'
    });
    setShowEditForm(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEditForm = async (e) => {
    e.preventDefault();
    
    if (!listing) return;

    try {
      setIsUpdating(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to update your listing');
        navigate('/login');
        return;
      }

      // Prepare the update data
      const updateData = {
        title: editForm.title.trim(),
        crop_variety: editForm.crop_variety,
        quantity_in_tons: parseFloat(editForm.quantity_in_tons),
        expected_price_per_ton: parseFloat(editForm.expected_price_per_ton),
        harvest_availability_date: editForm.harvest_availability_date,
        location: editForm.location.trim(),
        description: editForm.description.trim(),
        status: editForm.status
      };

      const response = await axios.put(`http://localhost:5000/api/listings/${listing._id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update the listing state with new data
        setListing(response.data.data);
        setShowEditForm(false);
        alert('✅ Listing updated successfully!');
      } else {
        alert('❌ Failed to update listing: ' + response.data.message);
      }

    } catch (err) {
      console.error('Error updating listing:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update listing. Please try again.';
      alert('❌ ' + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditForm({
      title: '',
      crop_variety: '',
      quantity_in_tons: '',
      expected_price_per_ton: '',
      harvest_availability_date: '',
      location: '',
      description: '',
      status: 'active'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Handle accepting an order request
  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to accept orders');
        return;
      }

      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: 'accepted' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Order accepted successfully!');
        // Refresh the orders list
        fetchListingOrders();
      } else {
        alert('❌ Failed to accept order: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('❌ Failed to accept order. Please try again.');
    }
  };

  // Handle rejecting an order request
  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to reject orders');
        return;
      }

      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: 'rejected' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('❌ Order rejected successfully!');
        // Refresh the orders list
        fetchListingOrders();
      } else {
        alert('❌ Failed to reject order: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('❌ Failed to reject order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading listing details...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/farmer/marketplace')} className="back-btn">
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="error-container">
        <h2>❌ Listing Not Found</h2>
        <p>The listing you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/farmer/marketplace')} className="back-btn">
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  const farmer = listing.farmer_id;
  const daysUntilHarvest = Math.ceil(
    (new Date(listing.harvest_availability_date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const totalValue = listing.quantity_in_tons * listing.expected_price_per_ton;

  return (
    <div className="listing-details-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/farmer/marketplace')} className="back-btn">
          ← Back to Marketplace
        </button>
        <h1>Listing Details</h1>
      </div>

      {/* Main Content */}
      <div className="listing-details-content">
        {/* Listing Information Card */}
        <div className="listing-info-card">
          <div className="listing-header">
            <div className="title-section">
              <h1>{listing.title}</h1>
              <span className="status-badge status-active">
                {listing.status.toUpperCase()}
              </span>
            </div>
            <div className="variety-section">
              <span className="variety-badge">{listing.crop_variety}</span>
            </div>
          </div>

          <div className="listing-details-grid">
            {/* Quantity & Price */}
            <div className="detail-group">
              <h3>📊 Quantity & Pricing</h3>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-icon">⚖️</span>
                  <div className="detail-content">
                    <label>Available Quantity</label>
                    <span className="detail-value">{listing.quantity_in_tons} tons</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <div className="detail-content">
                    <label>Price per Ton</label>
                    <span className="detail-value">{formatPrice(listing.expected_price_per_ton)}</span>
                  </div>
                </div>
                <div className="detail-item total-value">
                  <span className="detail-icon">💎</span>
                  <div className="detail-content">
                    <label>Total Value</label>
                    <span className="detail-value total">{formatPrice(totalValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Timeline */}
            <div className="detail-group">
              <h3>📍 Location & Timeline</h3>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-icon">🌍</span>
                  <div className="detail-content">
                    <label>Farm Location</label>
                    <span className="detail-value">{listing.location}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <label>Harvest Date</label>
                    <span className="detail-value">{formatDate(listing.harvest_availability_date)}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏰</span>
                  <div className="detail-content">
                    <label>Availability</label>
                    <span className="detail-value">
                      {daysUntilHarvest > 0 
                        ? `Ready in ${daysUntilHarvest} days`
                        : 'Available now'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="description-section">
              <h3>📝 Description</h3>
              <div className="description-content">
                <p>{listing.description}</p>
              </div>
            </div>
          )}

          {/* Listing Info */}
          <div className="listing-meta">
            <div className="meta-item">
              <span className="meta-label">Listed on:</span>
              <span className="meta-value">{formatDate(listing.createdAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Last updated:</span>
              <span className="meta-value">{formatDate(listing.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Farmer Information Card */}
        <div className="farmer-info-card">
          <h2>👨‍🌾 Farmer Information</h2>
          
          <div className="farmer-profile">
            <div className="farmer-avatar">
              <span className="avatar-icon">👨‍🌾</span>
            </div>
            <div className="farmer-details">
              <h3>{farmer?.name || 'Unknown Farmer'}</h3>
              <p className="farmer-username">@{farmer?.username}</p>
              {farmer?.location && (
                <p className="farmer-location">📍 {farmer.location}</p>
              )}
            </div>
          </div>

          <div className="contact-info">
            <h4>Contact Details</h4>
            <div className="contact-items">
              {farmer?.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span className="contact-text">{farmer.email}</span>
                </div>
              )}
              {farmer?.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <span className="contact-text">{farmer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnListing ? (
          <div className="action-buttons">
            <button 
              className="buy-btn-primary"
              onClick={handleShowBuyForm}
            >
              🛒 Buy This Sugarcane
            </button>
            <div className="secondary-actions">
              <button 
                className="contact-btn"
                onClick={() => {
                  const message = `Hi ${farmer?.name}, I'm interested in your listing: "${listing.title}". Please let me know if it's still available.`;
                  const mailtoLink = `mailto:${farmer?.email}?subject=Interested in ${listing.crop_variety}&body=${encodeURIComponent(message)}`;
                  window.location.href = mailtoLink;
                }}
              >
                📧 Contact Farmer
              </button>
              <button 
                className="profile-btn"
                onClick={() => navigate(`farmer/${farmer?._id}`)}
              >
                👤 View Profile
              </button>
            </div>
          </div>
          ) : (
          <div className="action-buttons">
            <button 
              className="edit-btn-primary"
              onClick={handleShowEditForm}
            >
              ✏️ Edit Listing
            </button>
            <div className="secondary-actions">
              <button 
                className="status-btn"
                onClick={() => {
                  alert('Status management coming soon!');
                }}
              >
                📊 Manage Status
              </button>
            </div>
          </div>
          )}

          {/* Own Listing - Show Requests and Buy Calls */}
          {isOwnListing && (
            <div className="listing-requests-section">
              <div className="requests-header">
                <h3>📋 Requests & Buy Calls</h3>
                {ordersLoading ? (
                  <div className="loading-indicator">Loading requests...</div>
                ) : (
                  <span className="requests-count">({listingOrders.length} requests)</span>
                )}
              </div>

              {ordersLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading requests...</p>
                </div>
              ) : listingOrders.length === 0 ? (
                <div className="no-requests-message">
                  <div className="no-requests-icon">📭</div>
                  <h4>No requests yet</h4>
                  <p>When other farmers are interested in your sugarcane, their buy requests will appear here.</p>
                  <button 
                    className="back-to-marketplace-btn"
                    onClick={() => navigate('/marketplace')}
                  >
                    ← Back to Marketplace
                  </button>
                </div>
              ) : (
                <div className="requests-list">
                  {listingOrders.map((order, index) => (
                    <div key={order.orderId || index} className="request-card">
                      <div className="request-header">
                        <div className="buyer-info">
                          <div className="buyer-avatar">
                            <span className="avatar-icon">👨‍🌾</span>
                          </div>
                          <div className="buyer-details">
                            <h4>{order.buyerDetails?.name || order.buyer?.name || 'Unknown Buyer'}</h4>
                            <p className="buyer-username">@{order.buyer?.username || 'N/A'}</p>
                            {order.buyer?.location && (
                              <p className="buyer-location">� {order.buyer.location}</p>
                            )}
                          </div>
                        </div>
                        <div className="request-status">
                          <span className={`status-badge status-${order.status}`}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className="request-date">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="request-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-label">Quantity Wanted:</span>
                            <span className="detail-value">{order.orderDetails?.quantityWanted} tons</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Proposed Price:</span>
                            <span className="detail-value">{formatPrice(order.orderDetails?.proposedPrice)}/ton</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Total Amount:</span>
                            <span className="detail-value total-amount">{formatPrice(order.orderDetails?.totalAmount)}</span>
                          </div>
                        </div>

                        {order.orderDetails?.deliveryLocation && (
                          <div className="delivery-location">
                            <span className="detail-label">Delivery Location:</span>
                            <span className="detail-value">📍 {order.orderDetails.deliveryLocation}</span>
                          </div>
                        )}

                        {order.orderDetails?.urgency && order.orderDetails.urgency !== 'normal' && (
                          <div className="urgency-indicator">
                            <span className={`urgency-badge urgency-${order.orderDetails.urgency}`}>
                              {order.orderDetails.urgency === 'high' ? '⚡ High Priority' : 
                               order.orderDetails.urgency === 'urgent' ? '🔥 Urgent' : order.orderDetails.urgency}
                            </span>
                          </div>
                        )}

                        {order.orderDetails?.message && (
                          <div className="buyer-message">
                            <span className="detail-label">Message:</span>
                            <p className="message-text">"{order.orderDetails.message}"</p>
                          </div>
                        )}
                      </div>

                      <div className="buyer-contact">
                        <h5>Buyer Contact:</h5>
                        <div className="contact-details">
                          {order.buyerDetails?.email && (
                            <div className="contact-item">
                              <span className="contact-icon">📧</span>
                              <span className="contact-text">{order.buyerDetails.email}</span>
                            </div>
                          )}
                          {order.buyerDetails?.phone && (
                            <div className="contact-item">
                              <span className="contact-icon">📱</span>
                              <span className="contact-text">{order.buyerDetails.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="request-actions">
                        {order.status === 'pending' && (
                          <div className="action-buttons">
                            <button 
                              className="accept-btn"
                              onClick={() => handleAcceptOrder(order.orderId)}
                            >
                              ✅ Accept
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleRejectOrder(order.orderId)}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                        
                        <div className="contact-buttons">
                          <button 
                            className="contact-buyer-btn"
                            onClick={() => {
                              const message = `Hi ${order.buyerDetails?.name}, Thank you for your interest in my sugarcane listing. I received your request for ${order.orderDetails?.quantityWanted} tons. Let's discuss the details.`;
                              const mailtoLink = `mailto:${order.buyerDetails?.email}?subject=Response to your sugarcane request&body=${encodeURIComponent(message)}`;
                              window.location.href = mailtoLink;
                            }}
                          >
                            📧 Contact Buyer
                          </button>
                          {order.buyer?.username && (
                            <button 
                              className="view-buyer-profile-btn"
                              onClick={() => navigate(`/profile/${order.buyerId}`)}
                            >
                              👤 View Profile
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buy Order Form Modal */}
      {showBuyForm && (
        <div className="modal-overlay" onClick={() => setShowBuyForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Place Buy Order</h2>
              <button 
                className="close-btn"
                onClick={() => setShowBuyForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <p><strong>Crop:</strong> {listing.title}</p>
                <p><strong>Variety:</strong> {listing.crop_variety}</p>
                <p><strong>Available Quantity:</strong> {listing.quantity_in_tons} tons</p>
                <p><strong>Listed Price:</strong> {formatPrice(listing.expected_price_per_ton)}/ton</p>
              </div>

              <form onSubmit={handleSubmitBuyOrder} className="buy-form">
                {/* Form fields same as FarmerPublicProfilePage */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="buyerName">Your Name *</label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      value={buyForm.buyerName}
                      onChange={handleBuyFormChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="buyerEmail">Your Email *</label>
                    <input
                      type="email"
                      id="buyerEmail"
                      name="buyerEmail"
                      value={buyForm.buyerEmail}
                      onChange={handleBuyFormChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="buyerPhone">Your Phone *</label>
                    <input
                      type="tel"
                      id="buyerPhone"
                      name="buyerPhone"
                      value={buyForm.buyerPhone}
                      onChange={handleBuyFormChange}
                      required
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="quantityWanted">Quantity Wanted (tons) *</label>
                    <input
                      type="number"
                      id="quantityWanted"
                      name="quantityWanted"
                      value={buyForm.quantityWanted}
                      onChange={handleBuyFormChange}
                      required
                      min="0.1"
                      max={listing.quantity_in_tons}
                      step="0.1"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="proposedPrice">Proposed Price per Ton *</label>
                    <input
                      type="number"
                      id="proposedPrice"
                      name="proposedPrice"
                      value={buyForm.proposedPrice}
                      onChange={handleBuyFormChange}
                      required
                      min="1000"
                      step="100"
                      placeholder="Enter your proposed price"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="urgency">Urgency</label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={buyForm.urgency}
                      onChange={handleBuyFormChange}
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryLocation">Delivery Location *</label>
                  <input
                    type="text"
                    id="deliveryLocation"
                    name="deliveryLocation"
                    value={buyForm.deliveryLocation}
                    onChange={handleBuyFormChange}
                    required
                    placeholder="Enter delivery address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Additional Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={buyForm.message}
                    onChange={handleBuyFormChange}
                    rows="4"
                    placeholder="Any additional details or special requirements..."
                  />
                </div>

                {buyForm.quantityWanted && buyForm.proposedPrice && (
                  <div className="order-total">
                    <span className="total-label">Total Order Value:</span>
                    <span className="total-amount">
                      {formatPrice(parseFloat(buyForm.quantityWanted || 0) * parseFloat(buyForm.proposedPrice || 0))}
                    </span>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" onClick={() => setShowBuyForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    � Place Buy Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Form Modal */}
      {showEditForm && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Listing</h2>
              <button 
                className="close-btn"
                onClick={handleCancelEdit}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmitEditForm} className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editTitle">Listing Title *</label>
                    <input
                      type="text"
                      id="editTitle"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      required
                      placeholder="e.g., Fresh Sugarcane Harvest 2024"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editCropVariety">Crop Variety *</label>
                    <input
                      type="text"
                      id="editCropVariety"
                      name="crop_variety"
                      value={editForm.crop_variety}
                      onChange={handleEditFormChange}
                      required
                      placeholder="e.g., Co-86032"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editQuantity">Quantity (tons) *</label>
                    <input
                      type="number"
                      id="editQuantity"
                      name="quantity_in_tons"
                      value={editForm.quantity_in_tons}
                      onChange={handleEditFormChange}
                      required
                      min="0.1"
                      step="0.1"
                      placeholder="Enter quantity in tons"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPrice">Expected Price per Ton (₹) *</label>
                    <input
                      type="number"
                      id="editPrice"
                      name="expected_price_per_ton"
                      value={editForm.expected_price_per_ton}
                      onChange={handleEditFormChange}
                      required
                      min="1000"
                      step="100"
                      placeholder="Enter price per ton"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editHarvestDate">Harvest Availability Date *</label>
                    <input
                      type="date"
                      id="editHarvestDate"
                      name="harvest_availability_date"
                      value={editForm.harvest_availability_date}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editLocation">Location *</label>
                    <input
                      type="text"
                      id="editLocation"
                      name="location"
                      value={editForm.location}
                      onChange={handleEditFormChange}
                      required
                      placeholder="e.g., Pune, Maharashtra"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="editStatus">Status *</label>
                  <select
                    id="editStatus"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editDescription">Description</label>
                  <textarea
                    id="editDescription"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    rows="4"
                    placeholder="Add any additional details about your sugarcane..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="cancel-btn"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isUpdating}
                  >
                    {isUpdating ? '⏳ Updating...' : '✅ Update Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Form Modal */}
      {showEditForm && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Listing</h2>
              <button 
                className="close-btn"
                onClick={handleCancelEdit}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmitEditForm} className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editTitle">Listing Title *</label>
                    <input
                      type="text"
                      id="editTitle"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      required
                      placeholder="Enter listing title"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editCropVariety">Crop Variety *</label>
                    <select
                      id="editCropVariety"
                      name="crop_variety"
                      value={editForm.crop_variety}
                      onChange={handleEditFormChange}
                      required
                    >
                      <option value="">Select variety</option>
                      <option value="Sugarcane-Co-62175">Co-62175</option>
                      <option value="Sugarcane-Co-86032">Co-86032</option>
                      <option value="Sugarcane-Co-0238">Co-0238</option>
                      <option value="Sugarcane-Co-94012">Co-94012</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editQuantity">Quantity (tons) *</label>
                    <input
                      type="number"
                      id="editQuantity"
                      name="quantity_in_tons"
                      value={editForm.quantity_in_tons}
                      onChange={handleEditFormChange}
                      required
                      min="0.1"
                      step="0.1"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPrice">Price per Ton (₹) *</label>
                    <input
                      type="number"
                      id="editPrice"
                      name="expected_price_per_ton"
                      value={editForm.expected_price_per_ton}
                      onChange={handleEditFormChange}
                      required
                      min="1000"
                      step="100"
                      placeholder="Enter price per ton"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editDate">Harvest Date *</label>
                    <input
                      type="date"
                      id="editDate"
                      name="harvest_availability_date"
                      value={editForm.harvest_availability_date}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editStatus">Status *</label>
                    <select
                      id="editStatus"
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="editLocation">Location *</label>
                  <input
                    type="text"
                    id="editLocation"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditFormChange}
                    required
                    placeholder="Enter farm/field location"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editDescription">Description</label>
                  <textarea
                    id="editDescription"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    rows="4"
                    placeholder="Additional details about the sugarcane..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={isUpdating}>
                    {isUpdating ? '⏳ Updating...' : '✏️ Update Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .listing-details-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: #5a6268;
        }

        .listing-details-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .listing-info-card, .farmer-info-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .title-section h1 {
          color: #2c5530;
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .status-badge {
          background: #4caf50;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .variety-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
        }

        .listing-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .detail-group h3 {
          color: #2c5530;
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .detail-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .detail-item.total-value {
          background: #e8f5e8;
          border-left: 4px solid #4caf50;
        }

        .detail-icon {
          font-size: 1.5rem;
        }

        .detail-content {
          flex: 1;
        }

        .detail-content label {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-weight: 600;
          color: #333;
        }

        .detail-value.total {
          font-size: 1.2rem;
          color: #2e7d32;
        }

        .description-section {
          margin-bottom: 2rem;
        }

        .description-section h3 {
          color: #2c5530;
          margin: 0 0 1rem 0;
        }

        .description-content {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }

        .description-content p {
          margin: 0;
          line-height: 1.6;
          color: #555;
        }

        .listing-meta {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
          font-size: 0.9rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .meta-label {
          color: #666;
          font-size: 0.8rem;
        }

        .meta-value {
          font-weight: 500;
          color: #333;
        }

        .farmer-info-card h2 {
          color: #2c5530;
          margin: 0 0 1.5rem 0;
        }

        .farmer-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .farmer-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4caf50, #45a049);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }

        .farmer-details h3 {
          margin: 0;
          color: #2c5530;
        }

        .farmer-username {
          color: #666;
          margin: 0.25rem 0;
        }

        .farmer-location {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }

        .contact-info h4 {
          color: #2c5530;
          margin: 0 0 1rem 0;
        }

        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .contact-icon {
          font-size: 1.2rem;
        }

        .contact-text {
          color: #333;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .buy-btn-primary {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 1.25rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        }

        .buy-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
          background: linear-gradient(135deg, #45a049, #388e3c);
        }

        .edit-btn-primary {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
          border: none;
          padding: 1.25rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
        }

        .edit-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 152, 0, 0.4);
          background: linear-gradient(135deg, #f57c00, #ef6c00);
        }

        .status-btn {
          background: linear-gradient(135deg, #9c27b0, #7b1fa2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .status-btn:hover {
          background: linear-gradient(135deg, #7b1fa2, #6a1b9a);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
        }

        .secondary-actions {
          display: flex;
          gap: 1rem;
        }

        .contact-btn, .profile-btn {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .contact-btn:hover, .profile-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        /* Modal styles - same as FarmerPublicProfilePage */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .modal-header h2 {
          color: #2c5530;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.5rem;
        }

        .modal-body {
          padding: 2rem;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .order-summary h3 {
          color: #2c5530;
          margin: 0 0 1rem 0;
        }

        .order-summary p {
          margin: 0.5rem 0;
        }

        .buy-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #2c5530;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4caf50;
        }

        .order-total {
          background: #e8f5e8;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #4caf50;
          margin: 1rem 0;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .submit-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .listing-details-content {
            grid-template-columns: 1fr;
          }
          
          .listing-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .own-listing-message {
          background: linear-gradient(135deg, #e8f5e8, #f0f9f0);
          border: 2px solid #4caf50;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
          text-align: center;
        }

        .listing-requests-section {
          background: linear-gradient(135deg, #f8f9fa, #ffffff);
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .requests-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .requests-header h3 {
          color: #2c5530;
          margin: 0;
          font-size: 1.4rem;
        }

        .requests-count {
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .loading-indicator {
          color: #666;
          font-style: italic;
        }

        .no-requests-message {
          text-align: center;
          padding: 3rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px dashed #dee2e6;
        }

        .no-requests-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-requests-message h4 {
          color: #2c5530;
          margin: 0 0 1rem 0;
          font-size: 1.3rem;
        }

        .no-requests-message p {
          color: #666;
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .request-card {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .request-card:hover {
          border-color: #4caf50;
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .buyer-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .buyer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4caf50, #45a049);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .buyer-details h4 {
          margin: 0;
          color: #2c5530;
          font-size: 1.1rem;
        }

        .buyer-username {
          color: #666;
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }

        .buyer-location {
          color: #666;
          margin: 0;
          font-size: 0.85rem;
        }

        .request-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.status-pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .status-badge.status-accepted {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.status-rejected {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .request-date {
          color: #666;
          font-size: 0.85rem;
        }

        .request-details {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .detail-label {
          color: #666;
          font-size: 0.9rem;
        }

        .detail-value {
          font-weight: 600;
          color: #333;
        }

        .detail-value.total-amount {
          color: #2e7d32;
          font-size: 1.1rem;
        }

        .delivery-location {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #e3f2fd;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .urgency-indicator {
          margin-bottom: 1rem;
        }

        .urgency-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .urgency-badge.urgency-high {
          background: #fff3cd;
          color: #856404;
        }

        .urgency-badge.urgency-urgent {
          background: #f8d7da;
          color: #721c24;
        }

        .buyer-message {
          padding: 1rem;
          background: #f0f9f0;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
          margin-bottom: 1rem;
        }

        .buyer-message .detail-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .message-text {
          margin: 0;
          line-height: 1.6;
          color: #333;
          font-style: italic;
        }

        .buyer-contact {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .buyer-contact h5 {
          margin: 0 0 0.75rem 0;
          color: #2c5530;
          font-size: 0.95rem;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .request-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .contact-buttons {
          display: flex;
          gap: 1rem;
        }

        .accept-btn, .reject-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          font-size: 0.9rem;
        }

        .accept-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
        }

        .reject-btn {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
        }

        .accept-btn:hover {
          background: linear-gradient(135deg, #45a049, #3d8b40);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .reject-btn:hover {
          background: linear-gradient(135deg, #d32f2f, #c62828);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }

        .contact-buyer-btn, .view-buyer-profile-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .view-buyer-profile-btn {
          background: linear-gradient(135deg, #2196f3, #1976d2);
        }

        .contact-buyer-btn:hover, .view-buyer-profile-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .own-listing-info h3 {
          color: #2c5530;
          margin: 0 0 1rem 0;
          font-size: 1.3rem;
        }

        .own-listing-info p {
          color: #666;
          margin: 0 0 1.5rem 0;
        }

        .back-to-marketplace-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }

        .back-to-marketplace-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
        }

        @media (max-width: 768px) {
          .listing-details-page {
            padding: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .secondary-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .buy-btn-primary {
            font-size: 1.1rem;
            padding: 1rem 1.5rem;
          }

          .listing-requests-section {
            padding: 1.5rem;
          }

          .requests-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .request-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .request-status {
            align-items: flex-start;
          }

          .detail-row {
            grid-template-columns: 1fr;
          }

          .request-actions {
            flex-direction: column;
          }

          .delivery-location {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ListingDetailsPage;