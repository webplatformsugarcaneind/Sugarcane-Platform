import React, { useState, useEffect, useCallback } from 'react';
import './PostBillForm.css';

const PostBillForm = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    farmerId: '',
    cropQuantity: '',
    totalAmount: ''
  });
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);

  // Fetch farmers on component mount
  useEffect(() => {
    fetchFarmers();
  }, []);

  // Filter farmers based on search term - memoized to prevent unnecessary re-renders
  const filterFarmers = useCallback((searchValue, farmersData) => {
    if (!searchValue) {
      return farmersData;
    }
    return farmersData.filter(farmer =>
      farmer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      farmer.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      farmer.phone.includes(searchValue)
    );
  }, []);

  // Filter farmers based on search term
  useEffect(() => {
    const filtered = filterFarmers(searchTerm, farmers);
    setFilteredFarmers(filtered);
  }, [searchTerm, farmers, filterFarmers]);

  const fetchFarmers = async () => {
    setIsLoadingFarmers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/public/farmers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFarmers(data.data || []);
        setFilteredFarmers(data.data || []);
      } else {
        console.error('Failed to fetch farmers');
        // Fallback: Create mock farmers for development
        const mockFarmers = [
          { _id: '1', name: 'John Farmer', email: 'john@example.com', phone: '123-456-7890' },
          { _id: '2', name: 'Jane Agriculture', email: 'jane@example.com', phone: '098-765-4321' },
          { _id: '3', name: 'Bob Sugarcane', email: 'bob@example.com', phone: '555-123-4567' }
        ];
        setFarmers(mockFarmers);
        setFilteredFarmers(mockFarmers);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setIsLoadingFarmers(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Clear selected farmer if search term changes (only if it's a significant change)
    if (selectedFarmer && value !== selectedFarmer.name && !value.toLowerCase().includes(selectedFarmer.name.toLowerCase())) {
      setSelectedFarmer(null);
      setFormData(prev => ({ ...prev, farmerId: '' }));
    }
  }, [selectedFarmer]);

  const handleFarmerSelect = useCallback((farmer) => {
    setSelectedFarmer(farmer);
    setSearchTerm(farmer.name);
    setFormData(prev => ({
      ...prev,
      farmerId: farmer._id
    }));
    setShowDropdown(false);
    
    // Clear farmer error
    if (errors.farmerId) {
      setErrors(prev => ({
        ...prev,
        farmerId: ''
      }));
    }
  }, [errors.farmerId]);

  const validateForm = () => {
    const newErrors = {};

    // Validate farmer selection
    if (!formData.farmerId) {
      newErrors.farmerId = 'Please select a farmer';
    }

    // Validate crop quantity
    if (!formData.cropQuantity) {
      newErrors.cropQuantity = 'Crop quantity is required';
    } else if (isNaN(formData.cropQuantity) || parseFloat(formData.cropQuantity) <= 0) {
      newErrors.cropQuantity = 'Please enter a valid quantity greater than 0';
    }

    // Validate total amount
    if (!formData.totalAmount) {
      newErrors.totalAmount = 'Total amount is required';
    } else if (isNaN(formData.totalAmount) || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        farmerId: formData.farmerId,
        cropQuantity: parseFloat(formData.cropQuantity),
        totalAmount: parseFloat(formData.totalAmount),
        farmerDetails: selectedFarmer
      };
      
      onSubmit(submitData);
    }
  };

  const handleReset = () => {
    setFormData({
      farmerId: '',
      cropQuantity: '',
      totalAmount: ''
    });
    setSearchTerm('');
    setSelectedFarmer(null);
    setErrors({});
    setShowDropdown(false);
  };

  return (
    <div className="post-bill-form-container">
      <form onSubmit={handleSubmit} className="post-bill-form">
        <div className="form-header">
          <h2 className="form-title">Create New Bill</h2>
          <p className="form-subtitle">Generate a billing record for a farmer</p>
        </div>

        {/* Farmer Selection */}
        <div className="form-group">
          <label htmlFor="farmerSearch" className="form-label">
            Select Farmer *
          </label>
          <div className="farmer-search-container">
            <input
              type="text"
              id="farmerSearch"
              className={`form-input farmer-search ${errors.farmerId ? 'error' : ''}`}
              placeholder={isLoadingFarmers ? "Loading farmers..." : "Search by name, email, or phone..."}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              disabled={isLoadingFarmers}
            />
            <div className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            
            {showDropdown && filteredFarmers.length > 0 && (
              <div className="farmer-dropdown">
                {filteredFarmers.map(farmer => (
                  <div
                    key={farmer._id}
                    className="dropdown-item"
                    onClick={() => handleFarmerSelect(farmer)}
                  >
                    <div className="farmer-info">
                      <div className="farmer-name">{farmer.name}</div>
                      <div className="farmer-details">
                        {farmer.email} • {farmer.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.farmerId && <span className="error-message">{errors.farmerId}</span>}
          
          {selectedFarmer && (
            <div className="selected-farmer">
              <div className="selected-farmer-info">
                <strong>{selectedFarmer.name}</strong>
                <span>{selectedFarmer.email} • {selectedFarmer.phone}</span>
              </div>
              <button
                type="button"
                className="clear-selection"
                onClick={() => {
                  setSelectedFarmer(null);
                  setSearchTerm('');
                  setFormData(prev => ({ ...prev, farmerId: '' }));
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Crop Quantity */}
        <div className="form-group">
          <label htmlFor="cropQuantity" className="form-label">
            Crop Quantity (tons) *
          </label>
          <input
            type="number"
            id="cropQuantity"
            name="cropQuantity"
            className={`form-input ${errors.cropQuantity ? 'error' : ''}`}
            placeholder="Enter quantity in tons"
            value={formData.cropQuantity}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
          {errors.cropQuantity && <span className="error-message">{errors.cropQuantity}</span>}
        </div>

        {/* Total Amount */}
        <div className="form-group">
          <label htmlFor="totalAmount" className="form-label">
            Total Amount Due ($) *
          </label>
          <input
            type="number"
            id="totalAmount"
            name="totalAmount"
            className={`form-input ${errors.totalAmount ? 'error' : ''}`}
            placeholder="Enter total amount"
            value={formData.totalAmount}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
          {errors.totalAmount && <span className="error-message">{errors.totalAmount}</span>}
        </div>

        {/* Calculated Rate Display */}
        {formData.cropQuantity && formData.totalAmount && (
          <div className="calculation-display">
            <div className="rate-info">
              Rate per ton: ${(parseFloat(formData.totalAmount) / parseFloat(formData.cropQuantity)).toFixed(2)}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel || handleReset}
            disabled={isLoading}
          >
            {onCancel ? 'Cancel' : 'Reset'}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || isLoadingFarmers}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Bill...
              </>
            ) : (
              'Create Bill'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostBillForm;