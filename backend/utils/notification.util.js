const Notification = require('../models/notification.model');

/**
 * Creates a notification in the database
 * 
 * @param {Object} params
 * @param {String} params.senderId - ID of the user sending the notification (can be null for system)
 * @param {String} params.receiverId - ID of the user receiving the notification
 * @param {String} params.senderRole - Role of the sender
 * @param {String} params.receiverRole - Role of the receiver
 * @param {String} params.type - Type of notification (e.g., 'CONTRACT_REQUEST')
 * @param {String} params.message - Content of the notification
 * @param {String} [params.relatedId] - ID of the related document (contract, job, etc.)
 * @param {String} [params.relatedModel] - Model name of the related document
 * @param {String} [params.priority='medium'] - Priority of the notification
 * @returns {Promise<Object>} The created notification
 */
const createNotification = async ({
    senderId,
    receiverId,
    senderRole,
    receiverRole,
    type,
    message,
    relatedId = null,
    relatedModel = null,
    priority = 'medium'
}) => {
    try {
        if (!receiverId || !type || !message) {
            console.error('Missing required fields for notification');
            return null;
        }

        const notification = new Notification({
            senderId,
            receiverId,
            senderRole,
            receiverRole,
            type,
            message,
            relatedId,
            relatedModel,
            priority
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        // We catch the error so it doesn't break the main business logic flow
        return null; 
    }
};

module.exports = {
    createNotification
};
