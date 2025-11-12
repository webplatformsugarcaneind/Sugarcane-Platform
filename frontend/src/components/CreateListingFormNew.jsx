import React, { useState } from 'react';

/**
 * CreateListingForm Component
 * 
 * A form component for creating new crop listings with fields for:
 * - Title
 * - Crop variety  
 * - Quantity in tons
 * - Expected price per ton
 * - Harvest availability date
 * - Location
 * - Description (optional)
 * 
 * Usage:
 * <CreateListingForm onSubmit={handleSubmit} isSubmitting={false} />
 */
const CreateListingForm = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    crop_variety: '',
    quantity_in_tons: '',
    expected_price_per_ton: '',
    harvest_availability_date: '',
    location: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.crop_variety.trim()) {
      newErrors.crop_variety = 'Crop variety is required';
    }

    if (!formData.quantity_in_tons) {
      newErrors.quantity_in_tons = 'Quantity is required';
    } else if (parseFloat(formData.quantity_in_tons) <= 0) {
      newErrors.quantity_in_tons = 'Quantity must be greater than 0';
    }

    if (!formData.expected_price_per_ton) {
      newErrors.expected_price_per_ton = 'Price is required';
    } else if (parseFloat(formData.expected_price_per_ton) <= 0) {
      newErrors.expected_price_per_ton = 'Price must be greater than 0';
    }

    if (!formData.harvest_availability_date) {
      newErrors.harvest_availability_date = 'Harvest date is required';
    } else {
      const harvestDate = new Date(formData.harvest_availability_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (harvestDate < today) {
        newErrors.harvest_availability_date = 'Harvest date cannot be in the past';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
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
      // Prepare form data for submission
      const submissionData = {
        title: formData.title.trim(),
        crop_variety: formData.crop_variety.trim(),
        quantity_in_tons: parseFloat(formData.quantity_in_tons),
        expected_price_per_ton: parseFloat(formData.expected_price_per_ton),
        harvest_availability_date: formData.harvest_availability_date,
        location: formData.location.trim(),
        description: formData.description.trim() || undefined
      };

      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(submissionData);
      }
      
      // Reset form after successful submission
      setFormData({
        title: '',
        crop_variety: '',
        quantity_in_tons: '',
        expected_price_per_ton: '',
        harvest_availability_date: '',
        location: '',
        description: ''
      });
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
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Listing Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g., Premium Quality Sugarcane for Sale"
            disabled={isSubmitting}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Crop Variety */}
        <div className="form-group">
          <label htmlFor="crop_variety" className="form-label">
            Crop Variety *
          </label>
          <input
            type="text"
            id="crop_variety"
            name="crop_variety"
            value={formData.crop_variety}
            onChange={handleChange}
            className={`form-input ${errors.crop_variety ? 'error' : ''}`}
            placeholder="e.g., Co 86032, Co 238, Co 0233"
            disabled={isSubmitting}
          />
          {errors.crop_variety && <span className="error-message">{errors.crop_variety}</span>}
        </div>

        {/* Quantity and Price Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity_in_tons" className="form-label">
              Quantity (tons) *
            </label>
            <input
              type="number"
              id="quantity_in_tons"
              name="quantity_in_tons"
              value={formData.quantity_in_tons}
              onChange={handleChange}
              className={`form-input ${errors.quantity_in_tons ? 'error' : ''}`}
              placeholder="25.5"
              min="0"
              step="0.1"
              disabled={isSubmitting}
            />
            {errors.quantity_in_tons && <span className="error-message">{errors.quantity_in_tons}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expected_price_per_ton" className="form-label">
              Price per Ton (₹) *
            </label>
            <input
              type="number"
              id="expected_price_per_ton"
              name="expected_price_per_ton"
              value={formData.expected_price_per_ton}
              onChange={handleChange}
              className={`form-input ${errors.expected_price_per_ton ? 'error' : ''}`}
              placeholder="3500"
              min="0"
              step="1"
              disabled={isSubmitting}
            />
            {errors.expected_price_per_ton && <span className="error-message">{errors.expected_price_per_ton}</span>}
          </div>
        </div>

        {/* Harvest Date and Location Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="harvest_availability_date" className="form-label">
              Harvest Available Date *
            </label>
            <input
              type="date"
              id="harvest_availability_date"
              name="harvest_availability_date"
              value={formData.harvest_availability_date}
              onChange={handleChange}
              className={`form-input ${errors.harvest_availability_date ? 'error' : ''}`}
              min={getMinDate()}
              disabled={isSubmitting}
            />
            {errors.harvest_availability_date && <span className="error-message">{errors.harvest_availability_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="e.g., Pune, Maharashtra"
              disabled={isSubmitting}
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>
        </div>

        {/* Description */}
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
            placeholder="Additional details about the crop quality, farming methods, etc."
            rows="4"
            disabled={isSubmitting}
          />
        </div>

        {/* Total Value Display */}
        {formData.quantity_in_tons && formData.expected_price_per_ton && (
          <div className="total-value-display">
            <span className="total-label">Total Expected Value:</span>
            <span className="total-amount">
              ₹{(parseFloat(formData.quantity_in_tons || 0) * parseFloat(formData.expected_price_per_ton || 0)).toLocaleString()}
            </span>
          </div>
        )}

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
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
        }

        .listing-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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

        .form-label {
          font-weight: 600;
          color: #2c5530;
          font-size: 0.9rem;
        }

        .form-input,
        .form-textarea {
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
          cursor: not-allowed;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #999;
        }

        .error-message {
          color: #f44336;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .total-value-display {
          background: #e8f5e8;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #4CAF50;
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
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
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
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          width: 25px;
          height: 25px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          display: inline-block;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .create-listing-form {
            padding: 1.5rem;
            margin: 0;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateListingForm;