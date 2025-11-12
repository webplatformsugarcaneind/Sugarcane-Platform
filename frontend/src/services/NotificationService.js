/**
 * NotificationService
 * 
 * Manages simple one-line notifications for:
 * - HHM requests, acceptances, rejections
 * - Factory billing and payment activities
 * - System updates
 */

let notificationListeners = [];
let notificationId = 0;

const NotificationService = {
    /**
     * Add a notification listener
     */
    subscribe(listener) {
        notificationListeners.push(listener);
        return () => {
            notificationListeners = notificationListeners.filter(l => l !== listener);
        };
    },

    /**
     * Show a simple one-line notification
     */
    show(type, message, duration = 5000) {
        const notification = {
            id: ++notificationId,
            type,
            message,
            timestamp: new Date()
        };

        // Notify all listeners
        notificationListeners.forEach(listener => {
            listener('add', notification);
        });

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, duration);
        }

        return notification.id;
    },

    /**
     * Dismiss a notification
     */
    dismiss(id) {
        notificationListeners.forEach(listener => {
            listener('remove', id);
        });
    },

    /**
     * Clear all notifications
     */
    clear() {
        notificationListeners.forEach(listener => {
            listener('clear');
        });
    },

    // === HHM NOTIFICATIONS === //

    /**
     * New HHM request received
     */
    newHHMRequest(hhmName, factoryName) {
        return this.show('hhm_request', `New HHM request from ${hhmName} to ${factoryName}`);
    },

    /**
     * New HHM Partnership Request (Simple one-line format)
     */
    newHHMPartnershipRequest(hhmName, factoryName) {
        return this.show('hhm_request', `${hhmName} wants to partner with ${factoryName}`);
    },

    /**
     * HHM request accepted
     */
    hhmRequestAccepted(hhmName, factoryName) {
        return this.show('hhm_accepted', `${factoryName} accepted ${hhmName}'s request`);
    },

    /**
     * HHM request rejected
     */
    hhmRequestRejected(hhmName, factoryName) {
        return this.show('hhm_rejected', `${factoryName} rejected ${hhmName}'s request`);
    },

    /**
     * HHM invitation sent
     */
    hhmInvitationSent(factoryName, hhmName) {
        return this.show('hhm_request', `Invitation sent to ${hhmName} from ${factoryName}`);
    },

    /**
     * HHM removed from factory
     */
    hhmRemoved(hhmName, factoryName) {
        return this.show('hhm_rejected', `${hhmName} removed from ${factoryName}`);
    },

    // === DASHBOARD SPECIFIC NOTIFICATIONS === //

    /**
     * Dashboard contract notification
     */
    dashboardContractNotification(contractDetails) {
        return this.show('dashboard_contract', `New contract: ${contractDetails}`);
    },

    /**
     * Dashboard bill notification from factory
     */
    dashboardFactoryBillNotification(factoryName, billAmount) {
        return this.show('dashboard_bill', `${factoryName} posted bill: ₹${billAmount}`);
    },

    /**
     * Dashboard general notification
     */
    dashboardGeneralNotification(message) {
        return this.show('dashboard_general', message);
    },

    // === FACTORY BILLING NOTIFICATIONS === //

    /**
     * New bill generated
     */
    billGenerated(billId, amount, factoryName) {
        return this.show('factory_bill', `Bill #${billId} generated - ₹${amount} for ${factoryName}`);
    },

    /**
     * Bill payment received
     */
    billPaid(billId, amount, factoryName) {
        return this.show('payment', `Payment received - ₹${amount} for Bill #${billId} from ${factoryName}`);
    },

    /**
     * Bill overdue
     */
    billOverdue(billId, amount, factoryName) {
        return this.show('factory_bill', `Bill #${billId} overdue - ₹${amount} from ${factoryName}`);
    },

    /**
     * Payment failed
     */
    paymentFailed(billId, factoryName) {
        return this.show('hhm_rejected', `Payment failed for Bill #${billId} from ${factoryName}`);
    },

    // === SYSTEM NOTIFICATIONS === //

    /**
     * System update
     */
    systemUpdate(message) {
        return this.show('system', message);
    },

    /**
     * Error notification
     */
    error(message) {
        return this.show('hhm_rejected', message);
    },

    /**
     * Success notification
     */
    success(message) {
        return this.show('hhm_accepted', message);
    },

    /**
     * Info notification
     */
    info(message) {
        return this.show('hhm_request', message);
    },

    // === QUICK MESSAGES === //

    /**
     * Pre-defined quick messages
     */
    quick: {
        newRequest: () => NotificationService.show('hhm_request', 'New HHM request received'),
        partnershipRequest: () => NotificationService.show('hhm_request', 'New HHM partnership request'),
        requestAccepted: () => NotificationService.show('hhm_accepted', 'HHM request accepted'),
        requestRejected: () => NotificationService.show('hhm_rejected', 'HHM request rejected'),
        billCreated: () => NotificationService.show('factory_bill', 'New bill generated'),
        paymentReceived: () => NotificationService.show('payment', 'Payment received successfully'),
        hhmRemoved: () => NotificationService.show('hhm_rejected', 'HHM association removed'),
        invitationSent: () => NotificationService.show('hhm_request', 'Invitation sent to HHM'),
        billOverdue: () => NotificationService.show('factory_bill', 'Bill payment overdue'),
        systemMaintenance: () => NotificationService.show('system', 'System maintenance scheduled')
    }
};

export default NotificationService;