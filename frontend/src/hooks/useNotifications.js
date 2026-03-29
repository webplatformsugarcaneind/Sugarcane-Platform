import { useState, useEffect } from 'react';
import NotificationService from '../services/NotificationService';

/**
 * useNotifications Hook
 * 
 * Manages notification state for React components
 * Automatically integrates with NotificationService
 */
const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleNotificationChange = (action, payload) => {
            switch (action) {
                case 'add':
                    setNotifications(prev => [...prev, payload]);
                    break;
                case 'remove':
                    setNotifications(prev => prev.filter(n => n.id !== payload));
                    break;
                case 'clear':
                    setNotifications([]);
                    break;
                default:
                    break;
            }
        };

        // Subscribe to notification service
        const unsubscribe = NotificationService.subscribe(handleNotificationChange);

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    const dismissNotification = (id) => {
        NotificationService.dismiss(id);
    };

    const clearAllNotifications = () => {
        NotificationService.clear();
    };

    return {
        notifications,
        dismissNotification,
        clearAllNotifications,
        // Direct access to NotificationService methods
        notify: NotificationService,
    };
};

export default useNotifications;