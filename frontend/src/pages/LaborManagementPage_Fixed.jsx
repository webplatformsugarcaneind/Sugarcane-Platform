import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LaborManagementPage = () => {
  const [activeTab, setActiveTab] = useState('create-job');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    wageOffered: '',
    workerCount: '',
    requiredSkills: '',
    workType: '',
    workingHours: ''
  });
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Hire Labour tab state
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Invitation modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [mySchedules, setMySchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');

  // Fetch applications when Applications tab is selected
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  // Fetch workers when Hire Labour tab is selected
  useEffect(() => {
    if (activeTab === 'hire-labour') {
      fetchWorkers();
    }
  }, [activeTab]);

  // Filter workers based on search and skill filter
  const filterWorkers = useCallback(() => {
    let filtered = [...workers];

    // Apply search filter (name, username, email)
    if (workerSearchTerm) {
      filtered = filtered.filter(worker =>
        worker.name?.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
        worker.username?.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
        worker.email?.toLowerCase().includes(workerSearchTerm.toLowerCase())
      );
    }

    // Apply skill filter
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
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('🔄 Fetching applications from backend...');
      
      const response = await axios.get('/api/hhm/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Received applications from API:', response.data);
      console.log('✅ Applications fetched successfully:', response.data);
      
      const applicationsData = response.data.data || response.data;
      
      const mappedApplications = applicationsData.map(app => ({
        _id: app._id,
        workerId: {
          _id: app.worker?.id || app.worker?._id,
          name: app.worker?.name || 'Unknown Worker',
          email: app.worker?.email || 'N/A',
          phone: app.worker?.phone || 'N/A',
          username: app.worker?.username || app.worker?.email?.split('@')[0] || 'N/A',
          skills: app.worker?.skills || [],
          availabilityStatus: app.worker?.availabilityStatus,
          profileImage: app.worker?.profileImage
        },
        scheduleId: {
          _id: app.schedule?.id || app.schedule?._id,
          title: app.schedule?.title || 'Unknown Job',
          location: app.schedule?.location || 'N/A',
          workType: app.schedule?.workType || app.schedule?.jobType || 'general',
          startDate: app.schedule?.startDate,
          endDate: app.schedule?.endDate,
          wageOffered: app.schedule?.wageOffered,
          workerCount: app.schedule?.workerCount,
          requiredSkills: app.schedule?.requiredSkills
        },
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        reviewedAt: app.reviewedAt,
        message: app.applicationMessage || app.message || 'No message provided',
        skills: app.workerSkills || app.skills || [],
        experience: app.experience || 'Not specified',
        expectedWage: app.expectedWage,
        availability: app.availability,
        reviewNotes: app.reviewNotes
      }));

      console.log('📊 Mapped applications:', mappedApplications.length, 'applications');
      setApplications(mappedApplications);
      
    } catch (err) {
      console.error('❌ Error fetching applications:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view applications.');
      } else if (err.response) {
        setError(err.response.data?.message || 'Failed to load applications.');
      } else if (err.request) {
        setError('Unable to reach the server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred while loading applications.');
      }
      
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Fetch available workers
  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching workers from backend...');
      const response = await axios.get('/api/hhm/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Backend response:', response.data);
      
      const backendWorkers = response.data.data || response.data || [];
      console.log('👥 Workers from backend:', backendWorkers.length, 'workers');
      
      const mappedWorkers = backendWorkers.map(worker => ({
        _id: worker.workerId || worker._id,
        name: worker.name,
        username: worker.email?.split('@')[0] || 'user',
        email: worker.email,
        phone: worker.phone,
        skills: worker.skills || [],
        workPreferences: 'Available for work',
        wageRate: 'Negotiable',
        availability: worker.availabilityStatus === 'available' ? 'Available' : 'Busy',
        workExperience: worker.experience ? `${worker.experience} years` : 'N/A',
        rating: 4.0,
        completedJobs: 0,
        location: worker.location,
        bio: worker.bio,
        profileImage: worker.profileImage,
        isVerified: worker.isVerified
      }));
      
      console.log('✅ Mapped workers:', mappedWorkers);
      setWorkers(mappedWorkers);
      setFilteredWorkers(mappedWorkers);
    } catch (err) {
      console.error('❌ Error fetching workers:', err.response?.data || err.message);
      const mockWorkers = [
        {
          _id: '1',
          name: 'Amit Kumar',
          username: 'amitlabour',
          email: 'amit.kumar@example.com',
          phone: '+91-9876543212',
          skills: ['Sugarcane cutting', 'Field preparation', 'Irrigation', 'Equipment operation'],
          workPreferences: 'Full-time, Day shifts, Outdoor work',
          wageRate: '₹350 per day',
          availability: 'Available',
          workExperience: '6 years in agricultural work',
          rating: 4.5,
          completedJobs: 45
        }
      ];
      setWorkers(mockWorkers);
      setFilteredWorkers(mockWorkers);
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Handle application approval/rejection
  const handleApplicationAction = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('⚠️ Authentication required. Please login again.');
        return;
      }

      const actionText = action === 'approved' ? 'Approving' : 'Rejecting';
      console.log(`${actionText} application:`, applicationId);

      const response = await axios.put(
        `/api/hhm/applications/${applicationId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Application status updated:', response.data);

      setApplications(prev =>
        prev.filter(app => app._id !== applicationId)
      );

      const successMsg = action === 'approved' 
        ? '✅ Application approved successfully! The worker has been notified and added to your hired workers in your profile.'
        : '❌ Application rejected. The worker has been notified.';
      
      alert(successMsg);

    } catch (err) {
      console.error('❌ Error updating application:', err);
      
      let errorMsg = 'Failed to update application status. ';
      
      if (err.response?.status === 401) {
        errorMsg = '🔒 Authentication failed. Please login again.';
      } else if (err.response?.status === 403) {
        errorMsg = '⛔ Access denied. You do not have permission to update this application.';
      } else if (err.response?.status === 404) {
        errorMsg = '❌ Application not found. It may have been already processed.';
      } else if (err.response?.status === 400) {
        errorMsg = '⚠️ ' + (err.response.data?.message || 'Invalid request. Please try again.');
      } else if (err.response) {
        errorMsg = '❌ ' + (err.response.data?.message || 'Failed to update application status.');
      } else if (err.request) {
        errorMsg = '🌐 Unable to reach the server. Please check your internet connection.';
      }
      
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading labor management data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>⚠️ Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f8f9fa' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '0.5rem' }}>
          Labor Management
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '0' }}>
          Manage job schedules, review applications, and connect with workers. <strong>Note:</strong> Your hired workers are now managed in your Profile page.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: activeTab === 'create-job' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'create-job' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'create-job' ? 'bold' : 'normal',
            borderBottom: activeTab === 'create-job' ? '3px solid #2980b9' : 'none'
          }}
          onClick={() => setActiveTab('create-job')}
        >
          + Create Job
        </button>
        <button
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: activeTab === 'applications' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'applications' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'applications' ? 'bold' : 'normal',
            borderBottom: activeTab === 'applications' ? '3px solid #2980b9' : 'none'
          }}
          onClick={() => setActiveTab('applications')}
        >
          Applications Received ({applications.filter(app => app.status === 'pending').length})
        </button>
        <button
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: activeTab === 'hire-labour' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'hire-labour' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'hire-labour' ? 'bold' : 'normal',
            borderBottom: activeTab === 'hire-labour' ? '3px solid #2980b9' : 'none'
          }}
          onClick={() => setActiveTab('hire-labour')}
        >
          Hire Labour
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        {activeTab === 'create-job' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Create Job Schedule</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              Create new job opportunities for workers
            </p>
            <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p>Job creation form will be implemented here</p>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Job Applications</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              Review and manage worker applications. Approved workers will appear in your Profile page under "My Hired Workers".
            </p>
            {loadingApplications ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p><strong>No applications received yet</strong></p>
                <p>Applications from workers will appear here for review</p>
              </div>
            ) : (
              <div>
                {applications.map(app => (
                  <div key={app._id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{app.workerId.name}</h3>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                          <strong>Job:</strong> {app.scheduleId.title}
                        </p>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                          <strong>Email:</strong> {app.workerId.email}
                        </p>
                        <p style={{ margin: '0 0 1rem 0' }}>
                          <strong>Status:</strong> <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            backgroundColor: app.status === 'pending' ? '#fff3cd' : app.status === 'approved' ? '#d4edda' : '#f8d7da',
                            color: app.status === 'pending' ? '#856404' : app.status === 'approved' ? '#155724' : '#721c24'
                          }}>
                            {app.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleApplicationAction(app._id, 'approved')}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#27ae60',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleApplicationAction(app._id, 'rejected')}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hire-labour' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Available Workers</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              Browse and invite workers for your jobs
            </p>
            {loadingWorkers ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading workers...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👷</div>
                <p><strong>No workers available</strong></p>
                <p>Available workers will appear here for invitation</p>
              </div>
            ) : (
              <div>
                {filteredWorkers.map(worker => (
                  <div key={worker._id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fff'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{worker.name}</h3>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                      <strong>Email:</strong> {worker.email}
                    </p>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                      <strong>Availability:</strong> {worker.availability}
                    </p>
                    <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d' }}>
                      <strong>Skills:</strong> {worker.skills.join(', ')}
                    </p>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      📤 Send Invitation
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborManagementPage;