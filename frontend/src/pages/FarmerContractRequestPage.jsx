import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FarmerContractRequestPage.css';

const FarmerContractRequestPage = () => {
  const navigate = useNavigate();
  const { hhmId } = useParams();
  
  const [hhm, setHhm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [contractForm, setContractForm] = useState({
    farmLocation: '',
    workType: 'Sugarcane harvesting',
    requirements: '',
    paymentTerms: '',
    startDate: '',
    endDate: '',
    duration_days: 30,
    grace_period_days: 2,
    additionalNotes: ''
  });

  useEffect(() => {
    fetchHHMDetails();
  }, [hhmId]);

  const fetchHHMDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/farmer/hhms/${hhmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHhm(data.data);
      } else {
        setError('Failed to load HHM details');
      }
    } catch (err) {
      setError('Error loading HHM details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContractForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate duration if dates are provided
    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? new Date(value) : new Date(contractForm.startDate);
      const end = name === 'endDate' ? new Date(value) : new Date(contractForm.endDate);
      
      if (start && end && end > start) {
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        setContractForm(prev => ({
          ...prev,
          duration_days: duration
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const contractData = {
        hhm_id: hhmId,
        contract_details: {
          farmLocation: contractForm.farmLocation,
          workType: contractForm.workType,
          requirements: contractForm.requirements,
          paymentTerms: contractForm.paymentTerms,
          startDate: contractForm.startDate,
          endDate: contractForm.endDate,
          additionalNotes: contractForm.additionalNotes
        },
        duration_days: parseInt(contractForm.duration_days),
        grace_period_days: parseInt(contractForm.grace_period_days)
      };

      const response = await fetch('http://localhost:5000/api/farmer-contracts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contractData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contract request sent successfully!');
        setTimeout(() => {
          navigate('/farmer/contracts'); // Navigate to farmer contracts dashboard
        }, 2000);
      } else {
        setError(data.message || 'Failed to send contract request');
      }
    } catch (err) {
      setError('Error sending contract request');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="contract-request-page">
        <div className="loading">Loading HHM details...</div>
      </div>
    );
  }

  if (!hhm) {
    return (
      <div className="contract-request-page">
        <div className="error">HHM not found</div>
      </div>
    );
  }

  return (
    <div className="contract-request-page">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/farmer/hhms')}
        >
          ← Back to HHM Directory
        </button>
        <h1>Send Contract Request</h1>
        <div className="hhm-info">
          <h2>To: {hhm.name}</h2>
          <p>{hhm.email} | {hhm.phone}</p>
          <p>Experience: {hhm.managementExperience}</p>
          <p>Team Size: {hhm.teamSize}</p>
        </div>
      </div>

      <div className="contract-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="contract-form">
          <div className="form-section">
            <h3>Work Details</h3>
            
            <div className="form-group">
              <label htmlFor="farmLocation">Farm Location *</label>
              <input
                type="text"
                id="farmLocation"
                name="farmLocation"
                value={contractForm.farmLocation}
                onChange={handleInputChange}
                placeholder="e.g., Nashik, Maharashtra"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="workType">Work Type *</label>
              <select
                id="workType"
                name="workType"
                value={contractForm.workType}
                onChange={handleInputChange}
                required
              >
                <option value="Sugarcane harvesting">Sugarcane Harvesting</option>
                <option value="Land preparation">Land Preparation</option>
                <option value="Planting">Planting</option>
                <option value="Irrigation management">Irrigation Management</option>
                <option value="Pest control">Pest Control</option>
                <option value="General farm management">General Farm Management</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Work Requirements *</label>
              <textarea
                id="requirements"
                name="requirements"
                value={contractForm.requirements}
                onChange={handleInputChange}
                placeholder="Describe the work requirements, number of workers needed, specific skills, etc."
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentTerms">Payment Terms *</label>
              <input
                type="text"
                id="paymentTerms"
                name="paymentTerms"
                value={contractForm.paymentTerms}
                onChange={handleInputChange}
                placeholder="e.g., ₹500 per day per worker, ₹15,000 total contract"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Timeline</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={contractForm.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={contractForm.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration_days">Duration (Days)</label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  value={contractForm.duration_days}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="grace_period_days">Grace Period (Days)</label>
                <input
                  type="number"
                  id="grace_period_days"
                  name="grace_period_days"
                  value={contractForm.grace_period_days}
                  onChange={handleInputChange}
                  min="1"
                  max="7"
                />
                <small>Time for HHM to respond before auto-cancellation</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            
            <div className="form-group">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={contractForm.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any additional information, special requirements, or notes for the HHM"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/farmer/hhms')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Sending Request...' : 'Send Contract Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerContractRequestPage;