import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HHMNotificationCenter.css';

/**
 * HHMNotificationCenter Component
 * 
 * Centralized notification system for HHMs to view:
 * - New factory invitations
 * - New worker applications
 * - Application status updates
 * - Schedule updates
 */
const HHMNotificationCenter = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, invitations, applications, schedules
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            // Fetch all notification sources in parallel
            const [factoryInvitationsRes, applicationsRes, schedulesRes] = await Promise.all([
                axios.get('/api/hhm/factory-invitations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('/api/hhm/applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('/api/hhm/schedules', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Process factory invitations into notifications
            const invitationNotifications = factoryInvitationsRes.data.invitations
                .filter(inv => inv.status === 'pending')
                .map(inv => ({
                    id: `invitation-${inv._id}`,
                    type: 'invitation',
                    title: 'New Factory Invitation',
                    message: `${inv.factoryId?.name || 'A factory'} has sent you an invitation`,
                    timestamp: inv.sentAt,
                    read: false,
                    priority: 'high',
                    actionUrl: '/hhm/factory-invitations',
                    data: inv
                }));

            // Process new applications into notifications
            const newApplications = applicationsRes.data.applications
                .filter(app => app.status === 'pending' && isRecent(app.createdAt, 7));

            const applicationNotifications = newApplications.map(app => ({
                id: `application-${app._id}`,
                type: 'application',
                title: 'New Worker Application',
                message: `${app.workerId?.name || 'A worker'} applied for ${app.scheduleId?.title || 'a job'}`,
                timestamp: app.createdAt,
                read: false,
                priority: 'medium',
                actionUrl: '/hhm/applications',
                data: app
            }));

            // Process schedule updates (closing soon)
            const closingSoonSchedules = schedulesRes.data.schedules
                .filter(schedule => {
                    if (schedule.status !== 'open') return false;
                    const daysUntilStart = getDaysUntil(schedule.startDate);
                    return daysUntilStart <= 3 && daysUntilStart >= 0;
                });

            const scheduleNotifications = closingSoonSchedules.map(schedule => ({
                id: `schedule-${schedule._id}`,
                type: 'schedule',
                title: 'Schedule Starting Soon',
                message: `"${schedule.title}" starts in ${getDaysUntil(schedule.startDate)} days`,
                timestamp: schedule.createdAt,
                read: false,
                priority: 'medium',
                actionUrl: '/hhm/schedules',
                data: schedule
            }));

            // Combine and sort all notifications
            const allNotifications = [
                ...invitationNotifications,
                ...applicationNotifications,
                ...scheduleNotifications
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setNotifications(allNotifications);
            setUnreadCount(allNotifications.filter(n => !n.read).length);

        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const isRecent = (dateString, days) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    };

    const getDaysUntil = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const getFilteredNotifications = () => {
        if (filter === 'all') return notifications;
        return notifications.filter(n => n.type === filter);
    };

    const formatTimestamp = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'invitation': return '📨';
            case 'application': return '📋';
            case 'schedule': return '📅';
            default: return '🔔';
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return '';
        }
    };

    const filteredNotifications = getFilteredNotifications();

    if (loading) {
        return (
            <div className="notification-center">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notification-center">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Notifications</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchNotifications}>
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-center">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>🔔 Notification Center</h1>
                    <p>Stay updated with important activities</p>
                </div>
                {unreadCount > 0 && (
                    <div className="unread-badge">{unreadCount} Unread</div>
                )}
            </div>

            {/* Filters and Actions */}
            <div className="notification-controls">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'invitation' ? 'active' : ''}`}
                        onClick={() => setFilter('invitation')}
                    >
                        📨 Invitations ({notifications.filter(n => n.type === 'invitation').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'application' ? 'active' : ''}`}
                        onClick={() => setFilter('application')}
                    >
                        📋 Applications ({notifications.filter(n => n.type === 'application').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'schedule' ? 'active' : ''}`}
                        onClick={() => setFilter('schedule')}
                    >
                        📅 Schedules ({notifications.filter(n => n.type === 'schedule').length})
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button className="btn btn-outline" onClick={markAllAsRead}>
                        ✓ Mark All as Read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔕</div>
                        <h3>No Notifications</h3>
                        <p>
                            {filter === 'all'
                                ? "You're all caught up! No new notifications at the moment."
                                : `No ${filter} notifications found.`}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-indicator">
                                {!notification.read && <div className="unread-dot"></div>}
                            </div>

                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>

                            <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                    {formatTimestamp(notification.timestamp)}
                                </span>
                            </div>

                            <div className="notification-action">
                                <button className="action-btn">View →</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Refresh Button */}
            {notifications.length > 0 && (
                <div className="notification-footer">
                    <button className="btn btn-secondary" onClick={fetchNotifications}>
                        🔄 Refresh Notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default HHMNotificationCenter;
