import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditListingPage = () => {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(location.state?.listing || null);
  const [loading, setLoading] = useState(!listing);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state with comprehensive fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sugarcane_variety: '',
    seed_quality: {
      seed_type: '',
      certified_seed: false,
      disease_free_status: ''
    },
    crop_age: '',
    germination_percentage: '',
    quantity_available: {
      value: '',
      unit: 'gunthas'
    },
    price_details: {
      base_price_per_ton: '',
      negotiable: false,
      bulk_discount_available: false
    },
    delivery_timeframe: {
      available_from: '',
      available_until: '',
      preferred_delivery_time: ''
    },
    farm_images: []
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);

  // Fetch listing if not provided via state
  useEffect(() => {
    const fetchListing = async () => {
      if (listing) {
        populateForm(listing);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/listings/${listingId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          const fetchedListing = response.data.data;
          setListing(fetchedListing);
          populateForm(fetchedListing);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, listing]);

  const populateForm = (listingData) => {
    console.log('📝 Populating form with listing data:', listingData);
    
    // Handle both old and new schema formats
    let variety = listingData.sugarcane_variety || listingData.crop_variety || '';
    
    // Map legacy variety values to new format
    const varietyMapping = {
      'Com 0265': 'CoM 0265',
      'CO 0265': 'CoM 0265',
      'COM 0265': 'CoM 0265'
    };
    if (varietyMapping[variety]) {
      variety = varietyMapping[variety];
    }
    
    // Keep disease_free_status as-is from database (model enum: 'Certified Disease-Free', 'Tested Healthy', 'Standard Quality')
    const diseaseStatus = listingData.seed_quality?.disease_free_status || '';
    
    const quantityValue = listingData.quantity_available?.value || listingData.quantity_in_tons || '';
    const priceValue = listingData.price_details?.base_price_per_ton || 
                       listingData.price_details?.price_per_unit || 
                       listingData.expected_price_per_ton || '';
    const availableFrom = listingData.delivery_timeframe?.available_from || 
                          listingData.harvest_availability_date || '';
    
    const formValues = {
      title: listingData.title || '',
      description: listingData.description || '',
      sugarcane_variety: variety,
      seed_quality: {
        seed_type: listingData.seed_quality?.seed_type || '',
        certified_seed: listingData.seed_quality?.certified_seed || false,
        disease_free_status: diseaseStatus
      },
      crop_age: listingData.crop_age?.toString() || '',
      germination_percentage: listingData.germination_percentage?.toString() || '',
      quantity_available: {
        value: quantityValue ? quantityValue.toString() : '',
        unit: 'gunthas'
      },
      price_details: {
        base_price_per_ton: priceValue ? priceValue.toString() : '',
        negotiable: listingData.price_details?.negotiable || false,
        bulk_discount_available: listingData.price_details?.bulk_discount_available || false
      },
      delivery_timeframe: {
        available_from: availableFrom ? availableFrom.split('T')[0] : '',
        available_until: listingData.delivery_timeframe?.available_until 
          ? listingData.delivery_timeframe.available_until.split('T')[0] 
          : '',
        preferred_delivery_time: listingData.delivery_timeframe?.preferred_delivery_time || ''
      },
      farm_images: []
    };
    
    console.log('✅ Form populated with values:', {
      variety: formValues.sugarcane_variety,
      seed_type: formValues.seed_quality.seed_type,
      disease_status: formValues.seed_quality.disease_free_status,
      crop_age: formValues.crop_age,
      germination: formValues.germination_percentage,
      quantity: formValues.quantity_available.value,
      price: formValues.price_details.base_price_per_ton
    });
    
    setFormData(formValues);
    
    // Store existing images
    if (listingData.farm_images && listingData.farm_images.length > 0) {
      setExistingImages(listingData.farm_images);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = files.length + existingImages.length;
    
    if (totalImages > 5) {
      setErrors(prev => ({ ...prev, farm_images: `Maximum 5 images allowed. You already have ${existingImages.length} images.` }));
      return;
    }
    
    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, farm_images: 'Only JPEG, PNG, and WebP images allowed' }));
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, farm_images: 'Each image must be less than 5MB' }));
        return false;
      }
      return true;
    });
    
    setImageFiles(validFiles);
    setErrors(prev => ({ ...prev, farm_images: '' }));
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    // Basic validation - only check required fields
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.sugarcane_variety) {
      newErrors.sugarcane_variety = 'Variety is required';
    }
    if (!formData.quantity_available.value || parseFloat(formData.quantity_available.value) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.price_details.base_price_per_ton || parseFloat(formData.price_details.base_price_per_ton) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.delivery_timeframe.available_from) {
      newErrors.available_from = 'Available from date is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      alert('❌ Please fill in all required fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to update listing');
        navigate('/login');
        return;
      }
      
      const submissionData = new FormData();
      
      // Add all form fields
      submissionData.append('title', formData.title);
      submissionData.append('description', formData.description);
      submissionData.append('sugarcane_variety', formData.sugarcane_variety);
      submissionData.append('seed_quality', JSON.stringify(formData.seed_quality));
      
      // Only add crop_age and germination_percentage if they have values
      if (formData.crop_age) {
        submissionData.append('crop_age', formData.crop_age);
      }
      if (formData.germination_percentage) {
        submissionData.append('germination_percentage', formData.germination_percentage);
      }
      
      submissionData.append('quantity_available', JSON.stringify(formData.quantity_available));
      submissionData.append('price_details', JSON.stringify(formData.price_details));
      submissionData.append('delivery_timeframe', JSON.stringify(formData.delivery_timeframe));
      
      console.log('📤 Submitting update data...');
      
      // Add new images
      imageFiles.forEach(file => {
        submissionData.append('farm_images', file);
      });
      
      // Keep existing images
      if (existingImages.length > 0) {
        submissionData.append('keep_existing_images', JSON.stringify(existingImages));
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/listings/${listingId}`,
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        alert('✅ Listing updated successfully!');
        navigate(`/farmer/listing/${listingId}`);
      } else {
        console.error('❌ Update failed:', response.data);
        alert('❌ Failed to update listing: ' + response.data.message);
      }
      
    } catch (err) {
      console.error('❌ Error updating listing:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Failed to update listing. Please try again.';
      
      if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading listing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/farmer/my-listings')} className="back-btn">
          ← Back to My Listings
        </button>
      </div>
    );
  }

  return (
    <div className="edit-listing-page">
      <div className="page-header">
        <button onClick={() => navigate(`/farmer/listing/${listingId}`)} className="back-btn">
          ← Back to Listing
        </button>
        <h1>✏️ Edit Listing</h1>
      </div>

      <div className="edit-form-container">
        <form onSubmit={handleSubmit} className="edit-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>📝 Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Listing Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                required
                disabled={isSubmitting}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Sugarcane Details */}
          <div className="form-section">
            <h3>🌾 Sugarcane Details</h3>
            
            <div className="form-group">
              <label htmlFor="sugarcane_variety">Variety *</label>
              <select
                id="sugarcane_variety"
                name="sugarcane_variety"
                value={formData.sugarcane_variety}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isSubmitting}
              >
                <option value="">Select variety</option>
                <option value="Co 86032">Co 86032</option>
                <option value="Co 0238">Co 0238</option>
                <option value="Co 62175">Co 62175</option>
                <option value="Co 06022">Co 06022</option>
                <option value="CoM 0265">CoM 0265</option>
                <option value="Co 1148">Co 1148</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="seed_quality.seed_type">Seed Type</label>
                <select
                  id="seed_quality.seed_type"
                  name="seed_quality.seed_type"
                  value={formData.seed_quality.seed_type}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Select seed type (Optional)</option>
                  <option value="2-Bud Setts">2-Bud Setts</option>
                  <option value="3-Bud Setts">3-Bud Setts</option>
                  <option value="Mixed Setts">Mixed Setts</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="seed_quality.disease_free_status">Disease Status</label>
                <select
                  id="seed_quality.disease_free_status"
                  name="seed_quality.disease_free_status"
                  value={formData.seed_quality.disease_free_status}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Select status (Optional)</option>
                  <option value="Certified Disease-Free">Certified Disease-Free</option>
                  <option value="Tested Healthy">Tested Healthy</option>
                  <option value="Standard Quality">Standard Quality</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="crop_age">Crop Age (months)</label>
                <input
                  type="number"
                  id="crop_age"
                  name="crop_age"
                  value={formData.crop_age}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                  max="24"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="germination_percentage">Germination %</label>
                <input
                  type="number"
                  id="germination_percentage"
                  name="germination_percentage"
                  value={formData.germination_percentage}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="seed_quality.certified_seed"
                  checked={formData.seed_quality.certified_seed}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                Certified Seed
              </label>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="form-section">
            <h3>💰 Quantity & Pricing</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity_available.value">Available Quantity (Gunthas) *</label>
                <input
                  type="number"
                  id="quantity_available.value"
                  name="quantity_available.value"
                  value={formData.quantity_available.value}
                  onChange={handleChange}
                  className="form-input"
                  min="0.1"
                  step="0.1"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price_details.base_price_per_ton">Price per Guntha (₹) *</label>
                <input
                  type="number"
                  id="price_details.base_price_per_ton"
                  name="price_details.base_price_per_ton"
                  value={formData.price_details.base_price_per_ton}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="price_details.negotiable"
                  checked={formData.price_details.negotiable}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                Price Negotiable
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="price_details.bulk_discount_available"
                  checked={formData.price_details.bulk_discount_available}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                Bulk Discount Available
              </label>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="form-section">
            <h3>📅 Delivery Timeline</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="delivery_timeframe.available_from">Available From *</label>
                <input
                  type="date"
                  id="delivery_timeframe.available_from"
                  name="delivery_timeframe.available_from"
                  value={formData.delivery_timeframe.available_from}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="delivery_timeframe.available_until">Available Until *</label>
                <input
                  type="date"
                  id="delivery_timeframe.available_until"
                  name="delivery_timeframe.available_until"
                  value={formData.delivery_timeframe.available_until}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h3>📸 Farm/Crop Images</h3>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="existing-images">
                <h4>Current Images</h4>
                <div className="image-preview-grid">
                  {existingImages.map((image, index) => {
                    const imageUrl = typeof image === 'object' 
                      ? `http://localhost:5000${image.url}` 
                      : `http://localhost:5000/${image}`;
                    
                    return (
                      <div key={index} className="image-preview-item">
                        <img src={imageUrl} alt={`Existing ${index + 1}`} className="preview-image"/>
                        <button 
                          type="button"
                          onClick={() => removeExistingImage(index)} 
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* New Images Upload */}
            <div className="form-group">
              <label htmlFor="farm_images">Add New Images (Max {5 - existingImages.length} more)</label>
              <input
                type="file"
                id="farm_images"
                name="farm_images"
                onChange={handleImageChange}
                className={`form-input file-input ${errors.farm_images ? 'error' : ''}`}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                disabled={isSubmitting || existingImages.length >= 5}
              />
              <small className="field-hint">
                Upload images of your farm, crop, or quality samples. Max 5 images total, 5MB each.
              </small>
              {errors.farm_images && <span className="error-message">{errors.farm_images}</span>}
              
              {/* New Image Previews */}
              {imageFiles.length > 0 && (
                <div className="image-preview-grid">
                  {Array.from(imageFiles).map((file, index) => (
                    <div key={index} className="image-preview-item">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`New Preview ${index + 1}`} 
                        className="preview-image"
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)} 
                        className="remove-image-btn"
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

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/farmer/listing/${listingId}`)}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Updating...
                </>
              ) : (
                '💾 Update Listing'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .edit-listing-page {
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e1e5e9;
        }

        .page-header h1 {
          color: #2c5530;
          margin: 0;
        }

        .back-btn {
          background: #f0f0f0;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: #e0e0e0;
        }

        .edit-form-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          padding: 1.5rem;
          background: #f8fffe;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
        }

        .form-section h3 {
          color: #2c5530;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group label {
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

        .form-input.error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .field-hint {
          color: #666;
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

        .existing-images h4 {
          color: #2c5530;
          margin-bottom: 1rem;
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

        .form-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e1e5e9;
        }

        .cancel-button {
          flex: 1;
          padding: 1rem 2rem;
          background: #f0f0f0;
          color: #333;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          
          transition: all 0.3s ease;
        }

        .cancel-button:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .submit-button {
          flex: 2;
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

        .submit-button:disabled,
        .cancel-button:disabled {
          opacity: 0.6;
          
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container,
        .error-container {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .edit-listing-page {
            margin: 1rem;
          }

          .edit-form-container {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-section {
            padding: 1rem;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default EditListingPage;
