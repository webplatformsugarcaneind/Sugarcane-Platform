import React,
{
  useState,
  useEffect
}

  from 'react';

import {
  Link,
  useNavigate
}

  from 'react-router-dom';
import FactoryNotifications from '../components/FactoryNotifications.jsx';

import {
  CRUSHING_STATUS,
  getCrushingStatusDisplay,
  DEFAULT_CRUSHING_STATUS
}

  from '../constants/crushingStatus.js';

import {
  handleAuthError
}

  from '../utils/authUtils';
import './FactoryDashboardPage.css';

const FactoryDashboardPage = () => {
  const [user,
    setUser] = useState(null);
  const [error,
    setError] = useState(null);
  const [success,
    setSuccess] = useState(null);

  const [dashboardStats,
    setDashboardStats] = useState({
      activeHHMs: 0,
      totalRevenue: 0,
      productionVolume: 0,
      totalOrders: 0
    }

    );
  const [statsLoading,
    setStatsLoading] = useState(true);
  const [crushingStatus,
    setCrushingStatus] = useState(DEFAULT_CRUSHING_STATUS);
  const [crushingStatusLoading,
    setCrushingStatusLoading] = useState(true);
  const [crushingStatusUpdating,
    setCrushingStatusUpdating] = useState(false);
  const navigate = useNavigate();

  // Get user information on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Set initial crushing status from localStorage if available
        if (parsedUser.crushingStatus) {
          setCrushingStatus(parsedUser.crushingStatus);
        }
      }

      catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

    , []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/factory/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }

        );

        const data = await response.json();

        if (response.ok && data.success) {
          setDashboardStats(data.data);
        }

        else {
          console.error('Failed to fetch dashboard stats:', data.message);
        }
      }

      catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }

      finally {
        setStatsLoading(false);
      }
    }

      ;

    fetchDashboardStats();
  }

    , []);

  // Fetch crushing status
  useEffect(() => {
    const fetchCrushingStatus = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/factory/crushing-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }

        );

        const data = await response.json();

        if (response.ok && data.success) {
          setCrushingStatus(data.data.crushingStatus);
        }

        else {

          // Handle authentication errors for fetch API
          if (response.status === 401) {
            const error = {
              response: {

                status: 401,
                data: {
                  message: data.message
                }
              }
            }

              ;

            if (handleAuthError(error, setError)) {
              return;
            }
          }

          console.error('Failed to fetch crushing status:', data.message);
        }
      }

      catch (error) {
        console.error('Error fetching crushing status:', error);
      }

      finally {
        setCrushingStatusLoading(false);
      }
    }

      ;

    fetchCrushingStatus();
  }

    , []);

  const handlePostBill = () => {
    navigate('/factory/post-bill');
  }

    ;

  const handleCrushingStatusChange = async (newStatus) => {
    if (crushingStatusUpdating) return;

    setCrushingStatusUpdating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/factory/crushing-status', {

        method: 'PUT',
        headers: {

          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }

        ,
        body: JSON.stringify({
          crushingStatus: newStatus
        }

        )
      }

      );

      const data = await response.json();

      if (response.ok && data.success) {
        setCrushingStatus(newStatus);

        // Update localStorage with new crushing status
        const userData = localStorage.getItem('user');

        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            parsedUser.crushingStatus = newStatus;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }

          catch (error) {
            console.error('Error updating user data in localStorage:', error);
          }
        }

        setSuccess(`Crushing status updated to ${newStatus}`);
        setTimeout(() => setSuccess(null), 3000);
      }

      else {

        // Handle authentication errors for fetch API
        if (response.status === 401) {
          const error = {
            response: {

              status: 401,
              data: {
                message: data.message
              }
            }
          }

            ;

          if (handleAuthError(error, setError)) {
            return;
          }
        }

        setError(data.message || 'Failed to update crushing status');
        setTimeout(() => setError(null), 5000);
      }
    }

    catch (error) {
      console.error('Error updating crushing status:', error);
      setError('Network error. Please check your connection and try again.');
      setTimeout(() => setError(null), 5000);
    }

    finally {
      setCrushingStatusUpdating(false);
    }
  }

    ;

  return (<div className="fd-page"> {
    /* Header Section */
  }

    <div className="fd-header"> <div className="fd-header-inner"> <div className="fd-welcome"> <div className="fd-eyebrow">Factory Dashboard</div> <h1 className="fd-title"> Welcome, <em> {
      user?.name || 'Factory User'
    }

    </em> ! </h1> <p className="fd-sub"> Manage your factory operations and connect with the sugarcane ecosystem </p> </div> {
        /* Crushing Status Control */
      }

      <div className="fd-crushing"> <div className="fd-crushing-label">Sugarcane Crushing Status</div> <div className="fd-crushing-toggle"> {
        crushingStatusLoading ? (<div className="fd-crushing-loading">Loading...</div>) : (<> <button onClick={
          () => handleCrushingStatusChange(crushingStatus === CRUSHING_STATUS.ON ? CRUSHING_STATUS.OFF : CRUSHING_STATUS.ON)
        }

          disabled={
            crushingStatusUpdating
          }

          className={
            `fd-status-btn ${crushingStatus === CRUSHING_STATUS.ON ? 'on' : 'off'}`
          }

        > {
            getCrushingStatusDisplay(crushingStatus).icon
          }

          {
            getCrushingStatusDisplay(crushingStatus).label
          }

        </button> {
            crushingStatusUpdating && (<span className="fd-status-updating">Updating...</span>)
          }

        </>)
      }

      </div> </div> </div> </div> {
      /* Notifications Section */
    }

    <div className="fd-notifications"> <FactoryNotifications /> </div> {
      error && (<div className="fd-alert error" role="alert"> <span style={{display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></span> {
        error
      }

      </div>)
    }

    {
      success && (<div className="fd-alert success" role="status"> <span style={{display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span> {
        success
      }

      </div>)
    }

    {
      /* Quick Stats Section (KPI Row) */
    }

    <div className="fd-kpi-row"> <div className="fd-kpi g"> <div className="fd-kpi-label">Active HHMs</div> <div className="fd-kpi-val g"> {
      statsLoading ? '...' : dashboardStats.activeHHMs
    }

    </div> <div className="fd-kpi-sub">Connected partners</div> </div> <div className="fd-kpi a"> <div className="fd-kpi-label">Factory Revenue</div> <div className="fd-kpi-val a"> {
      statsLoading ? '...' : `₹${dashboardStats.totalRevenue.toLocaleString()}`
    }

    </div> <div className="fd-kpi-sub">Coming Soon</div> </div> <div className="fd-kpi b"> <div className="fd-kpi-label">Sugar Production</div> <div className="fd-kpi-val b"> {
      statsLoading ? '...' : `${dashboardStats.productionVolume} MT`
    }

    </div> <div className="fd-kpi-sub">Coming Soon</div> </div> <div className="fd-kpi g"> <div className="fd-kpi-label">Customer Orders</div> <div className="fd-kpi-val g"> {
      statsLoading ? '...' : dashboardStats.totalOrders
    }

    </div> <div className="fd-kpi-sub">Coming Soon</div> </div> </div> {
      /* Action Cards Section */
    }

    <h2 className="fd-section-title">Factory <em>Operations</em></h2> <div className="fd-actions-grid"> {
      /* Post Bill Card */
    }

      <Link className="fd-action-card"
        to="/factory/post-bill"

        onClick={
          handlePostBill
        }

      > <div className="fd-action-icon"> <svg viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      > <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> <polyline points="14,2 14,8 20,8" /> <line x1="16" y1="13" x2="8" y2="13" /> <line x1="16" y1="17" x2="8" y2="17" /> <polyline points="10,9 9,9 8,9" /> </svg> </div> <div className="fd-action-body"> <div className="fd-action-name">Post Bill</div> <div className="fd-action-desc"> Create and manage billing records for farmers, track payments, and view billing history </div> <div className="fd-action-tags"> <span className="fd-action-tag">Create New Bills</span> <span className="fd-action-tag">Track Payments</span> <span className="fd-action-tag">View History</span> </div> </div> <div className="fd-action-arrow"> <svg viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"

      > <path d="M5 12h14" /> <path d="M12 5l7 7-7 7" /> </svg> </div> </Link> {
        /* My Associated HHMs Card */
      }

      <div className="fd-action-card"

        onClick={
          () => navigate('/factory/associated-hhms')
        }

        role="button"

        tabIndex={
          0
        }

        onKeyDown={
          (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/factory/associated-hhms');
            }
          }
        }
      > <div className="fd-action-icon"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> </div> <div className="fd-action-body"> <div className="fd-action-name">My Associated HHMs</div> <div className="fd-action-desc"> View and manage your HHM partnerships </div> <div className="fd-action-tags"> <span className="fd-action-tag">View Partners</span> <span className="fd-action-tag">Contact HHMs</span> </div> </div> <div className="fd-action-arrow"> <svg viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      > <path d="M5 12h14" /> <path d="M12 5l7 7-7 7" /> </svg> </div> </div> </div> 
      
      </div>);
}

  ;

export default FactoryDashboardPage;