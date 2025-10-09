const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const Invitation = require('../models/invitation.model');
const Profile = require('../models/profile.model');

/**
 * @desc    Get job feed - all open schedules available for application
 * @route   GET /api/worker/jobs
 * @access  Private (Labour only)
 */
const getJobFeed = async (req, res) => {
  try {
    console.log('📋 Getting job feed for worker:', req.user._id);
    
    const { 
      skills, 
      location, 
      minWage, 
      maxWage,
      startDate,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query for open schedules
    const query = { 
      status: 'open',
      startDate: { $gte: new Date() } // Only future schedules
    };

    // Add filters if provided
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      query.requiredSkills = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    if (minWage || maxWage) {
      query.wageOffered = {};
      if (minWage) query.wageOffered.$gte = parseFloat(minWage);
      if (maxWage) query.wageOffered.$lte = parseFloat(maxWage);
    }

    if (startDate) {
      query.startDate.$gte = new Date(startDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get schedules
    const schedules = await Schedule.find(query)
      .populate('hhmId', 'name email phone companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Schedule.countDocuments(query);

    // Check if worker has already applied to these schedules
    const workerApplications = await Application.find({
      workerId: req.user._id,
      scheduleId: { $in: schedules.map(s => s._id) }
    }).select('scheduleId status');

    const applicationMap = {};
    workerApplications.forEach(app => {
      applicationMap[app.scheduleId.toString()] = app.status;
    });

    // Check if worker has invitations for these schedules
    const workerInvitations = await Invitation.find({
      workerId: req.user._id,  
      scheduleId: { $in: schedules.map(s => s._id) }
    }).select('scheduleId status');

    const invitationMap = {};
    workerInvitations.forEach(inv => {
      invitationMap[inv.scheduleId.toString()] = inv.status;
    });

    // Enhance schedule data with application status
    const enhancedSchedules = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      scheduleObj.applicationStatus = applicationMap[schedule._id.toString()] || null;
      scheduleObj.invitationStatus = invitationMap[schedule._id.toString()] || null;
      scheduleObj.canApply = schedule.canWorkerApply() && !applicationMap[schedule._id.toString()];
      scheduleObj.spotsRemaining = schedule.workerCount - schedule.acceptedWorkersCount;
      
      return scheduleObj;
    });

    console.log(`✅ Found ${schedules.length} job opportunities for worker`);

    res.status(200).json({
      success: true,
      data: enhancedSchedules,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: enhancedSchedules.length,
        totalRecords: total
      },
      filters: {
        skills: skills ? (Array.isArray(skills) ? skills : skills.split(',')) : null,
        location: location || null,
        wageRange: {
          min: minWage || null,
          max: maxWage || null
        },
        startDate: startDate || null
      }
    });

  } catch (error) {
    console.error('❌ Error getting job feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job feed',
      error: error.message
    });
  }
};

/**
 * @desc    Apply for a job schedule
 * @route   POST /api/worker/applications
 * @access  Private (Labour only)
 */
const applyForJob = async (req, res) => {
  try {
    console.log('📝 Worker applying for job:', req.user._id);
    
    const {
      scheduleId,
      applicationMessage,
      workerSkills,
      experience,
      expectedWage,
      availability
    } = req.body;

    // Validate required fields
    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      });
    }

    if (!workerSkills || !Array.isArray(workerSkills) || workerSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Worker skills must be provided as a non-empty array'
      });
    }

    // Find the schedule
    const schedule = await Schedule.findById(scheduleId).populate('hhmId');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if schedule is still open and accepting applications
    if (!schedule.canWorkerApply()) {
      return res.status(400).json({
        success: false,
        message: 'This schedule is no longer accepting applications'
      });
    }

    // Check if worker has already applied
    const existingApplication = await Application.findOne({
      workerId: req.user._id,
      scheduleId: scheduleId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Get worker's profile for additional validation
    const workerProfile = await Profile.findOne({ userId: req.user._id });
    
    if (!workerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before applying for jobs'
      });
    }

    // Check worker availability status
    if (workerProfile.availabilityStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'You must be available to apply for jobs. Update your availability status in your profile.'
      });
    }

    // Create application
    const application = await Application.create({
      workerId: req.user._id,
      scheduleId: scheduleId,
      hhmId: schedule.hhmId._id,
      applicationMessage: applicationMessage || '',
      workerSkills: workerSkills,
      experience: experience || '',
      expectedWage: expectedWage || null,
      availability: availability || 'flexible'
    });

    // Populate the created application
    await application.populate([
      { path: 'workerId', select: 'name email phone' },
      { path: 'scheduleId', select: 'title startDate wageOffered location requiredSkills' },
      { path: 'hhmId', select: 'name email phone companyName' }
    ]);

    console.log('✅ Application submitted successfully:', application._id);

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error applying for job:', error);
    
    // Handle duplicate application error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

/**
 * @desc    Get worker's own applications
 * @route   GET /api/worker/applications
 * @access  Private (Labour only)
 */
