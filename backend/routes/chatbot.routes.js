const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  submitFeedback,
  clearSession
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const optionalAuth = (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
      req.user = { _id: decoded.id, role: decoded.role };
    }
  } catch (err) {
    // Silently fail for public access
  }
  next();
};

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many chat requests, please wait',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.body?.isPublic === true
});

router.post('/send-message', chatLimiter, optionalAuth, sendMessage);
router.get('/history/:sessionId', protect, getHistory);
router.post('/feedback', protect, submitFeedback);
router.delete('/sessions/:sessionId', protect, clearSession);

module.exports = router;
