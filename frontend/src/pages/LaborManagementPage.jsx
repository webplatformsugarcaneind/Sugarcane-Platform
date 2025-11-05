import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LaborManagementPage = () => {
  const [activeTab, setActiveTab] = useState('create-job');
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [filteredApplications, setFilteredApplications] = useState([]);
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

  // My Labours tab state
  const [myLabours, setMyLabours] = useState([]);
  const [loadingMyLabours, setLoadingMyLabours] = useState(false);
  const [labourSearchTerm, setLabourSearchTerm] = useState('');
  const [filteredMyLabours, setFilteredMyLabours] = useState([]);

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

  // Fetch my labours when My Labours tab is selected
  useEffect(() => {
    if (activeTab === 'my-labours') {
      fetchMyLabours();
    }
  }, [activeTab]);

  // Filter workers based on search and skill filter
  useEffect(() => {
    filterWorkers();
  }, [workers, workerSearchTerm, selectedSkillFilter]);

  // Filter my labours based on search
  useEffect(() => {
    filterMyLabours();
  }, [myLabours, labourSearchTerm]);

  // Filter applications based on status
  useEffect(() => {
    filterApplications();
  }, [applications, applicationStatusFilter]);

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

      // CRITICAL DEBUG LINE: Log the exact data received from API
      console.log('Received applications from API:', response.data);

      console.log('✅ Applications fetched successfully:', response.data);
      
      // Extract the applications array from response
      const applicationsData = response.data.data || response.data;
      
      // Map the backend response to match the display format
      // Backend sends: app.worker.name, app.schedule.title
      // Frontend expects: app.workerId.name, app.scheduleId.title
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
      
      // Set appropriate error message
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
      
      // Map backend data to frontend format
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
      // Use mock data as fallback for development
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
        },
        {
          _id: '2',
          name: 'Meena Kumari',
          username: 'meenalabour',
          email: 'meena.kumari@example.com',
          phone: '+91-9876543215',
          skills: ['Harvesting', 'Sorting', 'Packaging', 'Quality inspection'],
          workPreferences: 'Part-time, Flexible hours, Seasonal work',
          wageRate: '₹300 per day',
          availability: 'Available',
          workExperience: '4 years in farm operations',
          rating: 4.7,
          completedJobs: 32
        },
        {
          _id: '3',
          name: 'Rajesh Singh',
          username: 'rajeshworker',
          email: 'rajesh.singh@example.com',
          phone: '+91-9876543220',
          skills: ['Equipment operation', 'Machinery maintenance', 'Technical support'],
          workPreferences: 'Full-time, Any shift, Technical work',
          wageRate: '₹450 per day',
          availability: 'Busy',
          workExperience: '8 years with agricultural machinery',
          rating: 4.9,
          completedJobs: 67
        },
        {
          _id: '4',
          name: 'Sunita Devi',
          username: 'sunitaworker',
          email: 'sunita.devi@example.com',
          phone: '+91-9876543221',
          skills: ['Planting', 'Weeding', 'Fertilizer application', 'Crop monitoring'],
          workPreferences: 'Part-time, Morning shifts, Field work',
          wageRate: '₹280 per day',
          availability: 'Available',
          workExperience: '5 years in crop management',
          rating: 4.3,
          completedJobs: 38
        },
        {
          _id: '5',
          name: 'Prakash Yadav',
          username: 'prakashworker',
          email: 'prakash.yadav@example.com',
          phone: '+91-9876543222',
          skills: ['Irrigation', 'Pesticide application', 'Field preparation', 'Harvesting'],
          workPreferences: 'Full-time, Flexible, All types of work',
          wageRate: '₹380 per day',
          availability: 'Available',
          workExperience: '10 years multi-skilled experience',
          rating: 4.6,
          completedJobs: 89
        }
      ];
      setWorkers(mockWorkers);
      setFilteredWorkers(mockWorkers);
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Filter workers based on search term and skill filter
  const filterWorkers = () => {
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

    // Exclude workers who are currently busy/assigned
    filtered = filtered.filter(worker => {
      // Worker may have availability as 'Available' or 'Busy'
      if (worker.availability) {
        return worker.availability === 'Available';
      }
      // Fallback: include if no availability info
      return true;
    });
    setFilteredWorkers(filtered);
  };

  // Filter applications based on status
  const filterApplications = () => {
    let filtered = [...applications];

    // Apply status filter
    if (applicationStatusFilter && applicationStatusFilter !== 'all') {
      filtered = filtered.filter(application => 
        application.status === applicationStatusFilter
      );
    }

    setFilteredApplications(filtered);
  };

  // Fetch HHM's own schedules for invitation modal
  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📅 Fetching schedules from backend...');
      const response = await axios.get('/api/hhm/schedules', {
        params: { status: 'open' }, // Only fetch open schedules
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Schedules response:', response.data);
      const schedulesData = response.data.data || response.data || [];
      setMySchedules(schedulesData);
      
    } catch (err) {
      console.error('❌ Error fetching schedules:', err.response?.data || err.message);
      alert('Failed to load job schedules. Please try again.');
      setMySchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Handle opening invite modal
  const handleOpenInviteModal = async (worker) => {
    setSelectedWorker(worker);
    setShowInviteModal(true);
    setSelectedScheduleId('');
    setInvitationMessage('');
    
    // Fetch schedules when modal opens
    await fetchSchedules();
  };

  // Handle closing invite modal
  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setSelectedWorker(null);
    setSelectedScheduleId('');
    setInvitationMessage('');
    setMySchedules([]);
  };

  // Handle sending invitation
  const handleSendInvitation = async () => {
    if (!selectedScheduleId) {
      alert('Please select a job schedule to invite the worker for.');
      return;
    }

    if (!selectedWorker) {
      alert('No worker selected.');
      return;
    }

    try {
      setSendingInvitation(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📨 Sending invitation...');
      console.log('Worker ID:', selectedWorker._id);
      console.log('Schedule ID:', selectedScheduleId);

      const invitationData = {
        scheduleId: selectedScheduleId,
        workerId: selectedWorker._id,
        personalMessage: invitationMessage || `We would like to invite you to work with us!`,
        priority: 'medium'
      };

      const response = await axios.post('/api/hhm/invitations', invitationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Invitation sent:', response.data);
      
      alert(`✅ Invitation sent successfully to ${selectedWorker.name}!`);
      handleCloseInviteModal();
      
    } catch (err) {
      console.error('❌ Error sending invitation:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to send invitation. Please try again.';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setSendingInvitation(false);
    }
  };

  // Fetch approved labours (workers with approved applications)
  const fetchMyLabours = async () => {
    try {
      setLoadingMyLabours(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching approved labours from backend...');
      const response = await axios.get('/api/hhm/applications?status=approved', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Backend response for my labours:', response.data);
      
      const approvedApplications = response.data.data || response.data || [];
      console.log('👥 Approved labours from backend:', approvedApplications.length, 'workers');
      
      // Transform applications to labour data
      const laboursData = approvedApplications.map(app => ({
        _id: app.worker?.id || app._id,
        applicationId: app._id,
        name: app.worker?.name,
        email: app.worker?.email,
        phone: app.worker?.phone,
        skills: app.worker?.skills || app.workerSkills || [],
        experience: app.worker?.experience || app.experience,
        profileImage: app.worker?.profileImage,
        availabilityStatus: app.worker?.availabilityStatus || 'available',
        schedule: {
          title: app.schedule?.title,
          startDate: app.schedule?.startDate,
          location: app.schedule?.location,
          wageOffered: app.schedule?.wageOffered
        },
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        expectedWage: app.expectedWage,
        availability: app.availability
      }));
      
      console.log('✅ Mapped labours:', laboursData);
      setMyLabours(laboursData);
      setFilteredMyLabours(laboursData);
    } catch (err) {
      console.error('❌ Error fetching my labours:', err.response?.data || err.message);
      // Show empty state on error
      setMyLabours([]);
      setFilteredMyLabours([]);
    } finally {
      setLoadingMyLabours(false);
    }
  };

  // Filter my labours based on search term
  const filterMyLabours = () => {
    let filtered = [...myLabours];

    if (labourSearchTerm) {
      filtered = filtered.filter(labour =>
        labour.name?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
        labour.email?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
        labour.schedule?.title?.toLowerCase().includes(labourSearchTerm.toLowerCase())
      );
    }

    setFilteredMyLabours(filtered);
  };


  // Handle application approval/rejection
  const handleApplicationAction = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('⚠️ Authentication required. Please login again.');
        return;
      }

      // Show loading state
      const actionText = action === 'approved' ? 'Approving' : 'Rejecting';
      console.log(`${actionText} application:`, applicationId);

      // Make API request to update application status
      const response = await axios.put(
        `/api/hhm/applications/${applicationId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Application status updated:', response.data);

      // Update local state - remove the application from the list
      setApplications(prev =>
        prev.filter(app => app._id !== applicationId)
      );

      // If approved, mark the related worker as unavailable in the backend and locally
      if (action === 'approved') {
        try {
          // Get worker id from the application we just processed
          const currentApplication = applications.find(a => a._id === applicationId);
          const workerId = currentApplication?.workerId?._id || currentApplication?.workerId;

          if (workerId) {
            // Call backend API to mark worker as busy
            try {
              await axios.put(
                `/api/hhm/workers/${workerId}/availability`,
                { availability: 'busy' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              console.log(`✅ Worker ${workerId} marked as busy in backend`);
            } catch (availabilityError) {
              console.warn('❌ Could not update worker availability in backend:', availabilityError);
            }

            // Update local state: set availability to Busy
            setWorkers(prev => prev.map(w => (w._id === workerId ? { ...w, availability: 'Busy' } : w)));
            // Re-filter workers to remove busy ones from the display
            setFilteredWorkers(prev => prev.filter(w => w._id !== workerId));

            console.log(`✅ Worker ${workerId} marked as unavailable locally`);
          }
        } catch (e) {
          console.warn('Could not mark worker as Busy:', e);
        }
      }

      // Show success message
      const successMsg = action === 'approved' 
        ? '✅ Application approved successfully! The worker has been notified.'
        : '❌ Application rejected. The worker has been notified.';
      
      alert(successMsg);

      // If approved, refetch the "My Labours" data to update that tab
      if (action === 'approved' && activeTab === 'my-labours') {
        fetchMyLabours();
      }

    } catch (err) {
      console.error('❌ Error updating application:', err);
      
      // Show detailed error message
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

  // Handle schedule form submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages and errors
    setSuccessMessage('');
    setErrorMessage('');
    setFieldErrors({});
    
    try {
      setSubmittingSchedule(true);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Authentication required. Please login again.');
        return;
      }

      // Validate form data with specific error messages
      if (!scheduleForm.title || scheduleForm.title.trim() === '') {
        setErrorMessage('❌ Job Title is required and cannot be empty.');
        setFieldErrors({ title: true });
        return;
      }

      if (!scheduleForm.workType || scheduleForm.workType === '') {
        setErrorMessage('❌ Work Type is required. Please select a work type from the dropdown.');
        setFieldErrors({ workType: true });
        return;
      }

      if (!scheduleForm.location || scheduleForm.location.trim() === '') {
        setErrorMessage('❌ Location is required and cannot be empty.');
        setFieldErrors({ location: true });
        return;
      }

      if (!scheduleForm.description || scheduleForm.description.trim() === '') {
        setErrorMessage('❌ Job Description is required and cannot be empty.');
        setFieldErrors({ description: true });
        return;
      }

      if (!scheduleForm.workerCount || parseInt(scheduleForm.workerCount) <= 0) {
        setErrorMessage('❌ Workers Needed must be a positive number (at least 1).');
        setFieldErrors({ workerCount: true });
        return;
      }

      if (!scheduleForm.wageOffered || parseFloat(scheduleForm.wageOffered) <= 0) {
        setErrorMessage('❌ Daily Wage must be a positive amount (greater than 0).');
        setFieldErrors({ wageOffered: true });
        return;
      }

      // Validate dates
      if (!scheduleForm.startDate || !scheduleForm.endDate) {
        setErrorMessage('❌ Both Start Date and End Date are required.');
        setFieldErrors({ 
          startDate: !scheduleForm.startDate, 
          endDate: !scheduleForm.endDate 
        });
        return;
      }

      const startDate = new Date(scheduleForm.startDate);
      const endDate = new Date(scheduleForm.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      // Check if dates are valid
      if (isNaN(startDate.getTime())) {
        setErrorMessage('❌ Start Date is invalid. Please select a valid date.');
        setFieldErrors({ startDate: true });
        return;
      }

      if (isNaN(endDate.getTime())) {
        setErrorMessage('❌ End Date is invalid. Please select a valid date.');
        setFieldErrors({ endDate: true });
        return;
      }

      // Check if start date is not in the past
      if (startDate < today) {
        setErrorMessage('❌ Start Date cannot be in the past. Please select a future date.');
        setFieldErrors({ startDate: true });
        return;
      }

      // Check if end date is after start date
      if (endDate <= startDate) {
        setErrorMessage('❌ End Date must be after Start Date.');
        setFieldErrors({ startDate: true, endDate: true });
        return;
      }

      // Check if date range is reasonable (not more than 2 years)
      const twoYearsFromStart = new Date(startDate);
      twoYearsFromStart.setFullYear(twoYearsFromStart.getFullYear() + 2);
      if (endDate > twoYearsFromStart) {
        setErrorMessage('❌ Date range is too long. End Date should be within 2 years of Start Date.');
        setFieldErrors({ endDate: true });
        return;
      }

      // Prepare schedule data
      const scheduleData = {
        title: scheduleForm.title.trim(),
        description: scheduleForm.description.trim(),
        location: scheduleForm.location.trim(),
        workType: scheduleForm.workType,
        workingHours: scheduleForm.workingHours.trim(),
        wageOffered: parseFloat(scheduleForm.wageOffered),
        workerCount: parseInt(scheduleForm.workerCount),
        requiredSkills: scheduleForm.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0),
        startDate: new Date(scheduleForm.startDate).toISOString(),
        endDate: new Date(scheduleForm.endDate).toISOString(),
        status: 'open' // Set initial status
      };

      console.log('📤 Submitting schedule data:', scheduleData);

      // Make API request to create schedule
      const response = await axios.post('/api/hhm/schedules', scheduleData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Schedule created successfully:', response.data);

      // Show success message
      setSuccessMessage('Job schedule created successfully! Workers can now apply for this position.');

      // Reset form after successful submission
      setScheduleForm({
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

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      console.error('❌ Error creating schedule:', err);
      
      // Handle specific error cases
      if (err.response) {
        // Server responded with error
        const errorMsg = err.response.data?.message || 'Failed to create job schedule';
        const errorDetails = err.response.data?.error || '';
        
        if (err.response.status === 401) {
          setErrorMessage('🔒 Authentication failed. Please login again.');
        } else if (err.response.status === 403) {
          setErrorMessage('⛔ Access denied. You do not have permission to create schedules.');
        } else if (err.response.status === 400) {
          // Show specific validation error from backend
          setErrorMessage(`❌ Validation Error: ${errorMsg}${errorDetails ? '\n' + errorDetails : ''}`);
        } else {
          setErrorMessage(`❌ Error: ${errorMsg}`);
        }
      } else if (err.request) {
        // Request made but no response
        setErrorMessage('🌐 Unable to reach the server. Please check your internet connection.');
      } else {
        // Something else happened
        setErrorMessage('⚠️ An unexpected error occurred. Please try again.');
      }

      // Auto-hide error message after 7 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 7000);
      
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function for status styling
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    };

    switch (status) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'approved':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return baseStyle;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading labor management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #3498db !important;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          }
        `}
      </style>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Labor Management</h1>
        <p style={styles.subtitle}>
          Manage job schedules, review applications, and connect with workers
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'create-job' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('create-job')}
        >
          + Create Job
        </button>
        <button
          style={activeTab === 'applications' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('applications')}
        >
          Applications Received ({applications.filter(app => app.status === 'pending').length})
        </button>
        <button
          style={activeTab === 'hire-labour' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('hire-labour')}
        >
          Hire Labour
        </button>
        {/* <button
          style={activeTab === 'my-labours' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('my-labours')}
        >
          My Labours
        </button> */}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Create Job Tab */}
        {activeTab === 'create-job' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>Create New Job Schedule</h2>
              <p style={styles.tabDescription}>
                Post a new job opportunity to attract skilled agricultural workers
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div style={styles.successAlert}>
                <span style={styles.alertIcon}>✅</span>
                <span>{successMessage}</span>
                <button 
                  style={styles.closeAlert}
                  onClick={() => setSuccessMessage('')}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div style={styles.errorAlert}>
                <span style={styles.alertIcon}>⚠️</span>
                <span>{errorMessage}</span>
                <button 
                  style={styles.closeAlert}
                  onClick={() => setErrorMessage('')}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            )}
            
            <form onSubmit={handleScheduleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={scheduleForm.title}
                    onChange={handleInputChange}
                    style={fieldErrors.title ? styles.inputError : styles.input}
                    placeholder="e.g., Sugarcane Harvesting"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Work Type *</label>
                  <select
                    name="workType"
                    value={scheduleForm.workType}
                    onChange={handleInputChange}
                    style={fieldErrors.workType ? styles.inputError : styles.input}
                    required
                  >
                    <option value="">Select work type</option>
                    <option value="harvesting">Harvesting</option>
                    <option value="planting">Planting</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="maintenance">Field Maintenance</option>
                    <option value="pesticide">Pesticide Application</option>
                    <option value="preparation">Field Preparation</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={scheduleForm.location}
                    onChange={handleInputChange}
                    style={fieldErrors.location ? styles.inputError : styles.input}
                    placeholder="e.g., Field A-1, Punjab"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Workers Needed *</label>
                  <input
                    type="number"
                    name="workerCount"
                    value={scheduleForm.workerCount}
                    onChange={handleInputChange}
                    style={fieldErrors.workerCount ? styles.inputError : styles.input}
                    placeholder="Number of workers"
                    min="1"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={scheduleForm.startDate}
                    onChange={handleInputChange}
                    style={fieldErrors.startDate ? styles.inputError : styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={scheduleForm.endDate}
                    onChange={handleInputChange}
                    style={fieldErrors.endDate ? styles.inputError : styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Daily Wage (₹) *</label>
                  <input
                    type="number"
                    name="wageOffered"
                    value={scheduleForm.wageOffered}
                    onChange={handleInputChange}
                    style={fieldErrors.wageOffered ? styles.inputError : styles.input}
                    placeholder="e.g., 800"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Working Hours</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={scheduleForm.workingHours}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="e.g., 8 AM - 5 PM"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Required Skills</label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={scheduleForm.requiredSkills}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="e.g., harvesting, equipment operation (comma-separated)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Job Description *</label>
                <textarea
                  name="description"
                  value={scheduleForm.description}
                  onChange={handleInputChange}
                  style={fieldErrors.description ? styles.textareaError : styles.textarea}
                  placeholder="Describe the job requirements, working conditions, and any additional details..."
                  rows="4"
                  required
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={submittingSchedule}
                >
                  {submittingSchedule ? 'Creating...' : 'Create Job Schedule'}
                </button>
                <button
                  type="button"
                  style={styles.resetButton}
                  onClick={() => setScheduleForm({
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
                  })}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applications Received Tab */}
        {activeTab === 'applications' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>Applications Received</h2>
              <p style={styles.tabDescription}>
                Review and respond to job applications from workers
              </p>
            </div>
            
            {loadingApplications ? (
              <div style={styles.loadingSection}>
                <div style={styles.spinner}></div>
                <p>Loading applications...</p>
              </div>
            ) : error ? (
              <div style={styles.errorAlert}>
                <span style={styles.alertIcon}>⚠️</span>
                <span>{error}</span>
                <button 
                  style={styles.closeAlert}
                  onClick={() => {
                    setError(null);
                    fetchApplications();
                  }}
                  aria-label="Retry"
                >
                  🔄
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>📋</div>
                <p style={styles.placeholderTitle}>No applications yet</p>
                <p style={styles.placeholderText}>
                  Applications from workers will appear here when they apply for your jobs.
                  Create job schedules in the "Create Job" tab to start receiving applications.
                </p>
              </div>
            ) : (
              <div style={styles.applicationsList}>
                {/* Filter buttons for application status */}
                <div style={styles.filterButtonGroup}>
                  <button 
                    style={applicationStatusFilter === 'all' ? {...styles.filterBtn, ...styles.activeFilterBtn} : styles.filterBtn}
                    onClick={() => setApplicationStatusFilter('all')}
                  >
                    All ({applications.length})
                  </button>
                  <button 
                    style={applicationStatusFilter === 'pending' ? {...styles.filterBtn, ...styles.activeFilterBtn} : styles.filterBtn}
                    onClick={() => setApplicationStatusFilter('pending')}
                  >
                    Pending ({applications.filter(app => app.status === 'pending').length})
                  </button>
                  <button 
                    style={applicationStatusFilter === 'approved' ? {...styles.filterBtn, ...styles.activeFilterBtn} : styles.filterBtn}
                    onClick={() => setApplicationStatusFilter('approved')}
                  >
                    Approved ({applications.filter(app => app.status === 'approved').length})
                  </button>
                  <button 
                    style={applicationStatusFilter === 'rejected' ? {...styles.filterBtn, ...styles.activeFilterBtn} : styles.filterBtn}
                    onClick={() => setApplicationStatusFilter('rejected')}
                  >
                    Rejected ({applications.filter(app => app.status === 'rejected').length})
                  </button>
                </div>

                {/* Applications List */}
                {filteredApplications.map(application => (
                  <div key={application._id} style={styles.applicationCard}>
                    <div style={styles.applicationHeader}>
                      <div style={styles.workerInfo}>
                        <h3 style={styles.workerName}>
                          👤 {application.workerId ? application.workerId.name : 'Unknown Worker'}
                          {application.workerId?.username && (
                            <span style={styles.usernameTag}> @{application.workerId.username}</span>
                          )}
                        </h3>
                        <p style={styles.jobTitle}>
                          <strong>Applied for:</strong> {application.scheduleId ? application.scheduleId.title : 'Unknown Job'}
                        </p>
                        <p style={styles.location}>
                          📍 {application.scheduleId ? application.scheduleId.location : 'N/A'}
                        </p>
                        {application.scheduleId?.workType && (
                          <p style={styles.workType}>
                            🔧 Work Type: <span style={styles.workTypeBadge}>{application.scheduleId.workType}</span>
                          </p>
                        )}
                      </div>
                      <div style={styles.statusSection}>
                        <span style={getStatusStyle(application.status)}>
                          {application.status}
                        </span>
                        <p style={styles.appliedDate}>
                          📅 Applied: {new Date(application.appliedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {application.reviewedAt && (
                          <p style={styles.reviewedDate}>
                            ✅ Reviewed: {new Date(application.reviewedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={styles.applicationContent}>
                      <div style={styles.workerDetails}>
                        <div style={styles.detailItem}>
                          <strong>📧 Email:</strong> {application.workerId ? application.workerId.email : 'N/A'}
                        </div>
                        <div style={styles.detailItem}>
                          <strong>📱 Phone:</strong> {application.workerId ? application.workerId.phone : 'N/A'}
                        </div>
                        <div style={styles.detailItem}>
                          <strong>📅 Experience:</strong> {application.experience}
                        </div>
                        {application.expectedWage && (
                          <div style={styles.detailItem}>
                            <strong>💰 Expected Wage:</strong> ₹{application.expectedWage}/day
                          </div>
                        )}
                        {application.scheduleId?.wageOffered && (
                          <div style={styles.detailItem}>
                            <strong>💵 Offered Wage:</strong> ₹{application.scheduleId.wageOffered}/day
                          </div>
                        )}
                      </div>

                      {application.skills && application.skills.length > 0 && (
                        <div style={styles.skillsSection}>
                          <strong>🛠️ Skills:</strong>
                          <div style={styles.skillTagsContainer}>
                            {application.skills.map((skill, idx) => (
                              <span key={idx} style={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {application.message && (
                        <div style={styles.applicationMessage}>
                          <strong>💬 Application Message:</strong>
                          <p style={styles.messageText}>{application.message}</p>
                        </div>
                      )}

                      {application.availability && (
                        <div style={styles.availabilityInfo}>
                          <strong>📆 Availability:</strong> {application.availability}
                        </div>
                      )}
                    </div>

                    {application.status === 'pending' && (
                      <div style={styles.applicationActions}>
                        <button
                          style={styles.approveButton}
                          onClick={() => handleApplicationAction(application._id, 'approved')}
                        >
                          ✅ Approve Application
                        </button>
                        <button
                          style={styles.rejectButton}
                          onClick={() => handleApplicationAction(application._id, 'rejected')}
                        >
                          ❌ Reject Application
                        </button>
                        <button 
                          style={styles.contactButton}
                          onClick={() => window.location.href = `tel:${application.workerId ? application.workerId.phone : ''}`}
                        >
                          📞 Contact Worker
                        </button>
                      </div>
                    )}

                    {application.status === 'approved' && (
                      <div style={styles.applicationActions}>
                        <div style={styles.approvedMessage}>
                          ✅ This application has been approved. The worker is now in your "My Labours" list.
                        </div>
                        <button 
                          style={styles.contactButton}
                          onClick={() => window.location.href = `tel:${application.workerId ? application.workerId.phone : ''}`}
                        >
                          📞 Contact Worker
                        </button>
                      </div>
                    )}

                    {application.status === 'rejected' && (
                      <div style={styles.applicationActions}>
                        <div style={styles.rejectedMessage}>
                          ❌ This application was rejected.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hire Labour Tab */}
        {activeTab === 'hire-labour' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>Hire Labour</h2>
              <p style={styles.tabDescription}>
                Search and hire skilled workers for your agricultural needs
              </p>
            </div>

            {/* Search and Filter Section */}
            <div style={styles.searchFilterSection}>
              <div style={styles.searchInputGroup}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search workers by name, username, or email..."
                  value={workerSearchTerm}
                  onChange={(e) => setWorkerSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {workerSearchTerm && (
                  <button
                    style={styles.clearSearchButton}
                    onClick={() => setWorkerSearchTerm('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={styles.filterGroup}>
                <select
                  value={selectedSkillFilter}
                  onChange={(e) => setSelectedSkillFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Skills</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="planting">Planting</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="equipment">Equipment Operation</option>
                  <option value="field preparation">Field Preparation</option>
                  <option value="sorting">Sorting & Packaging</option>
                  <option value="pesticide">Pesticide Application</option>
                  <option value="maintenance">Machinery Maintenance</option>
                </select>

                {(workerSearchTerm || selectedSkillFilter) && (
                  <button
                    style={styles.clearFiltersBtn}
                    onClick={() => {
                      setWorkerSearchTerm('');
                      setSelectedSkillFilter('');
                    }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div style={styles.resultsInfo}>
                <span style={styles.resultsCount}>
                  {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Workers List */}
            {loadingWorkers ? (
              <div style={styles.loadingSection}>
                <div style={styles.spinner}></div>
                <p>Loading available workers...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>👷</div>
                <p style={styles.placeholderTitle}>
                  {workerSearchTerm || selectedSkillFilter
                    ? 'No workers match your search criteria'
                    : 'No workers available'}
                </p>
                <p style={styles.placeholderText}>
                  {workerSearchTerm || selectedSkillFilter
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Available workers will appear here when they register on the platform.'}
                </p>
                {(workerSearchTerm || selectedSkillFilter) && (
                  <button
                    style={styles.clearFiltersBtn}
                    onClick={() => {
                      setWorkerSearchTerm('');
                      setSelectedSkillFilter('');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.workersGrid}>
                {filteredWorkers.map(worker => (
                  <div key={worker._id} style={styles.workerCard}>
                    <div style={styles.workerHeader}>
                      <div style={styles.workerAvatar}>
                        <span style={styles.avatarIcon}>👤</span>
                      </div>
                      <div style={styles.workerBasicInfo}>
                        <h3 style={styles.workerName}>{worker.name || 'Unknown Worker'}</h3>
                        <p style={styles.workerUsername}>@{worker.username || 'unknown'}</p>
                      </div>
                      <div style={styles.availabilityBadge}>
                        <span style={
                          worker.availability === 'Available' 
                            ? styles.availableBadge 
                            : styles.busyBadge
                        }>
                          {worker.availability === 'Available' ? '✅ Available' : '⏳ Busy'}
                        </span>
                      </div>
                    </div>

                    <div style={styles.workerContent}>
                      <div style={styles.workerDetailRow}>
                        <span style={styles.detailLabel}>📧 Email:</span>
                        <span style={styles.detailValue}>{worker.email || 'N/A'}</span>
                      </div>

                      <div style={styles.workerDetailRow}>
                        <span style={styles.detailLabel}>📱 Phone:</span>
                        <span style={styles.detailValue}>{worker.phone || 'N/A'}</span>
                      </div>

                      <div style={styles.workerDetailRow}>
                        <span style={styles.detailLabel}>💰 Wage Rate:</span>
                        <span style={styles.detailValue}>{worker.wageRate || 'Negotiable'}</span>
                      </div>

                      <div style={styles.workerDetailRow}>
                        <span style={styles.detailLabel}>📅 Experience:</span>
                        <span style={styles.detailValue}>{worker.workExperience || 'N/A'}</span>
                      </div>

                      {worker.workPreferences && (
                        <div style={styles.workerDetailRow}>
                          <span style={styles.detailLabel}>⏰ Preferences:</span>
                          <span style={styles.detailValue}>{worker.workPreferences}</span>
                        </div>
                      )}

                      {worker.rating && (
                        <div style={styles.workerDetailRow}>
                          <span style={styles.detailLabel}>⭐ Rating:</span>
                          <span style={styles.detailValue}>
                            {worker.rating}/5.0 ({worker.completedJobs || 0} jobs)
                          </span>
                        </div>
                      )}

                      {worker.skills && worker.skills.length > 0 && (
                        <div style={styles.workerSkillsSection}>
                          <strong style={styles.skillsLabel}>Skills:</strong>
                          <div style={styles.skillTagsContainer}>
                            {worker.skills.map((skill, index) => (
                              <span key={`${worker._id}-skill-${index}`} style={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={styles.workerActions}>
                      <button
                        style={styles.inviteButton}
                        disabled={worker.availability !== 'Available'}
                        onClick={() => handleOpenInviteModal(worker)}
                      >
                        📤 Send Job Invitation
                      </button>
                      <button style={styles.viewProfileButton}>
                        👁️ View Full Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Labours Tab */}
        {activeTab === 'my-labours' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>My Labours</h2>
              <p style={styles.tabDescription}>
                Manage your hired workforce and track their assignments
              </p>
            </div>

            {/* Search Section */}
            <div style={styles.searchFilterSection}>
              <div style={styles.searchInputGroup}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by worker name, email, or job title..."
                  value={labourSearchTerm}
                  onChange={(e) => setLabourSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {labourSearchTerm && (
                  <button
                    style={styles.clearSearchButton}
                    onClick={() => setLabourSearchTerm('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={styles.resultsInfo}>
                <span style={styles.resultsCount}>
                  {filteredMyLabours.length} hired worker{filteredMyLabours.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Labours List */}
            {loadingMyLabours ? (
              <div style={styles.loadingSection}>
                <div style={styles.spinner}></div>
                <p>Loading your hired workers...</p>
              </div>
            ) : filteredMyLabours.length === 0 ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>👷</div>
                <p style={styles.placeholderTitle}>
                  {labourSearchTerm
                    ? 'No workers match your search'
                    : myLabours.length === 0
                    ? 'No hired workers yet'
                    : 'No workers found'}
                </p>
                <p style={styles.placeholderText}>
                  {labourSearchTerm
                    ? 'Try a different search term.'
                    : 'Workers you hire from the "Hire Labour" tab will appear here. You can review applications in the "Applications" tab and approve workers to add them to your workforce.'}
                </p>
                {labourSearchTerm && (
                  <button
                    style={styles.clearFiltersBtn}
                    onClick={() => setLabourSearchTerm('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.myLaboursGrid}>
                {filteredMyLabours.map(labour => (
                  <div key={labour._id} style={styles.labourCard}>
                    <div style={styles.labourHeader}>
                      <div style={styles.workerAvatar}>
                        <span style={styles.avatarIcon}>👤</span>
                      </div>
                      <div style={styles.labourMainInfo}>
                        <h3 style={styles.labourName}>{labour.name || 'Unknown Worker'}</h3>
                        <p style={styles.labourEmail}>{labour.email || 'N/A'}</p>
                        <span style={styles.hiredBadge}>✅ Hired</span>
                      </div>
                    </div>

                    <div style={styles.labourContent}>
                      <div style={styles.labourSection}>
                        <h4 style={styles.sectionTitle}>📋 Current Assignment</h4>
                        <div style={styles.assignmentCard}>
                          <p style={styles.jobTitle}>{labour.schedule?.title || 'No assignment'}</p>
                          <div style={styles.assignmentDetails}>
                            <span style={styles.assignmentDetailItem}>
                              📍 {labour.schedule?.location || 'N/A'}
                            </span>
                            <span style={styles.assignmentDetailItem}>
                              💰 ₹{labour.schedule?.wageOffered || labour.expectedWage || 'N/A'}/day
                            </span>
                            {labour.schedule?.startDate && (
                              <span style={styles.assignmentDetailItem}>
                                📅 Start: {new Date(labour.schedule.startDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={styles.labourSection}>
                        <h4 style={styles.sectionTitle}>👤 Worker Details</h4>
                        <div style={styles.workerDetailRow}>
                          <span style={styles.detailLabel}>📱 Phone:</span>
                          <span style={styles.detailValue}>{labour.phone || 'N/A'}</span>
                        </div>
                        <div style={styles.workerDetailRow}>
                          <span style={styles.detailLabel}>📅 Experience:</span>
                          <span style={styles.detailValue}>
                            {typeof labour.experience === 'number' 
                              ? `${labour.experience} years` 
                              : labour.experience || 'N/A'}
                          </span>
                        </div>
                        <div style={styles.workerDetailRow}>
                          <span style={styles.detailLabel}>🔄 Availability:</span>
                          <span style={styles.detailValue}>
                            {labour.availability || 'flexible'}
                          </span>
                        </div>
                      </div>

                      {labour.skills && labour.skills.length > 0 && (
                        <div style={styles.labourSection}>
                          <h4 style={styles.sectionTitle}>🛠️ Skills</h4>
                          <div style={styles.skillTagsContainer}>
                            {labour.skills.map((skill, index) => (
                              <span key={`${labour._id}-skill-${index}`} style={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={styles.labourSection}>
                        <h4 style={styles.sectionTitle}>📆 Timeline</h4>
                        {labour.reviewedAt && (
                          <p style={styles.timelineItem}>
                            ✅ Approved: {new Date(labour.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                        {labour.appliedAt && (
                          <p style={styles.timelineItem}>
                            📝 Applied: {new Date(labour.appliedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={styles.labourActions}>
                      <button style={styles.viewProfileButton}>
                        👁️ View Full Profile
                      </button>
                      <button style={styles.contactButton}>
                        📞 Contact Worker
                      </button>
                      <button style={styles.manageButton}>
                        ⚙️ Manage Assignment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div style={styles.modalOverlay} onClick={handleCloseInviteModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                📨 Send Job Invitation
              </h2>
              <button
                style={styles.modalCloseButton}
                onClick={handleCloseInviteModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {selectedWorker && (
                <div style={styles.inviteWorkerInfo}>
                  <div style={styles.workerAvatar}>
                    <span style={styles.avatarIcon}>👤</span>
                  </div>
                  <div>
                    <h3 style={styles.modalWorkerName}>{selectedWorker.name}</h3>
                    <p style={styles.modalWorkerEmail}>{selectedWorker.email}</p>
                    {selectedWorker.skills && selectedWorker.skills.length > 0 && (
                      <div style={styles.modalWorkerSkills}>
                        {selectedWorker.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} style={styles.modalSkillTag}>{skill}</span>
                        ))}
                        {selectedWorker.skills.length > 3 && (
                          <span style={styles.modalSkillTag}>+{selectedWorker.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>
                  Select Job Schedule <span style={styles.required}>*</span>
                </label>
                
                {loadingSchedules ? (
                  <div style={styles.modalLoading}>
                    <div style={styles.spinner}></div>
                    <p>Loading your job schedules...</p>
                  </div>
                ) : mySchedules.length === 0 ? (
                  <div style={styles.noSchedulesMessage}>
                    <p>⚠️ You don't have any open job schedules.</p>
                    <p style={styles.smallText}>
                      Create a job schedule in the "Create Job Schedule" tab first.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    style={styles.modalSelect}
                  >
                    <option value="">-- Select a job schedule --</option>
                    {mySchedules.map(schedule => (
                      <option key={schedule._id} value={schedule._id}>
                        {schedule.title} - {schedule.location} (₹{schedule.wageOffered}/day)
                        {schedule.startDate && ` - ${new Date(schedule.startDate).toLocaleDateString()}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>
                  Personal Message (Optional)
                </label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  placeholder="Add a personal message to the worker..."
                  style={styles.modalTextarea}
                  rows={4}
                  maxLength={500}
                />
                <p style={styles.characterCount}>
                  {invitationMessage.length}/500 characters
                </p>
              </div>

              {selectedScheduleId && (
                <div style={styles.selectedSchedulePreview}>
                  <h4 style={styles.previewTitle}>📋 Selected Job</h4>
                  {mySchedules.find(s => s._id === selectedScheduleId) && (
                    <div style={styles.schedulePreviewCard}>
                      <p style={styles.previewJobTitle}>
                        {mySchedules.find(s => s._id === selectedScheduleId).title}
                      </p>
                      <div style={styles.previewDetails}>
                        <span>📍 {mySchedules.find(s => s._id === selectedScheduleId).location}</span>
                        <span>💰 ₹{mySchedules.find(s => s._id === selectedScheduleId).wageOffered}/day</span>
                        <span>👥 {mySchedules.find(s => s._id === selectedScheduleId).workerCount} workers needed</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.modalCancelButton}
                onClick={handleCloseInviteModal}
                disabled={sendingInvitation}
              >
                Cancel
              </button>
              <button
                style={styles.modalSendButton}
                onClick={handleSendInvitation}
                disabled={!selectedScheduleId || sendingInvitation || mySchedules.length === 0}
              >
                {sendingInvitation ? (
                  <>
                    <span style={styles.buttonSpinner}></span>
                    Sending...
                  </>
                ) : (
                  <>
                    📤 Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#636e72',
    margin: '0'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #ddd',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '1rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  activeTab: {
    borderBottom: '3px solid #3498db',
    color: '#3498db',
    fontWeight: 'bold'
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    minHeight: '600px'
  },
  sectionHeader: {
    marginBottom: '2rem',
    borderBottom: '1px solid #ecf0f1',
    paddingBottom: '1rem'
  },
  tabDescription: {
    fontSize: '1rem',
    color: '#636e72',
    margin: '0.5rem 0 0 0'
  },
  
  // Form Styles
  form: {
    maxWidth: '800px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease'
  },
  inputError: {
    padding: '0.8rem',
    border: '2px solid #e74c3c',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    backgroundColor: '#fee'
  },
  textarea: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px'
  },
  textareaError: {
    padding: '0.8rem',
    border: '2px solid #e74c3c',
    borderRadius: '6px',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px',
    backgroundColor: '#fee'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    flexWrap: 'wrap'
  },
  submitButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  resetButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem'
  },

  // Applications Styles
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  filterButtonGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  filterBtn: {
    padding: '0.6rem 1.2rem',
    backgroundColor: 'white',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    color: '#495057'
  },
  activeFilterBtn: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    color: 'white',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
  },
  applicationCard: {
    border: '1px solid #ecf0f1',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    transition: 'box-shadow 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  applicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: '1.3rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  usernameTag: {
    fontSize: '0.9rem',
    color: '#3498db',
    fontWeight: 'normal'
  },
  jobTitle: {
    color: '#495057',
    margin: '0 0 0.25rem 0',
    fontSize: '0.95rem'
  },
  location: {
    color: '#636e72',
    margin: '0 0 0.25rem 0',
    fontSize: '0.9rem'
  },
  workType: {
    color: '#636e72',
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem'
  },
  workTypeBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  statusSection: {
    textAlign: 'right'
  },
  appliedDate: {
    color: '#636e72',
    margin: '0.5rem 0 0 0',
    fontSize: '0.85rem'
  },
  reviewedDate: {
    color: '#27ae60',
    margin: '0.25rem 0 0 0',
    fontSize: '0.85rem'
  },
  applicationContent: {
    marginBottom: '1.5rem'
  },
  workerDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  detailItem: {
    padding: '0.25rem 0'
  },
  skillsSection: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
    borderLeft: '4px solid #3498db'
  },
  availabilityInfo: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#fff3cd',
    borderRadius: '6px',
    fontSize: '0.9rem'
  },
  applicationMessage: {
    backgroundColor: '#e3f2fd',
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: '4px solid #2196f3',
    marginBottom: '0.5rem'
  },
  messageText: {
    margin: '0.5rem 0 0 0',
    fontStyle: 'italic',
    lineHeight: '1.6',
    color: '#495057'
  },
  applicationActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  approveButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  contactButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s'
  },
  approvedMessage: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.9rem'
  },
  rejectedMessage: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.9rem'
  },
  detailsButton: {
    backgroundColor: 'transparent',
    color: '#636e72',
    border: '1px solid #ddd',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },

  // Placeholder Styles
  placeholderContent: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 0'
  },
  placeholderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    textAlign: 'center',
    border: '2px dashed #dee2e6'
  },
  featureList: {
    textAlign: 'left',
    margin: '1.5rem 0',
    paddingLeft: '1.5rem',
    color: '#495057'
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  placeholder: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#7f8c8d'
  },
  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  placeholderTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2c3e50'
  },
  placeholderText: {
    fontSize: '1rem',
    lineHeight: '1.6'
  },

  // Loading and Error Styles
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem'
  },
  loadingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '4rem',
    color: '#e74c3c'
  },
  retryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem'
  },

  // Alert Styles
  successAlert: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
    animation: 'slideDown 0.3s ease-out'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
    animation: 'slideDown 0.3s ease-out'
  },
  alertIcon: {
    fontSize: '1.5rem',
    flexShrink: 0
  },
  closeAlert: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  },

  // Hire Labour Tab Styles
  searchFilterSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  searchInputGroup: {
    position: 'relative',
    marginBottom: '1rem'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '1.2rem'
  },
  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.2s'
  },
  clearSearchButton: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#999',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    transition: 'background-color 0.2s'
  },
  filterGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '0.75rem 1rem',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    minWidth: '200px',
    transition: 'border-color 0.2s'
  },
  clearFiltersBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  resultsInfo: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e1e5e9'
  },
  resultsCount: {
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  workersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '2rem'
  },
  workerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '1px solid #e1e5e9',
    transition: 'box-shadow 0.3s ease'
  },
  workerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa'
  },
  workerAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
    flexShrink: 0
  },
  avatarIcon: {
    fontSize: '2rem',
    color: 'white'
  },
  workerBasicInfo: {
    flex: 1
  },
  workerUsername: {
    color: '#666',
    margin: '0',
    fontSize: '0.9rem'
  },
  availabilityBadge: {
    marginLeft: 'auto'
  },
  availableBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  busyBadge: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  workerContent: {
    padding: '1.5rem'
  },
  workerDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f8f9fa',
    gap: '1rem'
  },
  detailLabel: {
    fontWeight: '500',
    color: '#495057',
    fontSize: '0.9rem',
    flexShrink: 0
  },
  detailValue: {
    color: '#6c757d',
    fontSize: '0.9rem',
    textAlign: 'right',
    wordBreak: 'break-word'
  },
  workerSkillsSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e1e5e9'
  },
  skillsLabel: {
    display: 'block',
    marginBottom: '0.75rem',
    color: '#2d3436',
    fontSize: '0.95rem'
  },
  skillTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: '1px solid #bbdefb'
  },
  workerActions: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa'
  },
  inviteButton: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  viewProfileButton: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    backgroundColor: 'white',
    color: '#3498db',
    border: '2px solid #3498db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  // My Labours Tab Styles
  myLaboursGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  },
  labourCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e1e5e9',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  labourHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0f3f5'
  },
  labourMainInfo: {
    flex: 1
  },
  labourName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.25rem 0'
  },
  labourEmail: {
    fontSize: '0.9rem',
    color: '#636e72',
    margin: '0 0 0.5rem 0'
  },
  hiredBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  labourContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1
  },
  labourSection: {
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.75rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  assignmentCard: {
    backgroundColor: 'white',
    padding: '0.75rem',
    borderRadius: '6px',
    borderLeft: '3px solid #3498db'
  },
  assignmentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  assignmentDetailItem: {
    fontSize: '0.875rem',
    color: '#636e72'
  },
  timelineItem: {
    fontSize: '0.875rem',
    color: '#636e72',
    margin: '0.25rem 0',
    padding: '0.25rem 0'
  },
  labourActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '2px solid #f0f3f5'
  },
  manageButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

  // Invitation Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideIn 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '2px solid #e1e5e9',
    backgroundColor: '#f8f9fa'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: 0
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#636e72',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    lineHeight: 1
  },
  modalBody: {
    padding: '1.5rem'
  },
  inviteWorkerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #bbdefb'
  },
  modalWorkerName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.25rem 0'
  },
  modalWorkerEmail: {
    fontSize: '0.9rem',
    color: '#636e72',
    margin: '0 0 0.5rem 0'
  },
  modalWorkerSkills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  modalSkillTag: {
    backgroundColor: '#fff',
    color: '#1976d2',
    padding: '0.25rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    border: '1px solid #bbdefb'
  },
  modalSection: {
    marginBottom: '1.5rem'
  },
  modalLabel: {
    display: 'block',
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: '0.5rem',
    fontSize: '0.95rem'
  },
  required: {
    color: '#e74c3c',
    marginLeft: '0.25rem'
  },
  modalSelect: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #dfe6e9',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#2d3436',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  modalTextarea: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #dfe6e9',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#2d3436',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  characterCount: {
    textAlign: 'right',
    fontSize: '0.8rem',
    color: '#95a5a6',
    marginTop: '0.25rem'
  },
  modalLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem',
    color: '#636e72'
  },
  noSchedulesMessage: {
    padding: '1.5rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    textAlign: 'center'
  },
  smallText: {
    fontSize: '0.875rem',
    color: '#636e72',
    marginTop: '0.5rem'
  },
  selectedSchedulePreview: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  },
  previewTitle: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.75rem 0'
  },
  schedulePreviewCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  },
  previewJobTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.75rem 0'
  },
  previewDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#636e72'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    padding: '1.5rem',
    borderTop: '2px solid #e1e5e9',
    backgroundColor: '#f8f9fa'
  },
  modalCancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#636e72',
    border: '2px solid #dfe6e9',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  modalSendButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  buttonSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block'
  }
};

export default LaborManagementPage;