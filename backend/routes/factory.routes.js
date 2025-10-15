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
  updateProfile
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

module.exports = router;