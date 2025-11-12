const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const {
  createContractRequest,
  createFactoryInvite,
  acceptFactoryInvite,
  rejectFactoryInvite,
  respondToContract,
  finalizeContract,
  getMyContracts,
  getContractById,
  extendContract,
  cancelContract,
  getContractStats
} = require('../controllers/contract.controller');

// Apply protection to all routes in this file
// Note: We'll apply specific role authorization per route since both HHM and Factory use these routes
router.use(protect);

// ================================
// CONTRACT CREATION & MANAGEMENT
// ================================

/**
 * @route   POST /api/contracts/request
 * @desc    Create a new contract request (HHM initiates negotiation)
 * @access  Private (HHM only)
 * @body    {
 *   factory_id: string (required) - ObjectId of the factory,
 *   hhm_request_details: object (required) - HHM's form data (vehicles, labor, etc.),
 *   title?: string (optional) - Contract title/description,
 *   initial_message?: string (optional) - Personal message to factory,
 *   priority?: string (optional) - 'low' | 'medium' | 'high' | 'urgent' (default: 'medium'),
 *   contract_value?: number (optional) - Proposed contract value,
 *   duration_days?: number (optional) - Proposed contract duration
 * }
 * @example POST /api/contracts/request
 *          Body: {
 *            "factory_id": "64f123456789abcdef123456",
 *            "hhm_request_details": {
 *              "vehicles": ["truck", "tractor"],
 *              "laborCount": 50,
 *              "skills": ["harvesting", "loading"],
 *              "startDate": "2024-01-15",
 *              "endDate": "2024-02-15"
 *            },
 *            "title": "Harvest Season Labor Contract",
 *            "initial_message": "We would like to propose a partnership for the upcoming harvest season.",
 *            "priority": "high",
 *            "contract_value": 50000,
 *            "duration_days": 30
 *          }
 */
router.post('/request', authorize('HHM'), createContractRequest);

/**
 * @route   POST /api/contracts/invite
 * @desc    Factory invites HHM to join (Factory initiates negotiation)
 * @access  Private (Factory only)
 * @body    {
 *   hhm_id: string (required) - ObjectId of the HHM,
 *   title?: string (optional) - Contract title/description,
 *   invitation_message?: string (optional) - Personal message to HHM,
 *   priority?: string (optional) - 'low' | 'medium' | 'high' | 'urgent' (default: 'medium'),
 *   contract_value?: number (optional) - Proposed contract value,
 *   duration_days?: number (optional) - Proposed contract duration,
 *   factory_requirements?: object (optional) - Factory's initial requirements
 * }
 * @example POST /api/contracts/invite
 *          Body: {
 *            "hhm_id": "64f123456789abcdef123456",
 *            "title": "Harvest Season Partnership",
 *            "invitation_message": "We would like to invite you to partner with our factory for the upcoming harvest season.",
 *            "priority": "high",
 *            "contract_value": 55000,
 *            "duration_days": 45,
 *            "factory_requirements": {
 *              "requiredLaborCount": 60,
 *              "vehiclesNeeded": ["truck", "tractor"],
 *              "skillsRequired": ["harvesting", "maintenance"]
 *            }
 *          }
 */
router.post('/invite', authorize('Factory'), createFactoryInvite);

/**
 * @route   PUT /api/contracts/:contractId/accept-invite
 * @desc    HHM accepts factory invitation
 * @access  Private (HHM only)
 * @params  contractId: string (required) - Contract ObjectId
 * @body    {
 *   response_message?: string (optional) - Acceptance message
 * }
 */
router.put('/:contractId/accept-invite', authorize('HHM'), acceptFactoryInvite);

/**
 * @route   PUT /api/contracts/:contractId/reject-invite
 * @desc    HHM rejects factory invitation
 * @access  Private (HHM only)
 * @params  contractId: string (required) - Contract ObjectId
 * @body    {
 *   response_message?: string (optional) - Rejection message
 * }
 */
router.put('/:contractId/reject-invite', authorize('HHM'), rejectFactoryInvite);

/**
 * @route   PUT /api/contracts/respond/:contractId
 * @desc    Factory responds to HHM contract request
 * @access  Private (Factory only)
 * @params  contractId: string (required) - Contract ObjectId
 * @body    {
 *   decision: string (required) - 'reject' | 'offer',
 *   factory_allowance_list?: object (required if decision is 'offer') - Factory's counter-offer details,
 *   response_message?: string (optional) - Response message,
 *   contract_value?: number (optional) - Counter-offered contract value,
 *   duration_days?: number (optional) - Counter-offered duration
 * }
 * @example PUT /api/contracts/respond/64f123456789abcdef123456
 *          Body: {
 *            "decision": "offer",
 *            "factory_allowance_list": {
 *              "approvedVehicles": ["truck"],
 *              "maxLaborCount": 40,
 *              "allowedSkills": ["harvesting"],
 *              "workingHours": "8am-6pm",
 *              "paymentTerms": "weekly"
 *            },
 *            "response_message": "We can accommodate most of your requirements with some adjustments.",
 *            "contract_value": 45000,
 *            "duration_days": 25
 *          }
 */
router.put('/respond/:contractId', authorize('Factory'), respondToContract);

/**
 * @route   PUT /api/contracts/finalize/:contractId
 * @desc    HHM finalizes contract (accept or reject factory offer)
 * @access  Private (HHM only)
 * @params  contractId: string (required) - Contract ObjectId
 * @body    {
 *   decision: string (required) - 'accept' | 'reject',
 *   response_message?: string (optional) - Final response message
 * }
 * @example PUT /api/contracts/finalize/64f123456789abcdef123456
 *          Body: {
 *            "decision": "accept",
 *            "response_message": "Thank you for the counter-offer. We accept the terms."
 *          }
 */
router.put('/finalize/:contractId', authorize('HHM'), finalizeContract);

// ================================
// CONTRACT RETRIEVAL & VIEWING
// ================================

/**
 * @route   GET /api/contracts/my-contracts
 * @desc    Get all contracts for the currently logged-in user (both HHM and Factory)
 * @access  Private (HHM or Factory)
 * @query   status?: string (optional) - Filter by status: 'hhm_pending' | 'factory_offer' | 'hhm_accepted' | 'hhm_rejected' | 'factory_rejected' | 'expired' | 'cancelled'
 * @query   priority?: string (optional) - Filter by priority: 'low' | 'medium' | 'high' | 'urgent'
 * @query   initiated_by?: string (optional) - Filter by initiator: 'hhm' | 'factory'
 * @query   page?: number (optional) - Page number for pagination (default: 1)
 * @query   limit?: number (optional) - Number of contracts per page (default: 10)
 * @query   sort?: string (optional) - Sort order (default: '-createdAt')
 * @example GET /api/contracts/my-contracts?status=hhm_pending&priority=high&page=1&limit=20
 */
router.get('/my-contracts', authorize('HHM', 'Factory'), getMyContracts);

/**
 * @route   GET /api/contracts/:contractId
 * @desc    Get a specific contract by ID
 * @access  Private (HHM or Factory - must be party to the contract)
 * @params  contractId: string (required) - Contract ObjectId
 * @example GET /api/contracts/64f123456789abcdef123456
 */
router.get('/:contractId', authorize('HHM', 'Factory'), getContractById);

/**
 * @route   GET /api/contracts/stats
 * @desc    Get contract statistics for dashboard
 * @access  Private (HHM or Factory)
 * @returns {
 *   overview: { total, active, accepted, rejected, expired, cancelled },
 *   byInitiator: { initiated, received },
 *   breakdown: { pending, completed }
 * }
 * @example GET /api/contracts/stats
 */
router.get('/stats', authorize('HHM', 'Factory'), getContractStats);

// ================================
// CONTRACT MODIFICATION & UTILITIES
// ================================

