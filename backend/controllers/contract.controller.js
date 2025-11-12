const Contract = require('../models/contract.model');
const User = require('../models/user.model');

/**
 * @desc    Create a new contract request (HHM initiates)
 * @route   POST /api/contracts/request
 * @access  Private (HHM only)
 */
const createContractRequest = async (req, res) => {
  try {
    console.log('📋 Creating new contract request from HHM:', req.user._id);

    const {
      factory_id,
      hhm_request_details,
      title,
      initial_message,
      priority = 'medium',
      contract_value,
      duration_days
    } = req.body;

    // Validate required fields
    if (!factory_id) {
      return res.status(400).json({
        success: false,
        message: 'Factory ID is required'
      });
    }

    if (!hhm_request_details || typeof hhm_request_details !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'HHM request details are required and must be an object'
      });
    }

    // Verify factory exists and has correct role
    const factory = await User.findById(factory_id);
    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    if (factory.role !== 'Factory') {
      return res.status(400).json({
        success: false,
        message: 'Referenced user must have Factory role'
      });
    }

    // Check for existing active contract between HHM and Factory
    const existingContract = await Contract.findActiveContract(req.user._id, factory_id);
    if (existingContract) {
      return res.status(409).json({
        success: false,
        message: 'An active contract already exists between you and this factory',
        data: { existingContractId: existingContract._id }
      });
    }

    // Create contract
    const contract = await Contract.create({
      hhm_id: req.user._id,
      factory_id,
      status: 'hhm_pending',
      initiated_by: 'hhm',
      hhm_request_details,
      title,
      initial_message,
      priority,
      contract_value,
      duration_days,
      last_modified_by: 'hhm'
    });

    // Populate with user details
    await contract.populate([
      { path: 'hhm_id', select: 'name email phone managementExperience teamSize servicesOffered' },
      { path: 'factory_id', select: 'name email phone factoryName factoryLocation capacity' }
    ]);

    console.log('✅ Contract request created successfully:', contract._id);

    res.status(201).json({
      success: true,
      data: contract,
      message: 'Contract request created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating contract request:', error);
    
    // Handle duplicate contract error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An active contract already exists between you and this factory'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating contract request',
      error: error.message
    });
  }
};

/**
 * @desc    Factory invites HHM to join (Factory initiates)
 * @route   POST /api/contracts/invite
 * @access  Private (Factory only)
 */
const createFactoryInvite = async (req, res) => {
  try {
    console.log('🏭 Creating factory invite to HHM:', req.body.hhm_id);

    const {
      hhm_id,
      title,
      initial_message,
      priority = 'medium',
      contract_value,
      duration_days,
      factory_requirements
    } = req.body;

    // Validate required fields
    if (!hhm_id) {
      return res.status(400).json({
        success: false,
        message: 'HHM ID is required'
      });
    }

    // Verify HHM exists and has correct role
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
        message: 'Referenced user must have HHM role'
      });
    }

    // Check for existing active contracts between this factory and HHM
    const existingContract = await Contract.findOne({
      hhm_id: hhm_id,
      factory_id: req.user._id,
      status: { $in: ['factory_invite', 'hhm_pending', 'factory_offer'] }
    });

    if (existingContract) {
      return res.status(409).json({
        success: false,
        message: 'An active contract or invite already exists with this HHM'
      });
    }

    // Set expiration date (default 7 days for invitations)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + (duration_days || 7));

    // Create new contract with factory_invite status
    const contractData = {
      hhm_id: hhm_id,
      factory_id: req.user._id,
      status: 'factory_invite',
      initiated_by: 'factory',
      title: title || 'Partnership Invitation',
      priority,
      contract_value,
      duration_days,
      expiration_date: expirationDate,
      factory_requirements,
      initial_message,
      created_at: new Date(),
      updated_at: new Date()
    };

    const contract = new Contract(contractData);
    await contract.save();

    // Populate the contract with user details for response
    await contract.populate([
      {
        path: 'hhm_id',
        select: 'name email phone managementExperience availableWorkers'
      },
      {
        path: 'factory_id', 
        select: 'factoryName email phone location specialization'
      }
    ]);

    console.log('✅ Factory invite created successfully:', contract._id);

    res.status(201).json({
      success: true,
      data: contract,
      message: 'Factory invitation sent successfully'
    });

  } catch (error) {
    console.error('❌ Error creating factory invite:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate contract error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.hhm_id && error.keyPattern.factory_id) {
      return res.status(409).json({
        success: false,
        message: 'An active invite already exists with this HHM'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating factory invitation',
      error: error.message
    });
  }
};

/**
 * @desc    HHM accepts factory invitation
 * @route   PUT /api/contracts/:contractId/accept-invite
 * @access  Private (HHM only)
 */
