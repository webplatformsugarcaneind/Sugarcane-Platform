const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const Profile = require('../models/profile.model');
const User = require('../models/user.model');

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
      availabilityStatus = 'available', 
      page = 1, 
      limit = 20,
      location,
      experience 
    } = req.query;

    // Build query for users with Worker role
    const userQuery = { role: 'Worker' };

    // Get worker user IDs
    const workers = await User.find(userQuery).select('_id');
    const workerIds = workers.map(worker => worker._id);

    // Build profile query
    const profileQuery = { 
      userId: { $in: workerIds },
      availabilityStatus: availabilityStatus
    };

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

    // Get worker profiles with pagination
    const workerProfiles = await Profile.find(profileQuery)
      .populate('userId', 'name email phone createdAt')
      .sort({ 'userId.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Profile.countDocuments(profileQuery);

    console.log(`✅ Found ${workerProfiles.length} workers matching criteria`);

    // Transform data to include relevant worker information
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
      isVerified: profile.isVerified
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
        availabilityStatus,
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

    // Build query
    const query = { hhmId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (scheduleId) {
      query.scheduleId = scheduleId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications with populated data
    const applications = await Application.find(query)
      .populate('workerId', 'name email phone')
      .populate('scheduleId', 'title startDate wageOffered workerCount location requiredSkills')
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
            startDate: app.scheduleId.startDate,
            wageOffered: app.scheduleId.wageOffered,
            workerCount: app.scheduleId.workerCount,
            location: app.scheduleId.location,
            requiredSkills: app.scheduleId.requiredSkills
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
    
    const { status, reviewNotes } = req.body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    // Find application
    const application = await Application.findOne({
      _id: req.params.id,
      hhmId: req.user._id
    }).populate('scheduleId workerId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    // Check if application is already reviewed
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed'
      });
    }

    // If approving, check if schedule still has available spots
    if (status === 'approved') {
      const schedule = application.scheduleId;
      if (schedule.acceptedWorkersCount >= schedule.workerCount) {
        return res.status(400).json({
          success: false,
          message: 'Schedule is already full. Cannot approve more applications.'
        });
      }

      // Check if schedule is still open
      if (schedule.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Schedule is closed. Cannot approve applications.'
        });
      }
    }

    // Update application status
    if (status === 'approved') {
      await application.approve(reviewNotes);
    } else {
      await application.reject(reviewNotes);
    }

    // Populate the updated application
    await application.populate('workerId scheduleId');

    console.log(`✅ Application ${status} successfully`);

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
  
  // Application management
  getApplications,
  updateApplicationStatus,
  
  // Profile management
  getProfile,
  updateProfile
};