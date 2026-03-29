import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FactoryNotifications.css';
<<<<<<< HEAD

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';
=======
import { configureAxios } from '../config/api';

// Set axios base URL
configureAxios(axios);
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3

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
<<<<<<< HEAD
      
      console.log('🔍 Fetching factory notifications...');
      
=======

      console.log('🔍 Fetching factory notifications...');

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
        
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
        
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      await axios.put(`/api/factory/received-invitations/${invitationId}`, {
        action: action // 'accept' or 'decline'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh notifications
      fetchNotifications();
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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

<<<<<<< HEAD
  const handleClearAllNotifications = async () => {
=======
  const handleClearAllNotifications = () => {
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    if (notifications.length === 0) {
      alert('No notifications to clear');
      return;
    }

    if (window.confirm(`Are you sure you want to clear all ${notifications.length} notifications? This action cannot be undone.`)) {
<<<<<<< HEAD
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
=======
      setNotifications([]);
      alert('✅ All notifications cleared successfully!');
    }
  };

  const handleClearNotification = (notificationId) => {
    if (window.confirm('Are you sure you want to clear this notification?')) {
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
            <button 
=======
            <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
            <div 
              key={notification.id} 
=======
            <div
              key={notification.id}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <h4 className="notification-title">{notification.title}</h4>
                  <div className="notification-header-right">
                    <span className="notification-time">{notification.time}</span>
<<<<<<< HEAD
                    <button 
=======
                    <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                      className="clear-notification-btn"
                      onClick={() => handleClearNotification(notification.id)}
                      title="Clear this notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
<<<<<<< HEAD
                
                <p className="notification-message">{notification.message}</p>
                
=======

                <p className="notification-message">{notification.message}</p>

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                {notification.personalMessage && (
                  <div className="notification-details">
                    <strong>Message:</strong> "{notification.personalMessage}"
                  </div>
                )}
<<<<<<< HEAD
                
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                {notification.invitationReason && (
                  <div className="notification-details">
                    <strong>Reason:</strong> {notification.invitationReason}
                  </div>
                )}

                {notification.status === 'pending' && (
                  <div className="notification-actions">
<<<<<<< HEAD
                    <button 
=======
                    <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                      className="btn-accept"
                      onClick={() => handleRespondToInvitation(notification.invitationId, 'accept')}
                    >
                      ✅ Accept
                    </button>
<<<<<<< HEAD
                    <button 
=======
                    <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
          <button 
=======
          <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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