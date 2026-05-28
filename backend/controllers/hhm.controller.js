const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const Invitation = require('../models/invitation.model');
const { createNotification } = require('../utils/notification.util');

/**
 * @desc    Create a new job schedule
 * @route   POST /api/hhm/schedules
 * @access  Private (HHM only)
 */
const createSchedule = async (req, res) => {
  try {
    console.log(' Creating new schedule for HHM:', req.user._id);

    const {
      requiredSkills,
      labourCount,
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

    if (!labourCount || labourCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Labour count must be at least 1'
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
      labourCount,
      wageOffered,
      startDate,
      title,
      description,
      location,
      endDate
    });

    await schedule.populate('hhmId', 'name email phone');

    console.log(' Schedule created successfully:', schedule._id);

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully'
    });

  } catch (error) {
    console.error(' Error creating schedule:', error);
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
    console.log(' Getting schedules for HHM:', req.user._id);

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

    console.log(` Found ${schedules.length} schedules for HHM`);

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
    console.error(' Error getting schedules:', error);
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
    console.log(' Getting schedule:', req.params.id);

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

    console.log(' Schedule found:', schedule._id);

    res.status(200).json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error(' Error getting schedule:', error);
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
    console.log(' Updating schedule:', req.params.id);

    const {
      requiredSkills,
      labourCount,
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

    if (labourCount && labourCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Labour count must be at least 1'
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
    if (labourCount) updateFields.labourCount = labourCount;
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

    console.log(' Schedule updated successfully:', updatedSchedule._id);

    res.status(200).json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule updated successfully'
    });

  } catch (error) {
    console.error(' Error updating schedule:', error);
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
    console.log(' Deleting schedule:', req.params.id);

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

    console.log(' Schedule deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Schedule and related data deleted successfully'
    });

  } catch (error) {
    console.error(' Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Get available labour directory
 * @route   GET /api/hhm/labours
 * @access  Private (HHM only)
 */
const getLabours = async (req, res) => {
  try {
    console.log(' Getting labour directory for HHM:', req.user._id);

    const {
      skills,
      availabilityStatus,
      page = 1,
      limit = 20,
      location,
      experience
    } = req.query;

    // Build query for users with Labour role
    const userQuery = { role: 'Labour' };

    // Get labour user IDs
    const labours = await User.find(userQuery).select('_id');
    const labourIds = labours.map(labour => labour._id);

    console.log(' Found', labours.length, 'users with Labour role');

    // Build profile query with exclusivity logic
    const profileQuery = {
      userId: { $in: labourIds },
      // Show labours that are either:
      // 1. Not employed by anyone (currentEmployer is null)
      // 2. Already employed by the requesting HHM
      $or: [
        { currentEmployer: null },
        { currentEmployer: req.user._id }
      ]
    };

    // Add availabilityStatus filter - default to 'available' if not specified
    if (availabilityStatus) {
      profileQuery.availabilityStatus = availabilityStatus;
      console.log(' Filtering by availabilityStatus:', availabilityStatus);
    } else {
      // Default to showing only available labours
      profileQuery.availabilityStatus = 'available';
      console.log(' Default filter: showing only available labours');
    }

    console.log(' Applying labour exclusivity for HHM:', req.user._id);
    console.log(' Profile query with exclusivity:', JSON.stringify(profileQuery, null, 2));

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

    // Get labour profiles with pagination and populate user information
    const labourProfiles = await Profile.find(profileQuery)
      .populate('userId', 'name email phone createdAt')
      .sort({ 'userId.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Profile.countDocuments(profileQuery);

    console.log(` Found ${labourProfiles.length} labour profiles out of ${total} total matching criteria`);
    console.log(' Profile query:', JSON.stringify(profileQuery));

    // Transform data to include relevant labour information with full profile data
    const laboursData = labourProfiles
      .filter(profile => profile && profile.userId)
      .map(profile => ({
      labourId: profile.userId._id,
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
      // Employment status information
      isEmployedByMe: profile.isEmployedBy ? profile.isEmployedBy(req.user._id) : false,
      employmentStartDate: profile.employmentStartDate,
      isCurrentEmployee: profile.currentEmployer ? profile.currentEmployer.toString() === req.user._id.toString() : false,
      // Additional profile information that might be useful for hiring decisions
      profileId: profile._id,
      rating: profile.rating || 0,
      completedJobs: profile.completedJobs || 0
    }));

    res.status(200).json({
      success: true,
      data: laboursData,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: laboursData.length,
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
    console.error(' Error getting labours:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving labour directory',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new invitation to directly hire a labour
 * @route   POST /api/hhm/invitations
 * @access  Private (HHM only)
 */
const createInvitation = async (req, res) => {
  try {
    console.log(' Creating invitation from HHM:', req.user._id);

    const { scheduleId, labourId, personalMessage, offeredWage, priority } = req.body;

    // Validate required fields
    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      });
    }

    if (!labourId) {
      return res.status(400).json({
        success: false,
        message: 'Labour ID is required'
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
        message: 'Schedule not found or you do not have permission to invite labour for this schedule'
      });
    }

    // Check if schedule is still open
    if (schedule.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send invitations for closed schedules'
      });
    }

    // Verify the labour exists and has Labour role
    const labour = await User.findOne({
      _id: labourId,
      role: 'Labour'
    });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: 'Labour not found or invalid labour ID'
      });
    }

    // Check if labour has a profile and is available
    const labourProfile = await Profile.findOne({ userId: labourId });

    if (!labourProfile) {
      return res.status(400).json({
        success: false,
        message: 'Labour does not have a profile. They need to complete their profile first.'
      });
    }

    if (labourProfile.availabilityStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Labour is currently ${labourProfile.availabilityStatus}. You can only invite available labour.`
      });
    }

    // Check if an invitation already exists for this labour and schedule
    const existingInvitation = await Invitation.findOne({
      labourId,
      scheduleId
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: `An invitation has already been sent to this labour for this schedule (Status: ${existingInvitation.status})`
      });
    }

    // Check if labour has already applied for this schedule
    const existingApplication = await Application.findOne({
      labourId,
      scheduleId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: `This labour has already applied for this schedule (Status: ${existingApplication.status})`
      });
    }

    // Create the invitation
    const invitation = await Invitation.create({
      labourId,
      hhmId: req.user._id,
      scheduleId,
      personalMessage: personalMessage || '',
      offeredWage: offeredWage || schedule.wageOffered,
      priority: priority || 'medium'
    });

    // Populate the created invitation with full details
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('labourId', 'name email phone')
      .populate('scheduleId', 'title startDate endDate wageOffered location requiredSkills')
      .populate('hhmId', 'name email phone companyName');

    console.log(' Invitation created successfully:', invitation._id);

    // Notify Labour
    await createNotification({
      senderId: req.user._id,
      receiverId: labourId,
      senderRole: 'hhm',
      receiverRole: 'labour',
      type: 'INVITATION_SENT',
      message: `You have received a job invitation from HHM ${req.user.name || 'someone'}.`,
      relatedId: invitation._id,
      relatedModel: 'Invitation'
    });

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: populatedInvitation._id,
        labour: {
          id: populatedInvitation.labourId._id,
          name: populatedInvitation.labourId.name,
          email: populatedInvitation.labourId.email,
          phone: populatedInvitation.labourId.phone
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
    console.error(' Error creating invitation:', error);

    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An invitation for this labour and schedule already exists'
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
    console.log(' Getting applications for HHM:', req.user._id);

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

    // Get applications with populated labour and schedule data
    const applications = await Application.find(query)
      .populate('labourId', 'name email username phone')
      .populate('scheduleId', 'title requiredSkills wageOffered location workType startDate endDate labourCount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    console.log(` Found ${applications.length} applications for HHM`);

    // Enhance application data with labour profile information
    let enhancedApplications = [];
    try {
      enhancedApplications = await Promise.all(
        applications.map(async (app) => {
          // Safe access to labourId and scheduleId
          if (!app.labourId || !app.scheduleId) {
            console.warn(`Skipping orphaned application ${app._id}: missing labour or schedule`);
            return null;
          }

          try {
            const labourProfile = await Profile.findOne({ userId: app.labourId._id });

            return {
              _id: app._id,
              applicationId: app._id,
              labour: {
                id: app.labourId._id,
                name: app.labourId.name || 'Unknown Labour',
                username: app.labourId.username || app.labourId.email?.split('@')[0] || 'unknown',
                email: app.labourId.email || 'N/A',
                phone: app.labourId.phone || 'N/A',
                skills: labourProfile?.skills || [],
                availabilityStatus: labourProfile?.availabilityStatus || 'unknown',
                experience: labourProfile?.farmingExperience || 0,
                profileImage: labourProfile?.profileImageUrl || '/uploads/profiles/default.jpg'
              },
              schedule: {
                id: app.scheduleId._id,
                title: app.scheduleId.title || 'Untitled Schedule',
                jobType: app.scheduleId.workType || 'general',
                workType: app.scheduleId.workType,
                startDate: app.scheduleId.startDate,
                endDate: app.scheduleId.endDate,
                wageOffered: app.scheduleId.wageOffered,
                labourCount: app.scheduleId.labourCount,
                location: app.scheduleId.location || 'Maharashtra',
                requiredSkills: app.scheduleId.requiredSkills || [],
                status: app.scheduleId.status
              },
              status: app.status,
              applicationMessage: app.applicationMessage,
              labourSkills: app.labourSkills || [],
              experience: app.experience,
              expectedWage: app.expectedWage,
              availability: app.availability,
              reviewedAt: app.reviewedAt,
              reviewNotes: app.reviewNotes,
              appliedAt: app.createdAt,
              daysSinceApplication: app.daysSinceApplication
            };
          } catch (mapErr) {
            console.error(`Error mapping application ${app._id}:`, mapErr);
            return null;
          }
        })
      );
    } catch (promiseErr) {
      console.error('Error in Promise.all for applications:', promiseErr);
      throw new Error('Failed to process application data');
    }

    // Filter out null applications from orphaned or failed data
    const filteredApplications = enhancedApplications.filter(app => app !== null);

    res.status(200).json({
      success: true,
      data: filteredApplications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: filteredApplications.length,
        totalRecords: total
      },
      summary: {
        pending: await Application.countDocuments({ hhmId: req.user._id, status: 'pending' }),
        approved: await Application.countDocuments({ hhmId: req.user._id, status: 'approved' }),
        rejected: await Application.countDocuments({ hhmId: req.user._id, status: 'rejected' })
      }
    });

  } catch (error) {
    console.error(' Error getting applications:', error);
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
    console.log(' Updating application status:', req.params.id);
    console.log(' Request by HHM:', req.user._id);

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
      .populate('scheduleId', 'title workType labourCount acceptedLabourCount status hhmId')
      .populate('labourId', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // CRITICAL SECURITY CHECK: Verify HHM owns this application's schedule
    // Compare the application's hhmId with the logged-in user's ID
    if (application.hhmId.toString() !== req.user._id.toString()) {
      console.log(' Unauthorized access attempt:');
      console.log('   Application hhmId:', application.hhmId.toString());
      console.log('   Request user ID:', req.user._id.toString());
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this application\'s job schedule.'
      });
    }

    console.log(' Security check passed - HHM owns this application');

    // Check if application is already reviewed
    if (application.status !== 'pending') {
      console.warn(`Update rejected: Application ${application._id} is already ${application.status}`);
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
        console.warn(`Approval rejected: Schedule ${schedule._id} is closed`);
        return res.status(400).json({
          success: false,
          message: 'Schedule is closed. Cannot approve applications for closed schedules.'
        });
      }

      // Check available labour slots
      const acceptedCount = schedule.acceptedLabourCount || 0;
      if (acceptedCount >= schedule.labourCount) {
        console.warn(`Approval rejected: Schedule ${schedule._id} is full (${acceptedCount}/${schedule.labourCount})`);
        return res.status(400).json({
          success: false,
          message: `Schedule is already full (${acceptedCount}/${schedule.labourCount} labour accepted). Cannot approve more applications.`
        });
      }

      console.log(` Schedule has space: ${acceptedCount + 1}/${schedule.labourCount} labour`);
    }

    // Update application status using instance methods
    if (status === 'approved') {
      await application.approve(reviewNotes);

      // Mark labour as hired by this HHM (exclusive employment)
      try {
        const labourProfile = await Profile.findOne({ userId: application.labourId._id });
        if (labourProfile) {
          await labourProfile.hireByHHM(req.user._id);
          console.log(` Labour ${application.labourId.name} is now exclusively hired by HHM ${req.user._id}`);
        } else {
          console.log(` Labour ${application.labourId.name} has no profile - creating basic profile for employment tracking`);
          await Profile.create({
            userId: application.labourId._id,
            currentEmployer: req.user._id,
            employmentStartDate: new Date(),
            availabilityStatus: 'unavailable'
          });
        }
      } catch (employmentError) {
        console.error(' Error updating labour employment status:', employmentError);
        // Continue with the response even if employment status update fails
      }
    } else {
      await application.reject(reviewNotes);
    }

    // Re-populate the updated application for response
    await application.populate([
      { path: 'labourId', select: 'name email phone username' },
      { path: 'scheduleId', select: 'title workType startDate endDate wageOffered labourCount location requiredSkills status' },
      { path: 'hhmId', select: 'name email phone' }
    ]);

    console.log(` Application ${status} successfully for labour: ${application.labourId.name}`);

    // Notify Labour
    await createNotification({
      senderId: req.user._id,
      receiverId: application.labourId._id,
      senderRole: 'hhm',
      receiverRole: 'labour',
      type: status === 'approved' ? 'JOB_ASSIGNED' : 'SYSTEM_ALERT',
      message: `Your job application for ${application.scheduleId.title} was ${status} by HHM ${req.user.name || 'someone'}.`,
      relatedId: application._id,
      relatedModel: 'Application'
    });

    res.status(200).json({
      success: true,
      data: application,
      message: `Application ${status} successfully`
    });

  } catch (error) {
    console.error(' Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

/**
 * @desc    Update labour availability status (HHM can mark labours as busy/available)
 * @route   PUT /api/hhm/labours/:labourId/availability
 * @access  Private (HHM only)
 */
const updateLabourAvailability = async (req, res) => {
  try {
    console.log(' HHM updating labour availability:', req.params.labourId);

    const { availability } = req.body;
    const labourId = req.params.labourId;

    // Validate availability status
    if (!availability || !['available', 'busy'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be either "available" or "busy"'
      });
    }

    // Verify the labour exists and has Labour role
    const labour = await User.findOne({
      _id: labourId,
      role: 'Labour'
    });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: 'Labour not found or invalid labour ID'
      });
    }

    // Update labour availability
    const updatedLabour = await User.findByIdAndUpdate(
      labourId,
      { availability: availability },
      { new: true, runValidators: true }
    ).select('name email availability');

    console.log(` Labour ${updatedLabour.name} availability updated to: ${availability} by HHM: ${req.user._id}`);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedLabour._id,
        name: updatedLabour.name,
        availability: updatedLabour.availability
      },
      message: `Labour availability updated to ${availability}`
    });

  } catch (error) {
    console.error(' Error updating labour availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating labour availability status',
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
    console.log(' getProfile called for HHM user:', req.user?._id);

    // The user is already attached to req.user by the protect middleware
    const hhm = req.user;

    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM profile not found'
      });
    }

    // Format profile data specific to HHM users
    const hhmData = hhm.toObject ? hhm.toObject({ getters: true, virtuals: true }) : hhm;
    delete hhmData.password;

    res.status(200).json({
      success: true,
      message: 'HHM profile retrieved successfully',
      profile: hhmData
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
    console.log(' updateProfile called for HHM user:', req.user?._id);

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

/**
 * @desc    Get all factory invitations received by HHM
 * @route   GET /api/hhm/factory-invitations
 * @access  Private (HHM only)
 */
const getFactoryInvitations = async (req, res) => {
  try {
    console.log(' Getting factory invitations for HHM:', req.user._id);

    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {
      hhmId: req.user._id,
      invitationType: 'factory-to-hhm'
    };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get invitations with pagination
    const invitations = await Invitation.find(query)
      .populate('factoryId', 'name email phone factoryName factoryLocation capacity contactInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invitation.countDocuments(query);

    // Get status counts
    const statusCounts = await Invitation.aggregate([
      {
        $match: {
          hhmId: req.user._id,
          invitationType: 'factory-to-hhm'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      pending: 0,
      accepted: 0,
      declined: 0
    };
    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    console.log(` Found ${invitations.length} factory invitations`);

    res.status(200).json({
      success: true,
      data: invitations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: invitations.length,
        totalRecords: total
      },
      statusCounts: counts
    });

  } catch (error) {
    console.error(' Error getting factory invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving factory invitations',
      error: error.message
    });
  }
};

/**
 * @desc    Accept or reject factory invitation
 * @route   PUT /api/hhm/factory-invitations/:id
 * @access  Private (HHM only)
 */
const respondToFactoryInvitation = async (req, res) => {
  try {
    console.log(' HHM responding to factory invitation:', req.params.id);

    let { status, responseMessage } = req.body;

    // Normalize status
    if (status && typeof status === 'string') {
      status = status.toLowerCase().trim();
    }

    // Validate status
    if (!status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "declined"'
      });
    }

    // Find invitation
    const invitation = await Invitation.findOne({
      _id: req.params.id,
      hhmId: req.user._id,
      invitationType: 'factory-to-hhm'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or unauthorized'
      });
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation already ${invitation.status}`
      });
    }

    // Check if invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired and can no longer be accepted. Please contact the factory for a new invitation.'
      });
    }

    // Update invitation status
    invitation.status = status;
    invitation.respondedAt = new Date();
    if (responseMessage) {
      invitation.responseMessage = responseMessage;
    }
    await invitation.save();

    // If accepted, create bidirectional association
    if (status === 'accepted') {
      try {
        // Add factory to HHM's associatedFactories
        const hhm = await User.findById(req.user._id);
        
        // Check if association already exists before adding
        if (!hhm.associatedFactories || !hhm.associatedFactories.includes(invitation.factoryId)) {
          await hhm.addFactory(invitation.factoryId);
          console.log(' Added factory to HHM\'s associated factories');
        } else {
          console.log('  Factory already associated with HHM');
        }

        // Add HHM to factory's associatedHHMs
        const factory = await User.findById(invitation.factoryId);
        if (factory) {
          // Check if association already exists before adding
          if (!factory.associatedHHMs || !factory.associatedHHMs.includes(req.user._id)) {
            await factory.addHHM(req.user._id);
            console.log(' Added HHM to factory\'s associated HHMs');
          } else {
            console.log('  HHM already associated with factory');
          }
        }

        console.log(' Association created between factory and HHM');
      } catch (associationError) {
        // Log the error but don't fail the invitation acceptance
        console.warn('  Association creation warning:', associationError.message);
        // Continue with the invitation acceptance even if association fails
      }
    }

    // Populate invitation details
    await invitation.populate('factoryId', 'name email phone factoryName factoryLocation');

    console.log(` Invitation ${status} successfully`);

    res.status(200).json({
      success: true,
      message: `Invitation ${status} successfully`,
      data: invitation
    });

  } catch (error) {
    console.error(' Error responding to factory invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Get list of associated factories
 * @route   GET /api/hhm/associated-factories
 * @access  Private (HHM only)
 */
const getAssociatedFactories = async (req, res) => {
  try {
    console.log(' Getting associated factories for HHM:', req.user._id);

    const hhm = await User.findById(req.user._id)
      .populate('associatedFactories', 'name email phone factoryName factoryLocation capacity contactInfo operatingSeason crushingStatus experience createdAt');

    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM not found'
      });
    }

    const factories = hhm.associatedFactories || [];

    console.log(` Found ${factories.length} associated factories`);

    res.status(200).json({
      success: true,
      count: factories.length,
      data: factories
    });

  } catch (error) {
    console.error(' Error getting associated factories:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving associated factories',
      error: error.message
    });
  }
};

/**
 * @desc    Disconnect from factory (remove association)
 * @route   DELETE /api/hhm/associated-factories/:factoryId
 * @access  Private (HHM only)
 */
const disconnectFromFactory = async (req, res) => {
  try {
    console.log(' HHM disconnecting from factory:', req.params.factoryId);

    const hhm = await User.findById(req.user._id);

    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM not found'
      });
    }

    // Check if factory is associated
    if (!hhm.associatedFactories || !hhm.associatedFactories.includes(req.params.factoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Factory is not associated with this HHM'
      });
    }

    // Remove from HHM's associatedFactories
    await hhm.removeFactory(req.params.factoryId);

    // Also remove from factory's associatedHHMs
    const factory = await User.findById(req.params.factoryId);
    if (factory && factory.associatedHHMs) {
      factory.associatedHHMs = factory.associatedHHMs.filter(
        id => !id.equals(req.user._id)
      );
      await factory.save();
    }

    console.log(' Factory association removed successfully');

    res.status(200).json({
      success: true,
      message: 'Factory association removed successfully'
    });

  } catch (error) {
    console.error(' Error disconnecting from factory:', error);
    res.status(500).json({
      success: false,
      message: 'Error disconnecting from factory',
      error: error.message
    });
  }
};

/**
 * @desc    Get own performance metrics
 * @route   GET /api/hhm/my-performance
 * @access  Private (HHM only)
 */