const acceptFactoryInvite = async (req, res) => {
  try {
    console.log('🤝 HHM accepting factory invite:', req.params.contractId);

    const { contractId } = req.params;
    const { response_message } = req.body;

    // Find the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Verify this is a factory invite for this HHM
    if (contract.hhm_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this invitation'
      });
    }

    if (contract.status !== 'factory_invite') {
      return res.status(400).json({
        success: false,
        message: 'This invitation is no longer available for response'
      });
    }

    // Check if invitation has expired
    if (contract.expiration_date && contract.expiration_date < new Date()) {
      await Contract.findByIdAndUpdate(contractId, { status: 'expired' });
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired'
      });
    }

    // Update contract to accepted status
    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      {
        status: 'hhm_accepted',
        response_message,
        responded_at: new Date(),
        finalized_at: new Date(),
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'hhm_id',
        select: 'name email phone managementExperience availableWorkers'
      },
      {
        path: 'factory_id', 
        select: 'factoryName email phone location specialization'
      }
    ]);

    console.log('✅ Factory invitation accepted successfully');

    res.status(200).json({
      success: true,
      data: updatedContract,
      message: 'Factory invitation accepted successfully'
    });

  } catch (error) {
    console.error('❌ Error accepting factory invite:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting factory invitation',
      error: error.message
    });
  }
};

/**
 * @desc    HHM rejects factory invitation
 * @route   PUT /api/contracts/:contractId/reject-invite
 * @access  Private (HHM only)
 */
const rejectFactoryInvite = async (req, res) => {
  try {
    console.log('❌ HHM rejecting factory invite:', req.params.contractId);

    const { contractId } = req.params;
    const { response_message } = req.body;

    // Find the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Verify this is a factory invite for this HHM
    if (contract.hhm_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this invitation'
      });
    }

    if (contract.status !== 'factory_invite') {
      return res.status(400).json({
        success: false,
        message: 'This invitation is no longer available for response'
      });
    }

    // Update contract to rejected status
    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      {
        status: 'hhm_rejected',
        response_message,
        responded_at: new Date(),
        finalized_at: new Date(),
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'hhm_id',
        select: 'name email phone managementExperience availableWorkers'
      },
      {
        path: 'factory_id', 
        select: 'factoryName email phone location specialization'
      }
    ]);

    console.log('✅ Factory invitation rejected');

    res.status(200).json({
      success: true,
      data: updatedContract,
      message: 'Factory invitation rejected'
    });

  } catch (error) {
    console.error('❌ Error rejecting factory invite:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting factory invitation',
      error: error.message
    });
  }
};

/**
 * @desc    Factory responds to HHM contract request
 * @route   PUT /api/contracts/respond/:contractId
 * @access  Private (Factory only)
 */
const respondToContract = async (req, res) => {
  try {
    console.log('🏭 Factory responding to contract:', req.params.contractId);

    const { contractId } = req.params;
    const {
      decision,
      factory_allowance_list,
      response_message,
      contract_value,
      duration_days
    } = req.body;

    // Validate required fields
    if (!decision || !['reject', 'offer'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "reject" or "offer"'
      });
    }

    if (decision === 'offer' && (!factory_allowance_list || typeof factory_allowance_list !== 'object')) {
      return res.status(400).json({
        success: false,
        message: 'Factory allowance list is required when making an offer and must be an object'
      });
    }

    // Find contract and verify it belongs to this factory
    const contract = await Contract.findOne({
      _id: contractId,
      factory_id: req.user._id
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or you are not authorized to respond to this contract'
      });
    }

    // Check if contract is in correct status
    if (contract.status !== 'hhm_pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot respond to contract in status: ${contract.status}. Expected: hhm_pending`
      });
    }

    // Check if contract is expired
    if (contract.isExpired) {
      await contract.updateOne({ status: 'expired' });
      return res.status(400).json({
        success: false,
        message: 'Cannot respond to an expired contract'
      });
    }

    let updatedContract;

    if (decision === 'reject') {
      // Factory rejects the contract
      updatedContract = await contract.reject(response_message);
      updatedContract.status = 'factory_rejected'; // Custom status for factory rejection
    } else {
      // Factory makes a counter-offer
      contract.factory_allowance_list = factory_allowance_list;
      contract.status = 'factory_offer'; // Now waiting for HHM response
      contract.last_modified_by = 'factory';
      contract.responded_at = new Date();
      
      if (response_message) contract.response_message = response_message;
      if (contract_value !== undefined) contract.contract_value = contract_value;
      if (duration_days !== undefined) contract.duration_days = duration_days;

      updatedContract = await contract.save();
    }

    // Populate with user details
    await updatedContract.populate([
      { path: 'hhm_id', select: 'name email phone managementExperience teamSize servicesOffered' },
      { path: 'factory_id', select: 'name email phone factoryName factoryLocation capacity' }
    ]);

    console.log('✅ Factory response processed successfully:', updatedContract._id);

    res.status(200).json({
      success: true,
      data: updatedContract,
      message: `Contract ${decision === 'reject' ? 'rejected' : 'counter-offer sent'} successfully`
    });

  } catch (error) {
    console.error('❌ Error processing factory response:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing factory response',
      error: error.message
    });
  }
};