/**
 * @route   PUT /api/contracts/:contractId/extend
 * @desc    Extend contract expiration deadline
 * @access  Private (HHM or Factory - must be party to the contract)
 * @params  contractId: string (required) - Contract ObjectId
 * @body    {
 *   days?: number (optional) - Number of days to extend (default: 7, max: 30)
 * }
 * @example PUT /api/contracts/64f123456789abcdef123456/extend
 *          Body: { "days": 14 }
 */
router.put('/:contractId/extend', authorize('HHM', 'Factory'), extendContract);

/**
 * @route   PUT /api/contracts/:contractId/cancel
 * @desc    Cancel a contract (available to both parties)
 * @access  Private (HHM or Factory - must be party to the contract)
 * @params  contractId: string (required) - Contract ObjectId
 * @body    {
 *   reason?: string (optional) - Reason for cancellation
 * }
 * @example PUT /api/contracts/64f123456789abcdef123456/cancel
 *          Body: { "reason": "Project requirements have changed" }
 */
router.put('/:contractId/cancel', authorize('HHM', 'Factory'), cancelContract);

// ================================
// ADDITIONAL UTILITY ROUTES
// ================================

/**
 * @route   GET /api/contracts/dashboard
 * @desc    Get contract dashboard data with key metrics
 * @access  Private (HHM or Factory)
 * @returns Comprehensive dashboard statistics including active negotiations, recent activity, etc.
 */
router.get('/dashboard', authorize('HHM', 'Factory'), async (req, res) => {
  try {
    const Contract = require('../models/contract.model');
    
    // Build query based on user role
    let query;
    if (req.user.role === 'HHM') {
      query = { hhm_id: req.user._id };
    } else if (req.user.role === 'Factory') {
      query = { factory_id: req.user._id };
    }

    // Get recent contracts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalContracts,
      activeNegotiations,
      recentActivity,
      expiringSoon
    ] = await Promise.all([
      Contract.countDocuments(query),
      Contract.countDocuments({ 
        ...query, 
        status: { $in: ['hhm_pending', 'factory_offer'] } 
      }),
      Contract.find({ 
        ...query, 
        createdAt: { $gte: thirtyDaysAgo } 
      })
        .populate('hhm_id factory_id', 'name factoryName')
        .sort({ createdAt: -1 })
        .limit(5),
      Contract.findExpiringSoon(7) // Contracts expiring in 7 days
        .then(contracts => contracts.filter(contract => {
          if (req.user.role === 'HHM') {
            return contract.hhm_id.toString() === req.user._id.toString();
          } else {
            return contract.factory_id.toString() === req.user._id.toString();
          }
        }))
    ]);

    const dashboardData = {
      summary: {
        total: totalContracts,
        activeNegotiations,
        recentActivity: recentActivity.length,
        expiringSoon: expiringSoon.length
      },
      recentContracts: recentActivity,
      expiringContracts: expiringSoon,
      userRole: req.user.role
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Contract dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting contract dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contract dashboard data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/contracts/partner/:partnerId
 * @desc    Get all contracts with a specific partner (HHM <-> Factory)
 * @access  Private (HHM or Factory)
 * @params  partnerId: string (required) - Partner's user ObjectId
 * @example GET /api/contracts/partner/64f123456789abcdef123456
 */
router.get('/partner/:partnerId', authorize('HHM', 'Factory'), async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    let query;
    if (req.user.role === 'HHM') {
      query = { hhm_id: req.user._id, factory_id: partnerId };
    } else if (req.user.role === 'Factory') {
      query = { factory_id: req.user._id, hhm_id: partnerId };
    }

    const contracts = await Contract.find(query)
      .populate('hhm_id factory_id', 'name email phone factoryName managementExperience')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contracts,
      count: contracts.length,
      message: 'Partner contracts retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting partner contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving partner contracts',
      error: error.message
    });
  }
});

module.exports = router;