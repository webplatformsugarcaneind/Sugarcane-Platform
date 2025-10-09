import React, { useState } from 'react';

/**
 * CreateListingForm Component
 * 
 * A form component for creating new crop listings with fields for:
 * - Type (buy/sell dropdown)
 * - Crop name
 * - Quantity
 * - Price
 * - Location
 * 
 * Usage:
 * <CreateListingForm onSubmit={handleSubmit} />
 */
const CreateListingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'sell',
    cropName: '',
    quantity: '',
    price: '',
    location: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Reset form after successful submission
      setFormData({
        type: 'sell',
        cropName: '',
        quantity: '',
        price: '',
        location: ''
      });
    } catch (error) {
      console.error('Error submitting listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-listing-form">
      <h2 className="form-title">Create New Listing</h2>
      
      <form onSubmit={handleSubmit} className="listing-form">
        {/* Type Selection */}
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Listing Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="sell">Sell</option>
            <option value="buy">Buy</option>
          </select>
        </div>

        {/* Crop Name */}
        <div className="form-group">
          <label htmlFor="cropName" className="form-label">
            Crop Name
          </label>
          <input
            type="text"
            id="cropName"
            name="cropName"
            value={formData.cropName}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Sugarcane, Rice, Wheat"
            required
          />
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label htmlFor="quantity" className="form-label">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter quantity in tons"
            min="0"
            step="0.1"
            required
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label htmlFor="price" className="form-label">
            Price (per ton)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter price per ton"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Mumbai, Maharashtra"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .create-listing-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .form-title {
          text-align: center;
          color: #2c5530;
          margin-bottom: 2rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .listing-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-input::placeholder {
          color: #999;
        }

        .form-actions {
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.875rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .submit-button:active {
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .create-listing-form {
            margin: 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateListingForm;