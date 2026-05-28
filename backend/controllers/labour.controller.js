const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const Invitation = require('../models/invitation.model');
const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const { createNotification } = require('../utils/notification.util');

/**
 * @desc    Get job feed - all open schedules available for application
 * @route   GET /api/labour/jobs
 * @access  Private (Labour only)
 */
const getJobFeed = async (req, res) => {
  try {
    console.log(' Getting job feed for labour:', req.user._id);
    
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

    // Check if labour has already applied to these schedules
    const labourApplications = await Application.find({
      labourId: req.user._id,
      scheduleId: { $in: schedules.map(s => s._id) }
    }).select('scheduleId status');

    const applicationMap = {};
    labourApplications.forEach(app => {
      applicationMap[app.scheduleId.toString()] = app.status;
    });

    // Check if labour has invitations for these schedules
    const labourInvitations = await Invitation.find({
      labourId: req.user._id,  
      scheduleId: { $in: schedules.map(s => s._id) }
    }).select('scheduleId status');

    const invitationMap = {};
    labourInvitations.forEach(inv => {
      invitationMap[inv.scheduleId.toString()] = inv.status;
    });

    // Enhance schedule data with application status
    const enhancedSchedules = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      scheduleObj.applicationStatus = applicationMap[schedule._id.toString()] || null;
      scheduleObj.invitationStatus = invitationMap[schedule._id.toString()] || null;
      scheduleObj.canApply = schedule.canLabourApply() && !applicationMap[schedule._id.toString()];
      scheduleObj.spotsRemaining = schedule.labourCount - schedule.acceptedLabourCount;
      
      return scheduleObj;
    });

    console.log(` Found ${schedules.length} job opportunities for labour`);

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
    console.error(' Error getting job feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job feed',
      error: error.message
    });
  }
};

/**
 * @desc    Apply for a job schedule
 * @route   POST /api/labour/applications
 * @access  Private (Labour only)
 */
