import React, { useState } from 'react';

/**
 * CreateListingForm Component
 * 
 * A form component for creating new crop listings with fields for:
 * - Title
 * - Crop variety  
 * - Quantity in gunthas
 * - Expected price per guntha
 * - Harvest availability date
 * - Location
 * - Description (optional)
 * 
 * Usage:
 * <CreateListingForm onSubmit={handleSubmit} isSubmitting={false} />
 */
const CreateListingForm = ({ onSubmit, isSubmitting = false }) => {
  const [
    formData, setFormData] = useState({
    // Basic Information
    title: '',
    sugarcane_variety: '',
    
    // Quality & Seed Information
    disease_free_status: '',
    certification_details: '',
    crop_age: '',
    germination_percentage: '',
    seed_type: '',
    
    // Quantity & Pricing
    quantity_value: '',
    quantity_unit: 'gunthas',
    price_per_unit: '',
    price_negotiable: true,
    minimum_order_quantity: '',
    
    // Delivery Information
    delivery_location: '',
    available_from: '',
    available_until: '',
    preferred_delivery_time: '',
    
    // Images
    farm_images: [],
    
    // Description
    description: '',
    
    // Legacy fields for backward compatibility
    crop_variety: '',
    quantity_in_tons: '',
    expected_price_per_ton: '',
    harvest_availability_date: '',
    location: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const sugarcaneVarieties = [
    'Co 86032', 'Co 0238', 'Co 62175', 'Co 06022', 
    'CoM 0265', 'Co 1148', 'Other'
  ];

  const diseaseStatusOptions = [
    'Certified Disease-Free', 
    'Tested Healthy', 
    'Standard Quality'
  ];

  const seedTypeOptions = [
    '2-Bud Setts', 
    '3-Bud Setts', 
    'Mixed Setts'
  ];

  const quantityUnits = [
    'gunthas'
  ];

  const deliveryTimeOptions = [
    'Morning (6AM-12PM)', 
    'Afternoon (12PM-6PM)', 
    'Evening (6PM-9PM)', 
    'Flexible'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        farm_images: 'Please select only JPEG, JPG, PNG, or WebP images'
      }));
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        farm_images: 'Each image must be smaller than 5MB'
      }));
      return;
    }

    // Limit to 5 images maximum
    if (files.length > 5) {
      setErrors(prev => ({
        ...prev,
        farm_images: 'You can upload maximum 5 images'
      }));
      return;
    }

    setImageFiles(files);
    
    // Clear any previous errors
    if (errors.farm_images) {
      setErrors(prev => ({
        ...prev,
        farm_images: ''
      }));
    }
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }

    if (!formData.sugarcane_variety) {
      newErrors.sugarcane_variety = 'Sugarcane variety is required';
    }

    if (!formData.disease_free_status) {
      newErrors.disease_free_status = 'Disease-free status is required';
    }

    if (!formData.crop_age || formData.crop_age < 1 || formData.crop_age > 24) {
      newErrors.crop_age = 'Crop age must be between 1 and 24 months';
    }

    if (!formData.germination_percentage || formData.germination_percentage < 0 || formData.germination_percentage > 100) {
      newErrors.germination_percentage = 'Germination percentage must be between 0 and 100';
    }

    if (!formData.seed_type) {
      newErrors.seed_type = 'Seed type is required';
    }

    if (!formData.quantity_value || formData.quantity_value <= 0) {
      newErrors.quantity_value = 'Quantity must be greater than 0';
    }

    if (!formData.price_per_unit || formData.price_per_unit <= 0) {
      newErrors.price_per_unit = 'Price per unit must be greater than 0';
    }

    if (!formData.delivery_location.trim()) {
      newErrors.delivery_location = 'Delivery location is required';
    }

    if (!formData.available_from) {
      newErrors.available_from = 'Available from date is required';
    }

    if (!formData.available_until) {
      newErrors.available_until = 'Available until date is required';
    }

    // Date validation
    if (formData.available_from && formData.available_until) {
      const fromDate = new Date(formData.available_from);
      const untilDate = new Date(formData.available_until);
      const today = new Date();
      
      if (fromDate < today) {
        newErrors.available_from = 'Available from date cannot be in the past';
      }
      
      if (untilDate <= fromDate) {
        newErrors.available_until = 'Available until date must be after available from date';
      }
    }

    // Image validation
    if (imageFiles.length === 0) {
      newErrors.farm_images = 'At least one image is required';
    }

    // Minimum order quantity validation
    if (formData.minimum_order_quantity && Number(formData.minimum_order_quantity) > Number(formData.quantity_value)) {
      newErrors.minimum_order_quantity = 'Minimum order quantity cannot be greater than available quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for file upload
      const submissionData = new FormData();
      
      // Add text fields
      submissionData.append('title', formData.title.trim());
      submissionData.append('sugarcane_variety', formData.sugarcane_variety);
      
      // Add quality & seed information
      submissionData.append('seed_quality', JSON.stringify({
        disease_free_status: formData.disease_free_status,
        certification_details: formData.certification_details.trim() || undefined
      }));
      submissionData.append('crop_age', parseInt(formData.crop_age));
      submissionData.append('germination_percentage', parseInt(formData.germination_percentage));
      submissionData.append('seed_type', formData.seed_type);
      
      // Add quantity & pricing
      submissionData.append('quantity_available', JSON.stringify({
        value: parseFloat(formData.quantity_value),
        unit: formData.quantity_unit
      }));
      submissionData.append('price_details', JSON.stringify({
        price_per_unit: parseFloat(formData.price_per_unit),
        price_negotiable: formData.price_negotiable,
        minimum_order_quantity: formData.minimum_order_quantity ? parseFloat(formData.minimum_order_quantity) : undefined
      }));
      
      // Add delivery information
      submissionData.append('delivery_location', formData.delivery_location.trim());
      submissionData.append('delivery_timeframe', JSON.stringify({
        available_from: formData.available_from,
        available_until: formData.available_until,
        preferred_delivery_time: formData.preferred_delivery_time || undefined
      }));
      
      // Add description
      if (formData.description.trim()) {
        submissionData.append('description', formData.description.trim());
      }
      
      // Add images
      imageFiles.forEach((file, index) => {
        submissionData.append('farm_images', file);
      });
      
      // Add legacy fields for backward compatibility
      submissionData.append('crop_variety', formData.sugarcane_variety);
      if (formData.quantity_unit === 'gunthas') {
        submissionData.append('quantity_in_tons', parseFloat(formData.quantity_value));
        submissionData.append('expected_price_per_ton', parseFloat(formData.price_per_unit));
      }
      submissionData.append('harvest_availability_date', formData.available_from);
      submissionData.append('location', formData.delivery_location.trim());

      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(submissionData);
      }
      
      // Reset form after successful submission
      setFormData({
        title: '',
        sugarcane_variety: '',
        disease_free_status: '',
        certification_details: '',
        crop_age: '',
        germination_percentage: '',
        seed_type: '',
        quantity_value: '',
        quantity_unit: 'gunthas',
        price_per_unit: '',
        price_negotiable: true,
        minimum_order_quantity: '',
        delivery_location: '',
        available_from: '',
        available_until: '',
        preferred_delivery_time: '',
        farm_images: [],
        description: '',
        crop_variety: '',
        quantity_in_tons: '',
        expected_price_per_ton: '',
        harvest_availability_date: '',
        location: ''
      });
      setImageFiles([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting listing:', error);
      // Let parent component handle the error display
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="create-listing-form">
      <form onSubmit={handleSubmit} className="listing-form">
        
        {/* Header */}
        <div className="form-header">
          <h2>🌾 Create Sugarcane Listing</h2>
          <p>Provide detailed information about your sugarcane crop</p>
        </div>

        {/* Basic Product Information */}
        <div className="form-section">
          <h3>📝 Product Information</h3>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Product Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Premium Quality Sugarcane Setts - Co 86032"
              disabled={isSubmitting}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sugarcane_variety" className="form-label">
              Sugarcane Variety *
            </label>
            <select
              id="sugarcane_variety"
              name="sugarcane_variety"
              value={formData.sugarcane_variety}
              onChange={handleChange}
              className={`form-input ${errors.sugarcane_variety ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Select a variety</option>
              {sugarcaneVarieties.map(variety => (
                <option key={variety} value={variety}>{variety}</option>
              ))}
            </select>
            {errors.sugarcane_variety && <span className="error-message">{errors.sugarcane_variety}</span>}
          </div>
        </div>

        {/* Quality & Seed Information */}
        <div className="form-section">
          <h3>🧪 Quality & Seed Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="disease_free_status" className="form-label">
                Seed Quality (Disease-Free Status) *
              </label>
              <select
                id="disease_free_status"
                name="disease_free_status"
                value={formData.disease_free_status}
                onChange={handleChange}
                className={`form-input ${errors.disease_free_status ? 'error' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select status</option>
                {diseaseStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.disease_free_status && <span className="error-message">{errors.disease_free_status}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="seed_type" className="form-label">
                Seed Type *
              </label>
              <select
                id="seed_type"
                name="seed_type"
                value={formData.seed_type}
                onChange={handleChange}
                className={`form-input ${errors.seed_type ? 'error' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select seed type</option>
                {seedTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.seed_type && <span className="error-message">{errors.seed_type}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="crop_age" className="form-label">
                Crop Age (months) *
              </label>
              <input
                type="number"
                id="crop_age"
                name="crop_age"
                value={formData.crop_age}
                onChange={handleChange}
                className={`form-input ${errors.crop_age ? 'error' : ''}`}
                placeholder="12"
                min="1"
                max="24"
                disabled={isSubmitting}
              />
              {errors.crop_age && <span className="error-message">{errors.crop_age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="germination_percentage" className="form-label">
                Germination Percentage *
              </label>
              <input
                type="number"
                id="germination_percentage"
                name="germination_percentage"
                value={formData.germination_percentage}
                onChange={handleChange}
                className={`form-input ${errors.germination_percentage ? 'error' : ''}`}
                placeholder="85"
                min="0"
                max="100"
                disabled={isSubmitting}
              />
              <small className="field-hint">Enter percentage (0-100)</small>
              {errors.germination_percentage && <span className="error-message">{errors.germination_percentage}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="certification_details" className="form-label">
              Certification Details (optional)
            </label>
            <input
              type="text"
              id="certification_details"
              name="certification_details"
              value={formData.certification_details}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Certified by Agricultural Department, Certificate No: AG-2024-001"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Quantity & Pricing */}
        <div className="form-section">
          <h3>💰 Quantity & Pricing</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity_value" className="form-label">
                Quantity Available *
              </label>
              <input
                type="number"
                id="quantity_value"
                name="quantity_value"
                value={formData.quantity_value}
                onChange={handleChange}
                className={`form-input ${errors.quantity_value ? 'error' : ''}`}
                placeholder="25.5"
                min="0"
                step="0.1"
                disabled={isSubmitting}
              />
              {errors.quantity_value && <span className="error-message">{errors.quantity_value}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity_value" className="form-label">
                Unit (Gunthas)*
              </label>
              <input
                type="number"
                id="quantity_value"
                name="quantity_value"
                value={formData.quantity_value}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter quantity in guntha"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price_per_unit" className="form-label">
                Price per guntha (₹) *
              </label>
              <input
                type="number"
                id="price_per_unit"
                name="price_per_unit"
                value={formData.price_per_unit}
                onChange={handleChange}
                className={`form-input ${errors.price_per_unit ? 'error' : ''}`}
                placeholder="3500"
                min="0"
                step="1"
                disabled={isSubmitting}
              />
              {errors.price_per_unit && <span className="error-message">{errors.price_per_unit}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="minimum_order_quantity" className="form-label">
                Minimum Order Quantity (optional)
              </label>
              <input
                type="number"
                id="minimum_order_quantity"
                name="minimum_order_quantity"
                value={formData.minimum_order_quantity}
                onChange={handleChange}
                className={`form-input ${errors.minimum_order_quantity ? 'error' : ''}`}
                placeholder="1"
                min="0"
                step="0.1"
                disabled={isSubmitting}
              />
              {errors.minimum_order_quantity && <span className="error-message">{errors.minimum_order_quantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="price_negotiable"
                checked={formData.price_negotiable}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span className="checkmark"></span>
              Price is negotiable
            </label>
          </div>

          {/* Total Value Display */}
          {formData.quantity_value && formData.price_per_unit && (
            <div className="total-value-display">
              <span className="total-label">Total Value:</span>
              <span className="total-amount">
                ₹{(parseFloat(formData.quantity_value || 0) * parseFloat(formData.price_per_unit || 0)).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Delivery Information */}
        <div className="form-section">
          <h3>🚚 Delivery Information</h3>
          
          <div className="form-group">
            <label htmlFor="delivery_location" className="form-label">
              Delivery Location *
            </label>
            <input
              type="text"
              id="delivery_location"
              name="delivery_location"
              value={formData.delivery_location}
              onChange={handleChange}
              className={`form-input ${errors.delivery_location ? 'error' : ''}`}
              placeholder="e.g., Pune, Maharashtra or On-farm pickup available"
              disabled={isSubmitting}
            />
            {errors.delivery_location && <span className="error-message">{errors.delivery_location}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="available_from" className="form-label">
                Available From *
              </label>
              <input
                type="date"
                id="available_from"
                name="available_from"
                value={formData.available_from}
                onChange={handleChange}
                className={`form-input ${errors.available_from ? 'error' : ''}`}
                min={getMinDate()}
                disabled={isSubmitting}
              />
              {errors.available_from && <span className="error-message">{errors.available_from}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="available_until" className="form-label">
                Available Until *
              </label>
              <input
                type="date"
                id="available_until"
                name="available_until"
                value={formData.available_until}
                onChange={handleChange}
                className={`form-input ${errors.available_until ? 'error' : ''}`}
                min={formData.available_from || getMinDate()}
                disabled={isSubmitting}
              />
              {errors.available_until && <span className="error-message">{errors.available_until}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="preferred_delivery_time" className="form-label">
              Preferred Delivery Time (optional)
            </label>
            <select
              id="preferred_delivery_time"
              name="preferred_delivery_time"
              value={formData.preferred_delivery_time}
              onChange={handleChange}
              className="form-input"
              disabled={isSubmitting}
            >
              <option value="">Select preferred time</option>
              {deliveryTimeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>📸 Farm/Crop Images</h3>
          
          <div className="form-group">
            <label htmlFor="farm_images" className="form-label">
              Upload Images (1-5 images) *
            </label>
            <input
              type="file"
              id="farm_images"
              name="farm_images"
              onChange={handleImageChange}
              className={`form-input file-input ${errors.farm_images ? 'error' : ''}`}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              disabled={isSubmitting}
            />
            <small className="field-hint">
              Upload images of your farm, crop, or quality samples. Max 5 images, 5MB each. 
              Accepted formats: JPEG, PNG, WebP
            </small>
            {errors.farm_images && <span className="error-message">{errors.farm_images}</span>}
            
            {/* Image Preview */}
            {imageFiles.length > 0 && (
              <div className="image-preview-grid">
                {Array.from(imageFiles).map((file, index) => (
                  <div key={index} className="image-preview-item">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                    <span className="image-name">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h3>📝 Additional Details</h3>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Additional details about farming methods, soil quality, irrigation, harvest process, storage conditions, or any special features..."
              rows="4"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Creating Listing...
              </>
            ) : (
              '🌾 Create Listing'
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .create-listing-form {
          max-width: 800px;
          margin: 2rem auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e1e5e9;
        }

        .form-header h2 {
          color: #2c5530;
          margin-bottom: 0.5rem;
          font-size: 1.75rem;
        }

        .form-header p {
          color: #666;
          margin: 0;
        }

        .form-section {
          margin-bottom: 2.5rem;
          padding: 1.5rem;
          background: #f8fffe;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
        }

        .form-section h3 {
          color: #2c5530;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .listing-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c5530;
          font-size: 0.9rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-input.error,
        .form-textarea.error {
          border-color: #f44336;
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
        }

        .form-input:disabled,
        .form-textarea:disabled {
          background-color: #f5f5f5;
          
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #999;
        }

        .field-hint {
          color: #666;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .error-message {
          color: #f44336;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          
          gap: 0.5rem;
          font-size: 0.95rem;
          color: #2c5530;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 0.5rem;
          transform: scale(1.2);
        }

        .file-input {
          border-style: dashed;
          background: #f8fffe;
        }

        .file-input:hover {
          border-color: #4CAF50;
          background: #f0fff0;
        }

        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .image-preview-item {
          position: relative;
          background: white;
          border-radius: 6px;
          padding: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .preview-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .remove-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f44336;
          color: white;
          border: none;
          
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-image-btn:hover {
          background: #d32f2f;
        }

        .image-name {
          font-size: 0.7rem;
          color: #666;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .total-value-display {
          background: #e8f5e8;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #4CAF50;
          margin-top: 1rem;
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

        .form-actions {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e1e5e9;
        }

        .submit-button {
          width: 100%;
          padding: 1rem 2rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .submit-button:disabled {
          background: #ccc;
          
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .create-listing-form {
            padding: 1.5rem;
            margin: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-section {
            padding: 1rem;
          }

          .image-preview-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }

          .form-header h2 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .create-listing-form {
            padding: 1rem;
            margin: 0.5rem;
          }

          .form-section h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateListingForm;
