import React from 'react';
import './NotificationToast.css';

/**
 * NotificationToast Component
 * 
 * Displays simple one-line notification messages for:
 * - HHM requests (new, accepted, rejected)
 * - Factory billing activities
 * - System updates
 */
const NotificationToast = ({ 
    notifications = [], 
    onDismiss, 
    onClearAll,
    position = 'top-right' 
}) => {
    
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'hhm_request': return '📨';
            case 'hhm_accepted': return '✅';
            case 'hhm_rejected': return '❌';
            case 'factory_bill': return '💰';
            case 'payment': return '💳';
            case 'system': return '🔔';
            case 'dashboard_contract': return '📄';
            case 'dashboard_bill': return '💰';
            case 'dashboard_general': return '🏠';
            default: return '📢';
        }
    };

    const getNotificationClass = (type) => {
        switch (type) {
            case 'hhm_accepted':
            case 'payment':
            case 'dashboard_contract':
                return 'success';
            case 'hhm_rejected':
                return 'error';
            case 'hhm_request':
            case 'dashboard_general':
                return 'info';
            case 'factory_bill':
            case 'dashboard_bill':
                return 'warning';
            default:
                return 'info';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className={`notification-container ${position}`}>
            {notifications.length > 1 && onClearAll && (
                <div className="notification-header">
                    <span className="notification-count">
                        {notifications.length} notifications
                    </span>
                    <button 
                        className="clear-all-btn"
                        onClick={() => onClearAll && onClearAll()}
                        title="Clear all notifications"
                    >
                        🗑️ Clear All
                    </button>
                </div>
            )}
            {notifications.map((notification, index) => (
                <div
                    key={notification.id || index}
                    className={`notification-toast ${getNotificationClass(notification.type)}`}
                    onClick={() => onDismiss && onDismiss(notification.id || index)}
                >
                    <span className="notification-icon">
                        {getNotificationIcon(notification.type)}
                    </span>
                    <span className="notification-message">
                        {notification.message}
                    </span>
                    <button 
                        className="notification-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss && onDismiss(notification.id || index);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;