const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for system notifications
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['farmer', 'hhm', 'labour', 'factory', 'system', 'admin'],
        required: false
    },
    receiverRole: {
        type: String,
        enum: ['farmer', 'hhm', 'labour', 'factory', 'system', 'admin'],
        required: true
    },
    type: {
        type: String,
        enum: [
            'CONTRACT_REQUEST', 
            'CONTRACT_ACCEPTED', 
            'CONTRACT_REJECTED',
            'JOB_ASSIGNED',
            'JOB_UPDATED',
            'PAYMENT_UPDATE',
            'BROADCAST',
            'REMINDER',
            'INVITATION_SENT',
            'INVITATION_ACCEPTED',
            'INVITATION_REJECTED',
            'SYSTEM_ALERT'
        ],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // Could be contractId, jobId, etc.
        required: false
    },
    relatedModel: {
        type: String, // E.g., 'Contract', 'Invitation', 'CropListing'
        required: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ receiverId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
