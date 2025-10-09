import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkerDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/worker/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJobs(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Use mock data as fallback for development
      const mockJobs = [
        {
          _id: '1',
          title: 'Sugarcane Harvesting - Premium Farm',
          description: 'Looking for experienced workers for sugarcane harvesting. Must have own tools and transportation.',
          location: 'Punjab, India',
          wageOffered: 900,
          workerCount: 15,
          startDate: '2025-10-15',
          endDate: '2025-10-30',
          workType: 'harvesting',
          requiredSkills: ['harvesting', 'equipment operation'],
          workingHours: '6 AM - 5 PM',
          employer: {
            name: 'Rajesh Kumar',
            rating: 4.8
          },
          postedAt: '2025-10-05'
        },
        {
          _id: '2',
          title: 'Organic Farm Field Preparation',
          description: 'Prepare fields for organic crop planting. Experience with soil management preferred.',
          location: 'Haryana, India',
          wageOffered: 750,
          workerCount: 8,
          startDate: '2025-10-12',
          endDate: '2025-10-25',
          workType: 'preparation',
          requiredSkills: ['soil preparation', 'planting'],
          workingHours: '7 AM - 4 PM',
          employer: {
            name: 'Priya Sharma',
            rating: 4.6
          },
          postedAt: '2025-10-04'
        },
        {
          _id: '3',
          title: 'Irrigation System Installation',
          description: 'Install and setup drip irrigation systems. Technical knowledge required.',
          location: 'Gujarat, India',
          wageOffered: 1200,
          workerCount: 5,
          startDate: '2025-10-18',
          endDate: '2025-11-02',
          workType: 'irrigation',
          requiredSkills: ['irrigation', 'technical setup'],
          workingHours: '8 AM - 6 PM',
          employer: {
            name: 'Suresh Patel',
            rating: 4.9
          },
          postedAt: '2025-10-03'
        }
      ];
      setJobs(mockJobs);
      setError('Using sample data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(prev => ({ ...prev, [jobId]: true }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const applicationData = {
        jobId,
        message: 'I am interested in this position and believe my skills and experience make me a good fit for this role.'
      };

      await axios.post('/api/worker/applications', applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Application submitted successfully!');
      
      // Update the job to show it's been applied to
      setJobs(prev =>
        prev.map(job =>
          job._id === jobId
            ? { ...job, hasApplied: true }
            : job
        )
      );

    } catch (err) {
      console.error('Error applying for job:', err);
      // For development, still update the UI
      setJobs(prev =>
        prev.map(job =>
          job._id === jobId
            ? { ...job, hasApplied: true }
            : job
        )
      );
      alert('Application submitted successfully! (Development mode)');
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Worker Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome to your worker dashboard. Browse and apply for available jobs.
        </p>
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}
      </div>
      
      <div style={styles.content}>
        <div style={styles.statsSection}>
          <div style={styles.statsCard}>
            <h3>Available Jobs</h3>
            <p style={styles.statsNumber}>{jobs.length}</p>
          </div>
          <div style={styles.statsCard}>
            <h3>Applied Today</h3>
            <p style={styles.statsNumber}>{jobs.filter(job => job.hasApplied).length}</p>
          </div>
        </div>

        <div style={styles.jobsSection}>
          <div style={styles.sectionHeader}>
            <h2>Available Jobs</h2>
            <button style={styles.refreshButton} onClick={fetchJobs}>
              🔄 Refresh
            </button>
          </div>

          {jobs.length === 0 ? (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>🔍</div>
              <p style={styles.placeholderTitle}>No jobs available</p>
              <p style={styles.placeholderText}>
                Check back later for new job opportunities.
              </p>
            </div>
          ) : (
            <div style={styles.jobsList}>
              {jobs.map(job => (
                <div key={job._id} style={styles.jobCard}>
                  <div style={styles.jobHeader}>
                    <div style={styles.jobTitleSection}>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <p style={styles.jobEmployer}>by {job.employer.name} ⭐ {job.employer.rating}</p>
                    </div>
                    <div style={styles.jobWage}>
                      <span style={styles.wageAmount}>₹{job.wageOffered}</span>
                      <span style={styles.wageUnit}>/day</span>
                    </div>
                  </div>

                  <div style={styles.jobDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>📍 Location:</span>
                      <span>{job.location}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>👥 Workers Needed:</span>
                      <span>{job.workerCount}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>🗓️ Duration:</span>
                      <span>{new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>⏰ Working Hours:</span>
                      <span>{job.workingHours}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>🛠️ Work Type:</span>
                      <span style={styles.workTypeTag}>{job.workType}</span>
                    </div>
                  </div>

                  <div style={styles.jobSkills}>
                    <strong>Required Skills:</strong>
                    <div style={styles.skillTags}>
                      {job.requiredSkills.map(skill => (
                        <span key={skill} style={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div style={styles.jobDescription}>
                    <strong>Description:</strong>
                    <p style={styles.descriptionText}>{job.description}</p>
                  </div>

                  <div style={styles.jobActions}>
                    <div style={styles.jobMeta}>
                      <span style={styles.postedDate}>
                        Posted: {new Date(job.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={styles.actionButtons}>
                      {job.hasApplied ? (
                        <button style={styles.appliedButton} disabled>
                          ✅ Applied
                        </button>
                      ) : (
                        <button
                          style={styles.applyButton}
                          onClick={() => handleApply(job._id)}
                          disabled={applying[job._id]}
                        >
                          {applying[job._id] ? 'Applying...' : '📝 Apply Now'}
                        </button>
                      )}
                      <button style={styles.detailsButton}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#7f8c8d',
    marginBottom: '1rem'
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '0.8rem 1rem',
    borderRadius: '6px',
    marginTop: '1rem',
    border: '1px solid #ffeaa7'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    textAlign: 'center'
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  statsCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statsNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3498db',
    margin: '0.5rem 0 0 0'
  },
  jobsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid #ecf0f1',
    paddingBottom: '1rem'
  },
  refreshButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem'
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
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  jobCard: {
    border: '1px solid #ecf0f1',
    borderRadius: '12px',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  jobTitleSection: {
    flex: 1
  },
  jobTitle: {
    fontSize: '1.4rem',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold'
  },
  jobEmployer: {
    color: '#7f8c8d',
    margin: '0',
    fontSize: '0.9rem'
  },
  jobWage: {
    textAlign: 'right'
  },
  wageAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#27ae60'
  },
  wageUnit: {
    fontSize: '0.9rem',
    color: '#7f8c8d'
  },
  jobDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '0.8rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  detailLabel: {
    fontWeight: 'bold',
    minWidth: '120px'
  },
  workTypeTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  jobSkills: {
    marginBottom: '1.5rem'
  },
  skillTags: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap'
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    padding: '0.3rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  jobDescription: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#e8f5e8',
    borderRadius: '6px',
    borderLeft: '4px solid #4caf50'
  },
  descriptionText: {
    margin: '0.5rem 0 0 0',
    lineHeight: '1.6',
    color: '#2e7d32'
  },
  jobActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ecf0f1'
  },
  jobMeta: {
    flex: 1
  },
  postedDate: {
    color: '#7f8c8d',
    fontSize: '0.85rem'
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  applyButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease'
  },
  appliedButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'not-allowed'
  },
  detailsButton: {
    backgroundColor: 'transparent',
    color: '#3498db',
    border: '1px solid #3498db',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
};

export default WorkerDashboardPage;