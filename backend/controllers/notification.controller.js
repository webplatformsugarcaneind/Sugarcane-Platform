const Notification = require('../models/notification.model');

// Fetch all notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        // Optional: Support pagination and filtering
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        
        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server error fetching notifications' });
    }
};

// Fetch unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        const count = await Notification.countDocuments({ 
            receiverId: userId,
            isRead: false 
        });
            
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, message: 'Server error fetching unread count' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id || req.user.id;
        
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, receiverId: userId },
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
            
        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        await Notification.updateMany(
            { receiverId: userId, isRead: false },
            { isRead: true }
        );
            
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id || req.user.id;
        
        const notification = await Notification.findOneAndDelete({ 
            _id: notificationId, 
            receiverId: userId 
        });
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
            
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete all notifications for a user
exports.deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        const result = await Notification.deleteMany({ receiverId: userId });
            
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} notification(s) deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
