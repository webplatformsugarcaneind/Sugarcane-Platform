import React, { useState } from 'react';
import Modal from './Modal';
import axios from 'axios';

/**
 * FarmerJobRequestModal Component
 * Modal for Farmers to send job requests to HHMs
 */
const FarmerJobRequestModal = ({
  isOpen,
  onClose,
  hhmInfo,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    farmLocation: '',
    workType: '',
    requirements: '',
    paymentTerms: '',
    startDate: '',
    endDate: '',
    duration_days: '',
    grace_period_days: 2,
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  // Auto-calculate duration when dates change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    // Auto-calculate duration_days if both dates are provided
    if (newFormData.startDate && newFormData.endDate) {
      const startDate = new Date(newFormData.startDate);
      const endDate = new Date(newFormData.endDate);
      if (endDate > startDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newFormData.duration_days = diffDays.toString();
      }
    }

    setFormData(newFormData);

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

    if (!formData.farmLocation.trim()) {
      newErrors.farmLocation = 'Farm location is required';
    }

    if (!formData.workType.trim()) {
      newErrors.workType = 'Work type is required';
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Requirements are required';
    }

    if (!formData.paymentTerms.trim()) {
      newErrors.paymentTerms = 'Payment terms are required';
    }

    if (!formData.duration_days) {
      newErrors.duration_days = 'Duration is required';
    } else if (isNaN(Number(formData.duration_days)) || Number(formData.duration_days) < 1) {
      newErrors.duration_days = 'Duration must be a positive number';
    }

    if (!formData.grace_period_days) {
      newErrors.grace_period_days = 'Grace period is required';
    } else if (isNaN(Number(formData.grace_period_days)) || Number(formData.grace_period_days) < 1) {
      newErrors.grace_period_days = 'Grace period must be a positive number';
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

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare contract details object
      const contract_details = {
        farmLocation: formData.farmLocation,
        workType: formData.workType,
        requirements: formData.requirements,
        paymentTerms: formData.paymentTerms,
        startDate: formData.startDate,
        endDate: formData.endDate,
        additionalNotes: formData.additionalNotes
      };

      const requestData = {
        hhm_id: hhmInfo._id || hhmInfo.id,
        contract_details,
        duration_days: parseInt(formData.duration_days),
        grace_period_days: parseInt(formData.grace_period_days)
      };

      console.log('Sending farmer job request:', requestData);

      const response = await axios.post('/api/farmer-contracts/request', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Job request sent successfully:', response.data);

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form and close modal
      resetForm();
      onClose();

    } catch (error) {
      console.error('Error sending job request:', error);
      
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to send job request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      farmLocation: '',
      workType: '',
      requirements: '',
      paymentTerms: '',
      startDate: '',
      endDate: '',
      duration_days: '',
      grace_period_days: 2,
      additionalNotes: ''
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
      title={`Send Job Request - ${hhmInfo?.name || 'HHM'}`}
      size="large"
    >
      <form onSubmit={handleSubmit} className="farmer-job-request-form">
        {/* HHM Info */}
        <div className="hhm-info-section">
          <div className="hhm-info-card">
            <h4>👨‍💼 HHM Details</h4>
            <p><strong>Name:</strong> {hhmInfo?.name}</p>
            {hhmInfo?.managementExperience && (
              <p><strong>Experience:</strong> {hhmInfo.managementExperience}</p>
            )}
            {hhmInfo?.teamSize && (
              <p><strong>Team Size:</strong> {hhmInfo.teamSize}</p>
            )}
            {hhmInfo?.servicesOffered && (
              <p><strong>Services:</strong> {hhmInfo.servicesOffered}</p>
            )}
          </div>
        </div>

        {/* Farm Location */}
        <div className="form-group">
          <label htmlFor="farmLocation">
            Farm Location <span className="required">*</span>
          </label>
          <input
            type="text"
            id="farmLocation"
            name="farmLocation"
            value={formData.farmLocation}
            onChange={handleInputChange}
            placeholder="e.g., Nashik, Maharashtra"
            className={`form-input ${errors.farmLocation ? 'error' : ''}`}
            required
          />
          {errors.farmLocation && <span className="error-text">{errors.farmLocation}</span>}
        </div>

        {/* Work Type and Requirements Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="workType">
              Type of Work <span className="required">*</span>
            </label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleInputChange}
              className={`form-select ${errors.workType ? 'error' : ''}`}
              required
            >
              <option value="">Select work type...</option>
              <option value="Sugarcane planting">Sugarcane Planting</option>
              <option value="Sugarcane harvesting">Sugarcane Harvesting</option>
              <option value="Field preparation">Field Preparation</option>
              <option value="Irrigation management">Irrigation Management</option>
              <option value="Fertilizer application">Fertilizer Application</option>
              <option value="Pest control">Pest Control</option>
              <option value="Transportation">Transportation</option>
              <option value="General farm labor">General Farm Labor</option>
              <option value="Equipment operation">Equipment Operation</option>
              <option value="Custom work">Custom Work</option>
            </select>
            {errors.workType && <span className="error-text">{errors.workType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requirements">
              Requirements <span className="required">*</span>
            </label>
            <input
              type="text"
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="e.g., 50 workers, harvesting experience"
              className={`form-input ${errors.requirements ? 'error' : ''}`}
              required
            />
            {errors.requirements && <span className="error-text">{errors.requirements}</span>}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="form-group">
          <label htmlFor="paymentTerms">
            Payment Terms <span className="required">*</span>
          </label>
          <input
            type="text"
            id="paymentTerms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleInputChange}
            placeholder="e.g., ₹500 per day per worker"
            className={`form-input ${errors.paymentTerms ? 'error' : ''}`}
            required
          />
          {errors.paymentTerms && <span className="error-text">{errors.paymentTerms}</span>}
        </div>

        {/* Date and Duration Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleDateChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleDateChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration_days">
              Duration (Days) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="duration_days"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              className={`form-input ${errors.duration_days ? 'error' : ''}`}
              min="1"
              max="365"
              required
            />
            {errors.duration_days && <span className="error-text">{errors.duration_days}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="grace_period_days">
              Grace Period (Days) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="grace_period_days"
              name="grace_period_days"
              value={formData.grace_period_days}
              onChange={handleInputChange}
              placeholder="2"
              className={`form-input ${errors.grace_period_days ? 'error' : ''}`}
              min="1"
              max="30"
              required
            />
            {errors.grace_period_days && <span className="error-text">{errors.grace_period_days}</span>}
            <small className="form-hint">Days to wait for HHM response before auto-cancellation</small>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="form-group">
          <label htmlFor="additionalNotes">
            Additional Notes <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            placeholder="Add any additional requirements, special conditions, or notes..."
            rows="4"
            className="form-textarea"
          />
          <small className="form-hint">
            Provide any additional details or special requirements for this job
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
                🚀 Send Job Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Component Styles */}
      <style jsx>{`
        .farmer-job-request-form {
          max-width: 100%;
        }

        .hhm-info-section {
          margin-bottom: 2rem;
        }

        .hhm-info-card {
          background: #f0f7ff;
          border: 2px solid #b8daff;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .hhm-info-card h4 {
          margin: 0 0 1rem 0;
          color: #1565c0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .hhm-info-card p {
          margin: 0.5rem 0;
          color: #495057;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          background: #28a745;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #218838;
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
          
          .hhm-info-card {
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

export default FarmerJobRequestModal;