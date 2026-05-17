import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LabourManagementPage = () => {
  const [activeTab, setActiveTab] = useState('create-job');
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [labours, setLabours] = useState([]);
  const [filteredLabours, setFilteredLabours] = useState([]);
  const [loadingLabours, setLoadingLabours] = useState(false);

  const [labourSearchTerm, setLabourSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Fetch applications
  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab]);

  // Fetch labours
  useEffect(() => {
    if (activeTab === 'hire-labour') fetchLabours();
  }, [activeTab]);

  // Filter labours
  const filterLabours = useCallback(() => {
    let filtered = [...labours];

    if (labourSearchTerm) {
      filtered = filtered.filter(labour =>
        labour.name?.toLowerCase().includes(labourSearchTerm.toLowerCase())
      );
    }

    if (selectedSkillFilter) {
      filtered = filtered.filter(labour =>
        labour.skills?.some(skill =>
          skill.toLowerCase().includes(selectedSkillFilter.toLowerCase())
        )
      );
    }

    setFilteredLabours(filtered);
  }, [labours, labourSearchTerm, selectedSkillFilter]);

  useEffect(() => {
    filterLabours();
  }, [filterLabours]);

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');

      const res = await axios.get('/api/hhm/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplications(res.data.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchLabours = async () => {
    try {
      setLoadingLabours(true);
      const token = localStorage.getItem('token');

      const res = await axios.get('/api/hhm/labours', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data.data || [];
      setLabours(data);
      setFilteredLabours(data);
    } catch {
      setLabours([]);
      setFilteredLabours([]);
    } finally {
      setLoadingLabours(false);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #f5f7fa, #e4efe9)',
      minHeight: '100vh'
    }}>

      {/* Animation Keyframes */}
      <style>
        {`
        @keyframes fadeIn {
          from {opacity:0; transform:translateY(10px);}
          to {opacity:1; transform:translateY(0);}
        }
      `}
      </style>

      {/* Header */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        animation: 'fadeIn 0.6s ease'
      }}>
        Labour Management
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
        {['create-job', 'applications', 'hire-labour'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab
                ? 'linear-gradient(135deg, #3498db, #2980b9)'
                : '#ecf0f1',
              color: activeTab === tab ? 'white' : '#2c3e50',
              transition: '0.3s',
              transform: activeTab === tab ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        animation: 'fadeIn 0.5s ease'
      }}>

        {/* APPLICATIONS */}
        {activeTab === 'applications' && (
          <>
            {loadingApplications ? <p>Loading...</p> : (
              applications.map(app => (
                <div key={app._id}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    transition: '0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >

                  <h3>{app.labour?.name}</h3>
                  <p>{app.labour?.email}</p>

                  {/* Status */}
                  <span style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    background:
                      app.status === 'approved' ? '#d4edda' :
                      app.status === 'rejected' ? '#f8d7da' : '#fff3cd'
                  }}>
                    {app.status}
                  </span>

                  {/* Buttons */}
                  <div style={{ marginTop: '1rem' }}>
                    <button style={{
                      marginRight: '10px',
                      padding: '0.5rem 1rem',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                      Approve
                    </button>

                    <button style={{
                      padding: '0.5rem 1rem',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                      Reject
                    </button>
                  </div>

                </div>
              ))
            )}
          </>
        )}

        {/* LABOURS */}
        {activeTab === 'hire-labour' && (
          <>
            {loadingLabours ? <p>Loading...</p> : (
              filteredLabours.map(labour => (
                <div key={labour._id}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    transition: '0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3>{labour.name}</h3>
                  <p>{labour.email}</p>
                  <p>{labour.skills?.join(', ')}</p>

                  <button style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #3498db, #2980b9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: '0.3s'
                  }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  >
                    Send Invitation
                  </button>
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default LabourManagementPage;