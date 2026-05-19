import React, { useState } from 'react';
import Modal from './Modal';

/**
 * ContractRequestModal Component
 * Modal for HHMs to create contract requests to Factories
 */
const ContractRequestModal = ({
  isOpen,
  onClose,
  factoryInfo,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    vehicle: '',
    labor: '',
    contractType: '',
    title: '',
    priority: 'medium',
    contractValue: '',
    durationDays: '',
    initialMessage: ''
  });

  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicle.trim()) {
      newErrors.vehicle = 'Vehicle information is required';
    }

    if (!formData.labor.trim()) {
      newErrors.labor = 'Labor details are required';
    }

    if (!formData.contractType.trim()) {
      newErrors.contractType = 'Contract type is required';
    }

    if (formData.contractValue && isNaN(Number(formData.contractValue))) {
      newErrors.contractValue = 'Contract value must be a valid number';
    }

    if (formData.durationDays && (isNaN(Number(formData.durationDays)) || Number(formData.durationDays) < 1)) {
      newErrors.durationDays = 'Duration must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || loading) {
      return;
    }

    // Prepare the request details object
    const hhmRequestDetails = {
      vehicle: formData.vehicle,
      labor: formData.labor,
      contractType: formData.contractType,
      additionalRequirements: formData.initialMessage || ''
    };

    const requestData = {
      factory_id: factoryInfo._id || factoryInfo.id,
      hhm_request_details: hhmRequestDetails,
      title: formData.title || `Contract Request for ${factoryInfo.factoryName || factoryInfo.name}`,
      initial_message: formData.initialMessage,
      priority: formData.priority,
      contract_value: formData.contractValue ? Number(formData.contractValue) : undefined,
      duration_days: formData.durationDays ? Number(formData.durationDays) : undefined
    };

    try {
      await onSubmit(requestData);
      // Reset form on successful submission
      resetForm();
    } catch (error) {
      console.error('Error submitting contract request:', error);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      vehicle: '',
      labor: '',
      contractType: '',
      title: '',
      priority: 'medium',
      contractValue: '',
      durationDays: '',
      initialMessage: ''
    });
    setErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Request Contract - ${factoryInfo?.factoryName || factoryInfo?.name || 'Factory'}`}
      size="medium"
      className="marketplace-style-modal"
    >
      <div className="create-listing-form">
        <form onSubmit={handleSubmit} className="listing-form">
          {/* Factory Info */}
          <div className="total-value-display" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem', background: '#e8f5e8', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
            <span className="total-label" style={{ fontWeight: '600', color: '#2c5530' }}>📍 Factory Details</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', color: '#2e7d32' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#4CAF50' }}>Name</span>
                <div className="total-amount" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{factoryInfo?.factoryName || factoryInfo?.name}</div>
              </div>
              {factoryInfo?.factoryLocation && (
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#4CAF50' }}>Location</span>
                  <div className="total-amount" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{factoryInfo.factoryLocation}</div>
                </div>
              )}
              {factoryInfo?.capacity && (
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#4CAF50' }}>Capacity</span>
                  <div className="total-amount" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{factoryInfo.capacity}</div>
                </div>
              )}
            </div>
          </div>

          {/* Contract Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Contract Title <span style={{ fontWeight: 'normal', color: '#999' }}>(Optional)</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Harvest Season Partnership 2024"
              disabled={loading}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Required Fields Row */}
          <div className="form-row">
            {/* Vehicle */}
            <div className="form-group">
              <label htmlFor="vehicle" className="form-label">
                Vehicle Requirements *
              </label>
              <input
                type="text"
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                placeholder="e.g., 2 trucks, 1 tractor"
                className={`form-input ${errors.vehicle ? 'error' : ''}`}
                disabled={loading}
                required
              />
              {errors.vehicle && <span className="error-message">{errors.vehicle}</span>}
            </div>

            {/* Labor */}
            <div className="form-group">
              <label htmlFor="labor" className="form-label">
                Labor Requirements *
              </label>
              <input
                type="text"
                id="labor"
                name="labor"
                value={formData.labor}
                onChange={handleInputChange}
                placeholder="e.g., 50 workers, 8-hour shifts"
                className={`form-input ${errors.labor ? 'error' : ''}`}
                disabled={loading}
                required
              />
              {errors.labor && <span className="error-message">{errors.labor}</span>}
            </div>
          </div>

          {/* Contract Type */}
          <div className="form-group">
            <label htmlFor="contractType" className="form-label">
              Type of Contract *
            </label>
            <select
              id="contractType"
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
              className={`form-input ${errors.contractType ? 'error' : ''}`}
              disabled={loading}
              style={{ backgroundColor: '#fff' }}
              required
            >
              <option value="">Select contract type...</option>
              <option value="seasonal">Seasonal Contract</option>
              <option value="harvest-only">Harvest Only</option>
              <option value="full-service">Full Service Partnership</option>
              <option value="equipment-rental">Equipment Rental</option>
              <option value="labor-supply">Labor Supply</option>
              <option value="maintenance">Maintenance Contract</option>
              <option value="custom">Custom Agreement</option>
            </select>
            {errors.contractType && <span className="error-message">{errors.contractType}</span>}
          </div>

          {/* Contract Details Row */}
          <div className="form-row">
            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-input"
                disabled={loading}
                style={{ backgroundColor: '#fff' }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Contract Value */}
            <div className="form-group">
              <label htmlFor="contractValue" className="form-label">
                Contract Value <span style={{ fontWeight: 'normal', color: '#999' }}>(Optional)</span>
              </label>
              <input
                type="number"
                id="contractValue"
                name="contractValue"
                value={formData.contractValue}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
                className={`form-input ${errors.contractValue ? 'error' : ''}`}
                min="0"
                step="100"
                disabled={loading}
              />
              {errors.contractValue && <span className="error-message">{errors.contractValue}</span>}
              <small style={{ color: '#999', fontSize: '0.8rem', marginTop: '0.25rem' }}>Enter amount in your local currency</small>
            </div>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="durationDays" className="form-label">
              Duration (Days) <span style={{ fontWeight: 'normal', color: '#999' }}>(Optional)</span>
            </label>
            <input
              type="number"
              id="durationDays"
              name="durationDays"
              value={formData.durationDays}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              className={`form-input ${errors.durationDays ? 'error' : ''}`}
              min="1"
              max="365"
              disabled={loading}
            />
            {errors.durationDays && <span className="error-message">{errors.durationDays}</span>}
          </div>

          {/* Initial Message */}
          <div className="form-group">
            <label htmlFor="initialMessage" className="form-label">
              Additional Message <span style={{ fontWeight: 'normal', color: '#999' }}>(Optional)</span>
            </label>
            <textarea
              id="initialMessage"
              name="initialMessage"
              value={formData.initialMessage}
              onChange={handleInputChange}
              placeholder="Add any additional requirements, special conditions, or personal message..."
              rows="4"
              className="form-textarea"
              disabled={loading}
            />
            <small style={{ color: '#999', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Provide any additional details or special requirements for this contract
            </small>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="submit-button"
              onClick={handleClose}
              disabled={loading}
              style={{ background: '#f5f5f5', color: '#333', border: '1px solid #e1e5e9', flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending Request...
                </>
              ) : (
                '📋 Send Contract Request'
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          .create-listing-form {
            width: 100%;
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
          .form-input, .form-textarea {
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 1rem;
            transition: all 0.2s ease;
            font-family: inherit;
            color: #333;
          }
          .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
          }
          .form-input.error, .form-textarea.error {
            border-color: #f44336;
            box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
          }
          .form-input:disabled, .form-textarea:disabled {
            background-color: #f5f5f5;
          }
          .form-input::placeholder, .form-textarea::placeholder {
            color: #999;
          }
          .error-message {
            color: #f44336;
            font-size: 0.8rem;
            margin-top: 0.25rem;
          }
          .submit-button {
            padding: 1rem;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            cursor: pointer;
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
            cursor: not-allowed;
          }
          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            display: inline-block;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default ContractRequestModal;