const express = require('express');
const app = express();

app.use(express.json());

// Test if simple route registration works
const testRouter = express.Router();
testRouter.get('/test', (req, res) => {
  res.json({ success: true, message: 'Direct test works!' });
});

app.use('/api/test', testRouter);

// Test importing our route file
const listingsRoutes = require('./routes/listings.routes.simple');
console.log('Loaded routes with stack:', listingsRoutes.stack.length);

app.use('/api/listings', listingsRoutes);

// Add 404 handler like in main server
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});