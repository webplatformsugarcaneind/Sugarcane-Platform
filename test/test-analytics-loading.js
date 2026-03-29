// Test script to verify analytics routes loading
const express = require('express');
const app = express();

// Test basic route loading
try {
  console.log('Testing analytics routes loading...');
  
  // Try to require the analytics routes file
  const analyticsRoutes = require('./routes/analytics.routes');
  console.log('✅ Analytics routes file loaded successfully');
  
  // Try to require the analytics controller
  const analyticsController = require('./controllers/analyticsController');
  console.log('✅ Analytics controller loaded successfully');
  console.log('Available controller functions:', Object.keys(analyticsController));
  
  // Try to require middleware
  const middleware = require('./middleware/auth.middleware');
  console.log('✅ Auth middleware loaded successfully');
  console.log('Available middleware functions:', Object.keys(middleware));
  
} catch (error) {
  console.error('❌ Error loading analytics components:', error.message);
  console.error('Stack trace:', error.stack);
}