/**
 * @desc    HHM finalizes contract (accept or reject factory offer)
 * @route   PUT /api/contracts/finalize/:contractId
 * @access  Private (HHM only)
 */
const finalizeContract = async (req, res) => {
  try {
    console.log('👨‍💼 HHM finalizing contract:', req.params.contractId);

    const { contractId } = req.params;
    const { decision, response_message } = req.body;

    // Validate required fields
    if (!decision || !['accept', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "accept" or "reject"'
      });
    }

    // Find contract and verify it belongs to this HHM
    const contract = await Contract.findOne({
      _id: contractId,
      hhm_id: req.user._id
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or you are not authorized to finalize this contract'
      });
    }

    // Check if contract is in correct status
    if (contract.status !== 'factory_offer') {
      return res.status(400).json({
        success: false,
        message: `Cannot finalize contract in status: ${contract.status}. Expected: factory_offer`
      });
    }

    // Check if contract is expired
    if (contract.isExpired) {
      await contract.updateOne({ status: 'expired' });
      return res.status(400).json({
        success: false,
        message: 'Cannot finalize an expired contract'
      });
    }

    let updatedContract;

    if (decision === 'accept') {
      // HHM accepts the factory's offer
      updatedContract = await contract.accept(response_message);
      updatedContract.status = 'hhm_accepted';
    } else {
      // HHM rejects the factory's offer
      updatedContract = await contract.reject(response_message);
      updatedContract.status = 'hhm_rejected';
    }

    // Populate with user details
    await updatedContract.populate([
      { path: 'hhm_id', select: 'name email phone managementExperience teamSize servicesOffered' },
      { path: 'factory_id', select: 'name email phone factoryName factoryLocation capacity' }
    ]);

    console.log('✅ Contract finalization processed successfully:', updatedContract._id);

    res.status(200).json({
      success: true,
      data: updatedContract,
      message: `Contract ${decision}ed successfully`
    });

  } catch (error) {
    console.error('❌ Error finalizing contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error finalizing contract',
      error: error.message
    });
  }
};

/**
 * @desc    Get all contracts for the currently logged-in user
 * @route   GET /api/contracts/my-contracts
 * @access  Private (HHM or Factory)
 */
const getMyContracts = async (req, res) => {
  try {
    console.log('📋 Getting contracts for user:', req.user._id, 'Role:', req.user.role);

    const {
      status,
      priority,
      initiated_by,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query based on user role
    let query;
    if (req.user.role === 'HHM') {
      query = { hhm_id: req.user._id };
    } else if (req.user.role === 'Factory') {
      query = { factory_id: req.user._id };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only HHM and Factory users can access contracts'
      });
    }

    // Add optional filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (initiated_by) query.initiated_by = initiated_by;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get contracts with pagination
    const contracts = await Contract.find(query)
      .populate('hhm_id', 'name email phone managementExperience teamSize servicesOffered')
      .populate('factory_id', 'name email phone factoryName factoryLocation capacity')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Contract.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    console.log('✅ Contracts retrieved successfully. Count:', contracts.length);

    res.status(200).json({
      success: true,
      data: contracts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalContracts: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      message: 'Contracts retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contracts',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific contract by ID
 * @route   GET /api/contracts/:contractId
 * @access  Private (HHM or Factory - must be party to the contract)
 */
const getContractById = async (req, res) => {
  try {
    console.log('🔍 Getting contract by ID:', req.params.contractId);

    const { contractId } = req.params;

    // Find contract
    const contract = await Contract.findById(contractId)
      .populate('hhm_id', 'name email phone managementExperience teamSize servicesOffered')
      .populate('factory_id', 'name email phone factoryName factoryLocation capacity');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if user is authorized to view this contract
    const userIsParty = (req.user.role === 'HHM' && contract.hhm_id._id.toString() === req.user._id.toString()) ||
                       (req.user.role === 'Factory' && contract.factory_id._id.toString() === req.user._id.toString());

    if (!userIsParty) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this contract'
      });
    }

    console.log('✅ Contract retrieved successfully:', contract._id);

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contract',
      error: error.message
    });
  }
};

/**
 * @desc    Update contract expiration (extend deadline)
 * @route   PUT /api/contracts/:contractId/extend
 * @access  Private (HHM or Factory - must be party to the contract)
 */
