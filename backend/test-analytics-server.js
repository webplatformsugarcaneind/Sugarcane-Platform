// Minimal server test for analytics routes
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Add a simple test route to verify analytics prefix works
app.use('/api/analytics', (req, res, next) => {
  console.log(`📊 Analytics request: ${req.method} ${req.path}`);
  next();
});

// Simple test route without authentication
app.get('/api/analytics/test', (req, res) => {
  res.json({ message: 'Analytics test route working!' });
});

// Try to load the actual analytics routes
try {
  app.use('/api/analytics', require('./routes/analytics.routes'));
  console.log('✅ Analytics routes registered successfully');
} catch (error) {
  console.error('❌ Error registering analytics routes:', error.message);
}

const PORT = 5001; // Use different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/analytics/test`);
  console.log(`Analytics: http://localhost:${PORT}/api/analytics/factory-profitability`);
});