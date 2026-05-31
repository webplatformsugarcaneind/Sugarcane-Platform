import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MyListingsDashboard.css';

/**
 * MyListingsDashboard Component
 * 
 * Dashboard for farmers to manage their own crop listings
 * Includes view, edit, and delete functionality
 */
const MyListingsDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterStatus, setFilterStatus] = useState('all');

  // Edit form state
  const [formData, setFormData] = useState({
    title: '',
    crop_variety: '',
    quantity_in_tons: '',
    expected_price_per_ton: '',
    harvest_availability_date: '',
    location: '',
    description: '',
    status: 'active'
  });

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Make API request to get user's listings
      const response = await axios.get(`${API_BASE_URL}/api/listings/my-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetched my listings:', response.data);
      setListings(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch your listings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleEdit = (listing) => {
    setEditingListing(listing._id);
    setFormData({
      title: listing.title,
      crop_variety: listing.crop_variety,
      quantity_in_tons: listing.quantity_in_tons.toString(),
      expected_price_per_ton: listing.expected_price_per_ton.toString(),
      harvest_availability_date: listing.harvest_availability_date.split('T')[0], // Format for date input
      location: listing.location,
      description: listing.description || '',
      status: listing.status
    });
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
    setFormData({
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

  const handleSaveEdit = async () => {
    try {
      // Validate form data
      if (!formData.title?.trim()) {
        alert('❌ Please provide a listing title');
        return;
      }

      if (!formData.crop_variety?.trim()) {
        alert('❌ Please select a crop variety');
        return;
      }

      if (!formData.quantity_in_tons || parseFloat(formData.quantity_in_tons) <= 0) {
        alert('❌ Please provide a valid quantity');
        return;
      }

      if (!formData.expected_price_per_ton || parseFloat(formData.expected_price_per_ton) <= 0) {
        alert('❌ Please provide a valid price per guntha');
        return;
      }

      if (!formData.harvest_availability_date) {
        alert('❌ Please provide harvest availability date');
        return;
      }

      if (!formData.location?.trim()) {
        alert('❌ Please provide a location');
        return;
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        crop_variety: formData.crop_variety,
        quantity_in_tons: parseFloat(formData.quantity_in_tons),
        expected_price_per_ton: parseFloat(formData.expected_price_per_ton),
        harvest_availability_date: formData.harvest_availability_date,
        location: formData.location.trim(),
        description: formData.description?.trim() || '',
        status: formData.status
      };

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ No authentication token found. Please login again.');
        return;
      }

      console.log('Updating listing:', editingListing, updateData);

      // Make PUT request to update listing
      const response = await axios.put(
        `${API_BASE_URL}/api/listings/${editingListing}`, 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      // Update the listing in state
      setListings(prev => prev.map(listing => 
        listing._id === editingListing ? response.data.data : listing
      ));

      // Close edit form
      handleCancelEdit();
      
      // Show success message
      alert('✅ Listing updated successfully!');
    } catch (err) {
      console.error('Error updating listing:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update listing. Please try again.';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('🗑️ Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingListing(listingId);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ No authentication token found. Please login again.');
        return;
      }

      console.log('Deleting listing:', listingId);

      // Make DELETE request
      await axios.delete(`${API_BASE_URL}/api/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the listing from state
      setListings(prev => prev.filter(listing => listing._id !== listingId));
      
      // Show success message
      alert('✅ Listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting listing:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete listing. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setDeletingListing(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'ml-status-badge excellent';
      case 'sold': return 'ml-status-badge good';
      case 'expired': return 'ml-status-badge poor';
      default: return 'ml-status-badge';
    }
  };

  const filterAndSortListings = () => {
    let filtered = listings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.crop_variety.toLowerCase().includes(query) ||
        l.location.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.expected_price_per_ton * b.quantity_in_tons) - (a.expected_price_per_ton * a.quantity_in_tons));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.expected_price_per_ton * a.quantity_in_tons) - (b.expected_price_per_ton * b.quantity_in_tons));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredListings = filterAndSortListings();
  const activeCount = listings.filter(l => l.status === 'active').length;
  const totalValue = listings.reduce((sum, l) => sum + (l.quantity_in_tons * l.expected_price_per_ton), 0);

  return (
    <div className="ml-page-fullscreen">
      {/* STICKY TOP BAR */}
      <div className="ml-topbar">
        <div className="ml-topbar-left">
          <span className="ml-eyebrow"><span></span>My Listings</span>
          <h1 className="ml-title-compact">Crop Listings</h1>
        </div>
        <button className="ml-refresh-btn" onClick={fetchMyListings}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="ml-main-content">
        {loading ? (
          <div className="ml-loading">
            <div className="ml-spinner"></div>
            <p>Loading your listings...</p>
          </div>
        ) : error ? (
          <div className="ml-error">
            <div className="ml-error-icon">⚠️</div>
            <p className="ml-error-msg">{error}</p>
            <button onClick={fetchMyListings} className="ml-retry-btn">Try Again</button>
          </div>
        ) : listings.length === 0 ? (
          <div className="ml-empty">
            <div className="ml-empty-icon">📦</div>
            <h3 className="ml-empty-title">No listings found</h3>
            <p className="ml-empty-sub">You haven't created any listings yet. Start by creating your first listing!</p>
            <button
              className="ml-create-btn"
              onClick={() => window.location.href = '/marketplace'}
            >
              + Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            {/* PAGE HEADER */}
            <div className="ml-page-header">
              <div className="ml-header-content">
                <div className="ml-header-left">
                  <h1 className="ml-title">Crop <em>Listings</em></h1>
                  <p className="ml-sub">Manage your crop listings and track their performance</p>
                </div>
              </div>
            </div>

            {/* KPI STATS */}
            <div className="ml-kpi-row">
              <div className="ml-kpi g">
                <span className="ml-kpi-label">Total Listings</span>
                <span className="ml-kpi-val g">{listings.length}</span>
              </div>
              <div className="ml-kpi g">
                <span className="ml-kpi-label">Active</span>
                <span className="ml-kpi-val g">{activeCount}</span>
              </div>
              <div className="ml-kpi a">
                <span className="ml-kpi-label">Sold</span>
                <span className="ml-kpi-val a">{listings.filter(l => l.status === 'sold').length}</span>
              </div>
              <div className="ml-kpi b">
                <span className="ml-kpi-label">Total Value</span>
                <span className="ml-kpi-val b">{formatPrice(totalValue)}</span>
              </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="global-toolbar">
              <div className="global-search-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search listings, crop varieties, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="global-search"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="global-filter"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="global-filter"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Highest Value</option>
                <option value="price-low">Lowest Value</option>
              </select>
            </div>

            {/* RESULTS COUNT */}
            <div className="ml-results-summary">
              <p className="ml-results-text">
                Showing <strong>{filteredListings.length}</strong> of <strong>{listings.length}</strong> listings
              </p>
            </div>

            {/* LISTINGS GRID */}
            {filteredListings.length === 0 ? (
              <div className="ml-no-results">
                <p>No listings match your search. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="ml-grid">
                {filteredListings.map((listing) => {
                  const isEditing = editingListing === listing._id;
                  const isDeleting = deletingListing === listing._id;
                  const daysUntilHarvest = getDaysUntilHarvest(listing.harvest_availability_date);
                  const cardTotalValue = listing.quantity_in_tons * listing.expected_price_per_ton;
                  const statusClass = listing.status === 'active' ? 'excellent' : listing.status === 'sold' ? 'good' : 'poor';

                  return (
                    <div key={listing._id} className={`ml-card ${statusClass}`}>
                      {!isEditing ? (
                        <>
                          {/* Card header */}
                          <div className="ml-card-header">
                            <div className="ml-card-avatar">🌾</div>
                            <div className="ml-card-title-wrap">
                              <div className="ml-card-name">{listing.title}</div>
                              <div className="ml-card-variety">{listing.crop_variety}</div>
                            </div>
                            <div className={getStatusBadgeClass(listing.status)}>
                              {listing.status === 'active' && '✅'}
                              {listing.status === 'sold' && '💰'}
                              {listing.status === 'expired' && '⏰'}
                              {' '}{listing.status.toUpperCase()}
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="ml-card-metrics">
                            <div className="ml-metric">
                              <span className="ml-metric-label">Quantity</span>
                              <span className="ml-metric-val green">{listing.quantity_in_tons} gunthas</span>
                            </div>
                            <div className="ml-metric">
                              <span className="ml-metric-label">Price / Guntha</span>
                              <span className="ml-metric-val amber">{formatPrice(listing.expected_price_per_ton)}</span>
                            </div>
                            <div className="ml-metric">
                              <span className="ml-metric-label">Harvest</span>
                              <span className="ml-metric-val muted">{daysUntilHarvest > 0 ? `${daysUntilHarvest}d` : 'Now'}</span>
                            </div>
                          </div>

                          {/* Total value + location */}
                          <div className="ml-card-info">
                            <div className="ml-info-row">
                              <span className="ml-info-label">📍 Location</span>
                              <span className="ml-info-value">{listing.location}</span>
                            </div>
                            <div className="ml-total-value">
                              <span className="ml-total-label">Total Value</span>
                              <span className="ml-total-amount">{formatPrice(cardTotalValue)}</span>
                            </div>
                          </div>

                          {listing.description && (
                            <div className="ml-card-desc">
                              <p>{listing.description}</p>
                            </div>
                          )}

                          {/* Divider + meta */}
                          <div className="ml-card-divider"></div>
                          <div className="ml-card-meta">
                            <span className="ml-meta-item">Created {formatDate(listing.createdAt)}</span>
                            {listing.updatedAt !== listing.createdAt && (
                              <span className="ml-meta-item">Updated {formatDate(listing.updatedAt)}</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="ml-card-actions">
                            <button
                              className="ml-btn-edit"
                              onClick={() => handleEdit(listing)}
                              disabled={isDeleting}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="ml-btn-delete"
                              onClick={() => handleDelete(listing._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? '⏳' : '🗑️'} Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Edit form */
                        <div className="ml-edit-form">
                          <div className="ml-edit-header">
                            <h3>✏️ Edit Listing</h3>
                            <div className="ml-edit-actions">
                              <button className="ml-btn-save" onClick={handleSaveEdit}>✅ Save</button>
                              <button className="ml-btn-cancel" onClick={handleCancelEdit}>✕ Cancel</button>
                            </div>
                          </div>

                          <div className="ml-edit-body">
                            <div className="ml-form-group">
                              <label>Listing Title *</label>
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Premium Quality Sugarcane for Sale"
                              />
                            </div>

                            <div className="ml-form-row">
                              <div className="ml-form-group">
                                <label>Crop Variety *</label>
                                <select
                                  name="crop_variety"
                                  value={formData.crop_variety}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select variety</option>
                                  <option value="Co 86032">Co 86032</option>
                                  <option value="Co 238">Co 238</option>
                                  <option value="Co 0233">Co 0233</option>
                                  <option value="Co 62175">Co 62175</option>
                                  <option value="Co 1148">Co 1148</option>
                                  <option value="Co 7717">Co 7717</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="ml-form-group">
                                <label>Status</label>
                                <select
                                  name="status"
                                  value={formData.status}
                                  onChange={handleInputChange}
                                >
                                  <option value="active">Active</option>
                                  <option value="sold">Sold</option>
                                  <option value="expired">Expired</option>
                                </select>
                              </div>
                            </div>

                            <div className="ml-form-row">
                              <div className="ml-form-group">
                                <label>Quantity (gunthas) *</label>
                                <input
                                  type="number"
                                  name="quantity_in_tons"
                                  value={formData.quantity_in_tons}
                                  onChange={handleInputChange}
                                  min="0.1"
                                  step="0.1"
                                  placeholder="e.g., 50"
                                />
                              </div>
                              <div className="ml-form-group">
                                <label>Expected Price (₹/guntha) *</label>
                                <input
                                  type="number"
                                  name="expected_price_per_ton"
                                  value={formData.expected_price_per_ton}
                                  onChange={handleInputChange}
                                  min="1"
                                  placeholder="e.g., 3000"
                                />
                              </div>
                            </div>

                            <div className="ml-form-row">
                              <div className="ml-form-group">
                                <label>Harvest Date *</label>
                                <input
                                  type="date"
                                  name="harvest_availability_date"
                                  value={formData.harvest_availability_date}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="ml-form-group">
                                <label>Location *</label>
                                <input
                                  type="text"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  placeholder="e.g., Village, District, State"
                                />
                              </div>
                            </div>

                            <div className="ml-form-group">
                              <label>Description</label>
                              <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Additional details about your crop..."
                                rows="3"
                              />
                            </div>

                            {formData.quantity_in_tons && formData.expected_price_per_ton && (
                              <div className="ml-total-preview">
                                <strong>Total Value: {formatPrice(parseFloat(formData.quantity_in_tons) * parseFloat(formData.expected_price_per_ton))}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyListingsDashboard;
