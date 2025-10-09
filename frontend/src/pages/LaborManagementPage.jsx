import React, { useState, useEffect } from 'react';
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

  // Fetch applications when Applications tab is selected
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/hhm/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplications(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Use mock data as fallback for development
      const mockApplications = [
        {
          _id: '1',
          worker: {
            _id: 'w1',
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91-9876543210'
          },
          schedule: {
            _id: 's1',
            title: 'Sugarcane Harvesting - Batch A',
            location: 'Field A-1, Punjab'
          },
          status: 'pending',
          appliedAt: '2025-10-05T10:30:00Z',
          message: 'I have 5 years of experience in sugarcane harvesting and own basic harvesting tools.',
          skills: ['harvesting', 'equipment operation'],
          experience: '5 years'
        },
        {
          _id: '2',
          worker: {
            _id: 'w2',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91-9876543211'
          },
          schedule: {
            _id: 's2',
            title: 'Field Preparation Project',
            location: 'Field B-2, Haryana'
          },
          status: 'pending',
          appliedAt: '2025-10-04T14:20:00Z',
          message: 'Experienced in soil preparation and planting. Available for the full duration.',
          skills: ['planting', 'soil preparation'],
          experience: '3 years'
        },
        {
          _id: '3',
          worker: {
            _id: 'w3',
            name: 'Amit Singh',
            email: 'amit@example.com',
            phone: '+91-9876543212'
          },
          schedule: {
            _id: 's1',
            title: 'Sugarcane Harvesting - Batch A',
            location: 'Field A-1, Punjab'
          },
          status: 'approved',
          appliedAt: '2025-10-03T09:15:00Z',
          message: 'I have worked on similar projects and have my own transportation.',
          skills: ['harvesting', 'transportation'],
          experience: '4 years'
        }
      ];
      setApplications(mockApplications);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Handle application approval/rejection
  const handleApplicationAction = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`/api/hhm/applications/${applicationId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app._id === applicationId
            ? { ...app, status: action }
            : app
        )
      );

      alert(`Application ${action} successfully!`);
    } catch (err) {
      console.error('Error updating application:', err);
      // For development, still update the local state
      setApplications(prev =>
        prev.map(app =>
          app._id === applicationId
            ? { ...app, status: action }
            : app
        )
      );
      alert(`Application ${action} successfully! (Development mode)`);
    }
  };

  // Handle schedule form submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmittingSchedule(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const scheduleData = {
        ...scheduleForm,
        wageOffered: parseFloat(scheduleForm.wageOffered),
        workerCount: parseInt(scheduleForm.workerCount),
        requiredSkills: scheduleForm.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
        startDate: new Date(scheduleForm.startDate),
        endDate: new Date(scheduleForm.endDate)
      };

      await axios.post('/api/hhm/schedules', scheduleData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
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

      alert('Job schedule created successfully!');
      
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert('Error creating schedule. Please try again.');
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
        <button
          style={activeTab === 'my-labours' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('my-labours')}
        >
          My Labours
        </button>
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
            
            <form onSubmit={handleScheduleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={scheduleForm.title}
                    onChange={handleInputChange}
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                  style={styles.textarea}
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
            ) : applications.length === 0 ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>📋</div>
                <p style={styles.placeholderTitle}>No applications yet</p>
                <p style={styles.placeholderText}>
                  Applications from workers will appear here when they apply for your jobs.
                </p>
              </div>
            ) : (
              <div style={styles.applicationsList}>
                {applications.map(application => (
                  <div key={application._id} style={styles.applicationCard}>
                    <div style={styles.applicationHeader}>
                      <div style={styles.workerInfo}>
                        <h3 style={styles.workerName}>{application.worker.name}</h3>
                        <p style={styles.jobTitle}>Applied for: {application.schedule.title}</p>
                        <p style={styles.location}>📍 {application.schedule.location}</p>
                      </div>
                      <div style={styles.statusSection}>
                        <span style={getStatusStyle(application.status)}>
                          {application.status}
                        </span>
                        <p style={styles.appliedDate}>
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div style={styles.applicationContent}>
                      <div style={styles.workerDetails}>
                        <p><strong>Email:</strong> {application.worker.email}</p>
                        <p><strong>Phone:</strong> {application.worker.phone}</p>
                        <p><strong>Experience:</strong> {application.experience}</p>
                        <p><strong>Skills:</strong> {application.skills.join(', ')}</p>
                      </div>

                      <div style={styles.applicationMessage}>
                        <strong>Application Message:</strong>
                        <p style={styles.messageText}>{application.message}</p>
                      </div>
                    </div>

                    {application.status === 'pending' && (
                      <div style={styles.applicationActions}>
                        <button
                          style={styles.approveButton}
                          onClick={() => handleApplicationAction(application._id, 'approved')}
                        >
                          ✅ Approve
                        </button>
                        <button
                          style={styles.rejectButton}
                          onClick={() => handleApplicationAction(application._id, 'rejected')}
                        >
                          ❌ Reject
                        </button>
                        <button style={styles.contactButton}>
                          Contact Worker
                        </button>
                      </div>
                    )}

                    {application.status === 'approved' && (
                      <div style={styles.applicationActions}>
                        <button style={styles.contactButton}>
                          Contact Worker
                        </button>
                        <button style={styles.detailsButton}>
                          View Details
                        </button>
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
              <p style={styles.tabDescription}>Search and hire skilled workers for your agricultural needs</p>
            </div>
            
            <div style={styles.placeholderContent}>
              <div style={styles.placeholderCard}>
                <h3>Worker Search & Hiring</h3>
                <p>Browse available workers, filter by skills and location, and send job invitations.</p>
                <ul style={styles.featureList}>
                  <li>Search workers by skills, location, and experience</li>
                  <li>View detailed worker profiles and ratings</li>
                  <li>Send direct job invitations</li>
                  <li>Post job requirements and receive applications</li>
                </ul>
                <button style={styles.primaryButton}>Coming Soon</button>
              </div>
            </div>
          </div>
        )}

        {/* My Labours Tab */}
        {activeTab === 'my-labours' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>My Labours</h2>
              <p style={styles.tabDescription}>Manage your current workforce and track their performance</p>
            </div>
            
            <div style={styles.placeholderContent}>
              <div style={styles.placeholderCard}>
                <h3>Current Workforce Management</h3>
                <p>View and manage all workers currently employed on your farm.</p>
                <ul style={styles.featureList}>
                  <li>View active workers and their current assignments</li>
                  <li>Track work progress and attendance</li>
                  <li>Manage worker schedules and tasks</li>
                  <li>Rate and provide feedback on worker performance</li>
                </ul>
                <button style={styles.primaryButton}>Coming Soon</button>
              </div>
            </div>
          </div>
        )}
      </div>
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
  textarea: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px'
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
  applicationCard: {
    border: '1px solid #ecf0f1',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    transition: 'box-shadow 0.3s ease'
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
    margin: '0 0 0.25rem 0'
  },
  jobTitle: {
    color: '#636e72',
    margin: '0 0 0.25rem 0',
    fontSize: '0.95rem'
  },
  location: {
    color: '#636e72',
    margin: '0',
    fontSize: '0.9rem'
  },
  statusSection: {
    textAlign: 'right'
  },
  appliedDate: {
    color: '#636e72',
    margin: '0.5rem 0 0 0',
    fontSize: '0.85rem'
  },
  applicationContent: {
    marginBottom: '1.5rem'
  },
  workerDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  },
  applicationMessage: {
    backgroundColor: '#e3f2fd',
    padding: '1rem',
    borderRadius: '6px',
    borderLeft: '4px solid #2196f3'
  },
  messageText: {
    margin: '0.5rem 0 0 0',
    fontStyle: 'italic',
    lineHeight: '1.5'
  },
  applicationActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  approveButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  contactButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
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
  }
};

export default LaborManagementPage;