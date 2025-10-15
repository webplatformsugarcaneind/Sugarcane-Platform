const Bill = require('../models/bill.model');
const Schedule = require('../models/schedule.model');
const Application = require('../models/application.model');
const User = require('../models/user.model');

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

module.exports = {
  createBill,
  getBills,
  createMaintenanceJob,
  getMaintenanceApplications,
  updateMaintenanceApplication,
  getProfile,
  updateProfile
};