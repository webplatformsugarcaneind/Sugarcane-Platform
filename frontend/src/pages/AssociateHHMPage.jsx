import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssociateHHMPage = () => {
  const { factoryId } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [availableHHMs, setAvailableHHMs] = useState([]);
  const [associatedHHMs, setAssociatedHHMs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHHMs, setSelectedHHMs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFactoryAndHHMs();
  }, [factoryId]);

  const fetchFactoryAndHHMs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch factory details
      const factoryResponse = await axios.get(`/api/farmer/factories/${factoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch all HHMs
      const hhmsResponse = await axios.get('/api/farmer/hhms', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const factoryData = factoryResponse.data;
      const allHHMs = hhmsResponse.data;

      setFactory(factoryData);
      
      // Separate associated and available HHMs
      const associatedIds = factoryData.associatedHHMs?.map(hhm => hhm._id) || [];
      const associated = allHHMs.filter(hhm => associatedIds.includes(hhm._id));
      const available = allHHMs.filter(hhm => !associatedIds.includes(hhm._id));

      setAssociatedHHMs(associated);
      setAvailableHHMs(available);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAssociateHHMs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/farmer/factories/${factoryId}/associate-hhms`, {
        hhmIds: selectedHHMs
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert(`Successfully associated ${selectedHHMs.length} HHMs with ${factory.name}`);
        setSelectedHHMs([]);
        fetchFactoryAndHHMs(); // Refresh data
      }
    } catch (error) {
      console.error('Error associating HHMs:', error);
      alert('Failed to associate HHMs. Please try again.');
    }
  };

  const handleRemoveHHM = async (hhmId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/farmer/factories/${factoryId}/remove-hhm/${hhmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('HHM removed from factory successfully');
        fetchFactoryAndHHMs(); // Refresh data
      }
    } catch (error) {
      console.error('Error removing HHM:', error);
      alert('Failed to remove HHM. Please try again.');
    }
  };

  const toggleHHMSelection = (hhmId) => {
    setSelectedHHMs(prev => 
      prev.includes(hhmId) 
        ? prev.filter(id => id !== hhmId)
        : [...prev, hhmId]
    );
  };

  const filteredAvailableHHMs = availableHHMs.filter(hhm =>
    hhm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hhm.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="associate-hhm-page">
        <div className="loading">Loading factory and HHM data...</div>
      </div>
    );
  }

  return (
    <div className="associate-hhm-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Manage HHM Associations</h1>
        <p className="page-subtitle">
          Factory: {factory?.name}
        </p>
      </div>

      <div className="content-grid">
        {/* Associated HHMs Section */}
        <div className="section">
          <h2>Currently Associated HHMs ({associatedHHMs.length})</h2>
          {associatedHHMs.length === 0 ? (
            <div className="empty-state">
              <p>No HHMs currently associated with this factory</p>
            </div>
          ) : (
            <div className="hhm-list">
              {associatedHHMs.map(hhm => (
                <div key={hhm._id} className="hhm-card associated">
                  <div className="hhm-info">
                    <div className="hhm-avatar">👨‍💼</div>
                    <div className="hhm-details">
                      <h3>{hhm.name}</h3>
                      <p>@{hhm.username}</p>
                      <p>📧 {hhm.email}</p>
                      <p>📞 {hhm.phone}</p>
                      {hhm.location && <p>📍 {hhm.location}</p>}
                      {hhm.experience && <p>🎯 {hhm.experience} years experience</p>}
                    </div>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveHHM(hhm._id)}
                    title="Remove association"
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available HHMs Section */}
        <div className="section">
          <h2>Available HHMs for Association ({filteredAvailableHHMs.length})</h2>
          
          <div className="global-toolbar">
            <div className="global-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search HHMs by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="global-search"
              />
            </div>
          </div>

          {filteredAvailableHHMs.length === 0 ? (
            <div className="empty-state">
              <p>No available HHMs found</p>
            </div>
          ) : (
            <>
              <div className="hhm-list">
                {filteredAvailableHHMs.map(hhm => (
                  <div 
                    key={hhm._id} 
                    className={`hhm-card available ${selectedHHMs.includes(hhm._id) ? 'selected' : ''}`}
                    onClick={() => toggleHHMSelection(hhm._id)}
                  >
                    <div className="hhm-info">
                      <div className="hhm-avatar">👨‍💼</div>
                      <div className="hhm-details">
                        <h3>{hhm.name}</h3>
                        <p>@{hhm.username}</p>
                        <p>📧 {hhm.email}</p>
                        <p>📞 {hhm.phone}</p>
                        {hhm.location && <p>📍 {hhm.location}</p>}
                        {hhm.experience && <p>🎯 {hhm.experience} years experience</p>}
                      </div>
                    </div>
                    <div className="selection-indicator">
                      {selectedHHMs.includes(hhm._id) ? '✅' : '☐'}
                    </div>
                  </div>
                ))}
              </div>

              {selectedHHMs.length > 0 && (
                <div className="action-section">
                  <button 
                    className="associate-btn"
                    onClick={handleAssociateHHMs}
                  >
                    Associate {selectedHHMs.length} Selected HHM{selectedHHMs.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .associate-hhm-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .back-btn {
          background: none;
          border: none;
          color: #007bff;
          font-size: 1rem;
          
          margin-bottom: 1rem;
        }

        .back-btn:hover {
          text-decoration: underline;
        }

        .page-header h1 {
          color: #2c5530;
          margin: 0.5rem 0;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .section h2 {
          color: #2c5530;
          margin-bottom: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .hhm-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hhm-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: #f8fdf9;
        }

        .hhm-card.associated {
          border-left: 4px solid #4caf50;
        }

        .hhm-card.available {
          
          transition: all 0.2s ease;
        }

        .hhm-card.available:hover {
          border-color: #4caf50;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .hhm-card.selected {
          border-color: #4caf50;
          background: #e8f5e8;
        }

        .hhm-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .hhm-avatar {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #2c5530, #4caf50);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hhm-details h3 {
          margin: 0 0 0.25rem 0;
          color: #2c5530;
        }

        .hhm-details p {
          margin: 0.1rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          
        }

        .remove-btn:hover {
          background: #c82333;
        }

        .selection-indicator {
          font-size: 1.5rem;
          margin-left: 1rem;
        }

        .associate-btn {
          width: 100%;
          background: #4caf50;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: bold;
          
          margin-top: 1rem;
        }

        .associate-btn:hover {
          background: #45a049;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
          font-style: italic;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          font-size: 1.1rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AssociateHHMPage;