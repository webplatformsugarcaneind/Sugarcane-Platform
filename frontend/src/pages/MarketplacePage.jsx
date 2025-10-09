import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateListingForm from '../components/CreateListingForm';

/**
 * MarketplacePage Component
 * 
 * Marketplace page where farmers can view, create, and manage
 * crop listings for buying and selling.
 */
const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [loading, setLoading] = useState(true);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myListingsError, setMyListingsError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  // Fetch my listings when My Listings tab is selected
  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyListings();
    }
  }, [activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Make API request with Authorization header
      const response = await axios.get('/api/farmer/listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setListings(response.data.listings || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch listings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      setMyListingsLoading(true);
      setMyListingsError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMyListingsError('No authentication token found');
        return;
      }

      // Make API request to get farmer's own listings
      const response = await axios.get('/api/farmer/listings/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMyListings(response.data.data || []);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      setMyListingsError(
        err.response?.data?.message || 
        'Failed to fetch your listings. Please try again.'
      );
    } finally {
      setMyListingsLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingListingId(listingId);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }

      // Make DELETE request to remove the listing
      await axios.delete(`/api/farmer/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the listing from the local state
      setMyListings(prev => prev.filter(listing => listing._id !== listingId));
      
      // Also remove from all listings if it exists there
      setListings(prev => prev.filter(listing => listing._id !== listingId));

      alert('Listing deleted successfully!');
    } catch (err) {
      console.error('Error deleting listing:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete listing. Please try again.';
      alert(errorMessage);
    } finally {
      setDeletingListingId(null);
    }
  };

  const handleCreateListing = async (formData) => {
    try {
      setIsSubmitting(true);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make POST request to create new listing
      const response = await axios.post('/api/farmer/listings', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Add new listing to the state
      setListings(prev => [response.data.listing, ...prev]);
      
      // Also add to my listings if we have them loaded
      if (activeTab === 'my' || myListings.length > 0) {
        setMyListings(prev => [response.data.listing, ...prev]);
      }
      
      // Close modal
      setIsModalOpen(false);
      
      // Show success message (you could replace this with a toast notification)
      alert('Listing created successfully!');
    } catch (err) {
      console.error('Error creating listing:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create listing. Please try again.';
      alert(errorMessage);
      throw err; // Re-throw to let CreateListingForm handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type) => {
    return type === 'sell' ? '#4caf50' : '#2196f3';
  };

  const getTypeIcon = (type) => {
    return type === 'sell' ? '📤' : '📥';
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <div className="header-content">
          <h1>Marketplace</h1>
          <p className="page-subtitle">Browse and manage crop listings</p>
        </div>
        <button 
          className="create-listing-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Create New Listing
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          🌍 All Listings
        </button>
        <button 
          className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          📋 My Listings
        </button>
      </div>

      {/* Listings Section */}
      <div className="listings-section">
        {activeTab === 'all' ? (
          // All Listings Tab
          <>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading listings...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">⚠️ {error}</p>
                <button 
                  onClick={fetchListings} 
                  className="retry-button"
                >
                  Retry
                </button>
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No listings found</h3>
                <p>Be the first to create a listing in the marketplace!</p>
                <button 
                  className="create-first-listing-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((listing) => (
                  <div key={listing._id} className="listing-card">
                    <div className="listing-header">
                      <div className="listing-type">
                        <span className="type-icon">{getTypeIcon(listing.type)}</span>
                        <span 
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(listing.type) }}
                        >
                          {listing.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="listing-date">
                        {formatDate(listing.createdAt)}
                      </span>
                    </div>

                    <div className="listing-content">
                      <h3 className="crop-name">{listing.cropName}</h3>
                      
                      <div className="listing-details">
                        <div className="detail-item">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{listing.quantity} tons</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">₹{listing.price}/ton</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">📍 {listing.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="listing-footer">
                      <div className="farmer-info">
                        <span className="farmer-name">
                          👤 {listing.farmerId?.name || 'Unknown Farmer'}
                        </span>
                      </div>
                      
                      <div className="listing-actions">
                        <button className="contact-btn">Contact</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // My Listings Tab
          <>
            {myListingsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your listings...</p>
              </div>
            ) : myListingsError ? (
              <div className="error-container">
                <p className="error-message">⚠️ {myListingsError}</p>
                <button 
                  onClick={fetchMyListings} 
                  className="retry-button"
                >
                  Retry
                </button>
              </div>
            ) : myListings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>You haven't created any listings yet</h3>
                <p>Create your first listing to start trading in the marketplace!</p>
                <button 
                  className="create-first-listing-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {myListings.map((listing) => (
                  <div key={listing._id} className="listing-card my-listing-card">
                    <div className="listing-header">
                      <div className="listing-type">
                        <span className="type-icon">{getTypeIcon(listing.type)}</span>
                        <span 
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(listing.type) }}
                        >
                          {listing.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="listing-date">
                        {formatDate(listing.createdAt)}
                      </span>
                    </div>

                    <div className="listing-content">
                      <h3 className="crop-name">{listing.cropName}</h3>
                      
                      <div className="listing-details">
                        <div className="detail-item">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{listing.quantity} tons</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">₹{listing.price}/ton</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">📍 {listing.location}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className={`status-badge ${listing.status}`}>
                            {listing.status === 'active' ? '✅ Active' : '❌ Closed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="listing-footer">
                      <div className="farmer-info">
                        <span className="farmer-name">👤 Your Listing</span>
                      </div>
                      
                      <div className="listing-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            alert('Edit functionality coming soon!');
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteListing(listing._id)}
                          disabled={deletingListingId === listing._id}
                        >
                          {deletingListingId === listing._id ? '⏳ Deleting...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        }

        .marketplace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin: 0;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin: 0.5rem 0 0 0;
        }

        .create-listing-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .create-listing-btn:hover {
          background: #45a049;
          transform: translateY(-2px);
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .tab-button {
          background: transparent;
          border: none;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          color: #666;
        }

        .tab-button:hover {
          color: #4caf50;
          background: rgba(76, 175, 80, 0.05);
        }

        .tab-button.active {
          color: #4caf50;
          border-bottom-color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }

        .listings-section {
          background: #fff;
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
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: 3rem;
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 8px;
        }

        .error-message {
          color: #c53030;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .retry-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
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
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
        }

        .listing-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .listing-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .type-icon {
          font-size: 1.2rem;
        }

        .type-badge {
          color: white;
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .listing-date {
          color: #777;
          font-size: 0.9rem;
        }

        .listing-content {
          margin-bottom: 1.5rem;
        }

        .crop-name {
          color: #2c5530;
          font-size: 1.4rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .listing-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          color: #666;
          font-weight: 500;
        }

        .detail-value {
          color: #333;
          font-weight: 600;
        }

        .listing-footer {
          border-top: 1px solid #e9ecef;
          padding-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .farmer-name {
          color: #666;
          font-size: 0.9rem;
        }

        .listing-actions {
          display: flex;
          gap: 0.5rem;
        }

        .contact-btn,
        .edit-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .contact-btn {
          background: #2196f3;
          color: white;
        }

        .contact-btn:hover {
          background: #1976d2;
        }

        .edit-btn {
          background: #ff9800;
          color: white;
        }

        .edit-btn:hover {
          background: #f57c00;
        }

        .delete-btn {
          background: #f44336;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-btn:hover:not(:disabled) {
          background: #d32f2f;
        }

        .delete-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .my-listing-card {
          border-left: 4px solid #4caf50;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status-badge.closed {
          background: #ffebee;
          color: #c62828;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e9ecef;
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
          padding: 0.25rem;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: #f5f5f5;
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
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .listing-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .listing-actions {
            justify-content: center;
          }

          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplacePage;