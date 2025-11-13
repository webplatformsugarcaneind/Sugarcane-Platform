const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Add request logging to debug issues
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/farmer', require('./routes/farmer.routes'));
app.use('/api/hhm', require('./routes/hhm.routes'));
app.use('/api/worker', require('./routes/worker.routes'));
app.use('/api/factory', require('./routes/factory.routes'));
app.use('/api/contracts', require('./routes/contract.routes'));
app.use('/api/farmer-contracts', require('./routes/farmerContract.routes'));

// Load analytics routes with debug logging
try {
  console.log('🔍 Loading analytics routes...');
  const analyticsRoutes = require('./routes/analytics-stable.routes');
  console.log('✅ Analytics routes loaded successfully');
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Analytics routes registered at /api/analytics');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error);
}

app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/test-orders', require('./routes/test-orders.routes'));
app.use('/api/minimal-test', require('./routes/minimal-test.routes'));

// Register listings routes like other routes
app.use('/api/listings', require('./routes/listings.routes'));

// Basic API info route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sugarcane Platform API is running!',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      public: '/api/public',
      users: '/api/users',
      farmer: '/api/farmer',
      hhm: '/api/hhm',
      worker: '/api/worker',
      factory: '/api/factory',
      contracts: '/api/contracts',
      'farmer-contracts': '/api/farmer-contracts',
      analytics: '/api/analytics',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', err.stack);
  
  // Prevent server crash by always sending a response
  if (!res.headersSent) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add process error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit, just log the error
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit, just log the error
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: '/api/auth (POST /register, POST /login, GET /verify)',
      public: '/api/public (GET /factories, GET /factories/:id, GET /roles-features)',
      farmer: '/api/farmer (Protected - GET /profile, PUT /profile, GET /announcements, etc.)',
      hhm: '/api/hhm (Protected - GET /schedules, POST /schedules, GET /workers, GET /applications, etc.)',
      worker: '/api/worker (Protected - GET /jobs, POST /applications, GET /invitations, etc.)',
      factory: '/api/factory (Protected - POST /bills, GET /bills, POST /maintenance-jobs, etc.)',
      contracts: '/api/contracts (Protected - POST /request, PUT /respond/:id, GET /my-contracts, etc.)',
      'farmer-contracts': '/api/farmer-contracts (Protected - POST /request, GET /my-contracts)',
      analytics: '/api/analytics (Protected - GET /factory-profitability, GET /factory-details/:id)',
      health: '/api/health (GET)',
      root: '/ (GET)'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🌍 Public Endpoints: http://localhost:${PORT}/api/public`);
  console.log(`🌾 Farmer Endpoints: http://localhost:${PORT}/api/farmer`);
  console.log(`👨‍💼 HHM Endpoints: http://localhost:${PORT}/api/hhm`);
  console.log(`👷 Worker Endpoints: http://localhost:${PORT}/api/worker`);
  console.log(`🏭 Factory Endpoints: http://localhost:${PORT}/api/factory`);
  console.log(`📋 Contract Endpoints: http://localhost:${PORT}/api/contracts`);
  console.log(`📊 Analytics Endpoints: http://localhost:${PORT}/api/analytics`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});