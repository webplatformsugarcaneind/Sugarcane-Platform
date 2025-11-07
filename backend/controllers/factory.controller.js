const Bill = require('../models/bill.model');
const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const User = require('../models/user.model');
const Invitation = require('../models/invitation.model');

/**
 * @desc    Create a new bill record for a farmer
 * @route   POST /api/factory/bills
 * @access  Private (Factory only)
 */
const createBill = async (req, res) => {
  try {
    console.log('💰 createBill called by factory:', req.user?._id);

    const { farmerId, cropQuantity, totalAmount } = req.body;

    // Validate required fields
    if (!farmerId || !cropQuantity || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide farmerId, cropQuantity, and totalAmount'
      });
    }

    // Verify that the farmerId exists and is a farmer
    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    if (farmer.role !== 'Farmer') {
      return res.status(400).json({
        success: false,
        message: 'Specified user is not a farmer'
      });
    }

    // Create the bill
    const bill = await Bill.create({
      factoryId: req.user._id,
      farmerId,
      cropQuantity,
      totalAmount,
      status: 'pending'
    });

    // Populate the farmer details
    await bill.populate('farmerId', 'name email phone');

    console.log('✅ Bill created successfully:', bill._id);

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill
    });

  } catch (error) {
    console.error('❌ Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill',
      error: error.message
    });
  }
};

/**
 * @desc    Get history of all bills posted by the factory
 * @route   GET /api/factory/bills
 * @access  Private (Factory only)
 */
const getBills = async (req, res) => {
  try {
    console.log('📋 getBills called by factory:', req.user?._id);

    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { factoryId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bills with pagination
    const bills = await Bill.find(query)
      .populate('farmerId', 'name email phone')
      .sort({ billDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalBills = await Bill.countDocuments(query);
    const totalPages = Math.ceil(totalBills / parseInt(limit));

    console.log(`✅ Retrieved ${bills.length} bills for factory`);

    res.status(200).json({
      success: true,
      data: bills,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBills,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message
    });
  }
};

/**
 * @desc    Post a new maintenance job (creates a schedule with jobType: 'maintenance')
 * @route   POST /api/factory/maintenance-jobs
 * @access  Private (Factory only)
 */
const createMaintenanceJob = async (req, res) => {
  try {
    console.log('🔧 createMaintenanceJob called by factory:', req.user?._id);

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
    if (!requiredSkills || !workerCount || !wageOffered || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide requiredSkills, workerCount, wageOffered, and startDate'
      });
    }

    // Create the maintenance schedule
    const maintenanceJob = await Schedule.create({
      hhmId: req.user._id, // Factory acts as HHM for maintenance jobs
      requiredSkills,
      workerCount,
      wageOffered,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      title,
      description,
      location,
      jobType: 'maintenance', // Explicitly set as maintenance job
      status: 'open'
    });

    console.log('✅ Maintenance job created successfully:', maintenanceJob._id);

    res.status(201).json({
      success: true,
      message: 'Maintenance job posted successfully',
      data: maintenanceJob
    });

  } catch (error) {
    console.error('❌ Error creating maintenance job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance job',
      error: error.message
    });
  }
};

/**
 * @desc    View applications received for maintenance jobs
 * @route   GET /api/factory/maintenance-applications
 * @access  Private (Factory only)
 */
const getMaintenanceApplications = async (req, res) => {
  try {
    console.log('📋 getMaintenanceApplications called by factory:', req.user?._id);

    const { status, page = 1, limit = 10 } = req.query;

    // First, get all maintenance schedules created by this factory
    const maintenanceSchedules = await Schedule.find({
      hhmId: req.user._id,
      jobType: 'maintenance'
    }).select('_id');

    const scheduleIds = maintenanceSchedules.map(schedule => schedule._id);

    if (scheduleIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalApplications: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    // Build query for applications
    const query = {
      scheduleId: { $in: scheduleIds }
    };

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await Application.find(query)
      .populate('workerId', 'name email phone')
      .populate('scheduleId', 'title description requiredSkills wageOffered startDate endDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalApplications = await Application.countDocuments(query);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    console.log(`✅ Retrieved ${applications.length} maintenance applications for factory`);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalApplications,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching maintenance applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance applications',
      error: error.message
    });
  }
};

/**
 * @desc    Approve or reject a specific maintenance application
 * @route   PUT /api/factory/maintenance-applications/:id
 * @access  Private (Factory only)
 */
