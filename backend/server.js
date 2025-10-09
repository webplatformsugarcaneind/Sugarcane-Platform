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
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/farmer', require('./routes/farmer.routes'));
app.use('/api/hhm', require('./routes/hhm.routes'));
app.use('/api/worker', require('./routes/worker.routes'));
app.use('/api/factory', require('./routes/factory.routes'));

// Basic API info route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sugarcane Platform API is running!',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      public: '/api/public',
      farmer: '/api/farmer',
      hhm: '/api/hhm',
      worker: '/api/worker',
      factory: '/api/factory',
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
  console.error('Error occurred:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
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