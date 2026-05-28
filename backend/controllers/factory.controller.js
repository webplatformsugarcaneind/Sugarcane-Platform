const Bill=require('../models/bill.model');
const Schedule=require('../models/schedule.model');
const Application=require('../models/application.model');
const User=require('../models/user.model');
const Invitation=require('../models/invitation.model');
const mongoose=require('mongoose');

/**
 * @desc    Create a new bill record for a farmer
 * @route   POST /api/factory/bills
 * @access  Private (Factory only)
 */
const createBill=async (req, res)=> {
  try {
    console.log(' createBill called by factory:', req.user?._id);

    const {
      farmerId,
      cropQuantity,
      totalAmount
    }

    =req.body;

    // Validate required fields
    if ( !farmerId || !cropQuantity || !totalAmount) {
      return res.status(400).json( {
          success: false,
          message: 'Please provide farmerId, cropQuantity, and totalAmount'
        }

      );
    }

    // Verify that the farmerId exists and is a farmer
    const farmer=await User.findById(farmerId);

    if ( !farmer) {
      return res.status(404).json( {
          success: false,
          message: 'Farmer not found'
        }

      );
    }

    if (farmer.role !=='Farmer') {
      return res.status(400).json( {
          success: false,
          message: 'Specified user is not a farmer'
        }

      );
    }

    // Create the bill
    const bill=await Bill.create( {
        factoryId: req.user._id,
        farmerId,
        cropQuantity,
        totalAmount,
        status: 'pending'
      }

    );

    // Populate the farmer details
    await bill.populate('farmerId', 'name email phone');

    console.log(' Bill created successfully:', bill._id);

    res.status(201).json( {
        success: true,
        message: 'Bill created successfully',
        data: bill
      }

    );

  }

  catch (error) {
    console.error(' Error creating bill:', error);

    res.status(500).json( {
        success: false,
        message: 'Error creating bill',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get history of all bills posted by the factory
 * @route   GET /api/factory/bills
 * @access  Private (Factory only)
 */
const getBills=async (req, res)=> {
  try {
    console.log(' getBills called by factory:', req.user?._id);

    const {
      status,
      page=1,
      limit=10
    }

    =req.query;

    // Build query
    const query= {
      factoryId: req.user._id
    }

    ;

    if (status) {
      query.status=status;
    }

    // Calculate pagination
    const skip=(parseInt(page) - 1) * parseInt(limit);

    // Get bills with pagination
    const bills=await Bill.find(query).populate('farmerId', 'name email phone').sort( {
        billDate: -1
      }

    ).skip(skip).limit(parseInt(limit));

    // Get total count for pagination
    const totalBills=await Bill.countDocuments(query);
    const totalPages=Math.ceil(totalBills / parseInt(limit));

    console.log(` Retrieved $ {
        bills.length
      }

      bills for factory`);

    res.status(200).json( {

        success: true,
        data: bills,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBills,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }

    );

  }

  catch (error) {
    console.error(' Error fetching bills:', error);

    res.status(500).json( {
        success: false,
        message: 'Error fetching bills',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Post a new maintenance job (creates a schedule with jobType: 'maintenance')
 * @route   POST /api/factory/maintenance-jobs
 * @access  Private (Factory only)
 */
const createMaintenanceJob=async (req, res)=> {
  try {
    console.log(' createMaintenanceJob called by factory:', req.user?._id);

    const {
      requiredSkills,
      labourCount,
      wageOffered,
      startDate,
      title,
      description,
      location,
      endDate
    }

    =req.body;

    // Validate required fields
    if ( !requiredSkills || !labourCount || !wageOffered || !startDate) {
      return res.status(400).json( {
          success: false,
          message: 'Please provide requiredSkills, labourCount, wageOffered, and startDate'
        }

      );
    }

    // Create the maintenance schedule
    const maintenanceJob=await Schedule.create( {
        hhmId: req.user._id, // Factory acts as HHM for maintenance jobs
        requiredSkills,
        labourCount,
        wageOffered,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        title,
        description,
        location,
        jobType: 'maintenance', // Explicitly set as maintenance job
        status: 'open'
      }

    );

    console.log(' Maintenance job created successfully:', maintenanceJob._id);

    res.status(201).json( {
        success: true,
        message: 'Maintenance job posted successfully',
        data: maintenanceJob
      }

    );

  }

  catch (error) {
    console.error(' Error creating maintenance job:', error);

    res.status(500).json( {
        success: false,
        message: 'Error creating maintenance job',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    View applications received for maintenance jobs
 * @route   GET /api/factory/maintenance-applications
 * @access  Private (Factory only)
 */
const getMaintenanceApplications=async (req, res)=> {
  try {
    console.log(' getMaintenanceApplications called by factory:', req.user?._id);

    const {
      status,
      page=1,
      limit=10
    }

    =req.query;

    // First, get all maintenance schedules created by this factory
    const maintenanceSchedules=await Schedule.find( {
        hhmId: req.user._id,
        jobType: 'maintenance'
      }

    ).select('_id');

    const scheduleIds=maintenanceSchedules.map(schedule=> schedule._id);

    if (scheduleIds.length===0) {
      return res.status(200).json( {

          success: true,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalApplications: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        }

      );
    }

    // Build query for applications
    const query= {
      scheduleId: {
        $in: scheduleIds
      }
    }

    ;

    if (status) {
      query.status=status;
    }

    // Calculate pagination
    const skip=(parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications=await Application.find(query).populate('labourId', 'name email phone').populate('scheduleId', 'title description requiredSkills wageOffered startDate endDate').sort( {
        createdAt: -1
      }

    ).skip(skip).limit(parseInt(limit));

    // Get total count for pagination
    const totalApplications=await Application.countDocuments(query);
    const totalPages=Math.ceil(totalApplications / parseInt(limit));

    console.log(` Retrieved ${applications.length} maintenance applications for factory`);

    res.status(200).json( {

        success: true,
        data: applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }

    );

  }

  catch (error) {
    console.error(' Error fetching maintenance applications:', error);

    res.status(500).json( {
        success: false,
        message: 'Error fetching maintenance applications',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Approve or reject a specific maintenance application
 * @route   PUT /api/factory/maintenance-applications/:id
 * @access  Private (Factory only)
 */
const updateMaintenanceApplication=async (req, res)=> {
  try {
    console.log(' updateMaintenanceApplication called by factory:', req.user?._id);

    const {
      id
    }

    =req.params;

    const {
      status
    }

    =req.body;

    // Validate status
    if ( !status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json( {
          success: false,
          message: 'Status must be either "approved" or "rejected"'
        }

      );
    }

    // Find the application and verify it belongs to a maintenance job created by this factory
    const application=await Application.findById(id).populate('scheduleId', 'hhmId jobType title');

    if ( !application) {
      return res.status(404).json( {
          success: false,
          message: 'Application not found'
        }

      );
    }

    // Verify the schedule belongs to this factory and is a maintenance job
    if ( !application.scheduleId || application.scheduleId.hhmId.toString() !==req.user._id.toString() || application.scheduleId.jobType !=='maintenance') {
      return res.status(403).json( {
          success: false,
          message: 'You can only update applications for your own maintenance jobs'
        }

      );
    }

    // Check if application is already processed
    if (application.status !=='pending') {
      return res.status(400).json( {

          success: false,
          message: `Application has already been $ {
            application.status
          }

          `
        }

      );
    }

    // Update the application status
    application.status=status;
    application.reviewedAt=new Date();
    await application.save();

    // If approved, increment the accepted labour count on the schedule
    if (status==='approved') {

      await Schedule.findByIdAndUpdate(application.scheduleId._id,
          {
          $inc: {
            acceptedLabourCount: 1
          }
        }

      );
    }

    // Populate the labour details for response
    await application.populate('labourId', 'name email phone');

    console.log(` Application ${status} successfully:`, application._id);

    res.status(200).json( {

        success: true,
        message: `Application ${status} successfully`,
        data: application
      }

    );

  }

  catch (error) {
    console.error(' Error updating maintenance application:', error);

    res.status(500).json( {
        success: false,
        message: 'Error updating maintenance application',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get factory profile
 * @route   GET /api/factory/profile
 * @access  Private (Factory only)
 */
const getProfile=async (req, res)=> {
  try {
    console.log(' getProfile called for factory user:', req.user?._id);

    // The user is already attached to req.user by the protect middleware
    const factory=req.user;

    if ( !factory) {
      return res.status(404).json( {
          success: false,
          message: 'Factory profile not found'
        }

      );
    }

    // Convert mongoose document to plain object with all virtuals and getters
    const factoryData = factory.toObject ? factory.toObject({ getters: true, virtuals: true }) : factory;

    // Extract crushingStatus with explicit fallback
    const crushingStatus = factory.crushingStatus || factoryData.crushingStatus || 'OFF';
    
    console.log(' Crushing status extracted:', crushingStatus);
    console.log(' Factory data keys:', Object.keys(factoryData));

    // Format profile data specific to factory users
    delete factoryData.password;
    factoryData.crushingStatus = crushingStatus;

    console.log(' Profile data crushingStatus:', factoryData.crushingStatus);

    res.status(200).json({
      success: true,
      message: 'Factory profile retrieved successfully',
      profile: factoryData
    });

  }

  catch (error) {
    console.error('Error in getProfile:', error);

    res.status(500).json( {
        success: false,
        message: 'Error retrieving factory profile',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Update factory profile
 * @route   PUT /api/factory/profile
 * @access  Private (Factory only)
 */
const updateProfile=async (req, res)=> {
  try {
    console.log(' updateProfile called for factory user:', req.user?._id);

    const factoryId=req.user._id;
    const updateData=req.body;

    // Remove fields that shouldn't be updated via profile
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;

    // Update factory profile
    const updatedFactory=await User.findByIdAndUpdate(factoryId,
      updateData,
        {
        new: true,
        runValidators: true
      }

    ).select('-password');

    if ( !updatedFactory) {
      return res.status(404).json( {
          success: false,
          message: 'Factory profile not found'
        }

      );
    }

    res.status(200).json( {
        success: true,
        message: 'Factory profile updated successfully',
        profile: updatedFactory
      }

    );

  }

  catch (error) {
    console.error('Error in updateProfile:', error);

    res.status(500).json( {
        success: false,
        message: 'Error updating factory profile',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get all HHMs (Hub Head Managers) directory for factories
 * @route   GET /api/factory/hhms
 * @access  Private (Factory only)
 */
const getHHMs=async (req, res)=> {
  try {
    console.log(' Getting HHMs directory for factory:', req.user._id);

    // Find all active users with HHM role
    const hhms = await User.find({
        role: 'HHM',
        isActive: true
    }).select('_id name phone email username createdAt').sort({
        name: 1
    });

    console.log(` Found $ {
        hhms.length
      }

      HHMs for factory directory`);

    res.status(200).json( {
        success: true,
        count: hhms.length,
        data: hhms,
        message: 'HHMs directory retrieved successfully for factory'
      }

    );

  }

  catch (error) {
    console.error('Error in getHHMs for factory:', error);

    res.status(500).json( {
        success: false,
        message: 'Failed to retrieve HHMs directory',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get single HHM by ID for factory view
 * @route   GET /api/factory/hhms/:id
 * @access  Private (Factory only)
 */
const getHHMById=async (req, res)=> {
  try {
    console.log(' Factory requesting HHM profile:', req.params.id);

    const {
      id
    }

    =req.params;

    // Find the HHM
    const hhm=await User.findOne( {
        _id: id,
        role: 'HHM',
        isActive: true
      }

    ).select('-password -__v');

    if ( !hhm) {
      return res.status(404).json( {
          success: false,
          message: 'HHM not found or inactive'
        }

      );
    }

    console.log(' HHM profile retrieved:', hhm.name);

    res.status(200).json( {
        success: true,
        data: hhm,
        message: 'HHM profile retrieved successfully'
      }

    );

  }

  catch (error) {
    console.error('Error in getHHMById:', error);

    res.status(500).json( {
        success: false,
        message: 'Failed to retrieve HHM profile',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Send invitation to HHM to associate with factory
 * @route   POST /api/factory/invite-hhm
 * @access  Private (Factory only)
 */
const inviteHHM=async (req, res)=> {
  try {
    console.log(' Factory inviting HHM:', req.user._id);

    const {
      hhmId,
      personalMessage,
      invitationReason
    }

    =req.body;

    // Validate required fields
    if (!hhmId) {
      return res.status(400).json({
        success: false,
        message: 'HHM ID is required'
      });
    }

    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(hhmId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid HHM ID format'
      });
    }

    // Verify the HHM exists and has HHM role
    const hhm=await User.findOne( {
        _id: hhmId,
        role: 'HHM',
        isActive: true
      }

    );

    if ( !hhm) {
      return res.status(404).json( {
          success: false,
          message: 'HHM not found or inactive'
        }

      );
    }

    // Check if HHM is already associated with this factory
    const factory=await User.findById(req.user._id);

    if (factory.associatedHHMs && factory.associatedHHMs.includes(hhmId)) {
      return res.status(400).json( {
          success: false,
          message: 'This HHM is already associated with your factory'
        }

      );
    }

    // Check if a PENDING invitation already exists (allow reinvite if declined/accepted)
    const existingPendingInvitation = await Invitation.findOne({
      factoryId: req.user._id,
      hhmId: hhmId,
      invitationType: 'factory-to-hhm',
      status: 'pending'
    });

    if (existingPendingInvitation) {
      return res.status(409).json({
        success: false,
        message: 'You have already sent a pending invitation to this HHM. Please wait for their response or cancel the previous invitation.',
        conflictType: 'pending_invitation',
        invitationId: existingPendingInvitation._id,
        sentAt: existingPendingInvitation.sentAt
      });
    }

    // Check if there's a recent declined invitation (within last 24 hours) to prevent spam
    const recentDeclined = await Invitation.findOne({
      factoryId: req.user._id,
      hhmId: hhmId,
      invitationType: 'factory-to-hhm',
      status: 'declined',
      respondedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentDeclined) {
      return res.status(429).json({
        success: false,
        message: 'This HHM recently declined your invitation. Please wait 24 hours before sending another invitation.',
        conflictType: 'recent_decline',
        declinedAt: recentDeclined.respondedAt
      });
    }

    // Create the invitation
    const invitation=await Invitation.create( {
        invitationType: 'factory-to-hhm',
        factoryId: req.user._id,
        hhmId: hhmId,
        personalMessage: personalMessage || '',
        invitationReason: invitationReason || '',
        status: 'pending'
      }

    );

    // Populate the created invitation with full details
    const populatedInvitation=await Invitation.findById(invitation._id).populate('hhmId', 'name email phone experience specialization').populate('factoryId', 'name email phone factoryName factoryLocation');

    console.log(' Factory invitation created successfully:', invitation._id);

    res.status(201).json( {
        success: true,
        message: 'Invitation sent to HHM successfully',
        data: populatedInvitation
      }

    );

  }

  catch (error) {
    console.error(' Error creating factory invitation:', error);

    // Handle duplicate key error from database constraints
    if (error.code === 11000) {
      console.error('Duplicate key details:', error.keyPattern, error.keyValue);

      // Check which index caused the error
      if (error.keyPattern && error.keyPattern.factoryId && error.keyPattern.hhmId) {
        return res.status(409).json({
          success: false,
          message: 'You have already sent a pending invitation to this HHM. Please wait for their response or cancel the previous invitation.',
          conflictType: 'duplicate_pending_invitation'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'An invitation with these details already exists. Please check your sent invitations.',
          conflictType: 'database_constraint'
        });
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating invitation. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

;

/**
 * @desc    Send invitations to multiple HHMs (Bulk Invite)
 * @route   POST /api/factory/invite-multiple-hhms
 * @access  Private (Factory only)
 */
const inviteMultipleHHMs=async (req, res)=> {
  try {
    console.log(' Factory sending bulk invitations:', req.user._id);

    const {
      hhmIds,
      personalMessage,
      invitationReason
    }

    =req.body;

    // Validate required fields
    if ( !hhmIds || !Array.isArray(hhmIds) || hhmIds.length===0) {
      return res.status(400).json( {
          success: false,
          message: 'Please provide an array of HHM IDs'
        }

      );
    }

    // Limit bulk invitations to prevent abuse
    if (hhmIds.length > 50) {
      return res.status(400).json( {
          success: false,
          message: 'Cannot send more than 50 invitations at once'
        }

      );
    }

    const results= {
      successful: [],
        failed: [],
        skipped: []
    }

    ;

    // Process each HHM ID
    for (const hhmId of hhmIds) {
      try {

        // Verify the HHM exists and has HHM role
        const hhm=await User.findOne( {
            _id: hhmId,
            role: 'HHM',
            isActive: true
          }

        );

        if ( !hhm) {
          results.failed.push( {
              hhmId,
              reason: 'HHM not found or inactive'
            }

          );
          continue;
        }

        // Check if HHM is already associated with this factory
        const factory=await User.findById(req.user._id);

        if (factory.associatedHHMs && factory.associatedHHMs.includes(hhmId)) {
          results.skipped.push( {
              hhmId,
              hhmName: hhm.name,
              reason: 'Already associated with this factory'
            }

          );
          continue;
        }

        // Check if a PENDING invitation already exists
        const existingPendingInvitation=await Invitation.findOne( {
            factoryId: req.user._id,
            hhmId: hhmId,
            invitationType: 'factory-to-hhm',
            status: 'pending'
          }

        );

        if (existingPendingInvitation) {
          results.skipped.push( {
              hhmId,
              hhmName: hhm.name,
              reason: 'Pending invitation already exists'
            }

          );
          continue;
        }

        // Create the invitation
        const invitation=await Invitation.create( {
            invitationType: 'factory-to-hhm',
            factoryId: req.user._id,
            hhmId: hhmId,
            personalMessage: personalMessage || '',
            invitationReason: invitationReason || '',
            status: 'pending'
          }

        );

        results.successful.push( {
            hhmId,
            hhmName: hhm.name,
            invitationId: invitation._id
          }

        );

      }

      catch (error) {
        console.error(` Error inviting HHM $ {
            hhmId
          }

          :`, error.message);

        results.failed.push( {
            hhmId,
            reason: error.message
          }

        );
      }
    }

    console.log(` Bulk invitation complete. Success: $ {
        results.successful.length
      }

      , Failed: $ {
        results.failed.length
      }

      , Skipped: $ {
        results.skipped.length
      }

      `);

    res.status(200).json( {

        success: true,
        message: `Sent $ {
          results.successful.length
        }

        invitation(s) successfully`,
        data: results
      }

    );

  }

  catch (error) {
    console.error(' Error in bulk invitation:', error);

    res.status(500).json( {
        success: false,
        message: 'Error sending bulk invitations',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get all invitations sent by factory to HHMs
 * @route   GET /api/factory/invitations
 * @access  Private (Factory only)
 */
const getMyInvitations=async (req, res)=> {
  try {
    console.log(' Getting factory invitations:', req.user._id);

    const {
      status,
      page=1,
      limit=20
    }

    =req.query;

    // Build query
    const query= {
      factoryId: req.user._id,
        invitationType: 'factory-to-hhm'
    }

    ;

    if (status) {
      query.status=status;
    }

    // Calculate pagination
    const skip=(parseInt(page) - 1) * parseInt(limit);

    // Get invitations with pagination
    const invitations=await Invitation.find(query).populate('hhmId', 'name email phone experience specialization managementExperience').sort( {
        createdAt: -1
      }

    ).skip(skip).limit(parseInt(limit));

    // Get total count for pagination
    const total=await Invitation.countDocuments(query);

    // Get status counts
    const statusCounts=await Invitation.aggregate([ {
        $match: {
          factoryId: req.user._id,
          invitationType: 'factory-to-hhm'
        }
      }

      ,
        {
        $group: {

          _id: '$status',
          count: {
            $sum: 1
          }
        }
      }

      ]);

    const counts= {
      pending: 0,
        accepted: 0,
        declined: 0
    }

    ;

    statusCounts.forEach(item=> {
        counts[item._id]=item.count;
      }

    );

    console.log(` Found $ {
        invitations.length
      }

      invitations`);

    res.status(200).json( {

        success: true,
        data: invitations,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: invitations.length,
          totalRecords: total
        }

        ,
        statusCounts: counts
      }

    );

  }

  catch (error) {
    console.error(' Error getting invitations:', error);

    res.status(500).json( {
        success: false,
        message: 'Error retrieving invitations',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Cancel pending invitation or remove any invitation from list
 * @route   DELETE /api/factory/invitations/:id
 * @access  Private (Factory only)
 */
const cancelInvitation=async (req, res)=> {
  try {
    console.log(' Processing invitation deletion:', req.params.id);

    const invitation=await Invitation.findOne( {
        _id: req.params.id,
        factoryId: req.user._id,
        invitationType: 'factory-to-hhm'
      }

    );

    if ( !invitation) {
      return res.status(404).json( {
          success: false,
          message: 'Invitation not found or unauthorized'
        }

      );
    }

    await invitation.deleteOne();

    let message;
    if (invitation.status === 'pending') {
      message = 'Invitation cancelled successfully';
      console.log(' Pending invitation cancelled successfully');
    } else {
      message = `${invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)} invitation removed successfully`;
      console.log(` ${invitation.status} invitation removed successfully`);
    }

    res.status(200).json( {
        success: true,
        message: message
      }

    );

  }

  catch (error) {
    console.error(' Error cancelling invitation:', error);

    res.status(500).json( {
        success: false,
        message: 'Error cancelling invitation',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Remove HHM from factory's associated list
 * @route   DELETE /api/factory/associated-hhms/:hhmId
 * @access  Private (Factory only)
 */
const removeAssociatedHHM=async (req, res)=> {
  try {
    console.log(' Removing HHM association:', req.params.hhmId);

    const factory=await User.findById(req.user._id);

    if ( !factory) {
      return res.status(404).json( {
          success: false,
          message: 'Factory not found'
        }

      );
    }

    // Check if HHM is associated
    if ( !factory.associatedHHMs || !factory.associatedHHMs.includes(req.params.hhmId)) {
      return res.status(400).json( {
          success: false,
          message: 'HHM is not associated with this factory'
        }

      );
    }

    // Remove from factory's associatedHHMs
    factory.associatedHHMs=factory.associatedHHMs.filter(id=> !id.equals(req.params.hhmId));
    await factory.save();

    // Also remove from HHM's associatedFactories
    const hhm=await User.findById(req.params.hhmId);

    if (hhm && hhm.associatedFactories) {
      hhm.associatedFactories=hhm.associatedFactories.filter(id=> !id.equals(req.user._id));
      await hhm.save();
    }

    console.log(' HHM association removed successfully');

    res.status(200).json( {
        success: true,
        message: 'HHM association removed successfully'
      }

    );

  }

  catch (error) {
    console.error(' Error removing HHM association:', error);

    res.status(500).json( {
        success: false,
        message: 'Error removing HHM association',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get factory's associated HHMs
 * @route   GET /api/factory/associated-hhms
 * @access  Private (Factory only)
 */
const getAssociatedHHMs=async (req, res)=> {
  try {
    console.log(' Getting associated HHMs for factory:', req.user._id);

    // Get factory user with populated associatedHHMs
    const factory=await User.findById(req.user._id).populate( {
        path: 'associatedHHMs',
        select: 'name email phone location profile'
      }

    );

    if ( !factory) {
      return res.status(404).json( {
          success: false,
          message: 'Factory not found'
        }

      );
    }

    console.log(` Found $ {
        factory.associatedHHMs.length
      }

      associated HHMs`);

    res.status(200).json( {
        success: true,
        count: factory.associatedHHMs.length,
        data: factory.associatedHHMs
      }

    );

  }

  catch (err) {
    console.error('Error fetching associated HHMs:', err);

    res.status(500).json( {
        success: false,
        message: 'Server error while fetching associated HHMs',
        error: err.message
      }

    );
  }
}

;

/**
 * @desc    Get invitations received from HHMs
 * @route   GET /api/factory/received-invitations
 * @access  Private (Factory only)
 */
const getReceivedInvitations=async (req, res)=> {
  try {
    console.log(' Getting factory received invitations:', req.user._id);

    const {
      status,
      page=1,
      limit=20
    }

    =req.query;

    // Build query - Factory receives invitations from HHMs
    const query= {
      factoryId: req.user._id,
        invitationType: 'hhm-to-factory'
    }

    ;

    if (status) {
      query.status=status;
    }

    // Calculate pagination
    const skip=(parseInt(page) - 1) * parseInt(limit);

    // Get invitations with pagination
    const invitations=await Invitation.find(query).populate('hhmId', 'name email phone experience specialization').sort( {
        createdAt: -1
      }

    ).skip(skip).limit(parseInt(limit));

    // Get total count for pagination
    const totalInvitations=await Invitation.countDocuments(query);

    console.log(` Found $ {
        invitations.length
      }

      received invitations`);

    res.status(200).json( {
        success: true,
        count: invitations.length,
        total: totalInvitations,
        page: parseInt(page),
        totalPages: Math.ceil(totalInvitations / parseInt(limit)),
        data: invitations
      }

    );

  }

  catch (error) {
    console.error(' Error fetching received invitations:', error);

    res.status(500).json( {
        success: false,
        message: 'Error fetching invitations',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Respond to HHM invitation (accept/decline)
 * @route   PUT /api/factory/received-invitations/:id
 * @access  Private (Factory only)
 */
const respondToHHMInvitation=async (req, res)=> {
  try {
    console.log(' Factory responding to HHM invitation:', req.params.id);

    let {
      status,
      responseMessage
    }

    =req.body;

    // Normalize status
    if (status && typeof status === 'string') {
      status = status.toLowerCase().trim();
    }

    // Validate status
    if ( !status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json( {
          success: false,
          message: 'Status must be either "accepted" or "declined"'
        }

      );
    }

    // Find invitation
    const invitation=await Invitation.findOne( {
        _id: req.params.id,
        factoryId: req.user._id,
        invitationType: 'hhm-to-factory'
      }

    );

    if ( !invitation) {
      return res.status(404).json( {
          success: false,
          message: 'Invitation not found or unauthorized'
        }

      );
    }

    // Check if already responded
    if (invitation.status !=='pending') {
      return res.status(400).json( {

          success: false,
          message: `This invitation has already been $ {
            invitation.status
          }

          `
        }

      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired and can no longer be accepted. Please contact the HHM for a new invitation.'
      });
    }

    // Update invitation status
    invitation.status=status;
    invitation.responseMessage=responseMessage || '';
    invitation.respondedAt=new Date();
    await invitation.save();

    // If accepted, add HHM to factory's associated HHMs
    if (status==='accepted') {
      try {
        const factory=await User.findById(req.user._id);
        const hhm=await User.findById(invitation.hhmId);

        if (!factory) {
          console.warn('  Factory user not found');
        } else {
          // Add to factory's associated HHMs
          if ( !factory.associatedHHMs) {
            factory.associatedHHMs=[];
          }

          if ( !factory.associatedHHMs.includes(invitation.hhmId)) {
            factory.associatedHHMs.push(invitation.hhmId);
            await factory.save();
            console.log(' Added HHM to factory\'s associated HHMs');
          } else {
            console.log('  HHM already associated with factory');
          }
        }

        if (!hhm) {
          console.warn('  HHM user not found');
        } else {
          // Add to HHM's associated factories
          if ( !hhm.associatedFactories) {
            hhm.associatedFactories=[];
          }

          if ( !hhm.associatedFactories.includes(req.user._id)) {
            hhm.associatedFactories.push(req.user._id);
            await hhm.save();
            console.log(' Added factory to HHM\'s associated factories');
          } else {
            console.log('  Factory already associated with HHM');
          }
        }

        console.log(' Partnership established between Factory and HHM');
      } catch (associationError) {
        // Log the error but don't fail the invitation acceptance
        console.warn('  Association creation warning:', associationError.message);
        // Continue with the invitation acceptance even if association fails
      }
    }

    // Populate the updated invitation
    const populatedInvitation=await Invitation.findById(invitation._id).populate('hhmId', 'name email phone experience specialization');

    console.log(` Invitation $ {
        status
      }

      `);

    res.status(200).json( {

        success: true,
        message: `Invitation $ {
          status
        }

        successfully`,
        data: populatedInvitation
      }

    );

  }

  catch (error) {
    console.error(' Error responding to invitation:', error);

    res.status(500).json( {
        success: false,
        message: 'Error responding to invitation',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Get dashboard statistics for factory
 * @route   GET /api/factory/dashboard-stats
 * @access  Private (Factory only)
 */
const getDashboardStats=async (req, res)=> {
  try {
    console.log(' getDashboardStats called by factory:', req.user?._id);

    const factoryId=req.user._id;

    // Get count of associated HHMs from User model
    const factory = await User.findById(factoryId).populate('associatedHHMs');
    const activeHHMsCount = factory?.associatedHHMs?.length || 0;
    console.log(' Active HHMs found:', activeHHMsCount);

    // TODO: Add proper factory revenue calculation (from sugar sales, not sugarcane purchases)
    const totalRevenue = 0; // Will implement proper revenue tracking later
    
    // TODO: Add proper factory-specific metrics
    const productionVolume = 0; // Will implement production tracking later
    const totalOrders = 0; // Will implement order tracking later

    console.log(' Dashboard Stats:', {
      activeHHMs: activeHHMsCount,
      totalRevenue: totalRevenue,
      productionVolume: productionVolume,
      totalOrders: totalOrders
    });

    res.status(200).json( {

        success: true,
        data: {
          activeHHMs: activeHHMsCount,
          totalRevenue: totalRevenue,
          productionVolume: productionVolume,
          totalOrders: totalOrders
        }
      }

    );

  }

  catch (error) {
    console.error(' Error getting dashboard stats:', error);

    res.status(500).json( {
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message
      }

    );
  }
}

;

/**
 * @desc    Clear single notification (invitation) from database
 * @route   DELETE /api/factory/notifications/:id
 * @access  Private (Factory only)
 */
const clearSingleNotification = async (req, res) => {
  try {
    console.log(' Clearing single notification:', req.params.id);

    const invitationId = req.params.id;

    // Find and delete the invitation
    const invitation = await Invitation.findOneAndDelete({
      _id: invitationId,
      factoryId: req.user._id,
      invitationType: 'hhm-to-factory'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or not authorized to delete'
      });
    }

    console.log(` Notification cleared: ${invitation.hhmId} -> ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Notification cleared successfully',
      data: {
        clearedNotificationId: invitationId,
        clearedAt: new Date()
      }
    });

  } catch (error) {
    console.error(' Error clearing notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notification',
      error: error.message
    });
  }
};

/**
 * @desc    Clear all notifications (invitations) from database
 * @route   DELETE /api/factory/notifications
 * @access  Private (Factory only)
 */
const clearAllNotifications = async (req, res) => {
  try {
    console.log(' Clearing all notifications for factory:', req.user._id);

    const { status } = req.query;

    // Build query - Factory receives invitations from HHMs
    const query = {
      factoryId: req.user._id,
      invitationType: 'hhm-to-factory'
    };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Count total notifications before deletion
    const totalCount = await Invitation.countDocuments(query);

    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No notifications to clear',
        data: {
          clearedCount: 0,
          clearedAt: new Date()
        }
      });
    }

    // Delete all matching invitations
    const result = await Invitation.deleteMany(query);

    console.log(` Cleared ${result.deletedCount} notifications for factory ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} notifications`,
      data: {
        clearedCount: result.deletedCount,
        clearedAt: new Date(),
        statusFilter: status || 'all'
      }
    });

  } catch (error) {
    console.error(' Error clearing all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Get the crushing status of the factory
 * @route   GET /api/factory/crushing-status
 * @access  Private (Factory only)
 */
const getCrushingStatus = async (req, res) => {
  try {
    console.log(' getCrushingStatus called for factory user:', req.user?._id);

    const factoryId = req.user._id;

    // Find the factory user
    const factory = await User.findById(factoryId);

    if (!factory || factory.role !== 'Factory') {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crushing status retrieved successfully',
      data: {
        crushingStatus: factory.crushingStatus || 'OFF'
      }
    });

  } catch (error) {
    console.error('Error in getCrushingStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving crushing status',
      error: error.message
    });
  }
};

/**
 * @desc    Update the crushing status of the factory
 * @route   PUT /api/factory/crushing-status
 * @access  Private (Factory only)
 */
const updateCrushingStatus = async (req, res) => {
  try {
    console.log(' updateCrushingStatus called for factory user:', req.user?._id);

    const factoryId = req.user._id;
    const { crushingStatus } = req.body;

    // Validate crushing status
    if (!crushingStatus || !['ON', 'OFF'].includes(crushingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid crushing status. Must be "ON" or "OFF"'
      });
    }

    // Update the factory user's crushing status
    const updatedFactory = await User.findByIdAndUpdate(
      factoryId,
      { crushingStatus },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedFactory || updatedFactory.role !== 'Factory') {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crushing status updated successfully',
      data: {
        crushingStatus: updatedFactory.crushingStatus,
        factoryName: updatedFactory.factoryName,
        updatedAt: updatedFactory.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in updateCrushingStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating crushing status',
      error: error.message
    });
  }
};

module.exports= {
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
  inviteMultipleHHMs,
  getMyInvitations,
  cancelInvitation,
  removeAssociatedHHM,
  getAssociatedHHMs,
  getReceivedInvitations,
  respondToHHMInvitation,
  getDashboardStats,
  clearSingleNotification,
  clearAllNotifications,
  getCrushingStatus,
  updateCrushingStatus
}

;
