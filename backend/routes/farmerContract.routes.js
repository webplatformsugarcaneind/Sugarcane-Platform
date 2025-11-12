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

module.exports = router;