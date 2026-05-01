const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All notification routes require authentication
router.use(authMiddleware.protect);

// Get all notifications for logged in user
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Mark specific as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete all notifications
router.delete('/all', notificationController.deleteAllNotifications);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
