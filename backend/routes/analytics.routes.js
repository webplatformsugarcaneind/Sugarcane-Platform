const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const {
  getFactoryProfitabilityAnalysis,
  getFactoryContractDetails
} = require('../controllers/analyticsController');

// ================================
// FARMER ANALYTICS ROUTES
// ================================

/**
 * @route   GET /api/analytics/test
 * @desc    Test route to verify analytics endpoints work
 * @access  Public (for testing)
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/analytics/factory-profitability
 * @desc    Get Factory Profitability Analysis for Farmers
 * @access  Private (Farmer only)
 */
router.get('/factory-profitability', protect, authorize('Farmer'), getFactoryProfitabilityAnalysis);

/**
 * @route   GET /api/analytics/factory-details/:factoryId
 * @desc    Get detailed contract history and metrics for a specific factory
 * @access  Private (Farmer only)
 */
router.get('/factory-details/:factoryId', protect, authorize('Farmer'), getFactoryContractDetails);

// ================================
// ADDITIONAL ANALYTICS ROUTES (Future Extensions)
// ================================

/**
 * @route   GET /api/analytics/market-trends
 * @desc    Get market trends and pricing analytics (Future Implementation)
 * @access  Private (Farmer only)
 */
router.get('/market-trends', protect, authorize('Farmer'), async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Market trends analytics endpoint not yet implemented',
    suggestion: 'This endpoint will provide historical pricing data, seasonal trends, and market forecasts'
  });
});

/**
 * @route   GET /api/analytics/hhm-performance
 * @desc    Get HHM performance analytics (Future Implementation)  
 * @access  Private (Farmer only)
 */
router.get('/hhm-performance', protect, authorize('Farmer'), async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'HHM performance analytics endpoint not yet implemented',
    suggestion: 'This endpoint will provide HHM reliability scores, completion rates, and service quality metrics'
  });
});

/**
 * @route   GET /api/analytics/farmer-dashboard
 * @desc    Get comprehensive farmer dashboard analytics (Future Implementation)
 * @access  Private (Farmer only)  
 */
router.get('/farmer-dashboard', protect, authorize('Farmer'), async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Farmer dashboard analytics endpoint not yet implemented',
    suggestion: 'This endpoint will provide personalized farmer analytics including contract history, earnings, and recommendations'
  });
});

module.exports = router;