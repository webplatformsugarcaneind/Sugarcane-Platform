import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AvailableJobsPage = () => {
  const [loading, _setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    skills: '',
    wageMin: ''
  });

  useEffect(() => {
    // Mock data - replace with actual API calls when backend is ready
    const mockJobs = [
      {
        _id: '1',
        title: 'Sugarcane Harvesting - Batch A',
        description: 'Seasonal harvesting work for mature sugarcane fields. Experience with harvesting tools preferred.',
        location: 'Field A-1, Punjab',
        wageOffered: 800,
        startDate: '2025-10-15',
        duration: '2 weeks',
        requiredSkills: ['harvesting', 'equipment operation'],
        workersNeeded: 10,
        appliedCount: 7,
        farmer: {
          name: 'Rajesh Kumar',
          rating: 4.5
        },
        isUrgent: true
      },
      {
        _id: '2',
        title: 'Field Preparation Project',
        description: 'Preparing fields for next planting season. Includes soil preparation and basic maintenance.',
        location: 'Field B-2, Haryana',
        wageOffered: 600,
        startDate: '2025-10-20',
        duration: '1 week',
        requiredSkills: ['planting', 'soil preparation'],
        workersNeeded: 15,
        appliedCount: 12,
        farmer: {
          name: 'Priya Sharma',
          rating: 4.8
        },
        isUrgent: false
      },
      {
        _id: '3',
        title: 'Irrigation System Installation',
        description: 'Installing and setting up new irrigation systems across multiple fields.',
        location: 'Multiple Fields, Punjab',
        wageOffered: 900,
        startDate: '2025-10-25',
        duration: '3 weeks',
        requiredSkills: ['irrigation', 'maintenance', 'equipment operation'],
        workersNeeded: 8,
        appliedCount: 5,
        farmer: {
          name: 'Amit Singh',
          rating: 4.2
        },
        isUrgent: false
      }
    ];

    setJobs(mockJobs);
  }, []);

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to apply for jobs');
        return;
      }

      // Find the job to get its required skills
      const job = jobs.find(j => j._id === jobId);
      if (!job) {
        alert('Job not found');
        return;
      }

      // Prepare application data according to backend requirements
      const applicationData = {
        scheduleId: jobId,  // Backend expects 'scheduleId'
        applicationMessage: 'I am interested in this position and believe my skills and experience make me a good fit for this role.',
        workerSkills: job.requiredSkills || [],  // Required: non-empty array
        experience: 'Experienced in agricultural work',
        expectedWage: job.wageOffered || 0,
        availability: 'full-time'  // Must be lowercase: 'full-time', 'part-time', or 'flexible'
      };

      await axios.post('/api/worker/applications', applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Application submitted successfully! You will be notified of the status soon.');
      
      // Update applied count in UI
      setJobs(prev => prev.map(j => 
        j._id === jobId 
          ? { ...j, appliedCount: j.appliedCount + 1, hasApplied: true }
          : j
      ));
    } catch (err) {
      console.error('Error applying for job:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application';
      alert(`Error: ${errorMessage}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesLocation = !filters.location || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesSkills = !filters.skills || 
      job.requiredSkills.some(skill => 
        skill.toLowerCase().includes(filters.skills.toLowerCase())
      );
    const matchesWage = !filters.wageMin || job.wageOffered >= parseInt(filters.wageMin);
    
    return matchesLocation && matchesSkills && matchesWage;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Available Jobs</h1>
        <p style={styles.subtitle}>
          Browse and apply for agricultural work opportunities in your area
        </p>
      </div>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <h3 style={styles.filtersTitle}>Filter Jobs</h3>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Location</label>
            <input
              type="text"
              placeholder="e.g., Punjab, Haryana"
              style={styles.filterInput}
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Skills</label>
            <input
              type="text"
              placeholder="e.g., harvesting, planting"
              style={styles.filterInput}
              value={filters.skills}
              onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Minimum Wage (₹/day)</label>
            <input
              type="number"
              placeholder="e.g., 500"
              style={styles.filterInput}
              value={filters.wageMin}
              onChange={(e) => setFilters(prev => ({ ...prev, wageMin: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div style={styles.jobsSection}>
        <div style={styles.jobsHeader}>
          <h3>Available Positions ({filteredJobs.length})</h3>
          <div style={styles.sortOptions}>
            <select style={styles.sortSelect}>
              <option>Sort by: Latest</option>
              <option>Sort by: Highest Wage</option>
              <option>Sort by: Nearest Location</option>
              <option>Sort by: Start Date</option>
            </select>
          </div>
        </div>

        <div style={styles.jobsList}>
          {filteredJobs.map(job => (
            <div key={job._id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <div>
                  <h3 style={styles.jobTitle}>
                    {job.title}
                    {job.isUrgent && <span style={styles.urgentBadge}>URGENT</span>}
                  </h3>
                  <p style={styles.jobLocation}>📍 {job.location}</p>
                </div>
                <div style={styles.jobWage}>
                  <span style={styles.wageAmount}>₹{job.wageOffered}</span>
                  <span style={styles.wageUnit}>/day</span>
                </div>
              </div>

              <div style={styles.jobContent}>
                <p style={styles.jobDescription}>{job.description}</p>
                
                <div style={styles.jobDetails}>
                  <div style={styles.jobDetailItem}>
                    <strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}
                  </div>
                  <div style={styles.jobDetailItem}>
                    <strong>Duration:</strong> {job.duration}
                  </div>
                  <div style={styles.jobDetailItem}>
                    <strong>Workers Needed:</strong> {job.workersNeeded}
                  </div>
                  <div style={styles.jobDetailItem}>
                    <strong>Already Applied:</strong> {job.appliedCount}
                  </div>
                </div>

                <div style={styles.skillsSection}>
                  <strong>Required Skills:</strong>
                  <div style={styles.skillsTags}>
                    {job.requiredSkills.map(skill => (
                      <span key={skill} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div style={styles.farmerInfo}>
                  <strong>Farmer:</strong> {job.farmer.name} 
                  <span style={styles.rating}>⭐ {job.farmer.rating}</span>
                </div>
              </div>

              <div style={styles.jobActions}>
                {job.hasApplied ? (
                  <button style={styles.appliedButton} disabled>
                    ✅ Applied
                  </button>
                ) : (
                  <button 
                    style={styles.applyButton}
                    onClick={() => handleApply(job._id)}
                  >
                    Apply Now
                  </button>
                )}
                <button style={styles.detailsButton}>View Details</button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div style={styles.noJobs}>
            <h3>No jobs found</h3>
            <p>Try adjusting your filters or check back later for new opportunities.</p>
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
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  filtersTitle: {
    margin: '0 0 1rem 0',
    color: '#2d3436'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  filterLabel: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  filterInput: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem'
  },
  jobsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  jobsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  sortOptions: {
    display: 'flex',
    alignItems: 'center'
  },
  sortSelect: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.9rem'
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  jobCard: {
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa'
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  jobTitle: {
    fontSize: '1.3rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  urgentBadge: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  jobLocation: {
    color: '#636e72',
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
    color: '#636e72'
  },
  jobContent: {
    marginBottom: '1.5rem'
  },
  jobDescription: {
    margin: '0 0 1rem 0',
    lineHeight: '1.6'
  },
  jobDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  jobDetailItem: {
    fontSize: '0.9rem'
  },
  skillsSection: {
    marginBottom: '1rem'
  },
  skillsTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  skillTag: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  farmerInfo: {
    fontSize: '0.9rem'
  },
  rating: {
    marginLeft: '0.5rem',
    color: '#f39c12'
  },
  jobActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  applyButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
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
  },
  noJobs: {
    textAlign: 'center',
    padding: '3rem',
    color: '#636e72'
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    marginBottom: '1rem'
  }
};

export default AvailableJobsPage;