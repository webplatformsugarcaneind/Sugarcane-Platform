const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const {
  createSchedule,
  getMySchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getWorkers,
  createInvitation,
  getApplications,
  updateApplicationStatus,
  updateWorkerAvailability,
  getProfile,
  updateProfile
} = require('../controllers/hhm.controller');

// Apply protection and authorization to all routes in this file
// All routes require user to be authenticated and have 'HHM' role
router.use(protect);
router.use(authorize('HHM'));

// ================================
// PROFILE API ROUTES
// ================================

/**
 * @route   GET /api/hhm/profile
 * @desc    Get the logged-in HHM's profile
 * @access  Private (HHM only)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/hhm/profile
 * @desc    Update the logged-in HHM's profile
 * @access  Private (HHM only)
 */
router.put('/profile', updateProfile);

// ================================
// JOB MANAGEMENT (SCHEDULES) ROUTES
// ================================

/**
 * @route   POST /api/hhm/schedules
 * @desc    Create a new job schedule
 * @access  Private (HHM only)
 * @body    {
 *   requiredSkills: string[],
 *   workerCount: number,
 *   wageOffered: number,
 *   startDate: date,
 *   title?: string,
 *   description?: string,
 *   location?: string,
 *   endDate?: date
 * }
 */
router.post('/schedules', createSchedule);

/**
 * @route   GET /api/hhm/schedules
 * @desc    Get all schedules for the logged-in HHM
 * @access  Private (HHM only)
 * @query   status?: 'open' | 'closed'
 * @query   page?: number (default: 1)
 * @query   limit?: number (default: 10)
 */
router.get('/schedules', getMySchedules);

/**
 * @route   GET /api/hhm/schedules/:id
 * @desc    Get a single schedule by ID
 * @access  Private (HHM only)
 * @params  id: string (schedule ObjectId)
 */
router.get('/schedules/:id', getScheduleById);

/**
 * @route   PUT /api/hhm/schedules/:id
 * @desc    Update a schedule
 * @access  Private (HHM only)
 * @params  id: string (schedule ObjectId)
 * @body    {
 *   requiredSkills?: string[],
 *   workerCount?: number,
 *   wageOffered?: number,
 *   startDate?: date,
 *   title?: string,
 *   description?: string,
 *   location?: string,
 *   endDate?: date,
 *   status?: 'open' | 'closed'
 * }
 */
router.put('/schedules/:id', updateSchedule);

/**
 * @route   DELETE /api/hhm/schedules/:id
 * @desc    Delete a schedule (only if no approved applications)
 * @access  Private (HHM only)
 * @params  id: string (schedule ObjectId)
 */
router.delete('/schedules/:id', deleteSchedule);

// ================================
// WORKER DIRECTORY ROUTES
// ================================

/**
 * @route   GET /api/hhm/workers
 * @desc    Browse available workers directory
 * @access  Private (HHM only)
 * @query   skills?: string | string[] (comma-separated skills to filter by)
 * @query   availabilityStatus?: 'available' | 'unavailable' (default: 'available')
 * @query   location?: string (location to filter by)
 * @query   experience?: number (minimum years of experience)
 * @query   page?: number (default: 1)
 * @query   limit?: number (default: 20)
 * @example GET /api/hhm/workers?skills=planting,harvesting&availabilityStatus=available&page=1&limit=20
 */
router.get('/workers', getWorkers);

/**
 * @route   PUT /api/hhm/workers/:workerId/availability
 * @desc    Update worker availability status (mark as busy/available)
 * @access  Private (HHM only)
 * @body    { availability: 'available' | 'busy' }
 */
router.put('/workers/:workerId/availability', updateWorkerAvailability);

// ================================
// INVITATION MANAGEMENT ROUTES (DIRECT HIRE)
// ================================

/**
 * @route   POST /api/hhm/invitations
 * @desc    Send a direct hire invitation to a worker
 * @access  Private (HHM only)
 * @body    {
 *   scheduleId: string (required) - The job schedule ID,
 *   workerId: string (required) - The worker's user ID,
 *   personalMessage?: string (optional) - Personal message to the worker,
 *   offeredWage?: number (optional) - Custom wage offer (defaults to schedule wage),
 *   priority?: 'low' | 'medium' | 'high' | 'urgent' (optional, default: 'medium')
 * }
 * @example POST /api/hhm/invitations
 *          Body: {
 *            "scheduleId": "64f123456789abcdef123456",
 *            "workerId": "64f987654321fedcba654321",
 *            "personalMessage": "We would love to have you join our team for this harvest!",
 *            "offeredWage": 550,
 *            "priority": "high"
 *          }
 */
