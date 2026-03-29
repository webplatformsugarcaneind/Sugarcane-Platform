import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateListingForm from '../components/CreateListingForm';

/**
 * MarketplacePage Component
 * 
 * Marketplace page where farmers can view and create crop listings
 * using the new CropListing API endpoints
 */
const MarketplacePage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  
  // My Listings states
  const [myListings, setMyListings] = useState([]);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  
  // My Orders states
  const [myOrders, setMyOrders] = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filterVariety) params.append('crop_variety', filterVariety);
      if (sortBy && sortBy !== 'createdAt') {
        // Map sort options to backend format
        if (sortBy === 'price') params.append('sort', 'price');
        else if (sortBy === 'quantity') params.append('sort', 'quantity');
        else if (sortBy === 'harvest') params.append('sort', 'harvest');
      }

      // Make API request to the new marketplace endpoint
      const response = await axios.get(`http://localhost:5000/api/listings/marketplace?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetched listings response:', response.data);
      setListings(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      
      // Handle authentication errors by redirecting to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      setError(
        err.response?.data?.message || 
        'Failed to fetch listings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [filterVariety, sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCreateListing = async (formData) => {
    try {
      setIsSubmitting(true);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('Creating listing with data:', formData);

      // Make POST request to create new listing
      const response = await axios.post('http://localhost:5000/api/listings/create', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Created listing response:', response.data);
      
      // Add new listing to the state (at the beginning since it's newest)
      if (response.data.data && response.data.data._id) {
        setListings(prev => [response.data.data, ...prev]);
      }
      
      // Close modal
      setIsModalOpen(false);
      
      // Show success message
      alert('🎉 Listing created successfully!');
    } catch (err) {
      console.error('Error creating listing:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create listing. Please try again.';
      alert(`❌ ${errorMessage}`);
      throw err; // Re-throw to let CreateListingForm handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (listing) => {
    if (!listing || !listing._id) {
      alert('Listing details not available');
      return;
    }
    
    // Navigate to listing details page with listing data
    navigate(`/farmer/listing/${listing._id}`, {
      state: { listing }
    });
  };

  const fetchMyListings = async () => {
    try {
      setMyListingsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      // Use the CropListing API which has the actual listings
      const response = await axios.get('http://localhost:5000/api/listings/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const cropListings = response.data.data || [];
        setMyListings(cropListings);
        console.log('📊 Fetched my listings from CropListing API:', cropListings.length, 'listings');
        if (cropListings.length > 0) {
          console.log('📦 Sample listing quantities:', cropListings.map(l => `${l.crop_variety}: ${l.quantity_in_tons} tons`));
        }
      }
    } catch (err) {
      console.error('Error fetching my listings:', err);
      // Fallback to embedded listings if CropListing API fails
      try {
        const token = localStorage.getItem('token');
        console.log('Trying fallback to embedded User.listings...');
        const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userResponse.data.success) {
          const userListings = userResponse.data.data.user.listings || [];
          setMyListings(userListings);
          console.log('📊 Fallback: Fetched embedded listings:', userListings.length, 'listings');
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setMyListingsLoading(false);
    }
  };

  const viewMyListings = async () => {
    await fetchMyListings();
    setShowMyListings(true);
    setShowMyOrders(false); // Hide orders when showing listings
  };

  // Fetch My Orders Function
  const fetchMyOrders = async () => {
    try {
      setMyOrdersLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      // Fetch received orders (orders for farmer's listings)
      const response = await axios.get('http://localhost:5000/api/orders/received', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const orders = response.data.data || response.data.orders || [];
        setMyOrders(orders);
        console.log('📦 Orders fetched:', orders.length);
      }
    } catch (err) {
      console.error('Error fetching my orders:', err);
    } finally {
      setMyOrdersLoading(false);
    }
  };

  const viewMyOrders = async () => {
    await fetchMyOrders();
    setShowMyOrders(true);
    setShowMyListings(false); // Hide listings when showing orders
  };

  const showAllListings = () => {
    setShowMyListings(false);
    setShowMyOrders(false); // Hide both when showing all listings
  };

  const handleEditListing = (listing) => {
    // Navigate to ListingDetailsPage where edit functionality is implemented
    navigate(`/farmer/listing/${listing._id}`, { 
      state: { listing } 
    });
  };

  const handleDeleteListing = async (listingId, listingTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${listingTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/listings/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Refresh my listings
      await fetchMyListings();
      alert('Listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDaysUntilHarvest = (harvestDate) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Order handling functions
  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Show detailed result message
        let message = '✅ Order accepted successfully!';
        
        if (response.data.order && response.data.order.isPartialFulfillment) {
          message = `🔄 Order partially fulfilled!\n`;
          message += `Original request: ${response.data.order.originalQuantityRequested} tons\n`;
          message += `Fulfilled amount: ${response.data.order.orderDetails.quantityWanted} tons\n`;
          message += `Adjusted total: ₹${response.data.order.orderDetails.totalAmount.toLocaleString()}`;
        }
        
        alert(message);
        
        // Refresh orders to show updated status
        await fetchMyOrders();
      } else {
        alert('❌ Failed to accept order: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('❌ Failed to accept order. Please try again.');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Order rejected successfully!');
        // Refresh orders to show updated status
        await fetchMyOrders();
      } else {
        alert('❌ Failed to reject order: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('❌ Failed to reject order. Please try again.');
    }
  };

  // Filter listings based on search term
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.crop_variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <h1>🌾 Sugarcane Marketplace</h1>
          <p className="page-subtitle">Discover and trade quality sugarcane crops</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <button onClick={fetchListings} className="refresh-btn">
            🔄 Refresh
          </button>
          <input
            type="text"
            placeholder="🔍 Search by title, variety, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Sort by: Newest</option>
            <option value="price">Sort by: Price</option>
            <option value="quantity">Sort by: Quantity</option>
            <option value="harvest">Sort by: Harvest Date</option>
          </select>
        </div>
        
        <div className="filter-controls">
          <select
            value={filterVariety}
            onChange={(e) => setFilterVariety(e.target.value)}
            className="filter-select"
          >
            <option value="">All Varieties</option>
            <option value="Co 86032">Co 86032</option>
            <option value="Co 238">Co 238</option>
            <option value="Co 0233">Co 0233</option>
            <option value="Co 62175">Co 62175</option>
          </select>

          <button 
            className="action-btn all-listing-btn"
            onClick={showAllListings}
          >
            📋 All Listing
          </button>
          
          <button 
            className="action-btn add-listing-btn"
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Add Listing
          </button>
          
          <button 
            className="action-btn my-listing-btn"
            onClick={viewMyListings}
          >
            👤 My Listing
          </button>
          
          <button 
            className="action-btn my-orders-btn"
            onClick={viewMyOrders}
          >
            � My Orders
          </button>
        </div>
      </div>

      {/* My Listings Section */}
      {showMyListings && (
        <div className="my-listings-section">
          <div className="my-listings-header">
            <h2>📋 My Listings</h2>
            {myListingsLoading ? (
              <div className="my-listings-loading">Loading...</div>
            ) : (
              <span className="listings-count">({myListings.length} listings)</span>
            )}
          </div>
          
          {myListingsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your listings...</p>
            </div>
          ) : myListings.length === 0 ? (
            <div className="empty-my-listings">
              <div className="empty-icon">📝</div>
              <h3>No listings yet</h3>
              <p>You haven't created any listings yet. Create your first listing to get started!</p>
              <button 
                className="create-first-listing-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="my-listings-grid">
              {myListings.map((listing) => {
                const totalValue = listing.quantity_in_tons * listing.expected_price_per_ton;
                return (
                  <div key={listing._id} className="my-listing-card">
                    <div className="my-listing-header">
                      <h3>{listing.title}</h3>
                      <span className={`my-listing-status status-${listing.status}`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="my-listing-details">
                      <div className="my-listing-detail">
                        <span>Variety</span>
                        <span>{listing.crop_variety}</span>
                      </div>
                      <div className="my-listing-detail">
                        <span>Quantity</span>
                        <span>{listing.quantity_in_tons} tons</span>
                      </div>
                      <div className="my-listing-detail">
                        <span>Price/ton</span>
                        <span>{formatPrice(listing.expected_price_per_ton)}</span>
                      </div>
                      <div className="my-listing-detail">
                        <span>Total Value</span>
                        <span><strong>{formatPrice(totalValue)}</strong></span>
                      </div>
                    </div>
                    
                    <div className="my-listing-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(listing)}
                      >
                        👁️ View Details
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditListing(listing)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteListing(listing._id, listing.title)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Orders Section */}
      {showMyOrders && (
        <div className="my-orders-section">
          <div className="my-orders-header">
            <h2>📦 My Orders</h2>
            {myOrdersLoading ? (
              <div className="my-orders-loading">Loading...</div>
            ) : (
              <span className="orders-count">({myOrders.length} orders)</span>
            )}
          </div>
          
          {myOrdersLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : myOrders.length === 0 ? (
            <div className="empty-my-orders">
              <div className="empty-icon">📝</div>
              <h3>No orders yet</h3>
              <p>You haven't received any orders yet. Share your listings to get orders!</p>
            </div>
          ) : (
            <div className="my-orders-grid">
              {myOrders.map((order) => (
                <div key={order._id} className="my-order-card">
                  <div className="my-order-header">
                    <h3>🌾 {order.orderDetails?.quantityWanted || 'N/A'} tons</h3>
                    <span className={`my-order-status status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="my-order-details">
                    <div className="my-order-detail">
                      <span>Buyer</span>
                      <span>{order.buyerDetails?.name || 'N/A'}</span>
                    </div>
                    <div className="my-order-detail">
                      <span>Contact</span>
                      <span>{order.buyerDetails?.email || 'N/A'}</span>
                    </div>
                    <div className="my-order-detail">
                      <span>Price/ton</span>
                      <span>{formatPrice(order.orderDetails?.proposedPrice || 0)}</span>
                    </div>
                    <div className="my-order-detail">
                      <span>Total Amount</span>
                      <span><strong>{formatPrice(order.orderDetails?.totalAmount || 0)}</strong></span>
                    </div>
                    {order.orderDetails?.deliveryLocation && (
                      <div className="my-order-detail">
                        <span>Delivery</span>
                        <span>{order.orderDetails.deliveryLocation}</span>
                      </div>
                    )}
                    <div className="my-order-detail">
                      <span>Urgency</span>
                      <span className={`urgency-${order.orderDetails?.urgency || 'normal'}`}>
                        {(order.orderDetails?.urgency || 'normal').toUpperCase()}
                      </span>
                    </div>
                    {order.orderDetails?.message && (
                      <div className="my-order-message">
                        <span>Message:</span>
                        <p>{order.orderDetails.message}</p>
                      </div>
                    )}
                    {order.isPartialFulfillment && (
                      <div className="partial-fulfillment-notice">
                        <span>⚠️ Partial Fulfillment</span>
                        <p>Original request: {order.originalQuantityRequested} tons</p>
                        <p>Fulfilled: {order.orderDetails?.quantityWanted} tons</p>
                      </div>
                    )}
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="my-order-actions">
                      <button 
                        className="accept-order-btn"
                        onClick={() => handleAcceptOrder(order.orderId)}
                      >
                        ✅ Accept Order
                      </button>
                      <button 
                        className="reject-order-btn"
                        onClick={() => handleRejectOrder(order.orderId)}
                      >
                        ❌ Reject Order
                      </button>
                    </div>
                  )}
                  
                  <div className="my-order-timestamp">
                    <small>Created: {new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Listings Section - Only show when not viewing My Listings or My Orders */}
      {!showMyListings && !showMyOrders && (
        <div className="listings-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading marketplace listings...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={fetchListings} className="retry-button">
              Try Again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No listings found</h3>
            <p>
              {listings.length === 0 
                ? "Be the first to create a listing in the marketplace!"
                : "Try adjusting your search or filters to find more listings."
              }
            </p>
            <button 
              className="create-first-listing-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            <div className="listings-header">
              <h2>Available Listings ({filteredListings.length})</h2>
            </div>
            
            <div className="listings-grid">
              {filteredListings.map((listing) => {
                const daysUntilHarvest = getDaysUntilHarvest(listing.harvest_availability_date);
                const totalValue = listing.quantity_in_tons * listing.expected_price_per_ton;
                
                return (
                  <div key={listing._id} className="listing-card">
                    <div className="listing-header">
                      <h3 className="listing-title">{listing.title}</h3>
                      <div className="status-badge active">✅ Active</div>
                    </div>

                    <div className="listing-content">
                      <div className="crop-info">
                        <div className="crop-variety">
                          <span className="label">🌾 Variety:</span>
                          <span className="value">{listing.crop_variety}</span>
                        </div>
                      </div>

                      <div className="listing-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-icon">⚖️</span>
                            <span className="detail-text">
                              <strong>{listing.quantity_in_tons}</strong> tons
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            <span className="detail-text">
                              <strong>{formatPrice(listing.expected_price_per_ton)}</strong>/ton
                            </span>
                          </div>
                        </div>

                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span className="detail-text">{listing.location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📅</span>
                            <span className="detail-text">
                              {daysUntilHarvest > 0 
                                ? `${daysUntilHarvest} days`
                                : 'Available now'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="total-value">
                          <span className="total-label">Total Value:</span>
                          <span className="total-amount">{formatPrice(totalValue)}</span>
                        </div>

                        {listing.description && (
                          <div className="description">
                            <p>{listing.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="listing-footer">
                      <div className="seller-info">
                        <div className="seller-name">
                          👤 {listing.farmer_id?.name || 'Unknown Farmer'}
                        </div>
                        <div className="listing-date">
                          Posted {formatDate(listing.createdAt)}
                        </div>
                      </div>
                      
                      <div className="listing-actions">
                        <button 
                          className="view-details-btn"
                          onClick={() => handleViewDetails(listing)}
                        >
                          �️ View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      )}

      {/* Modal for Create Listing Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Listing</h2>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <CreateListingForm 
                onSubmit={handleCreateListing}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .marketplace-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .marketplace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin: 0.5rem 0 0 0;
        }

        .create-listing-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
          white-space: nowrap;
        }

        .create-listing-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }

        .filters-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .search-bar {
          margin-bottom: 1rem;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .search-input {
          flex: 1;
          padding: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4caf50;
        }

        .sort-select {
          padding: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          min-width: 180px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .sort-select:focus {
          outline: none;
          border-color: #4caf50;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-select,
        .filter-input {
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          min-width: 150px;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
        }

        .refresh-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .action-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          min-width: 130px;
        }

        .all-listing-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
        }

        .all-listing-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .add-listing-btn {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
        }

        .add-listing-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }

        .my-listing-btn {
          background: linear-gradient(135deg, #9c27b0, #7b1fa2);
          color: white;
          box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2);
        }

        .my-listing-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
        }

        .my-orders-btn {
          background: linear-gradient(135deg, #ff5722, #d84315);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 87, 34, 0.2);
        }

        .my-orders-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 87, 34, 0.3);
        }

        /* My Listings Section */
        .my-listings-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .my-listings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1rem;
        }

        .my-listings-header h2 {
          color: #2c5530;
          margin: 0;
          font-size: 1.5rem;
        }

        .listings-count {
          color: #666;
          font-size: 0.9rem;
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .my-listings-loading {
          color: #666;
          font-style: italic;
        }

        .my-listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .my-listing-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .my-listing-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .my-listing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .my-listing-header h3 {
          margin: 0;
          color: #2c5530;
          font-size: 1.1rem;
        }

        .my-listing-status {
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-active {
          background: #d4edda;
          color: #155724;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-sold {
          background: #f8d7da;
          color: #721c24;
        }

        .my-listing-details {
          margin-bottom: 1.5rem;
        }

        .my-listing-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .my-listing-detail:last-child {
          border-bottom: none;
        }

        .my-listing-detail span:first-child {
          color: #666;
          font-size: 0.9rem;
        }

        .my-listing-detail span:last-child {
          color: #2c5530;
          font-weight: 500;
        }

        .my-listing-actions {
          display: flex;
          gap: 0.5rem;
        }

        .my-listing-actions button {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-details-btn {
          background: #007bff;
          color: white;
        }

        .edit-btn {
          background: #28a745;
          color: white;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
        }

        .my-listing-actions button:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        .empty-my-listings {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .empty-my-listings .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-my-listings h3 {
          color: #2c5530;
          margin-bottom: 0.5rem;
        }

        .create-first-listing-btn {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s ease;
        }

        .create-first-listing-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .listings-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .listings-header {
          margin-bottom: 2rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1rem;
        }

        .listings-header h2 {
          color: #2c5530;
          margin: 0;
        }

        .loading-container {
          text-align: center;
          padding: 4rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          margin: 0 auto 1rem;
        }

        .error-container {
          text-align: center;
          padding: 4rem;
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 12px;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-message {
          color: #c53030;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .retry-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #666;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .create-first-listing-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1.5rem;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .listing-card {
          background: #fff;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .listing-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #4caf50, #45a049);
        }

        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .listing-title {
          color: #2c5530;
          font-size: 1.3rem;
          margin: 0;
          font-weight: 600;
          line-height: 1.3;
          flex: 1;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge.active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .crop-variety {
          background: #f0f8ff;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #2196f3;
        }

        .crop-variety .label {
          font-weight: 500;
          color: #1976d2;
          margin-right: 0.5rem;
        }

        .crop-variety .value {
          font-weight: 600;
          color: #0d47a1;
        }

        .listing-details {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-icon {
          font-size: 1.1rem;
        }

        .detail-text {
          font-size: 0.9rem;
          color: #333;
        }

        .total-value {
          background: #e8f5e8;
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0;
        }

        .total-label {
          font-weight: 500;
          color: #2c5530;
        }

        .total-amount {
          font-weight: 700;
          font-size: 1.2rem;
          color: #2e7d32;
        }

        .description {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }

        .description p {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0;
        }

        .listing-footer {
          border-top: 1px solid #f0f0f0;
          padding-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
        }

        .seller-info {
          flex: 1;
        }

        .seller-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .listing-date {
          color: #777;
          font-size: 0.8rem;
        }

        .view-details-btn {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          width: 100%;
        }

        .view-details-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        /* Modal Styles */
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
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h2 {
          color: #2c5530;
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .close-btn:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .close-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .modal-body {
          padding: 0;
        }

        /* Responsive Design */
                }

        /* Header Buttons */
        .header-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .my-listings-toggle {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .my-listings-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        /* My Listings Section */
        .my-listings-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .my-listings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .my-listings-header h2 {
          color: #2c5530;
          margin: 0;
        }

        .listings-count {
          color: #666;
          font-size: 0.9rem;
        }

        .my-listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .my-listing-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          border-left: 4px solid #4caf50;
          transition: all 0.2s;
        }

        .my-listing-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .my-listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .my-listing-header h3 {
          color: #2c5530;
          margin: 0;
          font-size: 1.1rem;
        }

        .my-listing-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status-sold {
          background: #fff3e0;
          color: #f57c00;
        }

        .status-expired {
          background: #ffebee;
          color: #c62828;
        }

        .my-listing-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .my-listing-detail {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .my-listing-detail span:first-child {
          font-size: 0.8rem;
          color: #666;
          text-transform: uppercase;
        }

        .my-listing-detail span:last-child {
          font-weight: 600;
          color: #333;
        }

        .my-listing-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .edit-btn {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .edit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }

        .delete-btn {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }

        .empty-my-listings {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-my-listings .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-my-listings h3 {
          color: #2c5530;
          margin-bottom: 1rem;
        }

        .empty-my-listings p {
          color: #666;
          margin-bottom: 2rem;
        }

        /* My Orders Section */
        .my-orders-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .my-orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1rem;
        }

        .my-orders-header h2 {
          color: #2c5530;
          margin: 0;
        }

        .orders-count {
          background: linear-gradient(135deg, #ff5722, #d84315);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .my-orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .my-order-card {
          background: linear-gradient(135deg, #fff8e1, #fff3c4);
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .my-order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .my-order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }

        .my-order-header h3 {
          margin: 0;
          color: #2c5530;
          font-size: 1.1rem;
        }

        .my-order-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-pending {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
        }

        .status-accepted {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          color: white;
        }

        .status-rejected {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
        }

        .my-order-details {
          margin-bottom: 1rem;
        }

        .my-order-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .my-order-detail span:first-child {
          color: #666;
          font-weight: 500;
        }

        .my-order-detail span:last-child {
          color: #2c5530;
          font-weight: 600;
        }

        .urgency-high {
          color: #f44336;
          font-weight: bold;
        }

        .urgency-medium {
          color: #ff9800;
          font-weight: bold;
        }

        .urgency-normal {
          color: #4caf50;
          font-weight: bold;
        }

        .my-order-message {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 0.75rem;
          margin: 0.5rem 0;
        }

        .my-order-message span {
          color: #666;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .my-order-message p {
          margin: 0.25rem 0 0 0;
          color: #2c5530;
          font-style: italic;
        }

        .partial-fulfillment-notice {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border-left: 4px solid #ff9800;
          border-radius: 6px;
          padding: 0.75rem;
          margin: 0.5rem 0;
        }

        .partial-fulfillment-notice span {
          color: #e65100;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .partial-fulfillment-notice p {
          margin: 0.25rem 0 0 0;
          color: #bf360c;
          font-size: 0.8rem;
        }

        .my-order-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .accept-order-btn {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .accept-order-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .reject-order-btn {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .reject-order-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }

        .my-order-timestamp {
          text-align: right;
          margin-top: 1rem;
          border-top: 1px solid #eee;
          padding-top: 0.5rem;
        }

        .my-order-timestamp small {
          color: #999;
          font-size: 0.8rem;
        }

        .empty-my-orders {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-my-orders .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-my-orders h3 {
          color: #2c5530;
          margin-bottom: 1rem;
        }

        .empty-my-orders p {
          color: #666;
          margin-bottom: 2rem;
        }

        /* Responsive Design for My Listings */
        @media (max-width: 768px) {
          .header-buttons {
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }

          .my-listings-toggle,
          .create-listing-btn {
            width: 100%;
          }

          .my-listings-grid {
            grid-template-columns: 1fr;
          }

          .my-listing-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .marketplace-page {
            padding: 1rem;
          }

          .marketplace-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            padding: 1.5rem;
          }

          .header-content h1 {
            font-size: 2rem;
            justify-content: center;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select,
          .filter-input {
            min-width: auto;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .listing-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .listing-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .detail-row {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .modal-header {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplacePage;