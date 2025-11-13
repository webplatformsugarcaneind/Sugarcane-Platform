const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

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
 * @desc    Get Factory Profitability Analysis for Farmers (Simple Version)
 * @access  Private (Farmer only)
 */
router.get('/factory-profitability', protect, authorize('Farmer'), async (req, res) => {
  try {
    console.log('📊 Factory Profitability Analysis endpoint called');
    
    // Return mock data for testing
    res.json({
      success: true,
      message: 'Factory profitability analysis retrieved successfully',
      summary: {
        totalFactoriesAnalyzed: 3,
        factoriesWithContracts: 2,
        factoriesWithoutContracts: 1,
        averageScore: '308.33',
        topPerformer: {
          factoryId: '64f123456789abcdef123456',
          factoryName: 'Premium Sugar Mills'
        },
        analysisDate: new Date().toISOString()
      },
      data: [
        {
          factoryId: '64f123456789abcdef123456',
          factoryName: 'Premium Sugar Mills',
          factoryLocation: 'Maharashtra, India',
          factoryCapacity: '1000 tons/day',
          totalContracts: 25,
          completedContracts: 21,
          averagePricePerTon: 5000.00,
          averagePaymentDelay: 7.50,
          contractFulfillmentRate: 0.8400,
          profitabilityScore: 494.1176
        },
        {
          factoryId: '64f123456789abcdef123457',
          factoryName: 'Golden Cane Processing',
          factoryLocation: 'Uttar Pradesh, India',
          factoryCapacity: '800 tons/day',
          totalContracts: 18,
          completedContracts: 14,
          averagePricePerTon: 4800.00,
          averagePaymentDelay: 12.0,
          contractFulfillmentRate: 0.7778,
          profitabilityScore: 287.9692
        },
        {
          factoryId: '64f123456789abcdef123458',
          factoryName: 'Sweet Valley Industries',
          factoryLocation: 'Karnataka, India',
          factoryCapacity: '600 tons/day',
          totalContracts: 12,
          completedContracts: 8,
          averagePricePerTon: 4500.00,
          averagePaymentDelay: 20.0,
          contractFulfillmentRate: 0.6667,
          profitabilityScore: 142.8571
        }
      ],
      count: 3
    });

  } catch (error) {
    console.error('❌ Error in factory profitability analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving factory profitability analysis',
      error: error.message
    });
  }
});

module.exports = router;