const applyForJob = async (req, res) => {
  try {
    console.log(' Labour applying for job:', req.user._id);
    
    const {
      scheduleId,
      applicationMessage,
      labourSkills,
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

    if (!labourSkills || !Array.isArray(labourSkills) || labourSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Labour skills must be provided as a non-empty array'
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
    if (!schedule.canLabourApply()) {
      return res.status(400).json({
        success: false,
        message: 'This schedule is no longer accepting applications'
      });
    }

    // Check if labour has already applied
    const existingApplication = await Application.findOne({
      labourId: req.user._id,
      scheduleId: scheduleId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Check labour availability status - use req.user since labour data is stored in User model
    const labour = req.user;
    const labourAvailability = (labour.availability || 'Available').toLowerCase();
    
    if (labourAvailability !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'You must be available to apply for jobs. Update your availability status in your profile.'
      });
    }

    // Create application
    const application = await Application.create({
      labourId: req.user._id,
      scheduleId: scheduleId,
      hhmId: schedule.hhmId._id || schedule.hhmId, // Handle both populated and unpopulated hhmId
      applicationMessage: applicationMessage || '',
      labourSkills: labourSkills,
      experience: experience || '',
      expectedWage: expectedWage || null,
      availability: availability || 'flexible'
    });

    // Populate the created application
    await application.populate([
      { path: 'labourId', select: 'name email phone' },
      { path: 'scheduleId', select: 'title startDate wageOffered location requiredSkills' },
      { path: 'hhmId', select: 'name email phone companyName' }
    ]);

    console.log(' Application submitted successfully:', application._id);

    // Notify HHM
    await createNotification({
      senderId: req.user._id,
      receiverId: schedule.hhmId._id || schedule.hhmId,
      senderRole: 'labour',
      receiverRole: 'hhm',
      type: 'JOB_UPDATED',
      message: `Labour ${req.user.name || 'someone'} applied for your job: ${schedule.title}.`,
      relatedId: application._id,
      relatedModel: 'Application'
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error(' Error applying for job:', error);
    
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
 * @desc    Get labour's own applications
 * @route   GET /api/labour/applications
 * @access  Private (Labour only)
 */
const getMyApplications = async (req, res) => {
  try {
    console.log(' Getting applications for labour:', req.user._id);
    
    const { 
      status, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { labourId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get applications
    const applications = await Application.find(query)
      .populate('scheduleId', 'title startDate endDate wageOffered location status requiredSkills labourCount acceptedLabourCount')
      .populate('hhmId', 'name email phone companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    console.log(` Found ${applications.length} applications for labour`);

    // Transform applications for better frontend consumption
    const enhancedApplications = applications.map(app => ({
      _id: app._id,
      applicationId: app._id,
      status: app.status,
      applicationMessage: app.applicationMessage,
      labourSkills: app.labourSkills,
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
        totalSpots: app.scheduleId.labourCount,
        filledSpots: app.scheduleId.acceptedLabourCount,
        spotsRemaining: app.scheduleId.labourCount - app.scheduleId.acceptedLabourCount
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
        pending: await Application.countDocuments({ labourId: req.user._id, status: 'pending' }),
        approved: await Application.countDocuments({ labourId: req.user._id, status: 'approved' }),
        rejected: await Application.countDocuments({ labourId: req.user._id, status: 'rejected' })
      }
    });

  } catch (error) {
    console.error(' Error getting labour applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving applications',
      error: error.message
    });
  }
};

/**
 * @desc    Get labour's invitations
 * @route   GET /api/labour/invitations
 * @access  Private (Labour only)
 */
const getMyInvitations = async (req, res) => {
  try {
    console.log(' Getting invitations for labour:', req.user._id);
    
    const { 
      status, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { labourId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get invitations
    const invitations = await Invitation.find(query)
      .populate('scheduleId', 'title startDate endDate wageOffered location status requiredSkills labourCount acceptedLabourCount')
      .populate('hhmId', 'name email phone companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invitation.countDocuments(query);

    console.log(` Found ${invitations.length} invitations for labour`);

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
      labourRating: inv.labourRating,
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
        totalSpots: inv.scheduleId.labourCount,
        filledSpots: inv.scheduleId.acceptedLabourCount,
        spotsRemaining: inv.scheduleId.labourCount - inv.scheduleId.acceptedLabourCount
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
        pending: await Invitation.countDocuments({ labourId: req.user._id, status: 'pending' }),
        accepted: await Invitation.countDocuments({ labourId: req.user._id, status: 'accepted' }),
        declined: await Invitation.countDocuments({ labourId: req.user._id, status: 'declined' }),
        expired: await Invitation.countDocuments({ 
          labourId: req.user._id, 
          status: 'pending',
          expiresAt: { $lt: new Date() }
        })
      }
    });

  } catch (error) {
    console.error(' Error getting labour invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invitations',
      error: error.message
    });
  }
};

/**
 * @desc    Respond to invitation (accept or decline)
 * @route   PUT /api/labour/invitations/:id
 * @access  Private (Labour only)
 */
const respondToInvitation = async (req, res) => {
  try {
    console.log(' Labour responding to invitation:', req.params.id);
    
    let { status, responseMessage } = req.body;

    // Normalize status to lowercase
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
      labourId: req.user._id
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
      if (!schedule.canLabourApply()) {
        return res.status(400).json({
          success: false,
          message: 'This job is no longer available or accepting labour'
        });
      }

      // Check labour availability
      const labourProfile = await Profile.findOne({ userId: req.user._id });
      if (labourProfile && labourProfile.availabilityStatus !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'You must be available to accept invitations. Update your availability status.'
        });
      }

      // Check for scheduling conflicts (basic implementation)
      const conflictingAcceptedInvitations = await Invitation.countDocuments({
        labourId: req.user._id,
        status: 'accepted',
        scheduleId: { $ne: invitation.scheduleId._id }
      });

      const conflictingApprovedApplications = await Application.countDocuments({
        labourId: req.user._id,
        status: 'approved',
        scheduleId: { $ne: invitation.scheduleId._id }
      });

      if (conflictingAcceptedInvitations > 0 || conflictingApprovedApplications > 0) {
        console.log(' Potential scheduling conflict detected, but allowing acceptance');
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

    console.log(` Invitation ${status} successfully`);

    // Notify HHM
    await createNotification({
      senderId: req.user._id,
      receiverId: invitation.hhmId._id || invitation.hhmId,
      senderRole: 'labour',
      receiverRole: 'hhm',
      type: status === 'accepted' ? 'INVITATION_ACCEPTED' : 'INVITATION_REJECTED',
      message: `Labour ${req.user.name || 'someone'} has ${status} your job invitation.`,
      relatedId: invitation._id,
      relatedModel: 'Invitation'
    });

    res.status(200).json({
      success: true,
      data: invitation,
      message: `Invitation ${status} successfully`
    });

  } catch (error) {
    console.error(' Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Get labour dashboard statistics
 * @route   GET /api/labour/dashboard
 * @access  Private (Labour only)
 */
const getLabourDashboard = async (req, res) => {
  try {
    console.log(' Getting dashboard for labour:', req.user._id);

    // Get application statistics
    const [pendingApps, approvedApps, rejectedApps] = await Promise.all([
      Application.countDocuments({ labourId: req.user._id, status: 'pending' }),
      Application.countDocuments({ labourId: req.user._id, status: 'approved' }),
      Application.countDocuments({ labourId: req.user._id, status: 'rejected' })
    ]);

    // Get invitation statistics
    const [pendingInvites, acceptedInvites, declinedInvites, expiredInvites] = await Promise.all([
      Invitation.countDocuments({ labourId: req.user._id, status: 'pending' }),
      Invitation.countDocuments({ labourId: req.user._id, status: 'accepted' }),
      Invitation.countDocuments({ labourId: req.user._id, status: 'declined' }),
      Invitation.countDocuments({ 
        labourId: req.user._id, 
        status: 'pending',
        expiresAt: { $lt: new Date() }
      })
    ]);

    // Get job feed statistics
    const totalOpenJobs = await Schedule.countDocuments({ 
      status: 'open',
      startDate: { $gte: new Date() }
    });

    // Get labour profile
    const labourProfile = await Profile.findOne({ userId: req.user._id });

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
        availabilityStatus: labourProfile?.availabilityStatus || 'unknown',
        skills: labourProfile?.skills || [],
        skillCount: labourProfile?.skills?.length || 0,
        profileComplete: !!(labourProfile?.skills?.length && labourProfile?.farmLocation)
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error(' Error getting labour dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get labour profile
 * @route   GET /api/labour/profile
 * @access  Private (Labour only)
 */
const getProfile = async (req, res) => {
  try {
    console.log(' NEW LABOUR CONTROLLER - getProfile called for labour user:', req.user?._id);

    // The user is already attached to req.user by the protect middleware
    const labour = req.user;

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: 'Labour profile not found'
      });
    }

    // Format profile data specific to labour users - mapped to match frontend expectations
    // Format profile data specific to labour users - mapped to match frontend expectations
    const profileData = labour.toObject ? labour.toObject({ getters: true, virtuals: true }) : labour;
    delete profileData.password;
    profileData.availability = labour.availability || 'Available'; // ALWAYS include availability field

    // Helper function to check if a value is meaningful
    const hasValue = (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return Boolean(value);
    };

    // Skills - ensure always returned as string for frontend form compatibility
    if (hasValue(labour.skills)) {
      // Force skills to always be a string to match frontend form input expectations
      if (Array.isArray(labour.skills)) {
        profileData.skills = labour.skills.join(', ');
      } else if (typeof labour.skills === 'string') {
        profileData.skills = labour.skills;
      } else {
        profileData.skills = String(labour.skills || '');
      }
    }
    
    // availabilityStatus for UI display (lowercase version)
    profileData.availabilityStatus = (labour.availability || 'Available').toLowerCase();
    
    // Work preferences mapping
    if (hasValue(labour.workPreferences)) {
      profileData.workingHours = labour.workPreferences; // Also map to workingHours for frontend
    }
    
    // Wage rate mapping
    if (hasValue(labour.wageRate)) {
      // Extract numeric value for dailyWageRate field expected by frontend
      const wageMatch = labour.wageRate.match(/(\d+)/);
      if (wageMatch) {
        profileData.dailyWageRate = parseInt(wageMatch[1]);
      }
    }
    
    // Add default values for fields that the frontend expects
    profileData.languages = 'Hindi, Marathi, English';
    profileData.emergencyContact = '9876543000';
    profileData.additionalNotes = 'Experienced in manual harvesting and modern equipment operation. Good physical stamina and team coordination skills.';
    profileData.preferredWorkType = 'general';
    
    // Certifications - only add if there are actual certifications
    if (hasValue(labour.certifications)) {
      const certsArray = labour.certifications.split(',').map(cert => cert.trim()).filter(cert => cert);
      if (certsArray.length > 0) {
        profileData.certifications = certsArray;
      }
    }
    
    // Profile completeness check
    profileData.profileComplete = !!(labour.skills && labour.availability);

    console.log(' FINAL profileData.availability:', profileData.availability);
    console.log(' FINAL profileData keys:', Object.keys(profileData));

    res.status(200).json({
      success: true,
      message: 'Labour profile retrieved successfully',
      profile: profileData
    });

    console.log(' NEW LABOUR CONTROLLER - Response sent:', {
      success: true,
      message: 'Labour profile retrieved successfully',
      profileDataKeys: Object.keys(profileData)
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving labour profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update labour profile
 * @route   PUT /api/labour/profile
 * @access  Private (Labour only)
 */
const updateProfile = async (req, res) => {
  try {
    console.log(' NEW LABOUR CONTROLLER - updateProfile called for labour user:', req.user?._id);

    const labourId = req.user._id;
    const updateData = req.body;

    console.log(' Update data received:', JSON.stringify(updateData, null, 2));
    console.log(' Availability in updateData:', updateData.availability);

    // Remove fields that shouldn't be updated via profile
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;

    // Fix skills field: Convert array to comma-separated string if it's an array
    if (Array.isArray(updateData.skills)) {
      updateData.skills = updateData.skills.join(', ');
      console.log(' Converted skills array to string:', updateData.skills);
    }

    // Update labour profile directly in User model
    console.log(' Saving to database with availability:', updateData.availability);
    
    const updatedLabour = await User.findByIdAndUpdate(
      labourId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    console.log(' Database updated. New availability:', updatedLabour?.availability);

    if (!updatedLabour) {
      return res.status(404).json({
        success: false,
        message: 'Labour profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Labour profile updated successfully',
      profile: updatedLabour
    });

    console.log(' NEW LABOUR CONTROLLER - Profile updated successfully');

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating labour profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update labour availability status
 * @route   PUT /api/labour/availability
 * @access  Private (Labour only)
 */
const updateAvailability = async (req, res) => {
  try {
    console.log(' Updating availability for labour:', req.user._id);
    
    const { availability } = req.body;

    // Validate availability status
    if (!availability || !['available', 'busy'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be either "available" or "busy"'
      });
    }

    // Update labour availability
    const updatedLabour = await User.findByIdAndUpdate(
      req.user._id,
      { availability: availability },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedLabour) {
      return res.status(404).json({
        success: false,
        message: 'Labour not found'
      });
    }

    console.log(` Labour availability updated to: ${availability}`);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedLabour._id,
        name: updatedLabour.name,
        availability: updatedLabour.availability
      },
      message: `Availability updated to ${availability}`
    });

  } catch (error) {
    console.error(' Error updating labour availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability status',
      error: error.message
    });
  }
};

/**
 * @desc    Get all HHMs (Hub Head Managers) directory for labour
 * @route   GET /api/labour/hhms
 * @access  Private (Labour only)
 */
const getHHMs = async (req, res) => {
  try {
    console.log(' Getting HHMs directory for labour:', req.user._id);
    
    // Find all active users with HHM role
    const hhms = await User.find({ 
      role: 'HHM', 
      isActive: true 
    }).select('_id name phone email username createdAt').sort({ name: 1 });

    console.log(` Found ${hhms.length} HHMs for labour directory`);

    res.status(200).json({
      success: true,
      count: hhms.length,
      data: hhms,
      message: 'HHMs directory retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getHHMs for labour:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve HHMs directory',
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
  getLabourDashboard,
  
  // Profile management
  getProfile,
  updateProfile,
  
  // Availability management
  updateAvailability,
  
  // HHM Directory
  getHHMs
};