const getMyPerformance = async (req, res) => {
  try {
    console.log(' Getting performance metrics for HHM:', req.user._id);

    // Get total schedules created
    const totalSchedules = await Schedule.countDocuments({ hhmId: req.user._id });
    const openSchedules = await Schedule.countDocuments({ hhmId: req.user._id, status: 'open' });
    const closedSchedules = await Schedule.countDocuments({ hhmId: req.user._id, status: 'closed' });

    // Get total applications received
    const allApplications = await Application.find({ hhmId: req.user._id });
    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(app => app.status === 'pending').length;
    const approvedApplications = allApplications.filter(app => app.status === 'approved').length;
    const rejectedApplications = allApplications.filter(app => app.status === 'rejected').length;

    // Get labour invitations sent
    const labourInvitations = await Invitation.countDocuments({
      hhmId: req.user._id,
      invitationType: 'hhm-to-labour'
    });
    const acceptedInvitations = await Invitation.countDocuments({
      hhmId: req.user._id,
      invitationType: 'hhm-to-labour',
      status: 'accepted'
    });

    // Calculate success rate (approved applications / total applications)
    const successRate = totalApplications > 0
      ? ((approvedApplications / totalApplications) * 100).toFixed(2)
      : 0;

    // Calculate invitation acceptance rate
    const invitationAcceptanceRate = labourInvitations > 0
      ? ((acceptedInvitations / labourInvitations) * 100).toFixed(2)
      : 0;

    // Get associated factories count
    const hhm = await User.findById(req.user._id);
    const associatedFactoriesCount = hhm.associatedFactories ? hhm.associatedFactories.length : 0;

    // Calculate average response time for applications
    const respondedApplications = allApplications.filter(app => app.reviewedAt);
    let avgResponseTimeHours = 0;
    if (respondedApplications.length > 0) {
      const totalResponseTime = respondedApplications.reduce((sum, app) => {
        const responseTime = app.reviewedAt.getTime() - app.createdAt.getTime();
        return sum + responseTime;
      }, 0);
      avgResponseTimeHours = Math.round((totalResponseTime / respondedApplications.length) / (1000 * 60 * 60));
    }

    const performanceData = {
      schedules: {
        total: totalSchedules,
        open: openSchedules,
        closed: closedSchedules
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications
      },
      invitations: {
        sent: labourInvitations,
        accepted: acceptedInvitations,
        acceptanceRate: parseFloat(invitationAcceptanceRate)
      },
      metrics: {
        successRate: parseFloat(successRate),
        laboursHired: approvedApplications,
        activeJobs: openSchedules,
        associatedFactories: associatedFactoriesCount,
        avgResponseTimeHours: avgResponseTimeHours
      },
      calculatedAt: new Date()
    };

    console.log(' Performance metrics calculated successfully');

    res.status(200).json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error(' Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving performance metrics',
      error: error.message
    });
  }
};

