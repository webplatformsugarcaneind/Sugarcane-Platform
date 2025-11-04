const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const Invitation = require('../models/invitation.model');

/**
 * @desc    Create a new job schedule
 * @route   POST /api/hhm/schedules
 * @access  Private (HHM only)
 */
const createSchedule = async (req, res) => {
  try {
    console.log('📅 Creating new schedule for HHM:', req.user._id);
    
    const {
      requiredSkills,
      workerCount,
      wageOffered,
      startDate,
      title,
      description,
      location,
      endDate
    } = req.body;

    // Validate required fields
    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Required skills must be provided as a non-empty array'
      });
    }

    if (!workerCount || workerCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Worker count must be at least 1'
      });
    }

    if (!wageOffered || wageOffered < 0) {
      return res.status(400).json({
        success: false,
        message: 'Wage offered must be a positive number'
      });
    }

    if (!startDate || new Date(startDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be in the future'
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      hhmId: req.user._id,
      requiredSkills,
      workerCount,
      wageOffered,
      startDate,
      title,
      description,
      location,
      endDate
    });

    await schedule.populate('hhmId', 'name email phone');

    console.log('✅ Schedule created successfully:', schedule._id);

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Get all schedules for the logged-in HHM
 * @route   GET /api/hhm/schedules
 * @access  Private (HHM only)
 */