const getMyApplications = async (req, res) => {
  try {
    console.log('📋 Getting applications for worker:', req.user._id);
    
    const { 
      status, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { workerId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications
    const applications = await Application.find(query)
      .populate('scheduleId', 'title startDate endDate wageOffered location status requiredSkills workerCount acceptedWorkersCount')
      .populate('hhmId', 'name email phone companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    console.log(`✅ Found ${applications.length} applications for worker`);

    // Transform applications for better frontend consumption
    const enhancedApplications = applications.map(app => ({
      _id: app._id,
      applicationId: app._id,
      status: app.status,
      applicationMessage: app.applicationMessage,
      workerSkills: app.workerSkills,
      experience: app.experience,
      expectedWage: app.expectedWage,
      availability: app.availability,
      reviewedAt: app.reviewedAt,
      reviewNotes: app.reviewNotes,
      appliedAt: app.createdAt,
      daysSinceApplication: app.daysSinceApplication,
      isReviewed: app.isReviewed,
      schedule: {
        id: app.scheduleId._id,
        title: app.scheduleId.title,
        startDate: app.scheduleId.startDate,
        endDate: app.scheduleId.endDate,
        wageOffered: app.scheduleId.wageOffered,
        location: app.scheduleId.location,
        status: app.scheduleId.status,
        requiredSkills: app.scheduleId.requiredSkills,
        totalSpots: app.scheduleId.workerCount,
        filledSpots: app.scheduleId.acceptedWorkersCount,
        spotsRemaining: app.scheduleId.workerCount - app.scheduleId.acceptedWorkersCount
      },
      hhm: {
        id: app.hhmId._id,
        name: app.hhmId.name,
        email: app.hhmId.email,
        phone: app.hhmId.phone,
        companyName: app.hhmId.companyName
      }
    }));

    res.status(200).json({
      success: true,
      data: enhancedApplications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: enhancedApplications.length,
        totalRecords: total
      },
      summary: {
        pending: await Application.countDocuments({ workerId: req.user._id, status: 'pending' }),
        approved: await Application.countDocuments({ workerId: req.user._id, status: 'approved' }),
        rejected: await Application.countDocuments({ workerId: req.user._id, status: 'rejected' })
      }
    });

  } catch (error) {
    console.error('❌ Error getting worker applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving applications',
      error: error.message
    });
  }
};

/**
 * @desc    Get worker's invitations
 * @route   GET /api/worker/invitations
 * @access  Private (Labour only)
 */
const getMyInvitations = async (req, res) => {
  try {
    console.log('📨 Getting invitations for worker:', req.user._id);
    
    const { 
      status, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { workerId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get invitations
    const invitations = await Invitation.find(query)
      .populate('scheduleId', 'title startDate endDate wageOffered location status requiredSkills workerCount acceptedWorkersCount')
      .populate('hhmId', 'name email phone companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invitation.countDocuments(query);

    console.log(`✅ Found ${invitations.length} invitations for worker`);

    // Transform invitations for better frontend consumption
    const enhancedInvitations = invitations.map(inv => ({
      _id: inv._id,
      invitationId: inv._id,
      status: inv.status,
      personalMessage: inv.personalMessage,
      offeredWage: inv.offeredWage,
      priority: inv.priority,
      expiresAt: inv.expiresAt,
      isExpired: inv.isExpired,
      daysUntilExpiration: inv.daysUntilExpiration,
      respondedAt: inv.respondedAt,
      responseMessage: inv.responseMessage,
      invitationReason: inv.invitationReason,
      workerRating: inv.workerRating,
      invitedAt: inv.createdAt,
      responseTimeHours: inv.responseTimeHours,
      isResponded: inv.isResponded,
      schedule: {
        id: inv.scheduleId._id,
        title: inv.scheduleId.title,
        startDate: inv.scheduleId.startDate,
        endDate: inv.scheduleId.endDate,
        wageOffered: inv.scheduleId.wageOffered,
        location: inv.scheduleId.location,
        status: inv.scheduleId.status,
        requiredSkills: inv.scheduleId.requiredSkills,
        totalSpots: inv.scheduleId.workerCount,
        filledSpots: inv.scheduleId.acceptedWorkersCount,
        spotsRemaining: inv.scheduleId.workerCount - inv.scheduleId.acceptedWorkersCount
      },
      hhm: {
        id: inv.hhmId._id,
        name: inv.hhmId.name,
        email: inv.hhmId.email,
        phone: inv.hhmId.phone,
        companyName: inv.hhmId.companyName
      }
    }));

    res.status(200).json({
      success: true,
      data: enhancedInvitations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: enhancedInvitations.length,
        totalRecords: total
      },
      summary: {
        pending: await Invitation.countDocuments({ workerId: req.user._id, status: 'pending' }),
        accepted: await Invitation.countDocuments({ workerId: req.user._id, status: 'accepted' }),
        declined: await Invitation.countDocuments({ workerId: req.user._id, status: 'declined' }),
        expired: await Invitation.countDocuments({ 
          workerId: req.user._id, 
          status: 'pending',
          expiresAt: { $lt: new Date() }
        })
      }
    });

  } catch (error) {
    console.error('❌ Error getting worker invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invitations',
      error: error.message
    });
  }
};

/**
 * @desc    Respond to invitation (accept or decline)
 * @route   PUT /api/worker/invitations/:id
 * @access  Private (Labour only)
 */
const respondToInvitation = async (req, res) => {
  try {
    console.log('💌 Worker responding to invitation:', req.params.id);
    
    const { status, responseMessage } = req.body;

    // Validate status
    if (!status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either accepted or declined'
      });
    }

    // Find invitation
    const invitation = await Invitation.findOne({
      _id: req.params.id,
      workerId: req.user._id
    }).populate('scheduleId hhmId');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or unauthorized'
      });
    }

    // Check if invitation is already responded to
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been responded to'
      });
    }

    // Check if invitation is expired
    if (invitation.isExpired) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired'
      });
    }

    // If accepting, check if schedule still has available spots
    if (status === 'accepted') {
      const schedule = invitation.scheduleId;
      if (!schedule.canWorkerApply()) {
        return res.status(400).json({
          success: false,
          message: 'This job is no longer available or accepting workers'
        });
      }

      // Check worker availability
      const workerProfile = await Profile.findOne({ userId: req.user._id });
      if (workerProfile && workerProfile.availabilityStatus !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'You must be available to accept invitations. Update your availability status.'
        });
      }

      // Check for scheduling conflicts (basic implementation)
      const conflictingAcceptedInvitations = await Invitation.countDocuments({
        workerId: req.user._id,
        status: 'accepted',
        scheduleId: { $ne: invitation.scheduleId._id }
      });

      const conflictingApprovedApplications = await Application.countDocuments({
        workerId: req.user._id,
        status: 'approved',
        scheduleId: { $ne: invitation.scheduleId._id }
      });

      if (conflictingAcceptedInvitations > 0 || conflictingApprovedApplications > 0) {
        console.log('⚠️ Potential scheduling conflict detected, but allowing acceptance');
      }
    }

    // Update invitation status
    if (status === 'accepted') {
      await invitation.accept(responseMessage);
    } else {
      await invitation.decline(responseMessage);
    }

    // Populate the updated invitation
    await invitation.populate([
      { path: 'scheduleId', select: 'title startDate wageOffered location' },
      { path: 'hhmId', select: 'name email phone companyName' }
    ]);

    console.log(`✅ Invitation ${status} successfully`);

    res.status(200).json({
      success: true,
      data: invitation,
      message: `Invitation ${status} successfully`
    });

  } catch (error) {
    console.error('❌ Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Get worker dashboard statistics
 * @route   GET /api/worker/dashboard
 * @access  Private (Labour only)
 */
const getWorkerDashboard = async (req, res) => {
  try {
    console.log('📊 Getting dashboard for worker:', req.user._id);

    // Get application statistics
    const [pendingApps, approvedApps, rejectedApps] = await Promise.all([
      Application.countDocuments({ workerId: req.user._id, status: 'pending' }),
      Application.countDocuments({ workerId: req.user._id, status: 'approved' }),
      Application.countDocuments({ workerId: req.user._id, status: 'rejected' })
    ]);

    // Get invitation statistics
    const [pendingInvites, acceptedInvites, declinedInvites, expiredInvites] = await Promise.all([
      Invitation.countDocuments({ workerId: req.user._id, status: 'pending' }),
      Invitation.countDocuments({ workerId: req.user._id, status: 'accepted' }),
      Invitation.countDocuments({ workerId: req.user._id, status: 'declined' }),
      Invitation.countDocuments({ 
        workerId: req.user._id, 
        status: 'pending',
        expiresAt: { $lt: new Date() }
      })
    ]);

    // Get job feed statistics
    const totalOpenJobs = await Schedule.countDocuments({ 
      status: 'open',
      startDate: { $gte: new Date() }
    });

    // Get worker profile
    const workerProfile = await Profile.findOne({ userId: req.user._id });

    const dashboardData = {
      applications: {
        pending: pendingApps,
        approved: approvedApps,
        rejected: rejectedApps,
        total: pendingApps + approvedApps + rejectedApps
      },
      invitations: {
        pending: pendingInvites,
        accepted: acceptedInvites,
        declined: declinedInvites,
        expired: expiredInvites,
        total: pendingInvites + acceptedInvites + declinedInvites
      },
      jobFeed: {
        totalOpenJobs: totalOpenJobs
      },
      profile: {
        availabilityStatus: workerProfile?.availabilityStatus || 'unknown',
        skills: workerProfile?.skills || [],
        skillCount: workerProfile?.skills?.length || 0,
        profileComplete: !!(workerProfile?.skills?.length && workerProfile?.farmLocation)
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting worker dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics',
      error: error.message
    });
  }
};

module.exports = {
  // Job feed
  getJobFeed,
  
  // Application workflow
  applyForJob,
  getMyApplications,
  
  // Invitation workflow
  getMyInvitations,
  respondToInvitation,
  
  // Dashboard
  getWorkerDashboard
};