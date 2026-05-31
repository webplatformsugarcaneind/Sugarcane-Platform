import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FarmerProfile.css';

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
    landArea: '',
    laboursRequired: '',
    workTypeDetails: [], // ['cutting', 'loading', 'transport']
    equipment: {
      tractor: false,
      loadingTools: false
    },
    fieldAccessibility: 'easy',
    cropCondition: 'ready',
    paymentType: 'per_day',
    amount: '',
    advancePayment: false,
    isNegotiable: false,
    startDate: '',
    endDate: '',
    duration_days: 0,
    delayAllowed: 2, 
    urgency: 'medium',
    isFlexibleStart: false,
    additionalNotes: '',
    roadAccess: 'good',
    waterAvailability: 'available'
  });

  // --- VIEWPORT THEMING ---
  useEffect(() => {
    document.body.style.backgroundColor = '#0b0f0b';
    document.body.classList.add('fp-active-theme');
    return () => {
        document.body.style.backgroundColor = '';
        document.body.classList.remove('fp-active-theme');
    };
  }, []);

  useEffect(() => {
    fetchHHMDetails();
  }, [hhmId]);

  const fetchHHMDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/farmer/hhms/${hhmId}`, {
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
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setContractForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setContractForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? new Date(value) : new Date(contractForm.startDate);
      const end = name === 'endDate' ? new Date(value) : new Date(contractForm.endDate);
      if (start && end && end > start) {
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        setContractForm(prev => ({ ...prev, duration_days: duration }));
      }
    }
  };

  const handleToggleArray = (value) => {
    setContractForm(prev => {
      const current = prev.workTypeDetails;
      const next = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, workTypeDetails: next };
    });
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
        duration_days: parseInt(contractForm.duration_days) || 1,
        grace_period_days: parseInt(contractForm.delayAllowed) || 2,
        contract_details: {
          farmLocation: contractForm.farmLocation,
          workType: contractForm.workType,
          landArea: contractForm.landArea,
          laboursRequired: contractForm.laboursRequired,
          workTypeDetails: contractForm.workTypeDetails,
          equipment: contractForm.equipment,
          fieldAccessibility: contractForm.fieldAccessibility,
          cropCondition: contractForm.cropCondition,
          paymentType: contractForm.paymentType,
          amount: contractForm.amount,
          advancePayment: contractForm.advancePayment,
          isNegotiable: contractForm.isNegotiable,
          startDate: contractForm.startDate,
          endDate: contractForm.endDate,
          urgency: contractForm.urgency,
          isFlexibleStart: contractForm.isFlexibleStart,
          roadAccess: contractForm.roadAccess,
          waterAvailability: contractForm.waterAvailability,
          additionalNotes: contractForm.additionalNotes
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/farmer-contracts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contractData)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Work request sent successfully!');
        setTimeout(() => navigate('/farmer/contracts'), 2000);
      } else {
        setError(data.message || 'Failed to send request');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="farmer-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f0b' }}>
      <div style={{ color: 'var(--green)' }}>Loading...</div>
    </div>
  );

  return (
    <div className="farmer-profile-page">
      <div className="fp-noise" />
      <div className="fp-bg-glow" />

      <div className="fp-layout-shell">
        <main className="fp-main" style={{ marginLeft: 0 }}>
          
          <div className="fp-page-header">
            <div className="fp-header-left">
              <div className="fp-eyebrow">Work Proposal</div>
              <h1 className="fp-title">Harvesting <em className="fp-highlight">Request</em></h1>
              <p className="fp-subtitle">To: {hhm.name} ({hhm.role || 'HHM'})</p>
            </div>
            <div className="fp-header-right">
              <button className="btn-base btn-secondary" onClick={() => navigate('/farmer/hhms')}><span className="btn-icon">←</span> Back</button>
            </div>
          </div>

          {error && <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(126,200,67,0.1)', border: '1px solid var(--green)', color: 'var(--green)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            
            {/* SECTION 1: WORK DETAILS */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon">🌾</div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Work Details</h2>
                  <div className="fp-card-sub">Location, size and specific tasks</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid">
                  <div className="fp-field full">
                    <label>Farm Location (Village / District) *</label>
                    <input type="text" name="farmLocation" value={contractForm.farmLocation} onChange={handleInputChange} placeholder="e.g., Akola Village, Nashik" required />
                  </div>
                  
                  <div className="fp-field">
                    <label>Land Area (Acres) *</label>
                    <input type="number" name="landArea" value={contractForm.landArea} onChange={handleInputChange} placeholder="5" required />
                  </div>
                  <div className="fp-field">
                    <label>Labours Required *</label>
                    <input type="number" name="laboursRequired" value={contractForm.laboursRequired} onChange={handleInputChange} placeholder="10" required />
                  </div>

                  <div className="fp-field full">
                    <label>Work Type Details (Select all that apply) *</label>
                    <div className="fp-radio-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      {['Cutting', 'Loading', 'Transport'].map(task => (
                        <div 
                          key={task} 
                          className={`fp-radio-tile ${contractForm.workTypeDetails.includes(task.toLowerCase()) ? 'selected' : ''}`}
                          onClick={() => handleToggleArray(task.toLowerCase())}
                          style={{ cursor: 'pointer', padding: '15px' }}
                        >
                          <span className="fp-tile-label">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: EQUIPMENT & CONDITIONS */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon">🚜</div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Equipment & Field Conditions</h2>
                  <div className="fp-card-sub">Infrastructure and crop readiness</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid">
                  <div className="fp-field">
                    <label>Equipment Provided by Farmer</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" name="equipment.tractor" checked={contractForm.equipment.tractor} onChange={handleInputChange} /> Tractor
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" name="equipment.loadingTools" checked={contractForm.equipment.loadingTools} onChange={handleInputChange} /> Loading Tools
                      </label>
                    </div>
                  </div>

                  <div className="fp-field">
                    <label>Field Accessibility</label>
                    <select name="fieldAccessibility" value={contractForm.fieldAccessibility} onChange={handleInputChange} className="fp-select" style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px' }}>
                      <option value="easy">Easy (Road Touch)</option>
                      <option value="medium">Medium (Unpaved Path)</option>
                      <option value="difficult">Difficult (Interior Field)</option>
                    </select>
                  </div>

                  <div className="fp-field full">
                    <label>Crop Condition</label>
                    <div className="fp-radio-grid">
                      {['Ready', 'Almost Ready'].map(status => (
                        <div 
                          key={status} 
                          className={`fp-radio-tile ${contractForm.cropCondition === status.toLowerCase().replace(' ', '_') ? 'selected' : ''}`}
                          onClick={() => setContractForm(prev => ({ ...prev, cropCondition: status.toLowerCase().replace(' ', '_') }))}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="fp-tile-label">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: PAYMENT TERMS */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon">💰</div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Payment Terms</h2>
                  <div className="fp-card-sub">Financial agreement structure</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid">
                  <div className="fp-field">
                    <label>Payment Type *</label>
                    <select name="paymentType" value={contractForm.paymentType} onChange={handleInputChange} className="fp-select" style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px' }}>
                      <option value="per_day">Per Day</option>
                      <option value="per_acre">Per Acre</option>
                      <option value="contract">Fixed Contract</option>
                    </select>
                  </div>
                  <div className="fp-field">
                    <label>Amount (₹) *</label>
                    <input type="number" name="amount" value={contractForm.amount} onChange={handleInputChange} placeholder="5000" required />
                  </div>

                  <div className="fp-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '30px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" name="advancePayment" checked={contractForm.advancePayment} onChange={handleInputChange} /> Advance Payment
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" name="isNegotiable" checked={contractForm.isNegotiable} onChange={handleInputChange} /> Negotiable
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: TIMELINE */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon">🗓️</div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Timeline</h2>
                  <div className="fp-card-sub">Dates and urgency level</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid">
                  <div className="fp-field">
                    <label>Start Date *</label>
                    <input type="date" name="startDate" value={contractForm.startDate} onChange={handleInputChange} required style={{ colorScheme: 'dark' }} />
                  </div>
                  <div className="fp-field">
                    <label>End Date *</label>
                    <input type="date" name="endDate" value={contractForm.endDate} onChange={handleInputChange} required style={{ colorScheme: 'dark' }} />
                  </div>

                  <div className="fp-field">
                    <label>Allowed Delay (Days)</label>
                    <input type="number" name="delayAllowed" value={contractForm.delayAllowed} onChange={handleInputChange} min="1" max="15" />
                  </div>

                  <div className="fp-field">
                    <label>Urgency Level</label>
                    <div className="fp-radio-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      {['Low', 'Medium', 'High'].map(level => (
                        <div 
                          key={level} 
                          className={`fp-radio-tile ${contractForm.urgency === level.toLowerCase() ? 'selected' : ''}`}
                          onClick={() => setContractForm(prev => ({ ...prev, urgency: level.toLowerCase() }))}
                          style={{ cursor: 'pointer', padding: '10px' }}
                        >
                          <span className="fp-tile-label">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="fp-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px' }}>
                      <input type="checkbox" name="isFlexibleStart" checked={contractForm.isFlexibleStart} onChange={handleInputChange} /> Flexible Start Date
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: ADDITIONAL DETAILS */}
            <section className="fp-card">
              <div className="fp-card-header">
                <div className="fp-card-icon">ℹ️</div>
                <div className="fp-card-txt">
                  <h2 className="fp-card-title">Logistics & Instructions</h2>
                  <div className="fp-card-sub">Infrastructure and notes</div>
                </div>
              </div>
              <div className="fp-card-body">
                <div className="fp-form-grid">
                  <div className="fp-field">
                    <label>Road Access for Vehicles</label>
                    <select name="roadAccess" value={contractForm.roadAccess} onChange={handleInputChange} style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px' }}>
                      <option value="good">Good (Tractor/Truck can reach)</option>
                      <option value="limited">Limited (Small vehicle only)</option>
                      <option value="none">None (Manual transport needed)</option>
                    </select>
                  </div>
                  <div className="fp-field">
                    <label>Water Availability</label>
                    <select name="waterAvailability" value={contractForm.waterAvailability} onChange={handleInputChange} style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px' }}>
                      <option value="available">Available on Field</option>
                      <option value="nearby">Nearby (Walking distance)</option>
                      <option value="not_available">Not Available</option>
                    </select>
                  </div>

                  <div className="fp-field full">
                    <label>Special Instructions (Optional)</label>
                    <textarea name="additionalNotes" value={contractForm.additionalNotes} onChange={handleInputChange} placeholder="Mention specific instructions, lodging for labours, etc." rows="3" maxLength="300" style={{ resize: 'none' }} />
                  </div>
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', paddingBottom: '60px' }}>
              <button type="button" className="btn-base btn-outline" onClick={() => navigate('/farmer/hhms')} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn-base btn-primary" disabled={submitting} style={{ minWidth: '220px' }}>
                {submitting ? 'Sending Proposal...' : 'Send Work Request'}
              </button>
            </div>
          </form>

        </main>
      </div>
    </div>
  );
};

export default FarmerContractRequestPage;