const getMySchedules = async (req, res) => {
  try {
    console.log('📋 Getting schedules for HHM:', req.user._id);
    
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { hhmId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get schedules with pagination
    const schedules = await Schedule.find(query)
      .populate('hhmId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Schedule.countDocuments(query);

    console.log(`✅ Found ${schedules.length} schedules for HHM`);

    res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: schedules.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('❌ Error getting schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving schedules',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single schedule by ID
 * @route   GET /api/hhm/schedules/:id
 * @access  Private (HHM only)
 */
const getScheduleById = async (req, res) => {
  try {
    console.log('🔍 Getting schedule:', req.params.id);
    
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      hhmId: req.user._id
    }).populate('hhmId', 'name email phone');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    console.log('✅ Schedule found:', schedule._id);

    res.status(200).json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('❌ Error getting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Update a schedule
 * @route   PUT /api/hhm/schedules/:id
 * @access  Private (HHM only)
 */
const updateSchedule = async (req, res) => {
  try {
    console.log('✏️ Updating schedule:', req.params.id);
    
    const {
      requiredSkills,
      workerCount,
      wageOffered,
      startDate,
      title,
      description,
      location,
      endDate,
      status
    } = req.body;

    // Find schedule
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

    // Prevent updating closed schedules
    if (schedule.status === 'closed' && status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update closed schedule except to reopen it'
      });
    }

    // Validate fields if provided
    if (requiredSkills && (!Array.isArray(requiredSkills) || requiredSkills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Required skills must be a non-empty array'
      });
    }

    if (workerCount && workerCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Worker count must be at least 1'
      });
    }

    if (wageOffered && wageOffered < 0) {
      return res.status(400).json({
        success: false,
        message: 'Wage offered must be a positive number'
      });
    }

    if (startDate && new Date(startDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be in the future'
      });
    }

    // Update fields
    const updateFields = {};
    if (requiredSkills) updateFields.requiredSkills = requiredSkills;
    if (workerCount) updateFields.workerCount = workerCount;
    if (wageOffered) updateFields.wageOffered = wageOffered;
    if (startDate) updateFields.startDate = startDate;
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (location) updateFields.location = location;
    if (endDate) updateFields.endDate = endDate;
    if (status) updateFields.status = status;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('hhmId', 'name email phone');

    console.log('✅ Schedule updated successfully:', updatedSchedule._id);

    res.status(200).json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a schedule
 * @route   DELETE /api/hhm/schedules/:id
 * @access  Private (HHM only)
 */
const deleteSchedule = async (req, res) => {
  try {
    console.log('🗑️ Deleting schedule:', req.params.id);
    
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

    // Check if there are accepted applications
    const acceptedApplications = await Application.countDocuments({
      scheduleId: req.params.id,
      status: 'approved'
    });

    if (acceptedApplications > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete schedule with approved applications. Close the schedule instead.'
      });
    }

    // Delete the schedule
    await Schedule.findByIdAndDelete(req.params.id);

    // Also delete related applications and invitations
    await Application.deleteMany({ scheduleId: req.params.id });
    
    // Import Invitation model dynamically to avoid circular dependency
    const Invitation = require('../models/invitation.model');
    await Invitation.deleteMany({ scheduleId: req.params.id });

    console.log('✅ Schedule deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Schedule and related data deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Get available workers directory
 * @route   GET /api/hhm/workers
 * @access  Private (HHM only)
 */
const getWorkers = async (req, res) => {
  try {
    console.log('👥 Getting workers directory for HHM:', req.user._id);
    
    const { 
      skills, 
      availabilityStatus, 
      page = 1, 
      limit = 20,
      location,
      experience 
    } = req.query;

    // Build query for users with Worker role (updated from 'Labour')
    const userQuery = { role: 'Worker' };

    // Get worker user IDs
    const workers = await User.find(userQuery).select('_id');
    const workerIds = workers.map(worker => worker._id);
    
    console.log('👤 Found', workers.length, 'users with Worker role');

    // Build profile query
    const profileQuery = { 
      userId: { $in: workerIds }
    };

    // Add availabilityStatus filter - default to 'available' if not specified
    if (availabilityStatus) {
      profileQuery.availabilityStatus = availabilityStatus;
      console.log('🔍 Filtering by availabilityStatus:', availabilityStatus);
    } else {
      // Default to showing only available workers
      profileQuery.availabilityStatus = 'available';
      console.log('🔍 Default filter: showing only available workers');
    }

    // Add skills filter if provided
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      profileQuery.skills = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }

    // Add location filter if provided
    if (location) {
      profileQuery.farmLocation = new RegExp(location, 'i');
    }

    // Add experience filter if provided
    if (experience) {
      profileQuery.farmingExperience = { $gte: parseInt(experience) };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get worker profiles with pagination and populate user information
    const workerProfiles = await Profile.find(profileQuery)
      .populate('userId', 'name email phone createdAt')
      .sort({ 'userId.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Profile.countDocuments(profileQuery);

    console.log(`✅ Found ${workerProfiles.length} worker profiles out of ${total} total matching criteria`);
    console.log('📋 Profile query:', JSON.stringify(profileQuery));

    // Transform data to include relevant worker information with full profile data
    const workersData = workerProfiles.map(profile => ({
      workerId: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      skills: profile.skills || [],
      availabilityStatus: profile.availabilityStatus,
      location: profile.farmLocation,
      experience: profile.farmingExperience,
      bio: profile.bio,
      profileImage: profile.profileImageUrl,
      joinedDate: profile.userId.createdAt,
      isVerified: profile.isVerified,
      // Additional profile information that might be useful for hiring decisions
      profileId: profile._id,
      rating: profile.rating || 0,
      completedJobs: profile.completedJobs || 0
    }));

    res.status(200).json({
      success: true,
      data: workersData,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: workersData.length,
        totalRecords: total
      },
      filters: {
        skills: skills ? (Array.isArray(skills) ? skills : skills.split(',')) : null,
        availabilityStatus: availabilityStatus || 'available',
        location: location || null,
        experience: experience || null
      }
    });

  } catch (error) {
    console.error('❌ Error getting workers:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving workers directory',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new invitation to directly hire a worker
 * @route   POST /api/hhm/invitations
 * @access  Private (HHM only)
 */
const createInvitation = async (req, res) => {
  try {
    console.log('📨 Creating invitation from HHM:', req.user._id);
    
    const { scheduleId, workerId, personalMessage, offeredWage, priority } = req.body;

    // Validate required fields
    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      });
    }

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required'
      });
    }

    // Verify the schedule exists and belongs to this HHM
    const schedule = await Schedule.findOne({
      _id: scheduleId,
      hhmId: req.user._id
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or you do not have permission to invite workers for this schedule'
      });
    }

    // Check if schedule is still open
    if (schedule.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send invitations for closed schedules'
      });
    }

    // Verify the worker exists and has Worker role
    const worker = await User.findOne({
      _id: workerId,
      role: 'Worker'
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found or invalid worker ID'
      });
    }

    // Check if worker has a profile and is available
    const workerProfile = await Profile.findOne({ userId: workerId });
    
    if (!workerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Worker does not have a profile. They need to complete their profile first.'
      });
    }

    if (workerProfile.availabilityStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Worker is currently ${workerProfile.availabilityStatus}. You can only invite available workers.`
      });
    }

    // Check if an invitation already exists for this worker and schedule
    const existingInvitation = await Invitation.findOne({
      workerId,
      scheduleId
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: `An invitation has already been sent to this worker for this schedule (Status: ${existingInvitation.status})`
      });
    }

    // Check if worker has already applied for this schedule
    const existingApplication = await Application.findOne({
      workerId,
      scheduleId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: `This worker has already applied for this schedule (Status: ${existingApplication.status})`
      });
    }

    // Create the invitation
    const invitation = await Invitation.create({
      workerId,
      hhmId: req.user._id,
      scheduleId,
      personalMessage: personalMessage || '',
      offeredWage: offeredWage || schedule.wageOffered,
      priority: priority || 'medium'
    });

    // Populate the created invitation with full details
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('workerId', 'name email phone')
      .populate('scheduleId', 'title startDate endDate wageOffered location requiredSkills')
      .populate('hhmId', 'name email phone companyName');

    console.log('✅ Invitation created successfully:', invitation._id);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: populatedInvitation._id,
        worker: {
          id: populatedInvitation.workerId._id,
          name: populatedInvitation.workerId.name,
          email: populatedInvitation.workerId.email,
          phone: populatedInvitation.workerId.phone
        },
        schedule: {
          id: populatedInvitation.scheduleId._id,
          title: populatedInvitation.scheduleId.title,
          startDate: populatedInvitation.scheduleId.startDate,
          endDate: populatedInvitation.scheduleId.endDate,
          location: populatedInvitation.scheduleId.location,
          wageOffered: populatedInvitation.scheduleId.wageOffered
        },
        status: populatedInvitation.status,
        offeredWage: populatedInvitation.offeredWage,
        priority: populatedInvitation.priority,
        personalMessage: populatedInvitation.personalMessage,
        expiresAt: populatedInvitation.expiresAt,
        createdAt: populatedInvitation.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error creating invitation:', error);
    
    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An invitation for this worker and schedule already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Get applications for HHM's schedules
 * @route   GET /api/hhm/applications
 * @access  Private (HHM only)
 */
const getApplications = async (req, res) => {
  try {
    console.log('📋 Getting applications for HHM:', req.user._id);
    
    const { 
      status, 
      scheduleId, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query - CRITICAL: Only get applications where HHM owns the schedule
    // Using req.user._id to ensure HHM can only see their own applications
    const query = { hhmId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (scheduleId) {
      query.scheduleId = scheduleId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications with populated worker and schedule data
    // CRITICAL: Using .populate() to explicitly select only needed fields
    // This ensures worker name and email are included in the response
    const applications = await Application.find(query)
      .populate('workerId', 'name email')
      .populate('scheduleId', 'title requiredSkills wageOffered')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    console.log(`✅ Found ${applications.length} applications for HHM`);

    // Enhance application data with worker profile information
    const enhancedApplications = await Promise.all(
      applications.map(async (app) => {
        const workerProfile = await Profile.findOne({ userId: app.workerId._id });
        
        return {
          _id: app._id,
          applicationId: app._id,
          worker: {
            id: app.workerId._id,
            name: app.workerId.name,
            username: app.workerId.username || app.workerId.email?.split('@')[0] || 'unknown',
            email: app.workerId.email,
            phone: app.workerId.phone,
            skills: workerProfile?.skills || [],
            availabilityStatus: workerProfile?.availabilityStatus || 'unknown',
            experience: workerProfile?.farmingExperience || 0,
            profileImage: workerProfile?.profileImageUrl || '/uploads/profiles/default.jpg'
          },
          schedule: {
            id: app.scheduleId._id,
            title: app.scheduleId.title,
            jobType: app.scheduleId.workType || 'general', // Include jobType/workType
            workType: app.scheduleId.workType,
            startDate: app.scheduleId.startDate,
            endDate: app.scheduleId.endDate,
            wageOffered: app.scheduleId.wageOffered,
            workerCount: app.scheduleId.workerCount,
            location: app.scheduleId.location,
            requiredSkills: app.scheduleId.requiredSkills,
            status: app.scheduleId.status
          },
          status: app.status,
          applicationMessage: app.applicationMessage,
          workerSkills: app.workerSkills || [],
          experience: app.experience,
          expectedWage: app.expectedWage,
          availability: app.availability,
          reviewedAt: app.reviewedAt,
          reviewNotes: app.reviewNotes,
          appliedAt: app.createdAt,
          daysSinceApplication: app.daysSinceApplication
        };
      })
    );

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
        pending: await Application.countDocuments({ hhmId: req.user._id, status: 'pending' }),
        approved: await Application.countDocuments({ hhmId: req.user._id, status: 'approved' }),
        rejected: await Application.countDocuments({ hhmId: req.user._id, status: 'rejected' })
      }
    });

  } catch (error) {
    console.error('❌ Error getting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving applications',
      error: error.message
    });
  }
};

/**
 * @desc    Update application status (approve/reject)
 * @route   PUT /api/hhm/applications/:id
 * @access  Private (HHM only)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    console.log('✏️ Updating application status:', req.params.id);
    console.log('📝 Request by HHM:', req.user._id);
    
    const { status, reviewNotes } = req.body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    // Find application by ID first (without filtering by hhmId yet)
    const application = await Application.findById(req.params.id)
      .populate('scheduleId', 'title workType workerCount acceptedWorkersCount status hhmId')
      .populate('workerId', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // CRITICAL SECURITY CHECK: Verify HHM owns this application's schedule
    // Compare the application's hhmId with the logged-in user's ID
    if (application.hhmId.toString() !== req.user._id.toString()) {
      console.log('⚠️ Unauthorized access attempt:');
      console.log('   Application hhmId:', application.hhmId.toString());
      console.log('   Request user ID:', req.user._id.toString());
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this application\'s job schedule.'
      });
    }

    console.log('✅ Security check passed - HHM owns this application');

    // Check if application is already reviewed
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application has already been ${application.status}. Cannot change status.`
      });
    }

    // If approving, check if schedule still has available spots
    if (status === 'approved') {
      const schedule = application.scheduleId;
      
      // Check if schedule is still open
      if (schedule.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Schedule is closed. Cannot approve applications for closed schedules.'
        });
      }

      // Check available worker slots
      const acceptedCount = schedule.acceptedWorkersCount || 0;
      if (acceptedCount >= schedule.workerCount) {
        return res.status(400).json({
          success: false,
          message: `Schedule is already full (${acceptedCount}/${schedule.workerCount} workers accepted). Cannot approve more applications.`
        });
      }

      console.log(`✅ Schedule has space: ${acceptedCount + 1}/${schedule.workerCount} workers`);
    }

    // Update application status using instance methods
    if (status === 'approved') {
      await application.approve(reviewNotes);
    } else {
      await application.reject(reviewNotes);
    }

    // Re-populate the updated application for response
    await application.populate([
      { path: 'workerId', select: 'name email phone username' },
      { path: 'scheduleId', select: 'title workType startDate endDate wageOffered workerCount location requiredSkills status' },
      { path: 'hhmId', select: 'name email phone' }
    ]);

    console.log(`✅ Application ${status} successfully for worker: ${application.workerId.name}`);

    res.status(200).json({
      success: true,
      data: application,
      message: `Application ${status} successfully`
    });

  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