const updateMaintenanceApplication = async (req, res) => {
  try {
    console.log('🔄 updateMaintenanceApplication called by factory:', req.user?._id);

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    // Find the application and verify it belongs to a maintenance job created by this factory
    const application = await Application.findById(id)
      .populate('scheduleId', 'hhmId jobType title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the schedule belongs to this factory and is a maintenance job
    if (!application.scheduleId ||
      application.scheduleId.hhmId.toString() !== req.user._id.toString() ||
      application.scheduleId.jobType !== 'maintenance') {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your own maintenance jobs'
      });
    }

    // Check if application is already processed
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application has already been ${application.status}`
      });
    }

    // Update the application status
    application.status = status;
    application.reviewedAt = new Date();
    await application.save();

    // If approved, increment the accepted workers count on the schedule
    if (status === 'approved') {
      await Schedule.findByIdAndUpdate(
        application.scheduleId._id,
        { $inc: { acceptedWorkersCount: 1 } }
      );
    }

    // Populate the worker details for response
    await application.populate('workerId', 'name email phone');

    console.log(`✅ Application ${status} successfully:`, application._id);

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });

  } catch (error) {
    console.error('❌ Error updating maintenance application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance application',
      error: error.message
    });
  }
};

/**
 * @desc    Get factory profile
 * @route   GET /api/factory/profile
 * @access  Private (Factory only)
 */
const getProfile = async (req, res) => {
  try {
    console.log('👤 getProfile called for factory user:', req.user?._id);

    // The user is already attached to req.user by the protect middleware
    const factory = req.user;

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory profile not found'
      });
    }

    // Debug: Log the full user object
    console.log('🔍 Full user object:', JSON.stringify(factory, null, 2));
    console.log('🏭 Factory name from user:', factory.factoryName);

    // Format profile data specific to factory users
    const profileData = {
      _id: factory._id,
      name: factory.name,
      username: factory.username,
      email: factory.email,
      phone: factory.phone,
      role: factory.role,
      factoryName: factory.factoryName,
      factoryLocation: factory.factoryLocation,
      factoryDescription: factory.factoryDescription,
      capacity: factory.capacity,
      experience: factory.experience,
      specialization: factory.specialization,
      contactInfo: factory.contactInfo || {},
      operatingHours: factory.operatingHours || {},
      isActive: factory.isActive,
      createdAt: factory.createdAt,
      updatedAt: factory.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Factory profile retrieved successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving factory profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update factory profile
 * @route   PUT /api/factory/profile
 * @access  Private (Factory only)
 */
const updateProfile = async (req, res) => {
  try {
    console.log('🔄 updateProfile called for factory user:', req.user?._id);

    const factoryId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via profile
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;

    // Update factory profile
    const updatedFactory = await User.findByIdAndUpdate(
      factoryId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedFactory) {
      return res.status(404).json({
        success: false,
        message: 'Factory profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Factory profile updated successfully',
      profile: updatedFactory
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating factory profile',
      error: error.message
    });
  }
};

/**
 * @desc    Get all HHMs (Hub Head Managers) directory for factories
 * @route   GET /api/factory/hhms
 * @access  Private (Factory only)
 */
const getHHMs = async (req, res) => {
  try {
    console.log('📋 Getting HHMs directory for factory:', req.user._id);

    // Find all active users with HHM role
    const hhms = await User.find({
      role: 'HHM',
      isActive: true
    }).select('name phone email username createdAt').sort({ name: 1 });

    console.log(`✅ Found ${hhms.length} HHMs for factory directory`);

    res.status(200).json({
      success: true,
      count: hhms.length,
      data: hhms,
      message: 'HHMs directory retrieved successfully for factory'
    });

  } catch (error) {
    console.error('Error in getHHMs for factory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve HHMs directory',
      error: error.message
    });
  }
};

/**
 * @desc    Get single HHM by ID for factory view
 * @route   GET /api/factory/hhms/:id
 * @access  Private (Factory only)
 */
const getHHMById = async (req, res) => {
  try {
    console.log('👤 Factory requesting HHM profile:', req.params.id);

    const { id } = req.params;

    // Find the HHM
    const hhm = await User.findOne({
      _id: id,
      role: 'HHM',
      isActive: true
    }).select('-password -__v');

    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM not found or inactive'
      });
    }

    console.log('✅ HHM profile retrieved:', hhm.name);

    res.status(200).json({
      success: true,
      data: hhm,
      message: 'HHM profile retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getHHMById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve HHM profile',
      error: error.message
    });
  }
};

/**
 * @desc    Send invitation to HHM to associate with factory
 * @route   POST /api/factory/invite-hhm
 * @access  Private (Factory only)
 */
const inviteHHM = async (req, res) => {
  try {
    console.log('📨 Factory inviting HHM:', req.user._id);

    const { hhmId, personalMessage, invitationReason } = req.body;

    // Validate required fields
    if (!hhmId) {
      return res.status(400).json({
        success: false,
        message: 'HHM ID is required'
      });
    }

    // Verify the HHM exists and has HHM role
    const hhm = await User.findOne({
      _id: hhmId,
      role: 'HHM',
      isActive: true
    });

    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM not found or inactive'
      });
    }

    // Check if HHM is already associated with this factory
    const factory = await User.findById(req.user._id);
    if (factory.associatedHHMs && factory.associatedHHMs.includes(hhmId)) {
      return res.status(400).json({
        success: false,
        message: 'This HHM is already associated with your factory'
      });
    }

    // Check if a PENDING invitation already exists (allow reinvite if declined/accepted)
    const existingPendingInvitation = await Invitation.findOne({
      factoryId: req.user._id,
      hhmId: hhmId,
      invitationType: 'factory-to-hhm',
      status: 'pending'
    });

    if (existingPendingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'A pending invitation has already been sent to this HHM'
      });
    }

    // Create the invitation
    const invitation = await Invitation.create({
      invitationType: 'factory-to-hhm',
      factoryId: req.user._id,
      hhmId: hhmId,
      personalMessage: personalMessage || '',
      invitationReason: invitationReason || '',
      status: 'pending'
    });

    // Populate the created invitation with full details
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('hhmId', 'name email phone experience specialization')
      .populate('factoryId', 'name email phone factoryName factoryLocation');

    console.log('✅ Factory invitation created successfully:', invitation._id);

    res.status(201).json({
      success: true,
      message: 'Invitation sent to HHM successfully',
      data: populatedInvitation
    });

  } catch (error) {
    console.error('❌ Error creating factory invitation:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      console.error('Duplicate key details:', error.keyPattern, error.keyValue);

      // Check which index caused the error
      if (error.keyPattern && error.keyPattern.factoryId && error.keyPattern.hhmId) {
        return res.status(400).json({
          success: false,
          message: 'A pending invitation has already been sent to this HHM'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'An invitation conflict occurred. Please try again.'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Get all invitations sent by factory to HHMs
 * @route   GET /api/factory/invitations
 * @access  Private (Factory only)
 */
const getMyInvitations = async (req, res) => {
  try {
    console.log('📋 Getting factory invitations:', req.user._id);

    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {
      factoryId: req.user._id,
      invitationType: 'factory-to-hhm'
    };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get invitations with pagination
    const invitations = await Invitation.find(query)
      .populate('hhmId', 'name email phone experience specialization managementExperience')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invitation.countDocuments(query);

    // Get status counts
    const statusCounts = await Invitation.aggregate([
      {
        $match: {
          factoryId: req.user._id,
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

    console.log(`✅ Found ${invitations.length} invitations`);

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
    console.error('❌ Error getting invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving invitations',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel pending invitation to HHM
 * @route   DELETE /api/factory/invitations/:id
 * @access  Private (Factory only)
 */
const cancelInvitation = async (req, res) => {
  try {
    console.log('🗑️ Canceling invitation:', req.params.id);

    const invitation = await Invitation.findOne({
      _id: req.params.id,
      factoryId: req.user._id,
      invitationType: 'factory-to-hhm'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or unauthorized'
      });
    }

    // Only allow cancel if status is pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${invitation.status} invitation. Only pending invitations can be cancelled.`
      });
    }

    await invitation.deleteOne();

    console.log('✅ Invitation cancelled successfully');

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Remove HHM from factory's associated list
 * @route   DELETE /api/factory/associated-hhms/:hhmId
 * @access  Private (Factory only)
 */