const extendContract = async (req, res) => {
  try {
    console.log('⏰ Extending contract:', req.params.contractId);

    const { contractId } = req.params;
    const { days = 7 } = req.body;

    // Find contract
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if user is authorized to extend this contract
    const userIsParty = (req.user.role === 'HHM' && contract.hhm_id.toString() === req.user._id.toString()) ||
                       (req.user.role === 'Factory' && contract.factory_id.toString() === req.user._id.toString());

    if (!userIsParty) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to extend this contract'
      });
    }

    // Validate days
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      return res.status(400).json({
        success: false,
        message: 'Extension days must be an integer between 1 and 30'
      });
    }

    // Extend the contract
    const updatedContract = await contract.extendExpiration(days);

    await updatedContract.populate([
      { path: 'hhm_id', select: 'name email phone managementExperience teamSize servicesOffered' },
      { path: 'factory_id', select: 'name email phone factoryName factoryLocation capacity' }
    ]);

    console.log('✅ Contract extended successfully:', updatedContract._id);

    res.status(200).json({
      success: true,
      data: updatedContract,
      message: `Contract deadline extended by ${days} days`
    });

  } catch (error) {
    console.error('❌ Error extending contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error extending contract',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel a contract (available to both parties)
 * @route   PUT /api/contracts/:contractId/cancel
 * @access  Private (HHM or Factory - must be party to the contract)
 */
const cancelContract = async (req, res) => {
  try {
    console.log('❌ Cancelling contract:', req.params.contractId);

    const { contractId } = req.params;
    const { reason } = req.body;

    // Find contract
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if user is authorized to cancel this contract
    const userIsParty = (req.user.role === 'HHM' && contract.hhm_id.toString() === req.user._id.toString()) ||
                       (req.user.role === 'Factory' && contract.factory_id.toString() === req.user._id.toString());

    if (!userIsParty) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this contract'
      });
    }

    // Cancel the contract
    const updatedContract = await contract.cancel(reason);

    await updatedContract.populate([
      { path: 'hhm_id', select: 'name email phone managementExperience teamSize servicesOffered' },
      { path: 'factory_id', select: 'name email phone factoryName factoryLocation capacity' }
    ]);

    console.log('✅ Contract cancelled successfully:', updatedContract._id);

    res.status(200).json({
      success: true,
      data: updatedContract,
      message: 'Contract cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling contract',
      error: error.message
    });
  }
};

/**
 * @desc    Get contract statistics for dashboard
 * @route   GET /api/contracts/stats
 * @access  Private (HHM or Factory)
 */
const getContractStats = async (req, res) => {
  try {
    console.log('📊 Getting contract statistics for user:', req.user._id, 'Role:', req.user.role);

    // Build query based on user role
    let query;
    if (req.user.role === 'HHM') {
      query = { hhm_id: req.user._id };
    } else if (req.user.role === 'Factory') {
      query = { factory_id: req.user._id };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only HHM and Factory users can access contract statistics'
      });
    }

    // Get statistics in parallel
    const [
      totalContracts,
      pendingContracts,
      activeContracts,
      acceptedContracts,
      rejectedContracts,
      expiredContracts,
      cancelledContracts,
      initiatedByUser,
      receivedByUser
    ] = await Promise.all([
      Contract.countDocuments(query),
      Contract.countDocuments({ ...query, status: { $in: ['hhm_pending', 'factory_offer'] } }),
      Contract.countDocuments({ ...query, status: { $in: ['hhm_pending', 'factory_offer'] } }),
      Contract.countDocuments({ ...query, status: 'hhm_accepted' }),
      Contract.countDocuments({ ...query, status: { $in: ['hhm_rejected', 'factory_rejected'] } }),
      Contract.countDocuments({ ...query, status: 'expired' }),
      Contract.countDocuments({ ...query, status: 'cancelled' }),
      Contract.countDocuments({ ...query, initiated_by: req.user.role.toLowerCase() }),
      Contract.countDocuments({ ...query, initiated_by: { $ne: req.user.role.toLowerCase() } })
    ]);

    const stats = {
      overview: {
        total: totalContracts,
        active: activeContracts,
        accepted: acceptedContracts,
        rejected: rejectedContracts,
        expired: expiredContracts,
        cancelled: cancelledContracts
      },
      byInitiator: {
        initiated: initiatedByUser,
        received: receivedByUser
      },
      breakdown: {
        pending: pendingContracts,
        completed: acceptedContracts + rejectedContracts + expiredContracts + cancelledContracts
      }
    };

    console.log('✅ Contract statistics retrieved successfully');

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Contract statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting contract statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contract statistics',
      error: error.message
    });
  }
};

module.exports = {
  createContractRequest,
  createFactoryInvite,
  acceptFactoryInvite,
  rejectFactoryInvite,
  respondToContract,
  finalizeContract,
  getMyContracts,
  getContractById,
  extendContract,
  cancelContract,
  getContractStats
};