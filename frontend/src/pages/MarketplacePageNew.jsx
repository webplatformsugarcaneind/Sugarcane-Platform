import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateListingFormNew from '../components/CreateListingFormNew';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

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
      if (filterLocation) params.append('location', filterLocation);
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
      setError(
        err.response?.data?.message || 
        'Failed to fetch listings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [filterVariety, filterLocation, sortBy]);

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
    // Navigate to individual listing details page
    navigate(`/farmer/listing/${listing._id}`, { 
      state: { listing } 
    });
  };

  const fetchMyListings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/listings/my-listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyListings(data.data || []);
      } else if (response.status === 401) {
        console.log('Not authenticated or session expired');
        setMyListings([]);
      } else {
        console.error('Error fetching my listings:', response.status);
        setMyListings([]);
      }
    } catch (error) {
      console.error('Error fetching my listings:', error);
      setMyListings([]);
    }
  };

  const toggleMyListings = async () => {
    if (!showMyListings) {
      await fetchMyListings();
    }
    setShowMyListings(!showMyListings);
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
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <h1>🌾 Sugarcane Marketplace</h1>
          <p className="page-subtitle">Discover and trade quality sugarcane crops</p>
        </div>
        <button 
          className="create-listing-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Post New Listing
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by title, variety, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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

          <input
            type="text"
            placeholder="Filter by location..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="filter-input"
          />

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

          <button onClick={fetchListings} className="refresh-btn">
            🔄 Refresh
          </button>
          
          <button onClick={toggleMyListings} className="my-listings-btn">
            📋 {showMyListings ? 'Hide My Listings' : 'Show My Listings'}
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
                const daysUntilHarvest = Math.ceil(
                  (new Date(listing.harvest_availability_date) - new Date()) / (1000 * 60 * 60 * 24)
                );
                const totalValue = listing.quantity_in_tons * listing.expected_price_per_ton;

                return (
                  <div key={listing._id} className="listing-card my-listing">
                    <div className="listing-header">
                      <span className="status-badge status-badge-my">{listing.status.toUpperCase()}</span>
                      <div className="listing-actions-header">
                        <button className="edit-btn" title="Edit Listing">✏️</button>
                        <button className="delete-btn" title="Delete Listing">🗑️</button>
                      </div>
                    </div>
                    
                    <div className="listing-content">
                      <div className="listing-title-row">
                        <h3 className="listing-title">{listing.title}</h3>
                        <div className="variety-info">
                          <span className="variety-badge">{listing.crop_variety}</span>
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

      {/* Listings Section */}
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
          cursor: pointer;
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

        .contact-btn {
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
          cursor: pointer;
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