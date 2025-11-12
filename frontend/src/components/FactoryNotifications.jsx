import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FactoryNotifications.css';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

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
        action: action // 'accept' or 'decline'
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

  const handleClearAllNotifications = () => {
    if (notifications.length === 0) {
      alert('No notifications to clear');
      return;
    }

    if (window.confirm(`Are you sure you want to clear all ${notifications.length} notifications? This action cannot be undone.`)) {
      setNotifications([]);
      alert('✅ All notifications cleared successfully!');
    }
  };

  const handleClearNotification = (notificationId) => {
    if (window.confirm('Are you sure you want to clear this notification?')) {
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
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
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {displayNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔕</div>
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
                      ✅ Accept
                    </button>
                    <button 
                      className="btn-decline"
                      onClick={() => handleRespondToInvitation(notification.invitationId, 'decline')}
                    >
                      ❌ Decline
                    </button>
                  </div>
                )}

                {notification.status === 'accepted' && (
                  <div className="notification-status accepted">
                    ✅ Partnership Accepted
                  </div>
                )}

                {notification.status === 'declined' && (
                  <div className="notification-status declined">
                    ❌ Partnership Declined
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