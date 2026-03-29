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
      size="large"
    >
      <form onSubmit={handleSubmit} className="contract-request-form">
        {/* Factory Info */}
        <div className="factory-info-section">
          <div className="factory-info-card">
            <h4>📍 Factory Details</h4>
            <p><strong>Name:</strong> {factoryInfo?.factoryName || factoryInfo?.name}</p>
            {factoryInfo?.factoryLocation && (
              <p><strong>Location:</strong> {factoryInfo.factoryLocation}</p>
            )}
            {factoryInfo?.capacity && (
              <p><strong>Capacity:</strong> {factoryInfo.capacity}</p>
            )}
          </div>
        </div>

        {/* Contract Title */}
        <div className="form-group">
          <label htmlFor="title">
            Contract Title <span className="optional">(Optional)</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Harvest Season Partnership 2024"
            className={`form-input ${errors.title ? 'error' : ''}`}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        {/* Required Fields Row */}
        <div className="form-row">
          {/* Vehicle */}
          <div className="form-group">
            <label htmlFor="vehicle">
              Vehicle Requirements <span className="required">*</span>
            </label>
            <input
              type="text"
              id="vehicle"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              placeholder="e.g., 2 trucks, 1 tractor, loading equipment"
              className={`form-input ${errors.vehicle ? 'error' : ''}`}
              required
            />
            {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
          </div>

          {/* Labor */}
          <div className="form-group">
            <label htmlFor="labor">
              Labor Requirements <span className="required">*</span>
            </label>
            <input
              type="text"
              id="labor"
              name="labor"
              value={formData.labor}
              onChange={handleInputChange}
              placeholder="e.g., 50 workers, harvesting skills, 8-hour shifts"
              className={`form-input ${errors.labor ? 'error' : ''}`}
              required
            />
            {errors.labor && <span className="error-text">{errors.labor}</span>}
          </div>
        </div>

        {/* Contract Type */}
        <div className="form-group">
          <label htmlFor="contractType">
            Type of Contract <span className="required">*</span>
          </label>
          <select
            id="contractType"
            name="contractType"
            value={formData.contractType}
            onChange={handleInputChange}
            className={`form-select ${errors.contractType ? 'error' : ''}`}
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
          {errors.contractType && <span className="error-text">{errors.contractType}</span>}
        </div>

        {/* Contract Details Row */}
        <div className="form-row">
          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority">Priority Level</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Contract Value */}
          <div className="form-group">
            <label htmlFor="contractValue">
              Contract Value <span className="optional">(Optional)</span>
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
            />
            {errors.contractValue && <span className="error-text">{errors.contractValue}</span>}
            <small className="form-hint">Enter amount in your local currency</small>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="durationDays">
              Duration (Days) <span className="optional">(Optional)</span>
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
            />
            {errors.durationDays && <span className="error-text">{errors.durationDays}</span>}
          </div>
        </div>

        {/* Initial Message */}
        <div className="form-group">
          <label htmlFor="initialMessage">
            Additional Message <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="initialMessage"
            name="initialMessage"
            value={formData.initialMessage}
            onChange={handleInputChange}
            placeholder="Add any additional requirements, special conditions, or personal message..."
            rows="4"
            className="form-textarea"
          />
          <small className="form-hint">
            Provide any additional details or special requirements for this contract
          </small>
        </div>

        {/* Form Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Sending Request...
              </>
            ) : (
              <>
                📋 Send Contract Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Component Styles */}
      <style jsx>{`
        .contract-request-form {
          max-width: 100%;
        }

        .factory-info-section {
          margin-bottom: 2rem;
        }

        .factory-info-card {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .factory-info-card h4 {
          margin: 0 0 1rem 0;
          color: #4a7c59;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .factory-info-card p {
          margin: 0.5rem 0;
          color: #495057;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-row .form-group {
          margin-bottom: 0;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c5f2d;
        }

        .required {
          color: #e74c3c;
        }

        .optional {
          color: #6c757d;
          font-weight: 400;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #4a7c59;
          box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
        }

        .form-input.error,
        .form-select.error,
        .form-textarea.error {
          border-color: #e74c3c;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error-text {
          color: #e74c3c;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }

        .form-hint {
          color: #6c757d;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 1rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4a7c59;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3d6b48;
          transform: translateY(-1px);
        }

        .btn-primary.loading {
          position: relative;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e9ecef;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .factory-info-card {
            padding: 1rem;
          }
          
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ContractRequestModal;