/**
 * @desc    HHM sends invitation to a Factory
 * @route   POST /api/hhm/invite-factory
 * @access  Private (HHM only)
 */
const inviteFactory = async (req, res) => {
  try {
    console.log(' HHM inviting Factory:', req.user._id);
    console.log(' Request body received:', req.body);

    const { factoryId, personalMessage, invitationReason } = req.body;
    
    console.log(' Extracted factoryId:', factoryId);
    console.log(' Type of factoryId:', typeof factoryId);
    console.log(' factoryId exists:', !!factoryId);

    // Validate required fields
    if (!factoryId) {
      console.log(' Factory ID validation failed');
      return res.status(400).json({
        success: false,
        message: 'Factory ID is required'
      });
    }

    // Verify the Factory exists and has Factory role
    const factory = await User.findOne({
      _id: factoryId,
      role: 'Factory',
      isActive: true
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found or inactive'
      });
    }

    // Check if Factory is already associated with this HHM
    const hhm = await User.findById(req.user._id);
    if (hhm.associatedFactories && hhm.associatedFactories.includes(factoryId)) {
      return res.status(400).json({
        success: false,
        message: 'This Factory is already associated with your profile'
      });
    }

    // Check if a PENDING invitation already exists
    const existingPendingInvitation = await Invitation.findOne({
      hhmId: req.user._id,
      factoryId: factoryId,
      invitationType: 'hhm-to-factory',
      status: 'pending'
    });

    if (existingPendingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'A pending invitation has already been sent to this Factory'
      });
    }

    // Create the invitation
    const invitation = await Invitation.create({
      invitationType: 'hhm-to-factory',
      hhmId: req.user._id,
      factoryId: factoryId,
      personalMessage: personalMessage || '',
      invitationReason: invitationReason || '',
      status: 'pending'
    });

    // Populate the created invitation with full details
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('factoryId', 'name email phone factoryName factoryLocation')
      .populate('hhmId', 'name email phone experience specialization');

    console.log(' HHM invitation created successfully:', invitation._id);

    res.status(201).json({
      success: true,
      message: 'Invitation sent to Factory successfully',
      data: populatedInvitation
    });

  } catch (error) {
    console.error(' Error creating HHM invitation:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An invitation conflict occurred. A pending invitation may already exist.'
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
 * @desc    HHM sends invitations to multiple Factories (Bulk Invite)
 * @route   POST /api/hhm/invite-multiple-factories
 * @access  Private (HHM only)
 */
const inviteMultipleFactories = async (req, res) => {
  try {
    console.log(' HHM sending bulk factory invitations:', req.user._id);

    const { factoryIds, personalMessage, invitationReason } = req.body;

    // Validate required fields
    if (!factoryIds || !Array.isArray(factoryIds) || factoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of Factory IDs'
      });
    }

    // Limit bulk invitations to prevent abuse
    if (factoryIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send more than 50 invitations at once'
      });
    }

    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // Process each Factory ID
    for (const factoryId of factoryIds) {
      try {
        // Verify the Factory exists and has Factory role
        const factory = await User.findOne({
          _id: factoryId,
          role: 'Factory',
          isActive: true
        });

        if (!factory) {
          results.failed.push({
            factoryId,
            reason: 'Factory not found or inactive'
          });
          continue;
        }

        // Check if Factory is already associated with this HHM
        const hhm = await User.findById(req.user._id);
        if (hhm.associatedFactories && hhm.associatedFactories.includes(factoryId)) {
          results.skipped.push({
            factoryId,
            factoryName: factory.factoryName || factory.name,
            reason: 'Already associated with this HHM'
          });
          continue;
        }

        // Check if a PENDING invitation already exists
        const existingPendingInvitation = await Invitation.findOne({
          hhmId: req.user._id,
          factoryId: factoryId,
          invitationType: 'hhm-to-factory',
          status: 'pending'
        });

        if (existingPendingInvitation) {
          results.skipped.push({
            factoryId,
            factoryName: factory.factoryName || factory.name,
            reason: 'Pending invitation already exists'
          });
          continue;
        }

        // Create the invitation
        const invitation = await Invitation.create({
          invitationType: 'hhm-to-factory',
          hhmId: req.user._id,
          factoryId: factoryId,
          personalMessage: personalMessage || '',
          invitationReason: invitationReason || '',
          status: 'pending'
        });

        results.successful.push({
          factoryId,
          factoryName: factory.factoryName || factory.name,
          invitationId: invitation._id
        });

      } catch (error) {
        console.error(` Error inviting Factory ${factoryId}:`, error.message);
        results.failed.push({
          factoryId,
          reason: error.message
        });
      }
    }

    console.log(` Bulk invitation complete. Success: ${results.successful.length}, Failed: ${results.failed.length}, Skipped: ${results.skipped.length}`);

    res.status(200).json({
      success: true,
      message: `Sent ${results.successful.length} invitation(s) successfully`,
      data: results
    });

  } catch (error) {
    console.error(' Error in bulk invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending bulk invitations',
      error: error.message
    });
  }
};

