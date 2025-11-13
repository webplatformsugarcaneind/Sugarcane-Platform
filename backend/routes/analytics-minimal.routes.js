const express = require('express');
const router = express.Router();

// Minimal test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Analytics routes working!' });
});

// Factory profitability endpoint with comprehensive mock data
router.get('/factory-profitability', (req, res) => {
  res.json({
    success: true,
    message: 'Factory profitability analysis retrieved successfully',
    summary: {
      totalFactoriesAnalyzed: 4,
      factoriesWithContracts: 3,
      factoriesWithoutContracts: 1,
      averageScore: '308.31',
      topPerformer: {
        factoryId: '64f123456789abcdef123456',
        factoryName: 'Premium Sugar Mills',
        profitabilityScore: 494.12
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
        profitabilityScore: 494.12
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
        profitabilityScore: 287.97
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
        profitabilityScore: 142.86
      },
      {
        factoryId: '64f123456789abcdef123459',
        factoryName: 'New Factory (No Contracts)',
        factoryLocation: 'Gujarat, India',
        factoryCapacity: '500 tons/day',
        totalContracts: 0,
        completedContracts: 0,
        averagePricePerTon: 0,
        averagePaymentDelay: 30.0,
        contractFulfillmentRate: 0,
        profitabilityScore: 0
      }
    ],
    count: 4
  });
});

// Factory details endpoint
router.get('/factory-details/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Factory details retrieved successfully',
    data: {
      factoryId: id,
      factoryName: 'Premium Sugar Mills',
      factoryLocation: 'Maharashtra, India',
      factoryCapacity: '1000 tons/day',
      yearEstablished: 2015,
      totalContracts: 25,
      completedContracts: 21,
      activeContracts: 4,
      averagePricePerTon: 5000.00,
      averagePaymentDelay: 7.50,
      contractFulfillmentRate: 0.8400,
      profitabilityScore: 494.12,
      monthlyData: [
        { month: 'Jan 2024', contracts: 3, avgPrice: 4900, fulfillmentRate: 0.85, score: 485.2 },
        { month: 'Feb 2024', contracts: 2, avgPrice: 5100, fulfillmentRate: 0.82, score: 502.8 },
        { month: 'Mar 2024', contracts: 4, avgPrice: 5050, fulfillmentRate: 0.88, score: 496.1 },
        { month: 'Apr 2024', contracts: 2, avgPrice: 4950, fulfillmentRate: 0.80, score: 478.3 },
        { month: 'May 2024', contracts: 3, avgPrice: 5200, fulfillmentRate: 0.87, score: 523.7 },
        { month: 'Jun 2024', contracts: 5, avgPrice: 5000, fulfillmentRate: 0.84, score: 494.1 }
      ]
    }
  });
});

module.exports = router;