import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const LabourManagementPage = () => {
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
    labourCount: '',
    requiredSkills: '',
    workType: '',
    workingHours: ''
  });
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Hire Labour tab state
  const [labours, setLabours] = useState([]);
  const [filteredLabours, setFilteredLabours] = useState([]);
  const [loadingLabours, setLoadingLabours] = useState(false);
  const [labourSearchTerm, setLabourSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Invitation modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState(null);
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

  // Fetch labours when Hire Labour tab is selected
  useEffect(() => {
    if (activeTab === 'hire-labour') {
      fetchLabours();
    }
  }, [activeTab]);

  // Filter labours based on search and skill filter
  const filterLabours = useCallback(() => {
    let filtered = [...labours];

    // Apply search filter (name, username, email)
    if (labourSearchTerm) {
      filtered = filtered.filter(labour =>
        labour.name?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
        labour.username?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
        labour.email?.toLowerCase().includes(labourSearchTerm.toLowerCase())
      );
    }

    // Apply skill filter
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
        labourId: {
          _id: app.labour?.id || app.labour?._id,
          name: app.labour?.name || 'Unknown Labour',
          email: app.labour?.email || 'N/A',
          phone: app.labour?.phone || 'N/A',
          username: app.labour?.username || app.labour?.email?.split('@')[0] || 'N/A',
          skills: app.labour?.skills || [],
          availabilityStatus: app.labour?.availabilityStatus,
          profileImage: app.labour?.profileImage
        },
        scheduleId: {
          _id: app.schedule?.id || app.schedule?._id,
          title: app.schedule?.title || 'Unknown Job',
          location: app.schedule?.location || 'N/A',
          workType: app.schedule?.workType || app.schedule?.jobType || 'general',
          startDate: app.schedule?.startDate,
          endDate: app.schedule?.endDate,
          wageOffered: app.schedule?.wageOffered,
          labourCount: app.schedule?.labourCount,
          requiredSkills: app.schedule?.requiredSkills
        },
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        reviewedAt: app.reviewedAt,
        message: app.applicationMessage || app.message || 'No message provided',
        skills: app.labourSkills || app.skills || [],
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
    }  // Fetch available labours
  const fetchLabours = async () => {
    try {
      setLoadingLabours(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
 
      console.log('🔄 Fetching labours from backend...');
      const response = await axios.get('/api/hhm/labours', {
        headers: { Authorization: `Bearer ${token}` }
      });
 
      console.log('✅ Backend response:', response.data);
      
      const backendLabours = response.data.data || response.data || [];
      console.log('👥 Labours from backend:', backendLabours.length, 'labours');
      
      const mappedLabours = backendLabours.map(labour => ({
        _id: labour.labourId || labour._id,
        name: labour.name,
        username: labour.email?.split('@')[0] || 'user',
        email: labour.email,
        phone: labour.phone,
        skills: labour.skills || [],
        workPreferences: 'Available for work',
        wageRate: 'Negotiable',
        availability: labour.availabilityStatus === 'available' ? 'Available' : 'Busy',
        workExperience: labour.experience ? `${labour.experience} years` : 'N/A',
        rating: 4.0,
        completedJobs: 0,
        location: labour.location,
        bio: labour.bio,
        profileImage: labour.profileImage,
        isVerified: labour.isVerified
      }));
      
      console.log('✅ Mapped labours:', mappedLabours);
      setLabours(mappedLabours);
      setFilteredLabours(mappedLabours);
    } catch (err) {
      console.error('❌ Error fetching labours:', err.response?.data || err.message);
      const mockLabours = [
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
      setLabours(mockLabours);
      setFilteredLabours(mockLabours);
    } finally {
      setLoadingLabours(false);
    }
  };ers(false);
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
        ? '✅ Application approved successfully! The labour has been notified and added to your hired labours in your profile.'
        : '❌ Application rejected. The labour has been notified.';
      
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
        <div>Loading labour management data...</div>
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
          Labour Management
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '0' }}>
          Manage job schedules, review applications, and connect with labours. <strong>Note:</strong> Your hired labours are now managed in your Profile page.
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
              Create new job opportunities for labours
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
              Review and manage labour applications. Approved labours will appear in your Profile page under "My Hired Labours".
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
                <p>Applications from labours will appear here for review</p>
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
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{app.labourId.name}</h3>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                          <strong>Job:</strong> {app.scheduleId.title}
                        </p>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                          <strong>Email:</strong> {app.labourId.email}
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
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Available Labours</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              Browse and invite labours for your jobs
            </p>
            {loadingLabours ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading labours...</p>
              </div>
            ) : filteredLabours.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👷</div>
                <p><strong>No labours available</strong></p>
                <p>Available labours will appear here for invitation</p>
              </div>
            ) : (
              <div>
                {filteredLabours.map(labour => (
                  <div key={labour._id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fff'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{labour.name}</h3>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                      <strong>Email:</strong> {labour.email}
                    </p>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>
                      <strong>Availability:</strong> {labour.availability}
                    </p>
                    <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d' }}>
                      <strong>Skills:</strong> {labour.skills.join(', ')}
                    </p>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        
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

export default LabourManagementPage;