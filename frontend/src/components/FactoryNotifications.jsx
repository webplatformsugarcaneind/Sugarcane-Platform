import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FactoryNotifications.css';

const BellSlashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon-svg">
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
    <path d="M18 8a6 6 0 0 0-9.33-5"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Set axios base URL
axios.defaults.baseURL = API_BASE_URL;

const FactoryNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching factory notifications...');
      
      const response = await axios.get('/api/factory/received-invitations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('🔍 Factory notifications response:', response.data);

      if (response.data.success) {
        const invitations = response.data.data || [];
        console.log('🔍 Raw invitations data:', invitations);
        console.log('🔍 Number of invitations:', invitations.length);
        
        // Transform invitations into notifications
        const notificationData = invitations.map(invitation => ({
          id: invitation._id,
          type: 'invitation',
          title: 'New HHM Partnership Request',
          message: `${invitation.hhmId?.name || 'An HHM'} wants to partner with your factory`,
          time: new Date(invitation.sentAt).toLocaleDateString(),
          isRead: invitation.status !== 'pending',
          status: invitation.status,
          hhmName: invitation.hhmId?.name || 'Unknown HHM',
          personalMessage: invitation.personalMessage,
          invitationReason: invitation.invitationReason,
          invitationId: invitation._id
        }));
        
        console.log('🔍 Transformed notifications:', notificationData);
        setNotifications(notificationData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToInvitation = async (invitationId, action) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/factory/received-invitations/${invitationId}`, {
        status: action === 'accept' ? 'accepted' : 'declined'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh notifications
      fetchNotifications();
      
      if (action === 'accept') {
        alert('✅ Partnership accepted successfully!');
      } else {
        alert('❌ Partnership request declined.');
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      alert('Error responding to invitation: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClearAllNotifications = async () => {
    if (notifications.length === 0) {
      alert('No notifications to clear');
      return;
    }

    if (window.confirm(`Are you sure you want to clear all ${notifications.length} notifications? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        
        console.log('🗑️ Clearing all notifications from database...');
        
        const response = await axios.delete('/api/factory/notifications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          console.log('✅ All notifications cleared from database');
          setNotifications([]);
          alert(`✅ Successfully cleared ${response.data.data.clearedCount} notifications!`);
        } else {
          throw new Error(response.data.message || 'Failed to clear notifications');
        }
      } catch (err) {
        console.error('❌ Error clearing notifications:', err);
        alert('Error clearing notifications: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleClearNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to clear this notification?')) {
      try {
        const token = localStorage.getItem('token');
        
        console.log('🗑️ Clearing notification from database:', notificationId);
        
        const response = await axios.delete(`/api/factory/notifications/${notificationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          console.log('✅ Notification cleared from database');
          setNotifications(prevNotifications => 
            prevNotifications.filter(notification => notification.id !== notificationId)
          );
          alert('✅ Notification cleared successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to clear notification');
        }
      } catch (err) {
        console.error('❌ Error clearing notification:', err);
        alert('Error clearing notification: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const displayNotifications = showAll ? notifications : notifications.slice(0, 3);
  const unreadCount = notifications.filter(n => !n.isRead && n.status === 'pending').length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h3>📨 Notifications</h3>
          <div className="loading-indicator">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h3>📨 Notifications</h3>
        </div>
        <div className="error-message">
          ❌ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>📨 Notifications</h3>
        <div className="header-actions">
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
          {notifications.length > 0 && (
            <button 
              className="clear-all-btn"
              onClick={handleClearAllNotifications}
              title="Clear all notifications"
            >
              <TrashIcon /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {displayNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon"><BellSlashIcon /></div>
            <p>No notifications yet</p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <h4 className="notification-title">{notification.title}</h4>
                  <div className="notification-header-right">
                    <span className="notification-time">{notification.time}</span>
                    <button 
                      className="clear-notification-btn"
                      onClick={() => handleClearNotification(notification.id)}
                      title="Clear this notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <p className="notification-message">{notification.message}</p>
                
                {notification.personalMessage && (
                  <div className="notification-details">
                    <strong>Message:</strong> "{notification.personalMessage}"
                  </div>
                )}
                
                {notification.invitationReason && (
                  <div className="notification-details">
                    <strong>Reason:</strong> {notification.invitationReason}
                  </div>
                )}

                {notification.status === 'pending' && (
                  <div className="notification-actions">
                    <button 
                      className="btn-accept"
                      onClick={() => handleRespondToInvitation(notification.invitationId, 'accept')}
                    >
                      <CheckIcon /> Accept
                    </button>
                    <button 
                      className="btn-decline"
                      onClick={() => handleRespondToInvitation(notification.invitationId, 'decline')}
                    >
                      <XIcon /> Decline
                    </button>
                  </div>
                )}

                {notification.status === 'accepted' && (
                  <div className="notification-status accepted">
                    <CheckIcon /> Partnership Accepted
                  </div>
                )}

                {notification.status === 'declined' && (
                  <div className="notification-status declined">
                    <XIcon /> Partnership Declined
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {notifications.length > 3 && (
          <button 
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${notifications.length})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default FactoryNotifications;