router.post('/invitations', createInvitation);

// ================================
// APPLICATION MANAGEMENT ROUTES
// ================================

/**
 * @route   GET /api/hhm/applications
 * @desc    Get applications for HHM's job schedules
 * @access  Private (HHM only)
 * @query   status?: 'pending' | 'approved' | 'rejected'
 * @query   scheduleId?: string (filter by specific schedule)
 * @query   page?: number (default: 1)
 * @query   limit?: number (default: 20)
 * @example GET /api/hhm/applications?status=pending&page=1&limit=20
 */
router.get('/applications', getApplications);

/**
 * @route   PUT /api/hhm/applications/:id
 * @desc    Update application status (approve or reject)
 * @access  Private (HHM only)
 * @params  id: string (application ObjectId)
 * @body    {
 *   status: 'approved' | 'rejected',
 *   reviewNotes?: string
 * }
 * @example PUT /api/hhm/applications/64f123456789abcdef123456
 *          Body: { "status": "approved", "reviewNotes": "Great experience with required skills" }
 */
router.put('/applications/:id', updateApplicationStatus);

// ================================
// ADDITIONAL UTILITY ROUTES
// ================================

/**
 * @route   GET /api/hhm/dashboard
 * @desc    Get HHM dashboard statistics
 * @access  Private (HHM only)
 * @returns {
 *   schedules: { open: number, closed: number, total: number },
 *   applications: { pending: number, approved: number, rejected: number },
 *   workers: { available: number, assigned: number }
 * }
 */
router.get('/dashboard', async (req, res) => {
  try {
    const Schedule = require('../models/schedule.model');
    const Application = require('../models/application.model');
    const Profile = require('../models/profile.model');

    // Get schedule statistics
    const [openSchedules, closedSchedules] = await Promise.all([
      Schedule.countDocuments({ hhmId: req.user._id, status: 'open' }),
      Schedule.countDocuments({ hhmId: req.user._id, status: 'closed' })
    ]);

    // Get application statistics
    const [pendingApps, approvedApps, rejectedApps] = await Promise.all([
      Application.countDocuments({ hhmId: req.user._id, status: 'pending' }),
      Application.countDocuments({ hhmId: req.user._id, status: 'approved' }),
      Application.countDocuments({ hhmId: req.user._id, status: 'rejected' })
    ]);

    // Get worker statistics
    const [availableWorkers, unavailableWorkers] = await Promise.all([
      Profile.countDocuments({ availabilityStatus: 'available' }),
      Profile.countDocuments({ availabilityStatus: 'unavailable' })
    ]);

    const dashboardData = {
      schedules: {
        open: openSchedules,
        closed: closedSchedules,
        total: openSchedules + closedSchedules
      },
      applications: {
        pending: pendingApps,
        approved: approvedApps,
        rejected: rejectedApps,
        total: pendingApps + approvedApps + rejectedApps
      },
      workers: {
        available: availableWorkers,
        unavailable: unavailableWorkers,
        total: availableWorkers + unavailableWorkers
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hhm/schedules/:id/applications
 * @desc    Get all applications for a specific schedule
 * @access  Private (HHM only)
 * @params  id: string (schedule ObjectId)
 * @query   status?: 'pending' | 'approved' | 'rejected'
 */
router.get('/schedules/:id/applications', async (req, res) => {
  try {
    const Schedule = require('../models/schedule.model');
    const Application = require('../models/application.model');
    
    // Verify schedule belongs to HHM
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      hhmId: req.user._id
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    const { status } = req.query;
    const query = { scheduleId: req.params.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('workerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
      schedule: {
        id: schedule._id,
        title: schedule.title,
        workerCount: schedule.workerCount,
        acceptedWorkersCount: schedule.acceptedWorkersCount
      }
    });

  } catch (error) {
    console.error('❌ Error getting schedule applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving schedule applications',
      error: error.message
    });
  }
});

module.exports = router;