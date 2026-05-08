import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LaborManagementPage = () => {
  const [activeTab, setActiveTab] = useState('create-job');
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Fetch applications
  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab]);

  // Fetch workers
  useEffect(() => {
    if (activeTab === 'hire-labour') fetchWorkers();
  }, [activeTab]);

  // Filter workers
  const filterWorkers = useCallback(() => {
    let filtered = [...workers];

    if (workerSearchTerm) {
      filtered = filtered.filter(worker =>
        worker.name?.toLowerCase().includes(workerSearchTerm.toLowerCase())
      );
    }

    if (selectedSkillFilter) {
      filtered = filtered.filter(worker =>
        worker.skills?.some(skill =>
          skill.toLowerCase().includes(selectedSkillFilter.toLowerCase())
        )
      );
    }

    setFilteredWorkers(filtered);
  }, [workers, workerSearchTerm, selectedSkillFilter]);

  useEffect(() => {
    filterWorkers();
  }, [filterWorkers]);

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

  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const token = localStorage.getItem('token');

      const res = await axios.get('/api/hhm/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data.data || [];
      setWorkers(data);
      setFilteredWorkers(data);
    } catch {
      setWorkers([]);
      setFilteredWorkers([]);
    } finally {
      setLoadingWorkers(false);
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
        Labor Management
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

                  <h3>{app.worker?.name}</h3>
                  <p>{app.worker?.email}</p>

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

        {/* WORKERS */}
        {activeTab === 'hire-labour' && (
          <>
            {loadingWorkers ? <p>Loading...</p> : (
              filteredWorkers.map(worker => (
                <div key={worker._id}
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
                  <h3>{worker.name}</h3>
                  <p>{worker.email}</p>
                  <p>{worker.skills?.join(', ')}</p>

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

export default LaborManagementPage;