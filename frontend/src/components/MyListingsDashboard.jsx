import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
      const response = await axios.get('http://localhost:5000/api/listings/my-listings', {
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
        alert('❌ Please provide a valid price per ton');
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
        `http://localhost:5000/api/listings/${editingListing}`, 
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
      await axios.delete(`http://localhost:5000/api/listings/${listingId}`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { background: '#e8f5e8', color: '#2e7d32' };
      case 'sold':
        return { background: '#fff3e0', color: '#f57c00' };
      case 'expired':
        return { background: '#ffebee', color: '#c62828' };
      default:
        return { background: '#f5f5f5', color: '#666' };
    }
  };

  return (
    <div className="my-listings-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📋 My Crop Listings</h1>
          <p className="page-subtitle">Manage your crop listings and track their performance</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchMyListings}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your listings...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={fetchMyListings} className="retry-button">
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No listings found</h3>
            <p>You haven't created any listings yet. Start by creating your first listing!</p>
            <button 
              className="create-listing-btn"
              onClick={() => window.location.href = '/marketplace'}
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            <div className="listings-stats">
              <div className="stat-card">
                <div className="stat-number">{listings.length}</div>
                <div className="stat-label">Total Listings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{listings.filter(l => l.status === 'active').length}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{listings.filter(l => l.status === 'sold').length}</div>
                <div className="stat-label">Sold</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {formatPrice(listings.reduce((sum, l) => sum + (l.quantity_in_tons * l.expected_price_per_ton), 0))}
                </div>
                <div className="stat-label">Total Value</div>
              </div>
            </div>

            <div className="listings-grid">
              {listings.map((listing) => {
                const isEditing = editingListing === listing._id;
                const isDeleting = deletingListing === listing._id;
                const daysUntilHarvest = getDaysUntilHarvest(listing.harvest_availability_date);
                const totalValue = listing.quantity_in_tons * listing.expected_price_per_ton;
                const statusColors = getStatusColor(listing.status);

                return (
                  <div key={listing._id} className="listing-card">
                    {!isEditing ? (
                      <>
                        <div className="listing-header">
                          <h3 className="listing-title">{listing.title}</h3>
                          <div 
                            className="status-badge"
                            style={statusColors}
                          >
                            {listing.status === 'active' && '✅'}
                            {listing.status === 'sold' && '💰'}
                            {listing.status === 'expired' && '⏰'}
                            {' '}
                            {listing.status.toUpperCase()}
                          </div>
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
                          <div className="listing-meta">
                            <div className="created-date">
                              Created {formatDate(listing.createdAt)}
                            </div>
                            {listing.updatedAt !== listing.createdAt && (
                              <div className="updated-date">
                                Updated {formatDate(listing.updatedAt)}
                              </div>
                            )}
                          </div>
                          
                          <div className="listing-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEdit(listing)}
                              disabled={isDeleting}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDelete(listing._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? '⏳' : '🗑️'} Delete
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Edit form
                      <div className="edit-form">
                        <div className="edit-header">
                          <h3>✏️ Edit Listing</h3>
                          <div className="edit-actions">
                            <button 
                              className="save-btn"
                              onClick={handleSaveEdit}
                            >
                              ✅ Save
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>

                        <div className="edit-form-body">
                          <div className="form-group">
                            <label>Listing Title *</label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="e.g., Premium Quality Sugarcane for Sale"
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
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
                            <div className="form-group">
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

                          <div className="form-row">
                            <div className="form-group">
                              <label>Quantity (tons) *</label>
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
                            <div className="form-group">
                              <label>Expected Price (₹/ton) *</label>
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

                          <div className="form-row">
                            <div className="form-group">
                              <label>Harvest Date *</label>
                              <input
                                type="date"
                                name="harvest_availability_date"
                                value={formData.harvest_availability_date}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="form-group">
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

                          <div className="form-group">
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
                            <div className="total-value-preview">
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
          </>
        )}
      </div>

      <style jsx>{`
        .my-listings-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .dashboard-header {
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

        .refresh-btn {
          background: #2196f3;
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: #1976d2;
          transform: translateY(-1px);
        }

        .dashboard-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

        .create-listing-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1.5rem;
        }

        .listings-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
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

        .listing-meta {
          flex: 1;
        }

        .created-date,
        .updated-date {
          color: #777;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .listing-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn,
        .delete-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #2196f3;
          color: white;
        }

        .edit-btn:hover:not(:disabled) {
          background: #1976d2;
          transform: translateY(-1px);
        }

        .delete-btn {
          background: #f44336;
          color: white;
        }

        .delete-btn:hover:not(:disabled) {
          background: #d32f2f;
          transform: translateY(-1px);
        }

        .edit-btn:disabled,
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Edit Form Styles */
        .edit-form {
          border: 2px solid #4caf50;
          border-radius: 12px;
          overflow: hidden;
        }

        .edit-header {
          background: #4caf50;
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .edit-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-btn,
        .cancel-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn {
          background: white;
          color: #4caf50;
        }

        .save-btn:hover {
          background: #f5f5f5;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .edit-form-body {
          padding: 1.5rem;
          background: white;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4caf50;
        }

        .total-value-preview {
          background: #e8f5e8;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          color: #2e7d32;
          margin-top: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .my-listings-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            padding: 1.5rem;
          }

          .header-content h1 {
            font-size: 2rem;
            justify-content: center;
          }

          .listings-stats {
            grid-template-columns: repeat(2, 1fr);
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

          .listing-actions {
            justify-content: space-between;
          }

          .detail-row {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .edit-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .edit-actions {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default MyListingsDashboard;