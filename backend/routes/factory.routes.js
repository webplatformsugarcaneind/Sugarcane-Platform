const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const {
  createBill,
  getBills,
  createMaintenanceJob,
  getMaintenanceApplications,
  updateMaintenanceApplication,
  getProfile,
  updateProfile,
  getHHMs,
  inviteHHM,
  getMyInvitations,
  cancelInvitation,
  removeAssociatedHHM,
  getAssociatedHHMs
} = require('../controllers/factory.controller');

// Apply protection and authorization to all routes in this file
// All routes require user to be authenticated and have 'Factory' role
router.use(protect);
router.use(authorize('Factory'));

// ===================================
// PROFILE API ROUTES
// ===================================

/**
 * @route   GET /api/factory/profile
 * @desc    Get the logged-in factory's profile
 * @access  Private (Factory only)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/factory/profile
 * @desc    Update the logged-in factory's profile
 * @access  Private (Factory only)
 */
router.put('/profile', updateProfile);

// ===================================
// BILLING API ROUTES
// ===================================

/**
 * @route   POST /api/factory/bills
 * @desc    Create a new bill record for a farmer
 * @access  Private (Factory only)
 * @body    { farmerId, cropQuantity, totalAmount }
 */
router.post('/bills', createBill);

/**
 * @route   GET /api/factory/bills
 * @desc    View a history of all bills posted by the factory
 * @access  Private (Factory only)
 * @query   status (optional), page (optional), limit (optional)
 */
router.get('/bills', getBills);

// ===================================
// MAINTENANCE LABOR API ROUTES
// ===================================

/**
 * @route   POST /api/factory/maintenance-jobs
 * @desc    Post a new maintenance job (creates a schedule with jobType: 'maintenance')
 * @access  Private (Factory only)
 * @body    { requiredSkills, workerCount, wageOffered, startDate, title?, description?, location?, endDate? }
 */
router.post('/maintenance-jobs', createMaintenanceJob);

/**
 * @route   GET /api/factory/maintenance-applications
 * @desc    View applications received for maintenance jobs
 * @access  Private (Factory only)
 * @query   status (optional), page (optional), limit (optional)
 */
router.get('/maintenance-applications', getMaintenanceApplications);

/**
 * @route   PUT /api/factory/maintenance-applications/:id
 * @desc    Approve or reject a specific maintenance application
 * @access  Private (Factory only)
 * @param   id - Application ID
 * @body    { status: 'approved' | 'rejected' }
 */
router.put('/maintenance-applications/:id', updateMaintenanceApplication);

// ===================================
// HHM DIRECTORY API ROUTES
// ===================================

/**
 * @route   GET /api/factory/hhms
 * @desc    Get all HHMs (Hub Head Managers) directory for factories
 * @access  Private (Factory only)
 * @returns {Array} Array of HHM objects with basic contact information
 * @example GET /api/factory/hhms
 */
router.get('/hhms', getHHMs);

// ===================================
// HHM INVITATION & ASSOCIATION ROUTES
// ===================================

/**
 * @route   POST /api/factory/invite-hhm
 * @desc    Send invitation to HHM to associate with factory
 * @access  Private (Factory only)
 * @body    { hhmId, personalMessage?, invitationReason? }
 */
router.post('/invite-hhm', inviteHHM);

/**
 * @route   GET /api/factory/invitations
 * @desc    Get all invitations sent by factory to HHMs
 * @access  Private (Factory only)
 * @query   status (optional), page (optional), limit (optional)
 */
router.get('/invitations', getMyInvitations);

/**
 * @route   GET /api/factory/associated-hhms
 * @desc    Get all HHMs associated with factory
 * @access  Private (Factory only)
 */
router.get('/associated-hhms', getAssociatedHHMs);

/**
 * @route   DELETE /api/factory/invitations/:id
 * @desc    Cancel pending invitation to HHM
 * @access  Private (Factory only)
 * @param   id - Invitation ID
 */
router.delete('/invitations/:id', cancelInvitation);

/**
 * @route   DELETE /api/factory/associated-hhms/:hhmId
 * @desc    Remove HHM from factory's associated list
 * @access  Private (Factory only)
 * @param   hhmId - HHM user ID
 */
router.delete('/associated-hhms/:hhmId', removeAssociatedHHM);

module.exports = router;