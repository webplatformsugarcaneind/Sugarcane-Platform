const express = require('express');
const router = express.Router();

console.log('🔍 Analytics routes file loaded');

// Very basic test endpoint
router.get('/test', (req, res) => {
  console.log('📊 Test endpoint called');
  try {
    res.status(200).json({ 
      success: true, 
      message: 'Analytics test successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in test endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Factory profitability endpoint
router.get('/factory-profitability', (req, res) => {
  console.log('📊 Factory profitability endpoint called');
  try {
    const data = {
      success: true,
      message: 'Factory profitability analysis retrieved successfully',
      summary: {
        totalFactoriesAnalyzed: 4,
        factoriesWithContracts: 3,
        factoriesWithoutContracts: 1,
        averageScore: "308.31",
        topPerformer: {
          factoryId: "64f123456789abcdef123456",
          factoryName: "Premium Sugar Mills",
          profitabilityScore: 494.12
        },
        analysisDate: new Date().toISOString()
      },
      data: [
        {
          factoryId: "64f123456789abcdef123456",
          factoryName: "Premium Sugar Mills",
          factoryLocation: "Maharashtra, India",
          factoryCapacity: "1000 tons/day",
          totalContracts: 25,
          completedContracts: 21,
          averagePricePerTon: 5000.00,
          averagePaymentDelay: 7.50,
          contractFulfillmentRate: 0.8400,
          profitabilityScore: 494.12
        },
        {
          factoryId: "64f123456789abcdef123457",
          factoryName: "Golden Cane Processing",
          factoryLocation: "Uttar Pradesh, India",
          factoryCapacity: "800 tons/day",
          totalContracts: 18,
          completedContracts: 14,
          averagePricePerTon: 4800.00,
          averagePaymentDelay: 12.0,
          contractFulfillmentRate: 0.7778,
          profitabilityScore: 287.97
        },
        {
          factoryId: "64f123456789abcdef123458",
          factoryName: "Sweet Valley Industries",
          factoryLocation: "Karnataka, India",
          factoryCapacity: "600 tons/day",
          totalContracts: 12,
          completedContracts: 8,
          averagePricePerTon: 4500.00,
          averagePaymentDelay: 20.0,
          contractFulfillmentRate: 0.6667,
          profitabilityScore: 142.86
        },
        {
          factoryId: "64f123456789abcdef123459",
          factoryName: "New Factory (No Contracts)",
          factoryLocation: "Gujarat, India",
          factoryCapacity: "500 tons/day",
          totalContracts: 0,
          completedContracts: 0,
          averagePricePerTon: 0,
          averagePaymentDelay: 30.0,
          contractFulfillmentRate: 0,
          profitabilityScore: 0
        }
      ],
      count: 4
    };
    
    res.status(200).json(data);
    console.log('✅ Factory profitability data sent successfully');
  } catch (error) {
    console.error('❌ Error in factory profitability endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving factory profitability analysis',
      error: error.message 
    });
  }
});

console.log('✅ Analytics routes configured');

module.exports = router;