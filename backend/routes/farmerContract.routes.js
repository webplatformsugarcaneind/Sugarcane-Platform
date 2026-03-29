const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const {
  createContractRequest,
  getMyContracts,
  respondToContract
} = require('../controllers/farmerContract.controller');

// Apply protection to all routes in this file
router.use(protect);

// ================================
// FARMER CONTRACT CREATION
// ================================

/**
 * @route   POST /api/farmer-contracts/request
 * @desc    Create a new contract request from Farmer to HHM
 * @access  Private (Farmer only)
 * @body    {
 *   hhm_id: string (required) - ObjectId of the HHM,
 *   contract_details: object (required) - Contract details including duration_days and grace_period_days,
 *   duration_days: number (required) - Contract duration in days,
 *   grace_period_days?: number (optional) - Grace period before auto-cancellation (default: 2)
 * }
 * @example POST /api/farmer-contracts/request
 *          Body: {
 *            "hhm_id": "64f123456789abcdef123456",
 *            "contract_details": {
 *              "farmLocation": "Nashik, Maharashtra",
 *              "workType": "Sugarcane harvesting",
 *              "requirements": "50 workers needed for harvesting",
 *              "paymentTerms": "₹500 per day per worker",
 *              "startDate": "2024-01-15",
 *              "endDate": "2024-02-15"
 *            },
 *            "duration_days": 30,
 *            "grace_period_days": 2
 *          }
 */
router.post('/request', authorize('Farmer'), createContractRequest);

// ================================
// CONTRACT DASHBOARD & MANAGEMENT
// ================================

/**
 * @route   GET /api/farmer-contracts/my-contracts
 * @desc    Get all contracts related to the currently logged-in user
 *          (whether they are the farmer_id or hhm_id)
 * @access  Private (Any authenticated user)
 * @query   {
 *   status?: string (optional) - Filter by status ('farmer_pending', 'hhm_accepted', 'hhm_rejected', 'auto_cancelled'),
 *   page?: number (optional) - Page number for pagination (default: 1),
 *   limit?: number (optional) - Number of contracts per page (default: 10),
 *   sort?: string (optional) - Sort field ('createdAt', 'updatedAt', 'duration_days') with direction (-createdAt for desc)
 * }
 * @example GET /api/farmer-contracts/my-contracts?status=farmer_pending&page=1&limit=5&sort=-createdAt
 */
router.get('/my-contracts', getMyContracts);

// ================================
// HHM CONTRACT RESPONSE
// ================================

/**
 * @route   PUT /api/farmer-contracts/respond/:contractId
 * @desc    HHM responds to a farmer contract (accept/reject) with Farmer Exclusivity logic
 * @access  Private (HHM only)
 * @param   {string} contractId - ObjectId of the contract to respond to
 * @body    {
 *   decision: string (required) - 'accept' or 'reject'
 * }
 * @logic   FARMER EXCLUSIVITY LOGIC:
 *          - If 'reject': Update contract status to 'hhm_rejected'
 *          - If 'accept': Update contract to 'hhm_accepted' AND auto-cancel all other 
 *            pending contracts from the same farmer (ensures farmer exclusivity)
 * @example PUT /api/farmer-contracts/respond/64f123456789abcdef123456
 *          Body: { "decision": "accept" }
 */
router.put('/respond/:contractId', authorize('HHM'), respondToContract);

// ================================
// FARMER CONTRACT LIFECYCLE MANAGEMENT
// ================================

/**
 * @route   PUT /api/farmer-contracts/:contractId/mark-delivered
 * @desc    Mark farmer contract as delivered (sets delivery_date to current date)
 * @access  Private (Farmer or HHM - must be party to the contract)
 * @params  contractId: string (required) - Contract ObjectId
 * @example PUT /api/farmer-contracts/64f123456789abcdef123456/mark-delivered
 */
router.put('/:contractId/mark-delivered', authorize('Farmer', 'HHM'), async (req, res) => {
  try {
    const { contractId } = req.params;

    // Import model
    const FarmerContract = require('../models/farmerContract.model');

    // Find the contract and verify user is a party
    const contract = await FarmerContract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if user is party to the contract
    const isParty = contract.farmer_id.toString() === req.user._id.toString() || 
                   contract.hhm_id.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a party to this contract'
      });
    }

    // Check if contract is in an accepted state
    if (contract.status !== 'hhm_accepted') {
      return res.status(400).json({
        success: false,
        message: 'Contract must be in accepted state to mark as delivered'
      });
    }

    // Update delivery date
    contract.delivery_date = new Date();
    await contract.save();

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract marked as delivered successfully'
    });

  } catch (error) {
    console.error('❌ Error marking farmer contract as delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking farmer contract as delivered',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/farmer-contracts/:contractId/mark-paid
 * @desc    Mark farmer contract as paid (sets payment_date to current date and payment_status to 'paid')
 * @access  Private (Farmer or HHM - must be party to the contract)
 * @params  contractId: string (required) - Contract ObjectId
 * @example PUT /api/farmer-contracts/64f123456789abcdef123456/mark-paid
 */
router.put('/:contractId/mark-paid', authorize('Farmer', 'HHM'), async (req, res) => {
  try {
    const { contractId } = req.params;

    // Import model
    const FarmerContract = require('../models/farmerContract.model');

    // Find the contract and verify user is a party
    const contract = await FarmerContract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if user is party to the contract
    const isParty = contract.farmer_id.toString() === req.user._id.toString() || 
                   contract.hhm_id.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a party to this contract'
      });
    }

    // Check if contract is in an accepted state
    if (contract.status !== 'hhm_accepted') {
      return res.status(400).json({
        success: false,
        message: 'Contract must be in accepted state to mark as paid'
      });
    }

    // Update payment information
    contract.payment_date = new Date();
    contract.payment_status = 'paid';
    await contract.save();

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract marked as paid successfully'
    });

  } catch (error) {
    console.error('❌ Error marking farmer contract as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking farmer contract as paid',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/farmer-contracts/:contractId/mark-completed
 * @desc    Mark farmer contract as completed (sets status to 'completed')
 * @access  Private (Farmer or HHM - must be party to the contract)
 * @params  contractId: string (required) - Contract ObjectId
 * @example PUT /api/farmer-contracts/64f123456789abcdef123456/mark-completed
 */
router.put('/:contractId/mark-completed', authorize('Farmer', 'HHM'), async (req, res) => {
  try {
    const { contractId } = req.params;

    // Import model
    const FarmerContract = require('../models/farmerContract.model');

    // Find the contract and verify user is a party
    const contract = await FarmerContract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if user is party to the contract
    const isParty = contract.farmer_id.toString() === req.user._id.toString() || 
                   contract.hhm_id.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a party to this contract'
      });
    }

    // Check if contract has delivery date (should be delivered before completed)
    if (!contract.delivery_date) {
      return res.status(400).json({
        success: false,
        message: 'Contract must be delivered before it can be marked as completed'
      });
    }

    // Update status to completed
    contract.status = 'completed';
    await contract.save();

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract marked as completed successfully'
    });

  } catch (error) {
    console.error('❌ Error marking farmer contract as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking farmer contract as completed',
      error: error.message
    });
  }
});

module.exports = router;