/**
 * @desc    Get HHM profile
 * @route   GET /api/hhm/profile
 * @access  Private (HHM only)
 */
const getProfile = async (req, res) => {
  try {
    console.log('👤 getProfile called for HHM user:', req.user?._id);

    // The user is already attached to req.user by the protect middleware
    const hhm = req.user;

    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM profile not found'
      });
    }

    // Format profile data specific to HHM users
    const profileData = {
      _id: hhm._id,
      name: hhm.name,
      username: hhm.username,
      email: hhm.email,
      phone: hhm.phone,
      role: hhm.role,
      // HHM-specific fields
      managementExperience: hhm.managementExperience,
      teamSize: hhm.teamSize,
      managementOperations: hhm.managementOperations,
      servicesOffered: hhm.servicesOffered,
      location: hhm.location,
      isActive: hhm.isActive,
      createdAt: hhm.createdAt,
      updatedAt: hhm.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'HHM profile retrieved successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving HHM profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update HHM profile
 * @route   PUT /api/hhm/profile
 * @access  Private (HHM only)
 */
const updateProfile = async (req, res) => {
  try {
    console.log('🔄 updateProfile called for HHM user:', req.user?._id);

    const hhmId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via profile
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;

    // Update HHM profile
    const updatedHHM = await User.findByIdAndUpdate(
      hhmId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!updatedHHM) {
      return res.status(404).json({
        success: false,
        message: 'HHM profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'HHM profile updated successfully',
      profile: updatedHHM
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating HHM profile',
      error: error.message
    });
  }
};

module.exports = {
  // Schedule management
  createSchedule,
  getMySchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  
  // Worker directory
  getWorkers,
  
  // Invitation management
  createInvitation,
  
  // Application management
  getApplications,
  updateApplicationStatus,
  
  // Profile management
  getProfile,
  updateProfile
};