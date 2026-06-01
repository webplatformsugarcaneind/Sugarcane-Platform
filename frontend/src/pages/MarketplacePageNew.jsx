import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import CreateListingFormNew from '../components/CreateListingFormNew';

import QuickLogin from '../components/QuickLogin';

import './MarketplacePageNew.css';



/**

 * MarketplacePage Component

 * 

 * Marketplace page where farmers can view and create crop listings

 * using the new CropListing API endpoints

 */

const MarketplacePage = () => {

  const navigate = useNavigate();

  const [listings, setListings] = useState([]);

  const [myListings, setMyListings] = useState([]);

  const [showMyListings, setShowMyListings] = useState(false);

  const [myOrders, setMyOrders] = useState([]);

  const [showMyOrders, setShowMyOrders] = useState(false);

  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);



  // Filter states

  const [searchTerm, setSearchTerm] = useState('');

  const [filterLocation, setFilterLocation] = useState('');

  const [filterVariety, setFilterVariety] = useState('');

  const [sortBy, setSortBy] = useState('createdAt');

  

  // Authentication state

  const [user, setUser] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [showQuickLogin, setShowQuickLogin] = useState(false);

  

  // Check authentication on component mount

  useEffect(() => {

    const token = localStorage.getItem('token');

    const userData = localStorage.getItem('user');

    

    if (token && userData) {

      try {

        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);

        setIsAuthenticated(true);

        // Set default authorization header for all requests

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('✅ User authenticated:', parsedUser.name);

      } catch (err) {

        console.error('Error parsing user data:', err);

        handleLogout();

      }

    } else {

      console.log('⚠️ No authentication found');

      setIsAuthenticated(false);

    }

  }, []);

  

  const handleLogout = () => {

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];

    setUser(null);

    setIsAuthenticated(false);

  };

  

  const handleLoginSuccess = (userData) => {

    setUser(userData);

    setIsAuthenticated(true);

    setShowQuickLogin(false);

    // Refresh listings after login

    fetchListings();

  };

  

  const requireAuth = (actionName) => {

    if (!isAuthenticated) {

      console.log(`🔐 Authentication required for: ${actionName}`);

      setShowQuickLogin(true);

      return false;

    }

    return true;

  };



  const fetchListings = useCallback(async () => {

    try {

      setLoading(true);

      setError(null);



      // Check authentication before making API calls

      if (!isAuthenticated) {

        // Don't set an error, just return - the UI will show login options

        return;

      }



      // Build query parameters

      const params = new URLSearchParams();

      if (filterVariety) params.append('crop_variety', filterVariety);

      if (filterLocation) params.append('location', filterLocation);

      if (sortBy && sortBy !== 'createdAt') {

        // Map sort options to backend format

        if (sortBy === 'price') params.append('sort', 'price');

        else if (sortBy === 'quantity') params.append('sort', 'quantity');

        else if (sortBy === 'harvest') params.append('sort', 'harvest');

      }



      // Get token from localStorage

      const token = localStorage.getItem('token');

      

      // Make API request to the new marketplace endpoint

      const response = await axios.get(`${API_BASE_URL}/api/listings/marketplace?${params.toString()}`, {

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json'

        }

      });



      console.log('Fetched listings response:', response.data);

      

      const fetchedListings = Array.isArray(response.data.data) ? response.data.data : [];

      

      // Check for data quality issues and log them

      if (response.data.meta) {

        const { total_queried, valid_returned, filtered_out } = response.data.meta;

        console.log(`📊 Listings stats: ${valid_returned}/${total_queried} valid (${filtered_out} filtered)`);

        

        if (filtered_out > 0) {

          console.warn(`⚠️ ${filtered_out} listings filtered due to missing farmer data`);

          // You could show a notification to admin users here if needed

        }

      }

      

      // Filter out listings with missing farmer data completely

      const validListings = fetchedListings.filter(listing => {

        const hasValidFarmer = listing && listing.farmer_id && listing.farmer_id.name;

        if (!hasValidFarmer) {

          console.log(`Filtering out listing "${listing?.title || 'Unknown'}" - missing farmer data`);

        }

        return hasValidFarmer;

      });

      

      setListings(validListings);

    } catch (err) {

      console.error('Error fetching listings:', err);

      setError(

        err.response?.data?.message || 

        'Failed to fetch listings. Please try again.'

      );

    } finally {

      setLoading(false);

    }

  }, [filterVariety, filterLocation, sortBy, isAuthenticated]);



  useEffect(() => {

    // Only fetch listings after authentication state has been determined

    if (isAuthenticated) {

      fetchListings();

    }

  }, [fetchListings, isAuthenticated]);



  const handleCreateListing = async (formData) => {

    try {

      setIsSubmitting(true);



      // Get JWT token from localStorage

      const token = localStorage.getItem('token');

      

      if (!token) {

        throw new Error('No authentication token found. Please login again.');

      }



      console.log('Creating listing with data:', formData);



      // Determine content type based on data type

      const isFormData = formData instanceof FormData;

      

      const headers = {

        'Authorization': `Bearer ${token}`

      };



      // Don't set Content-Type for FormData - let browser set it with boundary

      if (!isFormData) {

        headers['Content-Type'] = 'application/json';

      }



      // Make POST request to create new listing

      const response = await axios.post(`${API_BASE_URL}/api/listings/create`, formData, {

        headers

      });



      console.log('Created listing response:', response.data);

      

      // Add new listing to the state (at the beginning since it's newest)

      if (response.data.data && response.data.data._id) {

        setListings(prev => [response.data.data, ...prev]);

      }

      

      // Close modal

      setIsModalOpen(false);

      

      // Show success message

      alert('🎉 Sugarcane listing created successfully!');

      

      // Refresh listings to get updated data

      fetchListings();

      

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

    // Navigate to individual listing details page

    navigate(`/farmer/listing/${listing._id}`, { 

      state: { listing } 

    });

  };



  const fetchMyListings = async () => {

    if (!isAuthenticated) {

      console.log('❌ Not authenticated - cannot fetch my listings');

      return;

    }



    try {

      console.log('📤 Fetching my listings...');

      const response = await axios.get(`${API_BASE_URL}/api/listings/my-listings`);



      console.log('✅ My listings response:', response.data);

      console.log('📋 Number of my listings:', response.data.data?.length || 0);

      setMyListings(response.data.data || []);

      

    } catch (err) {

      console.error('❌ Error fetching my listings:', err);

      

      if (err.response?.status === 401) {

        console.log('🔐 Authentication expired - showing login prompt');

        setShowQuickLogin(true);

      } else {

        setMyListings([]);

      }

    }

  };



  const toggleMyListings = async () => {

    if (!showMyListings) {

      await fetchMyListings();

    }

    setShowMyListings(!showMyListings);

  };



  const showAllListings = () => {

    setShowMyListings(false);

    setShowMyOrders(false);

    fetchListings();

  };



  const viewMyListings = async () => {

    setShowMyOrders(false);

    await fetchMyListings();

    setShowMyListings(true);

  };



  const handleEditListing = (listingId) => {

    console.log('✏️ Editing listing:', listingId);

    navigate(`/farmer/listing/edit/${listingId}`);

  };



  const handleDeleteListing = async (listingId, listingTitle) => {

    const confirmDelete = window.confirm(

      `Are you sure you want to delete this listing?\n\n"${listingTitle}"\n\nThis action cannot be undone.`

    );

    

    if (!confirmDelete) {

      return;

    }



    try {

      const token = localStorage.getItem('token');

      if (!token) {

        alert('Authentication required. Please login again.');

        return;

      }



      console.log('🗑️ Deleting listing:', listingId);



      const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json'

        }

      });



      const data = await response.json();



      if (response.ok) {

        console.log('✅ Listing deleted successfully');

        alert('Listing deleted successfully!');

        

        // Refresh the my listings

        await fetchMyListings();

        

        // Also refresh the marketplace listings

        await fetchListings();

      } else {

        console.error('❌ Error deleting listing:', data.message);

        alert(`Failed to delete listing: ${data.message}`);

      }

    } catch (error) {

      console.error('❌ Error deleting listing:', error);

      alert('An error occurred while deleting the listing. Please try again.');

    }

  };



  const viewMyOrders = async () => {

    if (!requireAuth('view orders')) {

      return;

    }

    

    setShowMyListings(false);

    setMyOrdersLoading(true);

    try {

      console.log('📦 Fetching my orders...');

      

      const response = await axios.get(`${API_BASE_URL}/api/orders/my-orders`);

      

      console.log('✅ Orders response:', response.data);

      console.log(`📊 Found ${response.data.data?.length || 0} orders`);

      

      setMyOrders(response.data.data || []);

      setShowMyOrders(true);

      

    } catch (err) {

      console.error('Error fetching my orders:', err);

      handleAuthError(err);

      

      if (err.response?.status === 404) {

        console.log('ℹ️ No orders found for this user');

        setMyOrders([]);

        setShowMyOrders(true);

      } else if (err.response?.status !== 401) {

        setError('Failed to fetch your orders. Please try again.');

        setMyOrders([]);

        setShowMyOrders(false);

      }

    } finally {

      setMyOrdersLoading(false);

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

      {/* Quick Login Overlay */}

      {showQuickLogin && (

        <QuickLogin onLoginSuccess={handleLoginSuccess} />

      )}

      

      {/* Header */}

      <div className="marketplace-header">

        <div className="header-content">

          <h1>🌾 Sugarcane Marketplace</h1>

          <p className="page-subtitle">Discover and trade quality sugarcane crops</p>

          {/* Authentication Status */}

          <div className="marketplace-auth-status" style={{ 

            backgroundColor: isAuthenticated ? '#d4edda' : '#f8d7da',

            color: isAuthenticated ? '#155724' : '#721c24',

          }}>

            {isAuthenticated ? `👤 ${user?.name || 'Logged in'}` : '🔒 Not logged in'}

            {isAuthenticated && (

              <button 

                onClick={handleLogout}

                style={{

                  marginLeft: '0.5rem',

                  background: 'none',

                  border: '1px solid currentColor',

                  color: 'inherit',

                  padding: '0.2rem 0.5rem',

                  borderRadius: '3px',

                  fontSize: '0.8rem'

                }}

              >

                Logout

              </button>

            )}

          </div>

        </div>

      

      </div>

    );

  };


  export default MarketplacePage;
        <div className="search-bar">

          <input

            type="text"

            placeholder="🔍 Search by title, variety, or location..."

            value={searchTerm}

            onChange={(e) => setSearchTerm(e.target.value)}

            className="search-input"

          />

          

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



          <select

            value={sortBy}

            onChange={(e) => setSortBy(e.target.value)}

            className="filter-select"

          >

            <option value="createdAt">Sort by: Newest</option>

            <option value="price">Sort by: Price</option>

            <option value="quantity">Sort by: Quantity</option>

            <option value="harvest">Sort by: Harvest Date</option>

          </select>

        </div>

        

        <div className="filter-controls">

          <button 

            className="action-btn all-listing-btn"

            onClick={showAllListings}

          >

            📋 All Listing

          </button>

          

          <button 

            className="action-btn add-listing-btn"

            onClick={() => {

              if (requireAuth('add listing')) {

                setIsModalOpen(true);

              }

            }}

          >

            ➕ Add Listing

          </button>

          

          <button 

            className="action-btn my-listing-btn"

            onClick={() => {

              if (requireAuth('view my listings')) {

                viewMyListings();

              }

            }}

          >

            👤 My Listing

          </button>

          

          <button 

            className="action-btn my-orders-btn"

            onClick={viewMyOrders}

          >

            📦 My Orders

          </button>

        </div>

      </div>



      {/* My Listings Section */}

      {showMyListings && (

        <div className="my-listings-section">

          <h2>📋 My Listings ({myListings.length})</h2>

          

          {myListings.length === 0 ? (

            <div className="no-listings">

              <p>You haven't created any listings yet.</p>

              <button onClick={() => setIsModalOpen(true)} className="create-listing-btn">

                ➕ Create Your First Listing

              </button>

            </div>

          ) : (

            <div className="listings-grid">

              {myListings.map((listing) => {

                // Support both new and legacy formats

                const variety = listing.sugarcane_variety || listing.crop_variety;

                const quantityValue = listing.quantity_available?.value || listing.quantity_in_tons || 0;

                const quantity = listing.quantity_available ? 

                  `${listing.quantity_available.value} ${listing.quantity_available.unit}` : 

                  `${listing.quantity_in_tons} Gunthas`;

                

                // Calculate price with priority logic

                const basePricePerTon = listing.price_details?.base_price_per_ton;

                const pricePerUnit = listing.price_details?.price_per_unit; 

                const expectedPricePerTon = listing.expected_price_per_ton;

                

                // Determine actual price source and value

                let actualPrice = 0;

                let priceSource = 'none';

                

                if (basePricePerTon && basePricePerTon > 0) {

                  actualPrice = basePricePerTon;

                  priceSource = 'base_price_per_ton';

                } else if (pricePerUnit && pricePerUnit > 0) {

                  actualPrice = pricePerUnit;

                  priceSource = 'price_per_unit';

                } else if (expectedPricePerTon && expectedPricePerTon > 0) {

                  actualPrice = expectedPricePerTon;

                  priceSource = 'expected_price_per_ton';

                }

                

                const price = formatPrice(actualPrice);

                const priceUnit = listing.quantity_available ? 

                  listing.quantity_available.unit : 

                  'Guntha';

                const location = listing.delivery_location || listing.location;

                const availabilityDate = listing.delivery_timeframe ? 

                  listing.delivery_timeframe.available_from : 

                  listing.harvest_availability_date;

                const isNegotiable = listing.price_details?.negotiable || false;

                

                const daysUntilAvailable = Math.ceil(

                  (new Date(availabilityDate) - new Date()) / (1000 * 60 * 60 * 24)

                );

                

                // Calculate total value

                const totalValue = quantityValue * actualPrice;



                return (

                  <div key={listing._id} className="listing-card my-listing">

                    <div className="listing-header">

                      <span className="status-badge status-badge-my">{listing.status.toUpperCase()}</span>

                      <div className="listing-actions-header">

                        <button 

                          className="edit-btn" 

                          title="Edit Listing"

                          onClick={(e) => {

                            e.stopPropagation();

                            handleEditListing(listing._id);

                          }}

                        >

                          ✏️

                        </button>

                        <button 

                          className="delete-btn" 

                          title="Delete Listing"

                          onClick={(e) => {

                            e.stopPropagation();

                            handleDeleteListing(listing._id, listing.title);

                          }}

                        >

                          🗑️

                        </button>

                      </div>

                    </div>

                    

                    <div className="listing-content">

                      <div className="listing-title-row">

                        <h3 className="listing-title">{listing.title}</h3>

                        <div className="variety-info">

                          <span className="variety-badge">{variety}</span>

                        </div>

                      </div>



                      {/* Show quality information if available */}

                      {listing.seed_quality && (

                        <div className="quality-summary">



                          {listing.germination_percentage && (

                            <span className="quality-badge">

                              🌱 {listing.germination_percentage}%

                            </span>

                          )}

                        </div>

                      )}



                      <div className="listing-details">

                        <div className="detail-row">

                          <div className="detail-item">

                            <span className="detail-icon">⚖️</span>

                            <span className="detail-text">

                              <strong>{quantity}</strong>

                            </span>

                          </div>

                          <div className="detail-item">

                            <span className="detail-icon">💰</span>

                            <span className="detail-text">

                              <strong>{price}</strong>/{priceUnit}

                              {(() => {

                                // Only show (Negotiable) if price comes from price_details AND negotiable is true

                                const isPriceNegotiable = (priceSource === 'base_price_per_ton' || priceSource === 'price_per_unit') &&

                                                         (listing.price_details?.price_negotiable === true || 

                                                          listing.price_details?.negotiable === true ||

                                                          listing.price_details?.is_negotiable === true);

                                

                                // Debug: Log actual values for My Listings

                                if (process.env.NODE_ENV === 'development') {

                                  console.log('My Listing negotiable check:', {

                                    listingId: listing._id,

                                    priceSource: priceSource,

                                    actualPrice: actualPrice,

                                    price_negotiable: listing.price_details?.price_negotiable,

                                    negotiable: listing.price_details?.negotiable,

                                    is_negotiable: listing.price_details?.is_negotiable,

                                    result: isPriceNegotiable

                                  });

                                }

                                

                                return isPriceNegotiable ? (

                                  <span className="negotiable-tag"> (Negotiable)</span>

                                ) : null;

                              })()}

                            </span>

                          </div>

                        </div>



                        <div className="detail-row">

                          <div className="detail-item">

                            <span className="detail-icon">📍</span>

                            <span className="detail-text">{location}</span>

                          </div>

                          <div className="detail-item">

                            <span className="detail-icon">📅</span>

                            <span className="detail-text">

                              {daysUntilAvailable > 0 

                                ? `${daysUntilAvailable} days`

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

                        <div className="listing-date">

                          Created {formatDate(listing.createdAt)}

                        </div>

                      </div>

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

              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: 'var(--amber)'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>

              <h3>No orders yet</h3>

              <p>You haven't placed any orders yet. Browse listings to place your first order!</p>

              <button 

                className="browse-listings-btn"

                onClick={showAllListings}

              >

                Browse All Listings

              </button>

            </div>

          ) : (

            <div className="my-orders-grid">

              {myOrders.map((order) => {

                // Simple logic using the 'type' field from backend

                // 'sent' = current user is buyer (BUY order)

                // 'received' = current user is seller (SELL order)

                const isBuyOrder = order.type === 'sent';

                const isSellOrder = order.type === 'received';

                

                let orderType, orderTypeColor;

                if (isBuyOrder) {

                  orderType = 'BUY';

                  orderTypeColor = '#007bff';

                } else if (isSellOrder) {

                  orderType = 'SELL';

                  orderTypeColor = '#28a745';

                } else {

                  // Fallback

                  orderType = 'ORDER';

                  orderTypeColor = '#6c757d';

                }

                

                return (

                <div key={order._id} className="my-order-card">

                  <div className="my-order-header">

                    <div className="order-title-section">

                      <h3>{order.listing?.title || `Order for Listing ${order.listing_id || order.listing?._id}`}</h3>

                      <div className="order-type-badges">

                        <span 

                          className="order-type-badge"

                          style={{

                            backgroundColor: orderTypeColor,

                            color: 'white',

                            padding: '0.25rem 0.5rem',

                            borderRadius: '4px',

                            fontSize: '0.8rem',

                            fontWeight: 'bold',

                            marginRight: '0.5rem'

                          }}

                        >

                          {orderType}

                        </span>

                        <span className={`my-order-status status-${order.status}`}>

                          {order.status.toUpperCase()}

                        </span>

                      </div>

                    </div>

                  </div>

                  

                  <div className="my-order-details">

                    <div className="my-order-detail">

                      <span>Quantity</span>

                      <span>{order.quantity_tons} Gunthas</span>

                    </div>

                    <div className="my-order-detail">

                      <span>Price/Guntha</span>

                      <span>₹{order.agreed_price_per_ton?.toLocaleString()}</span>

                    </div>

                    <div className="my-order-detail">

                      <span>Total Value</span>

                      <span>₹{(order.quantity_tons * order.agreed_price_per_ton)?.toLocaleString()}</span>

                    </div>

                    <div className="my-order-detail">

                      <span>Order Date</span>

                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>

                    </div>

                    <div className="my-order-detail">

                      <span>Order Type</span>

                      <span style={{ 

                        color: orderTypeColor, 

                        fontWeight: 'bold' 

                      }}>

                        {isBuyOrder ? '🛒 BUYING' : (isSellOrder ? '📤 SELLING' : '📋 ORDER')}

                      </span>

                    </div>

                  </div>

                </div>

                );

              })}

            </div>

          )}

        </div>

      )}



      {/* Listings Section */}

      {!showMyListings && !showMyOrders && (

        <div className="listings-section">

        {!isAuthenticated ? (

          <div className="auth-required-container">

            <div className="auth-icon">🔐</div>

            <h3>Authentication Required</h3>

            <p>Please log in to view and interact with marketplace listings.</p>

            <button 

              onClick={() => setShowQuickLogin(true)}

              className="login-button"

              style={{

                backgroundColor: '#007bff',

                color: 'white',

                padding: '0.75rem 1.5rem',

                border: 'none',

                borderRadius: '5px',

                fontSize: '1rem',

                marginTop: '1rem'

              }}

            >

              🚀 Login Now

            </button>

          </div>

        ) : loading ? (

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

            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: 'var(--green)'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>

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

                // Support both new and legacy formats

                const variety = listing.sugarcane_variety || listing.crop_variety;

                const quantityValue = listing.quantity_available?.value || listing.quantity_in_tons || 0;

                const quantity = listing.quantity_available ? 

                  `${listing.quantity_available.value} ${listing.quantity_available.unit}` : 

                  `${listing.quantity_in_tons} Gunthas`;

                

                // Calculate price with priority logic

                const basePricePerTon = listing.price_details?.base_price_per_ton;

                const pricePerUnit = listing.price_details?.price_per_unit; 

                const expectedPricePerTon = listing.expected_price_per_ton;

                

                // Determine actual price source and value

                let actualPrice = 0;

                let priceSource = 'none';

                

                if (basePricePerTon && basePricePerTon > 0) {

                  actualPrice = basePricePerTon;

                  priceSource = 'base_price_per_ton';

                } else if (pricePerUnit && pricePerUnit > 0) {

                  actualPrice = pricePerUnit;

                  priceSource = 'price_per_unit';

                } else if (expectedPricePerTon && expectedPricePerTon > 0) {

                  actualPrice = expectedPricePerTon;

                  priceSource = 'expected_price_per_ton';

                }

                

                const price = formatPrice(actualPrice);

                const priceUnit = listing.quantity_available ? 

                  listing.quantity_available.unit : 

                  'Guntha';

                const location = listing.delivery_location || listing.location;

                const availabilityDate = listing.delivery_timeframe ? 

                  listing.delivery_timeframe.available_from : 

                  listing.harvest_availability_date;

                const isNegotiable = listing.price_details?.negotiable || false;

                

                const daysUntilAvailable = getDaysUntilHarvest(availabilityDate);

                

                // Calculate total value

                const totalValue = quantityValue * actualPrice;

                

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

                          <span className="value">{variety}</span>

                        </div>

                        

                        {/* Show new quality information if available */}

                        {listing.seed_quality && (

                          <div className="quality-info">



                            {listing.germination_percentage && (

                              <div className="quality-item">

                                <span className="label">🌱 Germination:</span>

                                <span className="value">{listing.germination_percentage}%</span>

                              </div>

                            )}

                            {listing.seed_type && (

                              <div className="quality-item">

                                <span className="label">🌿 Type:</span>

                                <span className="value">{listing.seed_type}</span>

                              </div>

                            )}

                          </div>

                        )}

                      </div>



                      <div className="listing-details">

                        <div className="detail-row">

                          <div className="detail-item">

                            <span className="detail-icon">⚖️</span>

                            <span className="detail-text">

                              <strong>{quantity}</strong>

                            </span>

                          </div>

                          <div className="detail-item">

                            <span className="detail-icon">💰</span>

                            <span className="detail-text">

                              <strong>{price}</strong>/{priceUnit}

                              {(() => {

                                // Only show (Negotiable) if price comes from price_details AND negotiable is true

                                const isPriceNegotiable = (priceSource === 'base_price_per_ton' || priceSource === 'price_per_unit') &&

                                                         (listing.price_details?.price_negotiable === true || 

                                                          listing.price_details?.negotiable === true ||

                                                          listing.price_details?.is_negotiable === true);

                                

                                // Debug: Log actual values for Marketplace Listings

                                if (process.env.NODE_ENV === 'development') {

                                  console.log('Marketplace Listing negotiable check:', {

                                    listingId: listing._id,

                                    priceSource: priceSource,

                                    actualPrice: actualPrice,

                                    price_negotiable: listing.price_details?.price_negotiable,

                                    negotiable: listing.price_details?.negotiable,

                                    is_negotiable: listing.price_details?.is_negotiable,

                                    result: isPriceNegotiable

                                  });

                                }

                                

                                return isPriceNegotiable ? (

                                  <span className="negotiable-tag"> (Negotiable)</span>

                                ) : null;

                              })()}

                            </span>

                          </div>

                        </div>



                        <div className="detail-row">

                          <div className="detail-item">

                            <span className="detail-icon">📍</span>

                            <span className="detail-text">{location}</span>

                          </div>

                          <div className="detail-item">

                            <span className="detail-icon">📅</span>

                            <span className="detail-text">

                              {daysUntilAvailable > 0 

                                ? `${daysUntilAvailable} days`

                                : 'Available now'

                              }

                            </span>

                          </div>

                        </div>



                        {/* Show crop age if available */}

                        {listing.crop_age && (

                          <div className="detail-row">

                            <div className="detail-item">

                              <span className="detail-icon">📈</span>

                              <span className="detail-text">Age: {listing.crop_age} months</span>

                            </div>

                            {listing.price_details?.minimum_order_quantity && (

                              <div className="detail-item">

                                <span className="detail-icon">📦</span>

                                <span className="detail-text">Min: {listing.price_details.minimum_order_quantity} {priceUnit}</span>

                              </div>

                            )}

                          </div>

                        )}



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

                          👤 {listing.farmer_id.name}

                        </div>

                        <div className="listing-date">

                          Posted {formatDate(listing.createdAt)}

                        </div>

                        {/* Show additional farmer info if available */}

                        {listing.farmer_id?.location && (

                          <div className="farmer-location" style={{fontSize: '0.85em', color: '#666'}}>

                            📍 {listing.farmer_id.location}

                          </div>

                        )}

                      </div>

                      

                      <div className="listing-actions">

                        <button 

                          className="view-details-btn"

                          onClick={() => handleViewDetails(listing)}

                        >

                          👁️ View Details

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

              <CreateListingFormNew 

                onSubmit={handleCreateListing}

                isSubmitting={isSubmitting}

              />

            </div>

          </div>

        </div>

      )}



      <style jsx={true}>{`

        .marketplace-page {
          padding: 2rem 24px;
          width: 100%;
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

        }



        .search-input {

          width: 100%;

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

          background: #2196f3;

          color: white;

          border: none;

          padding: 0.75rem 1rem;

          border-radius: 8px;

          

          font-size: 0.9rem;

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

          animation: spin 1s linear infinite;

          margin: 0 auto 1rem;

        }



        @keyframes spin {

          0% { transform: rotate(0deg); }

          100% { transform: rotate(360deg); }

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

          

          margin-top: 1.5rem;

        }



        .listings-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 20px;
        }

        @media (min-width: 640px) {
          .listings-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .listings-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1000px) {
          .listings-grid {
            grid-template-columns: repeat(4, 1fr);
          }
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



        .contact-btn {

          background: linear-gradient(135deg, #2196f3, #1976d2);

          color: white;

          border: none;

          padding: 0.75rem 1.5rem;

          border-radius: 8px;

          font-size: 0.9rem;

          font-weight: 500;

          

          transition: all 0.2s ease;

          white-space: nowrap;

        }



        .contact-btn:hover {

          transform: translateY(-1px);

          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);

        }



        .view-profile-btn {

          background: linear-gradient(135deg, #4caf50, #45a049);

          color: white;

          border: none;

          padding: 0.75rem 1.5rem;

          border-radius: 8px;

          font-size: 0.9rem;

          font-weight: 500;

          

          transition: all 0.2s ease;

          white-space: nowrap;

          margin-left: 0.5rem;

        }



        .view-profile-btn:hover {

          transform: translateY(-1px);

          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);

        }



        .listing-actions {

          display: flex;

          gap: 0.5rem;

          flex-wrap: wrap;

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

          

          color: #666;

          padding: 0.5rem;

          border-radius: 8px;

          transition: background-color 0.2s ease;

        }



        .close-btn:hover:not(:disabled) {

          background: #f5f5f5;

        }



        .close-btn:disabled {

          

          opacity: 0.5;

        }



        .modal-body {

          padding: 0;

        }



        /* Responsive Design */

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

