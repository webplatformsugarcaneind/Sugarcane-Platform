const express = require('express');
const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const {
  getJobFeed,
  applyForJob,
  getMyApplications,
  getMyInvitations,
  respondToInvitation,
  getWorkerDashboard,
  getProfile,
  updateProfile
} = require('../controllers/worker.controller');

// Apply protection and authorization to all routes in this file
// All routes require user to be authenticated and have 'Labour' role
router.use(protect);
router.use(authorize('Labour'));

// ================================
// PROFILE API ROUTES
// ================================

/**
 * @route   GET /api/worker/profile
 * @desc    Get the logged-in worker's profile
 * @access  Private (Labour only)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/worker/profile
 * @desc    Update the logged-in worker's profile
 * @access  Private (Labour only)
 */
router.put('/profile', updateProfile);

// ================================
// JOB FEED ROUTES
// ================================

/**
 * @route   GET /api/worker/jobs
 * @desc    Get job feed - all open schedules available for application
 * @access  Private (Labour only)
 * @query   skills?: string | string[] (comma-separated skills to filter by)
 * @query   location?: string (location to filter by)
 * @query   minWage?: number (minimum wage filter)
 * @query   maxWage?: number (maximum wage filter)
 * @query   startDate?: date (earliest start date filter)
 * @query   page?: number (default: 1)
 * @query   limit?: number (default: 20)
 * @example GET /api/worker/jobs?skills=planting,harvesting&minWage=500&location=punjab&page=1&limit=20
 */
router.get('/jobs', getJobFeed);

// ================================
// APPLICATION WORKFLOW ROUTES
// ================================

/**
 * @route   POST /api/worker/applications
 * @desc    Apply for a job schedule
 * @access  Private (Labour only)
 * @body    {
 *   scheduleId: string (required),
 *   applicationMessage?: string,
 *   workerSkills: string[] (required),
 *   experience?: string,
 *   expectedWage?: number,
 *   availability?: 'full-time' | 'part-time' | 'flexible'
 * }
 * @example POST /api/worker/applications
 *          Body: {
 *            "scheduleId": "64f123456789abcdef123456",
 *            "applicationMessage": "I have 5 years of experience in sugarcane farming",
 *            "workerSkills": ["planting", "harvesting", "irrigation"],
 *            "experience": "5 years in agricultural work",
 *            "expectedWage": 600,
 *            "availability": "full-time"
 *          }
 */
router.post('/applications', applyForJob);

/**
 * @route   GET /api/worker/applications
 * @desc    Get worker's own applications with status
 * @access  Private (Labour only)
 * @query   status?: 'pending' | 'approved' | 'rejected'
 * @query   page?: number (default: 1)
 * @query   limit?: number (default: 20)
 * @example GET /api/worker/applications?status=pending&page=1&limit=10
 */
router.get('/applications', getMyApplications);

// ================================
// INVITATION WORKFLOW ROUTES
// ================================

/**
 * @route   GET /api/worker/invitations
 * @desc    Get worker's invitations from HHMs
 * @access  Private (Labour only)
 * @query   status?: 'pending' | 'accepted' | 'declined'
 * @query   page?: number (default: 1)
 * @query   limit?: number (default: 20)
 * @example GET /api/worker/invitations?status=pending&page=1&limit=10
 */
router.get('/invitations', getMyInvitations);

/**
 * @route   PUT /api/worker/invitations/:id
 * @desc    Respond to invitation (accept or decline)
 * @access  Private (Labour only)
 * @params  id: string (invitation ObjectId)
 * @body    {
 *   status: 'accepted' | 'declined' (required),
 *   responseMessage?: string
 * }
 * @example PUT /api/worker/invitations/64f123456789abcdef123456
 *          Body: {
 *            "status": "accepted",
 *            "responseMessage": "Thank you for the invitation. I'm excited to work on this project."
 *          }
 */
router.put('/invitations/:id', respondToInvitation);

// ================================
// DASHBOARD & UTILITY ROUTES
// ================================

/**
 * @route   GET /api/worker/dashboard
 * @desc    Get worker dashboard statistics
 * @access  Private (Labour only)
 * @returns {
 *   applications: { pending: number, approved: number, rejected: number, total: number },
 *   invitations: { pending: number, accepted: number, declined: number, expired: number },
 *   jobFeed: { totalOpenJobs: number },
 *   profile: { availabilityStatus: string, skills: string[], profileComplete: boolean }
 * }
 */