const removeAssociatedHHM = async (req, res) => {
  try {
    console.log('🔓 Removing HHM association:', req.params.hhmId);

    const factory = await User.findById(req.user._id);

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    // Check if HHM is associated
    if (!factory.associatedHHMs || !factory.associatedHHMs.includes(req.params.hhmId)) {
      return res.status(400).json({
        success: false,
        message: 'HHM is not associated with this factory'
      });
    }

    // Remove from factory's associatedHHMs
    factory.associatedHHMs = factory.associatedHHMs.filter(
      id => !id.equals(req.params.hhmId)
    );
    await factory.save();

    // Also remove from HHM's associatedFactories
    const hhm = await User.findById(req.params.hhmId);
    if (hhm && hhm.associatedFactories) {
      hhm.associatedFactories = hhm.associatedFactories.filter(
        id => !id.equals(req.user._id)
      );
      await hhm.save();
    }

    console.log('✅ HHM association removed successfully');

    res.status(200).json({
      success: true,
      message: 'HHM association removed successfully'
    });

  } catch (error) {
    console.error('❌ Error removing HHM association:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing HHM association',
      error: error.message
    });
  }
};

/**
 * @desc    Get factory's associated HHMs
 * @route   GET /api/factory/associated-hhms
 * @access  Private (Factory only)
 */
const getAssociatedHHMs = async (req, res) => {
  try {
    console.log('📋 Getting associated HHMs for factory:', req.user._id);

    // Get factory user with populated associatedHHMs
    const factory = await User.findById(req.user._id).populate({
      path: 'associatedHHMs',
      select: 'name email phone location profile'
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    console.log(`✅ Found ${factory.associatedHHMs.length} associated HHMs`);

    res.status(200).json({
      success: true,
      count: factory.associatedHHMs.length,
      data: factory.associatedHHMs
    });

  } catch (err) {
    console.error('Error fetching associated HHMs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching associated HHMs',
      error: err.message
    });
  }
};

module.exports = {
  createBill,
  getBills,
  createMaintenanceJob,
  getMaintenanceApplications,
  updateMaintenanceApplication,
  getProfile,
  updateProfile,
  getHHMs,
  getHHMById,
  inviteHHM,
  getMyInvitations,
  cancelInvitation,
  removeAssociatedHHM,
  getAssociatedHHMs
};