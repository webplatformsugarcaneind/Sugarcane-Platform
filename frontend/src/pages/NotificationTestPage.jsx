import React from 'react';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';
import './NotificationTestPage.css';

/**
 * NotificationTestPage
 * 
 * Demo page to test the simple one-line notification system
 */
const NotificationTestPage = () => {
    const { notifications, dismissNotification, clearAllNotifications, notify } = useNotifications();

    const testNotifications = [
        // Dashboard notifications (with clear functionality)
        () => notify.dashboardContractNotification('Sugar supply contract with Farmer ABC'),
        () => notify.dashboardFactoryBillNotification('Maharashtra Sugar Mills', '25000'),
        () => notify.dashboardGeneralNotification('Dashboard update available'),
        // Regular notifications (no clear functionality)
        () => notify.newHHMRequest('Sunil Kumar', 'Priya Factory'),
        () => notify.newHHMPartnershipRequest('Sunita Sharma', 'Maharashtra Sugar Mills'),
        () => notify.hhmRequestAccepted('Sunita Sharma', 'Anita Factory'),
        () => notify.hhmRequestRejected('Rajesh Verma', 'Deepak Factory'),
        () => notify.hhmInvitationSent('Priya Factory', 'Amit Singh'),
        () => notify.hhmRemoved('Old HHM', 'Factory'),
        () => notify.billGenerated('B001', '5000', 'Priya Factory'),
        () => notify.billPaid('B002', '3000', 'Anita Factory'),
        () => notify.billOverdue('B003', '7000', 'Deepak Factory'),
        () => notify.paymentFailed('B004', 'Rajesh Factory'),
        () => notify.systemUpdate('System maintenance at 2 AM'),
        () => notify.error('Connection error occurred'),
        () => notify.success('Operation completed successfully'),
        () => notify.info('New features available'),
        () => notify.quick.newRequest(),
        () => notify.quick.partnershipRequest(),
        () => notify.quick.requestAccepted(),
        () => notify.quick.billCreated(),
    ];

    return (
        <div className="notification-test-page">
            {/* Header */}
            <div className="page-header">
                <h1>🔔 Notification System Demo</h1>
                <p>Test simple one-line notifications for HHM activities and factory billing</p>
            </div>

            {/* Test Buttons */}
            <div className="test-grid">
                <div className="test-section">
                    <h2>🏠 Dashboard Notifications (with Clear)</h2>
                    <div className="button-group">
                        <button 
                            className="test-btn dashboard-contract"
                            onClick={() => notify.dashboardContractNotification('Sugar supply contract with Farmer ABC')}
                        >
                            Dashboard Contract
                        </button>
                        <button 
                            className="test-btn dashboard-bill"
                            onClick={() => notify.dashboardFactoryBillNotification('Maharashtra Sugar Mills', '25000')}
                        >
                            Dashboard Factory Bill
                        </button>
                        <button 
                            className="test-btn dashboard-general"
                            onClick={() => notify.dashboardGeneralNotification('Dashboard update available')}
                        >
                            Dashboard General
                        </button>
                    </div>
                </div>

                <div className="test-section">
                    <h2>📨 HHM Activity Notifications (no clear)</h2>
                    <div className="button-group">
                        <button 
                            className="test-btn hhm-request"
                            onClick={() => notify.newHHMRequest('Sunil Kumar', 'Priya Factory')}
                        >
                            New HHM Request
                        </button>
                        <button 
                            className="test-btn hhm-partnership"
                            onClick={() => notify.newHHMPartnershipRequest('Sunita Sharma', 'Maharashtra Sugar Mills')}
                        >
                            Partnership Request
                        </button>
                        <button 
                            className="test-btn hhm-accepted"
                            onClick={() => notify.hhmRequestAccepted('Sunita Sharma', 'Anita Factory')}
                        >
                            Request Accepted
                        </button>
                        <button 
                            className="test-btn hhm-rejected"
                            onClick={() => notify.hhmRequestRejected('Rajesh Verma', 'Deepak Factory')}
                        >
                            Request Rejected
                        </button>
                        <button 
                            className="test-btn hhm-invitation"
                            onClick={() => notify.hhmInvitationSent('Factory', 'Amit Singh')}
                        >
                            Invitation Sent
                        </button>
                        <button 
                            className="test-btn hhm-removed"
                            onClick={() => notify.hhmRemoved('Old HHM', 'Factory')}
                        >
                            HHM Removed
                        </button>
                    </div>
                </div>

                <div className="test-section">
                    <h2>💰 Factory Billing Notifications (no clear)</h2>
                    <div className="button-group">
                        <button 
                            className="test-btn bill-generated"
                            onClick={() => notify.billGenerated('B001', '5000', 'Priya Factory')}
                        >
                            Bill Generated
                        </button>
                        <button 
                            className="test-btn bill-paid"
                            onClick={() => notify.billPaid('B002', '3000', 'Anita Factory')}
                        >
                            Bill Paid
                        </button>
                        <button 
                            className="test-btn bill-overdue"
                            onClick={() => notify.billOverdue('B003', '7000', 'Deepak Factory')}
                        >
                            Bill Overdue
                        </button>
                        <button 
                            className="test-btn payment-failed"
                            onClick={() => notify.paymentFailed('B004', 'Rajesh Factory')}
                        >
                            Payment Failed
                        </button>
                    </div>
                </div>

                <div className="test-section">
                    <h2>🔔 System Notifications (no clear)</h2>
                    <div className="button-group">
                        <button 
                            className="test-btn system-update"
                            onClick={() => notify.systemUpdate('System maintenance scheduled at 2 AM')}
                        >
                            System Update
                        </button>
                        <button 
                            className="test-btn error"
                            onClick={() => notify.error('Connection error occurred')}
                        >
                            Error Message
                        </button>
                        <button 
                            className="test-btn success"
                            onClick={() => notify.success('Operation completed successfully')}
                        >
                            Success Message
                        </button>
                        <button 
                            className="test-btn info"
                            onClick={() => notify.info('New features available')}
                        >
                            Info Message
                        </button>
                    </div>
                </div>

                <div className="test-section">
                    <h2>⚡ Quick Messages</h2>
                    <div className="button-group">
                        <button 
                            className="test-btn quick"
                            onClick={() => notify.quick.newRequest()}
                        >
                            Quick: New Request
                        </button>
                        <button 
                            className="test-btn quick"
                            onClick={() => notify.quick.requestAccepted()}
                        >
                            Quick: Accepted
                        </button>
                        <button 
                            className="test-btn quick"
                            onClick={() => notify.quick.billCreated()}
                        >
                            Quick: Bill Created
                        </button>
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="control-section">
                <div className="control-info">
                    <p>🏠 Clear button only works for Dashboard notifications (Contract & Bill)</p>
                </div>
                <div className="control-buttons">
                    <button 
                        className="control-btn clear"
                        onClick={() => {
                            if (notifications.length > 0) {
                                if (window.confirm(`Clear all ${notifications.length} notifications?`)) {
                                    clearAllNotifications();
                                }
                            } else {
                                clearAllNotifications();
                            }
                        }}
                    >
                        🗑️ Clear All Dashboard ({notifications.length})
                    </button>
                    <button 
                        className="control-btn random"
                        onClick={() => {
                            const randomTest = testNotifications[Math.floor(Math.random() * testNotifications.length)];
                            randomTest();
                        }}
                    >
                        🎲 Random Notification
                    </button>
                </div>
            </div>

            {/* Current Notifications Count */}
            <div className="notification-info">
                <p>Active Notifications: {notifications.length}</p>
            </div>

            {/* Notifications Toast */}
            <NotificationToast 
                notifications={notifications}
                onDismiss={dismissNotification}
                onClearAll={clearAllNotifications}
                position="top-right"
            />
        </div>
    );
};

export default NotificationTestPage;