/**
 * @desc    Get invitations sent by HHM to Factories
 * @route   GET /api/hhm/my-factory-invitations
 * @access  Private (HHM only)
 */
const getMyFactoryInvitations = async (req, res) => {
  try {
    console.log(' Getting HHM factory invitations:', req.user._id);

    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {
      hhmId: req.user._id,
      invitationType: 'hhm-to-factory'
    };

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get invitations with pagination
    const invitations = await Invitation.find(query)
      .populate('factoryId', 'name email phone factoryName factoryLocation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalInvitations = await Invitation.countDocuments(query);

    console.log(` Found ${invitations.length} HHM factory invitations`);

    res.status(200).json({
      success: true,
      count: invitations.length,
      total: totalInvitations,
      page: parseInt(page),
      totalPages: Math.ceil(totalInvitations / parseInt(limit)),
      data: invitations
    });

  } catch (error) {
    console.error(' Error fetching HHM factory invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
      error: error.message
    });
  }
};

/**
 * @desc    Release a labour (end exclusive employment)
 * @route   POST /api/hhm/release-labour
 * @access  Private (HHM only)
 */
const releaseLabour = async (req, res) => {
  try {
    console.log(' Releasing labour for HHM:', req.user._id);

    const { labourId } = req.body;

    if (!labourId) {
      return res.status(400).json({
        success: false,
        message: 'Labour ID is required'
      });
    }

    // Find the labour's profile
    const labourProfile = await Profile.findOne({ userId: labourId });

    if (!labourProfile) {
      return res.status(404).json({
        success: false,
        message: 'Labour profile not found'
      });
    }

    // Check if this HHM currently employs the labour
    if (!labourProfile.currentEmployer || labourProfile.currentEmployer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only release labour that you currently employ'
      });
    }

    // Release the labour
    await labourProfile.releaseFromEmployment();

    // Get labour details for response
    const labour = await User.findById(labourId).select('name email');

    console.log(` Labour ${labour.name} has been released and is now available for other HHMs`);

    res.status(200).json({
      success: true,
      message: `Labour ${labour.name} has been released successfully`,
      data: {
        labourId: labour._id,
        name: labour.name,
        email: labour.email,
        status: 'released'
      }
    });

  } catch (error) {
    console.error(' Error releasing labour:', error);
    res.status(500).json({
      success: false,
      message: 'Error releasing labour',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single labour profile by ID
 * @route   GET /api/hhm/labours/:id
 * @access  Private (HHM only)
 */
const getLabourById = async (req, res) => {
  try {
    const labourId = req.params.id;
    console.log(' Getting labour profile for ID:', labourId);

    // Find labour profile and populate user details
    const profile = await Profile.findOne({ userId: labourId })
      .populate('userId', 'name email phone createdAt username');

    if (!profile) {
      // If no profile exists, try to find the user to see if they just haven't completed their profile
      const labour = await User.findOne({ 
        _id: labourId, 
        role: 'Labour'
      }).select('name email phone username createdAt');
      
      if (!labour) {
        return res.status(404).json({
          success: false,
          message: 'Labour not found'
        });
      }

      // Return a basic profile object if the labour exists but has no detailed profile yet
      return res.status(200).json({
        success: true,
        data: {
          labourId: labour._id,
          name: labour.name,
          email: labour.email,
          phone: labour.phone,
          username: labour.username,
          joinedDate: labour.createdAt,
          availabilityStatus: 'unknown',
          skills: [],
          isVerified: false,
          rating: 0,
          completedJobs: 0
        }
      });
    }

    // Transform and return full profile data
    const labourData = {
      labourId: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      username: profile.userId.username,
      skills: profile.skills || [],
      availabilityStatus: profile.availabilityStatus,
      location: profile.farmLocation,
      experience: profile.farmingExperience,
      bio: profile.bio,
      profileImage: profile.profileImageUrl,
      joinedDate: profile.userId.createdAt,
      isVerified: profile.isVerified,
      rating: profile.rating || 0,
      completedJobs: profile.completedJobs || 0,
      isCurrentEmployee: profile.currentEmployer ? profile.currentEmployer.toString() === req.user._id.toString() : false
    };

    res.status(200).json({
      success: true,
      data: labourData
    });

  } catch (error) {
    console.error(' Error getting labour profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving labour profile',
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

  // Labour directory
  getLabours,
  getLabourById,

  // Invitation management (labour invitations)
  createInvitation,

  // Application management
  getApplications,
  updateApplicationStatus,

  // Labour availability management
  updateLabourAvailability,
  releaseLabour,

  // Profile management
  getProfile,
  updateProfile,

  // Factory invitation management (receiving invitations from factories)
  getFactoryInvitations,
  respondToFactoryInvitation,
  getAssociatedFactories,
  disconnectFromFactory,
  getMyPerformance,

  // HHM initiates invitations to factories
  inviteFactory,
  inviteMultipleFactories,
  getMyFactoryInvitations
};
