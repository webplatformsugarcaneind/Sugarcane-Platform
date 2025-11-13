const Contract = require('../models/contract.model');
const FarmerContract = require('../models/farmerContract.model');
const User = require('../models/user.model');

/**
 * @desc    Factory Profitability Analysis for Farmers
 * @route   GET /api/analytics/factory-profitability
 * @access  Private (Farmer only)
 */
const getFactoryProfitabilityAnalysis = async (req, res) => {
  try {
    console.log('📊 Starting Factory Profitability Analysis for Farmer:', req.user._id);

    // MongoDB Aggregation Pipeline to analyze factory profitability
    const factoryAnalytics = await Contract.aggregate([
      // Stage 1: Match all contracts involving factories
      {
        $match: {
          factory_id: { $exists: true, $ne: null }
        }
      },

      // Stage 2: Lookup factory user details
      {
        $lookup: {
          from: 'users',
          localField: 'factory_id',
          foreignField: '_id',
          as: 'factory'
        }
      },

      // Stage 3: Unwind factory data and filter only Factory role users
      {
        $unwind: '$factory'
      },
      {
        $match: {
          'factory.role': 'Factory'
        }
      },

      // Stage 4: Add computed fields for analysis
      {
        $addFields: {
          // Calculate payment delay (delivery_date to payment_date)
          paymentDelay: {
            $cond: {
              if: { 
                $and: [
                  { $ne: ['$delivery_date', null] },
                  { $ne: ['$payment_date', null] }
                ]
              },
              then: {
                $divide: [
                  { $subtract: ['$payment_date', '$delivery_date'] },
                  1000 * 60 * 60 * 24 // Convert milliseconds to days
                ]
              },
              else: 30 // Default high delay if no payment_date
            }
          },
          
          // Extract contract value for price calculation
          contractPrice: {
            $cond: {
              if: { $ne: ['$contract_value', null] },
              then: '$contract_value',
              else: 0
            }
          },

          // Check if contract is completed
          isCompleted: {
            $cond: {
              if: { $eq: ['$status', 'completed'] },
              then: 1,
              else: 0
            }
          },

          // Check if contract is finalized (any end state)
          isFinalized: {
            $cond: {
              if: { 
                $in: ['$status', ['completed', 'cancelled', 'expired', 'hhm_rejected', 'factory_rejected']]
              },
              then: 1,
              else: 0
            }
          }
        }
      },

      // Stage 5: Group by factory to calculate metrics
      {
        $group: {
          _id: '$factory_id',
          factoryInfo: { $first: '$factory' },
          
          // Calculate total and completed contracts
          totalContracts: { $sum: 1 },
          completedContracts: { $sum: '$isCompleted' },
          finalizedContracts: { $sum: '$isFinalized' },
          
          // Calculate price metrics (only from completed contracts)
          totalPriceFromCompleted: {
            $sum: {
              $cond: {
                if: { $eq: ['$isCompleted', 1] },
                then: '$contractPrice',
                else: 0
              }
            }
          },
          completedContractsWithPrice: {
            $sum: {
              $cond: {
                if: { 
                  $and: [
                    { $eq: ['$isCompleted', 1] },
                    { $gt: ['$contractPrice', 0] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          },
          
          // Calculate payment delay metrics
          totalPaymentDelay: { $sum: '$paymentDelay' },
          contractsWithDelay: {
            $sum: {
              $cond: {
                if: { $ne: ['$paymentDelay', null] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },

      // Stage 6: Calculate final metrics and profitability score
      {
        $addFields: {
          // Average Price per Ton (assuming contract_value represents total price)
          // For actual ton calculation, you might need additional fields in contract
          averagePricePerTon: {
            $cond: {
              if: { $gt: ['$completedContractsWithPrice', 0] },
              then: { $divide: ['$totalPriceFromCompleted', '$completedContractsWithPrice'] },
              else: 0
            }
          },

          // Average Payment Delay
          averagePaymentDelay: {
            $cond: {
              if: { $gt: ['$contractsWithDelay', 0] },
              then: { $divide: ['$totalPaymentDelay', '$contractsWithDelay'] },
              else: 30 // Default high delay if no data
            }
          },

          // Contract Fulfillment Rate
          contractFulfillmentRate: {
            $cond: {
              if: { $gt: ['$totalContracts', 0] },
              then: { $divide: ['$completedContracts', '$totalContracts'] },
              else: 0
            }
          }
        }
      },

      // Stage 7: Calculate Profitability Score using the given formula
      {
        $addFields: {
          profitabilityScore: {
            $cond: {
              if: { 
                $and: [
                  { $gt: ['$averagePricePerTon', 0] },
                  { $gt: ['$contractFulfillmentRate', 0] }
                ]
              },
              then: {
                $divide: [
                  { $multiply: ['$averagePricePerTon', '$contractFulfillmentRate'] },
                  { $add: ['$averagePaymentDelay', 1] }
                ]
              },
              else: 0
            }
          }
        }
      },

      // Stage 8: Project final fields
      {
        $project: {
          _id: 1,
          factoryId: '$_id',
          factoryName: '$factoryInfo.name',
          factoryEmail: '$factoryInfo.email',
          factoryLocation: '$factoryInfo.factoryLocation',
          factoryCapacity: '$factoryInfo.capacity',
          
          // Metrics
          totalContracts: 1,
          completedContracts: 1,
          averagePricePerTon: { $round: ['$averagePricePerTon', 2] },
          averagePaymentDelay: { $round: ['$averagePaymentDelay', 2] },
          contractFulfillmentRate: { $round: ['$contractFulfillmentRate', 4] },
          
          // Final Score
          profitabilityScore: { $round: ['$profitabilityScore', 4] }
        }
      },

      // Stage 9: Sort by profitability score (highest first)
      {
        $sort: {
          profitabilityScore: -1
        }
      }
    ]);

    // Additional analysis: Get factories with no contracts
    const factoriesWithoutContracts = await User.aggregate([
      {
        $match: {
          role: 'Factory'
        }
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: 'factory_id',
          as: 'contracts'
        }
      },
      {
        $match: {
          'contracts': { $size: 0 }
        }
      },
      {
        $project: {
          factoryId: '$_id',
          factoryName: '$name',
          factoryEmail: '$email',
          factoryLocation: '$factoryLocation',
          factoryCapacity: '$capacity',
          totalContracts: 0,
          completedContracts: 0,
          averagePricePerTon: 0,
          averagePaymentDelay: 30, // Default high delay
          contractFulfillmentRate: 0,
          profitabilityScore: 0
        }
      }
    ]);

    // Combine results and sort again
    const allFactoryAnalytics = [
      ...factoryAnalytics,
      ...factoriesWithoutContracts
    ].sort((a, b) => b.profitabilityScore - a.profitabilityScore);

    // Generate summary statistics
    const summary = {
      totalFactoriesAnalyzed: allFactoryAnalytics.length,
      factoriesWithContracts: factoryAnalytics.length,
      factoriesWithoutContracts: factoriesWithoutContracts.length,
      averageScore: allFactoryAnalytics.length > 0 
        ? (allFactoryAnalytics.reduce((sum, factory) => sum + factory.profitabilityScore, 0) / allFactoryAnalytics.length).toFixed(4)
        : 0,
      topPerformer: allFactoryAnalytics.length > 0 ? allFactoryAnalytics[0] : null,
      analysisDate: new Date().toISOString()
    };

    console.log(`✅ Factory Profitability Analysis completed. Analyzed ${allFactoryAnalytics.length} factories.`);

    res.status(200).json({
      success: true,
      message: 'Factory profitability analysis completed successfully',
      summary: summary,
      data: allFactoryAnalytics,
      count: allFactoryAnalytics.length
    });

  } catch (error) {
    console.error('❌ Error in Factory Profitability Analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing factory profitability analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Additional Analytics Helper - Get Factory Contract Details
 * @route   GET /api/analytics/factory-details/:factoryId
 * @access  Private (Farmer only)
 */
const getFactoryContractDetails = async (req, res) => {
  try {
    const { factoryId } = req.params;
    
    console.log('📊 Getting detailed contract analysis for factory:', factoryId);

    // Validate factory exists
    const factory = await User.findById(factoryId);
    if (!factory || factory.role !== 'Factory') {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    // Get detailed contract history
    const contractDetails = await Contract.find({ factory_id: factoryId })
      .populate('hhm_id', 'name email managementExperience')
      .sort({ createdAt: -1 })
      .select('status contract_value delivery_date payment_date createdAt updatedAt duration_days');

    // Calculate metrics for this specific factory
    const metrics = {
      totalContracts: contractDetails.length,
      completedContracts: contractDetails.filter(c => c.status === 'completed').length,
      pendingContracts: contractDetails.filter(c => ['hhm_pending', 'factory_offer'].includes(c.status)).length,
      cancelledContracts: contractDetails.filter(c => ['cancelled', 'expired', 'hhm_rejected', 'factory_rejected'].includes(c.status)).length
    };

    res.status(200).json({
      success: true,
      message: 'Factory contract details retrieved successfully',
      factory: {
        id: factory._id,
        name: factory.name,
        email: factory.email,
        location: factory.factoryLocation,
        capacity: factory.capacity
      },
      metrics: metrics,
      contracts: contractDetails,
      count: contractDetails.length
    });

  } catch (error) {
    console.error('❌ Error getting factory contract details:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving factory contract details',
      error: error.message
    });
  }
};

module.exports = {
  getFactoryProfitabilityAnalysis,
  getFactoryContractDetails
};