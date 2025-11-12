import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * FarmerPublicProfilePage Component
 * 
 * Public farmer profile page where other farmers can view details
 * and place buy orders for sugarcane crops
 */
const FarmerPublicProfilePage = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  
  const [farmer, setFarmer] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  
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

  // Fetch farmer profile and listings
  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch farmer profile (public route)
        const profileResponse = await axios.get(`http://localhost:5000/api/public/farmers/${farmerId}`);
        setFarmer(profileResponse.data.data);

        // Fetch farmer's listings
        const listingsResponse = await axios.get(`http://localhost:5000/api/listings/marketplace?farmer_id=${farmerId}`);
        setListings(listingsResponse.data.data || []);

      } catch (err) {
        console.error('Error fetching farmer data:', err);
        setError(err.response?.data?.message || 'Failed to load farmer profile');
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchFarmerData();
    }
  }, [farmerId]);

  const handleBuyFormChange = (e) => {
    const { name, value } = e.target;
    setBuyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowBuyForm = (listing) => {
    setSelectedListing(listing);
    setBuyForm(prev => ({
      ...prev,
      quantityWanted: listing.quantity_in_tons,
      proposedPrice: listing.expected_price_per_ton
    }));
    setShowBuyForm(true);
  };

  const handleSubmitBuyOrder = async (e) => {
    e.preventDefault();
    
    if (!selectedListing) return;

    try {
      // Get buyer info from localStorage or require login
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to place a buy order');
        navigate('/login');
        return;
      }

      const orderData = {
        listingId: selectedListing._id,
        farmerId: farmer._id,
        ...buyForm,
        totalAmount: parseFloat(buyForm.quantityWanted) * parseFloat(buyForm.proposedPrice)
      };

      // Submit buy order (you'll need to create this API endpoint)
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
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading farmer profile...</h3>
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

  if (!farmer) {
    return (
      <div className="error-container">
        <h2>❌ Farmer Not Found</h2>
        <p>The farmer profile you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/farmer/marketplace')} className="back-btn">
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="farmer-profile-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/farmer/marketplace')} className="back-btn">
          ← Back to Marketplace
        </button>
        <h1>Farmer Profile</h1>
      </div>

      {/* Farmer Profile Card */}
      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <div className="farmer-avatar">
              <span className="avatar-icon">👨‍🌾</span>
            </div>
            <div className="farmer-info">
              <h2>{farmer.name || 'Unknown Name'}</h2>
              <p className="username">@{farmer.username}</p>
              <div className="farmer-stats">
                <div className="stat">
                  <span className="stat-value">{listings.length}</span>
                  <span className="stat-label">Active Listings</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{farmer.totalSales || 0}</span>
                  <span className="stat-label">Total Sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-section">
            <h3>📞 Contact Information</h3>
            <div className="contact-grid">
              {farmer.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div className="contact-details">
                    <label>Email</label>
                    <span>{farmer.email}</span>
                  </div>
                </div>
              )}
              {farmer.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div className="contact-details">
                    <label>Phone</label>
                    <span>{farmer.phone}</span>
                  </div>
                </div>
              )}
              {farmer.location && (
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div className="contact-details">
                    <label>Location</label>
                    <span>{farmer.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Listings */}
      <div className="listings-section">
        <h2>🌾 Available Crops from {farmer.name}</h2>
        
        {listings.length === 0 ? (
          <div className="no-listings">
            <p>This farmer currently has no active listings.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing._id} className="listing-card">
                <div className="listing-header">
                  <h3>{listing.title}</h3>
                  <span className="variety-badge">{listing.crop_variety}</span>
                </div>
                
                <div className="listing-details">
                  <div className="detail-item">
                    <span className="detail-label">Quantity</span>
                    <span className="detail-value">{listing.quantity_in_tons} tons</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price per ton</span>
                    <span className="detail-value">{formatPrice(listing.expected_price_per_ton)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{listing.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Harvest Date</span>
                    <span className="detail-value">{formatDate(listing.harvest_availability_date)}</span>
                  </div>
                </div>

                {listing.description && (
                  <div className="listing-description">
                    <p>{listing.description}</p>
                  </div>
                )}

                <div className="total-value">
                  <span className="total-label">Total Value:</span>
                  <span className="total-amount">
                    {formatPrice(listing.quantity_in_tons * listing.expected_price_per_ton)}
                  </span>
                </div>

                <div className="listing-actions">
                  <button 
                    className="buy-btn"
                    onClick={() => handleShowBuyForm(listing)}
                  >
                    💰 Place Buy Order
                  </button>
                  <button 
                    className="contact-btn"
                    onClick={() => {
                      const message = `Hi ${farmer.name}, I'm interested in your listing: "${listing.title}". Please let me know if it's still available.`;
                      const mailtoLink = `mailto:${farmer.email}?subject=Interested in ${listing.crop_variety}&body=${encodeURIComponent(message)}`;
                      window.location.href = mailtoLink;
                    }}
                  >
                    📧 Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy Order Form Modal */}
      {showBuyForm && selectedListing && (
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
                <p><strong>Crop:</strong> {selectedListing.title}</p>
                <p><strong>Variety:</strong> {selectedListing.crop_variety}</p>
                <p><strong>Available Quantity:</strong> {selectedListing.quantity_in_tons} tons</p>
                <p><strong>Listed Price:</strong> {formatPrice(selectedListing.expected_price_per_ton)}/ton</p>
              </div>

              <form onSubmit={handleSubmitBuyOrder} className="buy-form">
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
                      max={selectedListing.quantity_in_tons}
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
                    💰 Submit Buy Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .farmer-profile-page {
          max-width: 1200px;
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

        .profile-section {
          margin-bottom: 3rem;
        }

        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .farmer-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4caf50, #45a049);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
        }

        .farmer-info h2 {
          color: #2c5530;
          margin: 0 0 0.5rem 0;
        }

        .username {
          color: #666;
          margin: 0 0 1rem 0;
        }

        .farmer-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #4caf50;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #666;
        }

        .contact-section h3 {
          color: #2c5530;
          margin-bottom: 1rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .contact-icon {
          font-size: 1.5rem;
        }

        .contact-details label {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .contact-details span {
          font-weight: 500;
          color: #333;
        }

        .listings-section h2 {
          color: #2c5530;
          margin-bottom: 2rem;
        }

        .no-listings {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 12px;
          color: #666;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .listing-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .listing-card:hover {
          transform: translateY(-4px);
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .listing-header h3 {
          color: #2c5530;
          margin: 0;
          flex: 1;
        }

        .variety-badge {
          background: #4caf50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .listing-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-weight: 600;
          color: #333;
        }

        .listing-description {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .listing-description p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .total-value {
          background: #e8f5e8;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0;
          border-left: 4px solid #4caf50;
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

        .listing-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .buy-btn {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .buy-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .contact-btn {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contact-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
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
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        /* Responsive */
        @media (max-width: 768px) {
          .farmer-profile-page {
            padding: 1rem;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .farmer-stats {
            justify-content: center;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .listing-details {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .listing-actions {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmerPublicProfilePage;