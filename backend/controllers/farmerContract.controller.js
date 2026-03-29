const FarmerContract = require('../models/farmerContract.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * @desc    Create a new contract request from Farmer to HHM
 * @route   POST /api/farmer-contracts/request
 * @access  Private (Farmer only)
 */
const createContractRequest = async (req, res) => {
  try {
    console.log('📝 FarmerContract Controller - createContractRequest called');
    console.log('👤 Farmer:', req.user.name, '(', req.user._id, ')');
    
    const { hhm_id, contract_details, duration_days, grace_period_days } = req.body;
    const farmer_id = req.user._id;

    // Validation - Check required fields
    if (!hhm_id) {
      return res.status(400).json({
        success: false,
        message: 'HHM ID is required'
      });
    }

    if (!contract_details) {
      return res.status(400).json({
        success: false,
        message: 'Contract details are required'
      });
    }

    if (!duration_days) {
      return res.status(400).json({
        success: false,
        message: 'Duration in days is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(hhm_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid HHM ID format'
      });
    }

    // Check if HHM exists and has correct role
    const hhm = await User.findById(hhm_id);
    if (!hhm) {
      return res.status(404).json({
        success: false,
        message: 'HHM not found'
      });
    }

    if (hhm.role !== 'HHM') {
      return res.status(400).json({
        success: false,
        message: 'User must have HHM role'
      });
    }

    if (!hhm.isActive) {
      return res.status(400).json({
        success: false,
        message: 'HHM account is not active'
      });
    }

    // Check if farmer is trying to create contract with themselves
    if (farmer_id.toString() === hhm_id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create contract with yourself'
      });
    }

    // Check for existing pending contract between this farmer and HHM
    const existingContract = await FarmerContract.findOne({
      farmer_id: farmer_id,
      hhm_id: hhm_id,
      status: 'farmer_pending'
    });

    if (existingContract) {
      return res.status(409).json({
        success: false,
        message: 'A pending contract already exists between you and this HHM',
        existing_contract_id: existingContract._id
      });
    }

    // Create the contract
    const contractData = {
      farmer_id,
      hhm_id,
      contract_details,
      duration_days: parseInt(duration_days),
      status: 'farmer_pending'
    };

    // Add grace period if provided
    if (grace_period_days !== undefined) {
      contractData.grace_period_days = parseInt(grace_period_days);
    }

    const farmerContract = new FarmerContract(contractData);
    await farmerContract.save();

    // Populate the contract with user details
    await farmerContract.populate([
      { path: 'farmer_id', select: 'name username email phone location' },
      { path: 'hhm_id', select: 'name username email phone managementExperience' }
    ]);

    console.log('✅ FarmerContract created successfully:', farmerContract._id);

    res.status(201).json({
      success: true,
      message: 'Contract request sent successfully',
      data: {
        contract: farmerContract
      }
    });

  } catch (error) {
    console.error('❌ FarmerContract creation error:', error.message);
    console.error('Full error stack:', error.stack);

    // Handle mongoose validation errors
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
      message: 'Server error while creating contract request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all contracts related to the currently logged-in user
 * @route   GET /api/farmer-contracts/my-contracts
 * @access  Private (Any authenticated user)
 */
const getMyContracts = async (req, res) => {
  try {
    console.log('📊 FarmerContract Controller - getMyContracts called');
    console.log('👤 User:', req.user.name, '(', req.user._id, ')', 'Role:', req.user.role);

    const userId = req.user._id;
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build query to find contracts where user is either farmer or HHM
    const query = {
      $or: [
        { farmer_id: userId },
        { hhm_id: userId }
      ]
    };

    // Add status filter if provided
    if (status) {
      const validStatuses = ['farmer_pending', 'hhm_accepted', 'hhm_rejected', 'auto_cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid options: ' + validStatuses.join(', ')
        });
      }
      query.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-50'
      });
    }

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1; // Descending
    } else {
      sortObj[sort] = 1; // Ascending
    }

    // Execute query with pagination and population
    const contracts = await FarmerContract.find(query)
      .populate('farmer_id', 'name username email phone location farmSize')
      .populate('hhm_id', 'name username email phone managementExperience teamSize')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const totalContracts = await FarmerContract.countDocuments(query);
    const totalPages = Math.ceil(totalContracts / limitNum);

    // Separate contracts by user role for better organization
    const contractsAsNARMER = contracts.filter(contract => 
      contract.farmer_id._id.toString() === userId.toString()
    );
    const contractsAsHHM = contracts.filter(contract => 
      contract.hhm_id._id.toString() === userId.toString()
    );

    console.log(`📈 Found ${contracts.length} contracts (${contractsAsNARMER.length} as farmer, ${contractsAsHHM.length} as HHM)`);

    res.status(200).json({
      success: true,
      message: 'Contracts retrieved successfully',
      data: {
        contracts,
        contractsAsFarmer: contractsAsNARMER,
        contractsAsHHM: contractsAsHHM,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalContracts,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        },
        filters: {
          status: status || 'all',
          sort
        },
        summary: {
          total: contracts.length,
          asFarmer: contractsAsNARMER.length,
          asHHM: contractsAsHHM.length,
          byStatus: {
            farmer_pending: contracts.filter(c => c.status === 'farmer_pending').length,
            hhm_accepted: contracts.filter(c => c.status === 'hhm_accepted').length,
            hhm_rejected: contracts.filter(c => c.status === 'hhm_rejected').length,
            auto_cancelled: contracts.filter(c => c.status === 'auto_cancelled').length
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Get contracts error:', error.message);
    console.error('Full error stack:', error.stack);

    res.status(500).json({
      success: false,
      message: 'Server error while retrieving contracts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    HHM responds to a farmer contract (accept/reject) with Farmer Exclusivity logic
 * @route   PUT /api/farmer-contracts/respond/:contractId
 * @access  Private (HHM only)
 */
const respondToContract = async (req, res) => {
  try {
    console.log('🤝 FarmerContract Controller - respondToContract called');
    console.log('👤 HHM:', req.user.name, '(', req.user._id, ')');
    console.log('📄 Contract ID:', req.params.contractId);
    
    const { contractId } = req.params;
    const { decision } = req.body;
    const hhmId = req.user._id;

    // Validation - Check required fields
    if (!decision) {
      return res.status(400).json({
        success: false,
        message: 'Decision is required'
      });
    }

    // Validate decision value
    if (!['accept', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "accept" or "reject"'
      });
    }

    // Validate contract ID format
    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID format'
      });
    }

    // Find the contract by ID
    const contract = await FarmerContract.findById(contractId)
      .populate('farmer_id', 'name username email phone location')
      .populate('hhm_id', 'name username email phone managementExperience');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if the logged-in HHM is the one assigned to this contract
    if (contract.hhm_id._id.toString() !== hhmId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this contract'
      });
    }

    // Check if contract is still pending
    if (contract.status !== 'farmer_pending') {
      return res.status(400).json({
        success: false,
        message: `Contract is already ${contract.status}. Only pending contracts can be responded to.`
      });
    }

    let responseResult = {};
    let autoCancelledCount = 0;

    if (decision === 'reject') {
      // ================================
      // REJECT LOGIC
      // ================================
      console.log('❌ HHM is rejecting the contract');
      
      // Update contract status to 'hhm_rejected'
      contract.status = 'hhm_rejected';
      await contract.save();
      
      responseResult = {
        action: 'rejected',
        contract: contract,
        message: 'Contract has been rejected'
      };
      
      console.log('✅ Contract rejected successfully');
      
    } else if (decision === 'accept') {
      // ================================
      // ACCEPT LOGIC WITH FARMER EXCLUSIVITY
      // ================================
      console.log('✅ HHM is accepting the contract - applying Farmer Exclusivity logic');
      
      const farmerId = contract.farmer_id._id;
      console.log('🌾 Farmer ID:', farmerId);
      
      // Step 1: Update the accepted contract status to 'hhm_accepted'
      contract.status = 'hhm_accepted';
      await contract.save();
      console.log('✅ Contract accepted and saved');
      
      // Step 2: Find and auto-cancel all other pending contracts from the same farmer
      console.log('🔍 Finding other pending contracts from the same farmer...');
      
      const otherPendingContracts = await FarmerContract.find({
        farmer_id: farmerId,
        status: 'farmer_pending',
        _id: { $ne: contractId } // Exclude the current contract
      });
      
      console.log(`📋 Found ${otherPendingContracts.length} other pending contracts to auto-cancel`);
      
      // Step 3: Auto-cancel all other pending contracts using updateMany
      if (otherPendingContracts.length > 0) {
        const updateResult = await FarmerContract.updateMany(
          {
            farmer_id: farmerId,
            status: 'farmer_pending',
            _id: { $ne: contractId }
          },
          {
            $set: { status: 'auto_cancelled' }
          }
        );
        
        autoCancelledCount = updateResult.modifiedCount;
        console.log(`🚫 Auto-cancelled ${autoCancelledCount} pending contracts`);
      }
      
      responseResult = {
        action: 'accepted',
        contract: contract,
        farmerExclusivity: {
          autoCancelledContracts: autoCancelledCount,
          message: autoCancelledCount > 0 
            ? `${autoCancelledCount} other pending contracts from this farmer were automatically cancelled`
            : 'No other pending contracts from this farmer to cancel'
        },
        message: 'Contract has been accepted with Farmer Exclusivity applied'
      };
      
      console.log('🎉 Contract accepted with Farmer Exclusivity logic completed');
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: `Contract ${decision}ed successfully`,
      data: responseResult
    });

  } catch (error) {
    console.error('❌ Respond to contract error:', error.message);
    console.error('Full error stack:', error.stack);

    // Handle mongoose validation errors
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
      message: 'Server error while responding to contract',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createContractRequest,
  getMyContracts,
  respondToContract
};