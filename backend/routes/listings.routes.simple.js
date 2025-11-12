const express = require('express');
const router = express.Router();

// Simple test route without any middleware
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Listings test route works!'
  });
});

// Test route with some middleware
router.get('/marketplace', (req, res) => {
  res.json({
    success: true,
    message: 'Marketplace route works without auth!',
    data: []
  });
});

module.exports = router;