router.get('/dashboard', getWorkerDashboard);

/**
 * @route   GET /api/worker/jobs/:id
 * @desc    Get detailed information about a specific job
 * @access  Private (Labour only)
 * @params  id: string (schedule ObjectId)
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const Schedule = require('../models/schedule.model');
    const Application = require('../models/application.model');
    const Invitation = require('../models/invitation.model');

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      status: 'open',
      startDate: { $gte: new Date() }
    }).populate('hhmId', 'name email phone companyName');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer available'
      });
    }

    // Check if worker has applied or has invitation
    const [existingApplication, existingInvitation] = await Promise.all([
      Application.findOne({ workerId: req.user._id, scheduleId: req.params.id }),
      Invitation.findOne({ workerId: req.user._id, scheduleId: req.params.id })
    ]);

    const jobDetails = {
      ...schedule.toObject(),
      applicationStatus: existingApplication?.status || null,
      invitationStatus: existingInvitation?.status || null,
      canApply: schedule.canWorkerApply() && !existingApplication,
      spotsRemaining: schedule.workerCount - schedule.acceptedWorkersCount,
      hasApplied: !!existingApplication,
      hasInvitation: !!existingInvitation
    };

    res.status(200).json({
      success: true,
      data: jobDetails
    });

  } catch (error) {
    console.error('❌ Error getting job details:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job details',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/worker/applications/:id
 * @desc    Withdraw/cancel a pending application
 * @access  Private (Labour only)
 * @params  id: string (application ObjectId)
 */
router.delete('/applications/:id', async (req, res) => {
  try {
    const Application = require('../models/application.model');

    const application = await Application.findOne({
      _id: req.params.id,
      workerId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    // Only allow withdrawal of pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending applications'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Update schedule applications count
    const Schedule = require('../models/schedule.model');
    await Schedule.findByIdAndUpdate(
      application.scheduleId,
      { $inc: { applicationsCount: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('❌ Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/worker/jobs/recommendations
 * @desc    Get job recommendations based on worker's skills and profile
 * @access  Private (Labour only)
 * @query   limit?: number (default: 10)
 */
router.get('/jobs/recommendations', async (req, res) => {
  try {
    const Schedule = require('../models/schedule.model');
    const Profile = require('../models/profile.model');
    const { limit = 10 } = req.query;

    // Get worker's profile to understand skills and preferences
    const workerProfile = await Profile.findOne({ userId: req.user._id });
    
    if (!workerProfile || !workerProfile.skills || workerProfile.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please update your profile with skills to get personalized recommendations'
      });
    }

    // Find schedules that match worker's skills
    const recommendations = await Schedule.find({
      status: 'open',
      startDate: { $gte: new Date() },
      requiredSkills: { $in: workerProfile.skills.map(skill => new RegExp(skill, 'i')) }
    })
      .populate('hhmId', 'name email phone companyName')
      .sort({ wageOffered: -1, createdAt: -1 }) // Sort by wage and recency
      .limit(parseInt(limit));

    // Check application status for each recommendation
    const Application = require('../models/application.model');
    const workerApplications = await Application.find({
      workerId: req.user._id,
      scheduleId: { $in: recommendations.map(s => s._id) }
    }).select('scheduleId status');

    const applicationMap = {};
    workerApplications.forEach(app => {
      applicationMap[app.scheduleId.toString()] = app.status;
    });

    const enhancedRecommendations = recommendations.map(schedule => {
      const scheduleObj = schedule.toObject();
      scheduleObj.applicationStatus = applicationMap[schedule._id.toString()] || null;
      scheduleObj.canApply = schedule.canWorkerApply() && !applicationMap[schedule._id.toString()];
      scheduleObj.matchingSkills = schedule.requiredSkills.filter(skill => 
        workerProfile.skills.some(workerSkill => 
          workerSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(workerSkill.toLowerCase())
        )
      );
      scheduleObj.skillMatchScore = scheduleObj.matchingSkills.length / schedule.requiredSkills.length;
      
      return scheduleObj;
    });

    res.status(200).json({
      success: true,
      data: enhancedRecommendations,
      message: `Found ${enhancedRecommendations.length} job recommendations based on your skills`,
      workerSkills: workerProfile.skills
    });

  } catch (error) {
    console.error('❌ Error getting job recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job recommendations',
      error: error.message
    });
  }
});

module.exports = router;