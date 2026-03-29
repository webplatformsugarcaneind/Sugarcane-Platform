const mongoose = require('mongoose');

/**
 * Contract Schema
 * 
 * Manages the negotiation process between an HHM and a Factory.
 * This schema handles the back-and-forth negotiation where:
 * 1. Either HHM or Factory can initiate a contract
 * 2. HHM provides request details (vehicles, labor, etc.)
 * 3. Factory provides allowance/counter-offer details
 * 4. Status tracks the current state of negotiation
 */
const contractSchema = new mongoose.Schema({
  // HHM ID - Reference to the HHM user involved in the contract
  hhm_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'HHM ID is required'],
    index: true,
    validate: {
      validator: async function (userId) {
        // Validate that the referenced user exists and has role 'HHM'
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'HHM';
      },
      message: 'Referenced user must exist and have role "HHM"'
    }
  },

  // Factory ID - Reference to the Factory user involved in the contract
  factory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Factory ID is required'],
    index: true,
    validate: {
      validator: async function (userId) {
        // Validate that the referenced user exists and has role 'Factory'
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'Factory';
      },
      message: 'Referenced user must exist and have role "Factory"'
    }
  },

  // Contract Status - Tracks the current state of the contract negotiation
  status: {
    type: String,
    required: [true, 'Contract status is required'],
    enum: {
      values: [
        'factory_invite',   // Factory has invited HHM, waiting for HHM response
        'hhm_pending',      // HHM has submitted request, waiting for factory response
        'factory_offer',    // Factory has made counter-offer, waiting for HHM response
        'factory_rejected', // Factory rejected the HHM request
        'hhm_accepted',     // HHM accepted the factory's offer
        'hhm_rejected',     // HHM rejected the factory's offer
        'expired',          // Contract offer expired
        'cancelled',        // Contract cancelled by either party
        'completed'         // Contract work completed
      ],
      message: '{VALUE} is not a valid contract status'
    },
    default: 'hhm_pending',
    index: true
  },

  // Initiated By - Tracks who started the contract negotiation
  initiated_by: {
    type: String,
    required: [true, 'Initiator is required'],
    enum: {
      values: ['hhm', 'factory'],
      message: '{VALUE} is not a valid initiator. Must be either "hhm" or "factory"'
    },
    index: true
  },

  // HHM Request Details - Stores the HHM's form data and requirements
  hhm_request_details: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        // Ensure it's an object if provided
        return value === null || value === undefined || typeof value === 'object';
      },
      message: 'HHM request details must be an object'
    }
  },

  // Factory Allowance List - Stores the Factory's counter-offer or allowance details
  factory_allowance_list: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        // Ensure it's an object if provided
        return value === null || value === undefined || typeof value === 'object';
      },
      message: 'Factory allowance list must be an object'
    }
  },

  // Factory Requirements - Stores the Factory's initial requirements when they initiate
  factory_requirements: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        // Ensure it's an object if provided
        return value === null || value === undefined || typeof value === 'object';
      },
      message: 'Factory requirements must be an object'
    }
  },

  // Additional fields for better contract management
  
  // Contract Title/Description
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Contract title cannot exceed 200 characters']
  },

  // Personal message from initiator
  initial_message: {
    type: String,
    trim: true,
    maxlength: [500, 'Initial message cannot exceed 500 characters']
  },

  // Response message from the other party
  response_message: {
    type: String,
    trim: true,
    maxlength: [500, 'Response message cannot exceed 500 characters']
  },

  // Contract priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Contract expiration date
  expires_at: {
    type: Date,
    validate: {
      validator: function (date) {
        return !date || date > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },

  // When the contract was responded to
  responded_at: {
    type: Date
  },

  // When the contract was finalized (accepted/rejected)
  finalized_at: {
    type: Date
  },

  // Contract value/amount if applicable
  contract_value: {
    type: Number,
    min: [0, 'Contract value must be a positive number']
  },

  // Contract duration in days
  duration_days: {
    type: Number,
    min: [1, 'Contract duration must be at least 1 day']
  },

  // Number of revisions made to the contract
  revision_count: {
    type: Number,
    default: 0,
    min: 0
  },

  // Last party to make changes
  last_modified_by: {
    type: String,
    enum: ['hhm', 'factory']
  },

  // Delivery Date - When the contract work was delivered/completed
  delivery_date: {
    type: Date,
    required: false
  },

  // Payment Date - When payment was made for the contract
  payment_date: {
    type: Date,
    required: false
  },

  // Payment Status - Whether payment has been made
  payment_status: {
    type: String,
    enum: {
      values: ['pending', 'paid'],
      message: 'Payment status must be either pending or paid'
    },
    default: 'pending'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
contractSchema.index({ hhm_id: 1, factory_id: 1 });
contractSchema.index({ status: 1, createdAt: -1 });
contractSchema.index({ initiated_by: 1, status: 1 });
contractSchema.index({ expires_at: 1 });
contractSchema.index({ priority: 1, status: 1 });

// Prevent duplicate pending contracts between same HHM and Factory
contractSchema.index(
  { hhm_id: 1, factory_id: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['hhm_pending', 'factory_offer'] }
    }
  }
);

// Virtual for checking if contract is expired
contractSchema.virtual('isExpired').get(function () {
  return this.expires_at && this.expires_at < new Date();
});

// Virtual for checking if contract is active (pending states)
contractSchema.virtual('isActive').get(function () {
  return ['hhm_pending', 'factory_offer'].includes(this.status);
});

// Virtual for checking if contract is finalized
contractSchema.virtual('isFinalized').get(function () {
  return ['hhm_accepted', 'hhm_rejected', 'factory_rejected', 'expired', 'cancelled', 'completed'].includes(this.status);
});

// Virtual for calculating days until expiration
contractSchema.virtual('daysUntilExpiration').get(function () {
  if (!this.expires_at) return null;
  const diffTime = this.expires_at.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for calculating response time (in hours)
contractSchema.virtual('responseTimeHours').get(function () {
  if (!this.responded_at) return null;
  const diffTime = this.responded_at.getTime() - this.createdAt.getTime();
  return Math.round(diffTime / (1000 * 60 * 60));
});

// Pre-save middleware to set default expiration (30 days from creation)
contractSchema.pre('save', function (next) {
  if (this.isNew && !this.expires_at) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days for contracts
    this.expires_at = expirationDate;
  }

  // Set responded_at when status changes from initial pending state
  if (this.isModified('status') && this.status !== this.constructor.getInitialStatus(this.initiated_by) && !this.responded_at) {
    this.responded_at = new Date();
  }

  // Set finalized_at when contract reaches final state
  if (this.isModified('status') && this.isFinalized && !this.finalized_at) {
    this.finalized_at = new Date();
  }

  // Increment revision count when HHM or Factory details are modified
  if ((this.isModified('hhm_request_details') || this.isModified('factory_allowance_list')) && !this.isNew) {
    this.revision_count += 1;
  }

  next();
});

// Static method to get initial status based on initiator
contractSchema.statics.getInitialStatus = function (initiatedBy) {
  return initiatedBy === 'hhm' ? 'hhm_pending' : 'factory_pending';
};

// Static method to find contracts by HHM
contractSchema.statics.findByHHM = function (hhmId, status = null) {
  const query = { hhm_id: hhmId };
  if (status) query.status = status;

  return this.find(query)
    .populate('factory_id', 'name email phone factoryName factoryLocation capacity')
    .sort({ createdAt: -1 });
};

// Static method to find contracts by Factory
contractSchema.statics.findByFactory = function (factoryId, status = null) {
  const query = { factory_id: factoryId };
  if (status) query.status = status;

  return this.find(query)
    .populate('hhm_id', 'name email phone managementExperience teamSize servicesOffered')
    .sort({ createdAt: -1 });
};

// Static method to find active contracts between HHM and Factory
contractSchema.statics.findActiveContract = function (hhmId, factoryId) {
  return this.findOne({
    hhm_id: hhmId,
    factory_id: factoryId,
    status: { $in: ['hhm_pending', 'factory_offer'] }
  });
};

// Static method to find expired contracts
contractSchema.statics.findExpired = function () {
  return this.find({
    status: { $in: ['hhm_pending', 'factory_offer'] },
    expires_at: { $lt: new Date() }
  }).populate('hhm_id factory_id');
};

// Static method to find contracts expiring soon
contractSchema.statics.findExpiringSoon = function (days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  return this.find({
    status: { $in: ['hhm_pending', 'factory_offer'] },
    expires_at: { $lte: cutoffDate, $gt: new Date() }
  }).populate('hhm_id factory_id');
};

// Instance method to accept contract
contractSchema.methods.accept = function (responseMessage = '') {
  if (!this.isActive) {
    throw new Error('Cannot accept a non-active contract');
  }
  
  this.status = 'accepted';
  this.finalized_at = new Date();
  if (responseMessage) this.response_message = responseMessage;
  return this.save();
};

// Instance method to reject contract
contractSchema.methods.reject = function (responseMessage = '') {
  if (!this.isActive) {
    throw new Error('Cannot reject a non-active contract');
  }
  
  this.status = 'rejected';
  this.finalized_at = new Date();
  if (responseMessage) this.response_message = responseMessage;
  return this.save();
};

// Instance method to cancel contract
contractSchema.methods.cancel = function (responseMessage = '') {
  if (this.isFinalized) {
    throw new Error('Cannot cancel a finalized contract');
  }
  
  this.status = 'cancelled';
  this.finalized_at = new Date();
  if (responseMessage) this.response_message = responseMessage;
  return this.save();
};

// Instance method to update HHM request details
contractSchema.methods.updateHHMRequest = function (requestDetails, modifiedBy = 'hhm') {
  if (this.isFinalized) {
    throw new Error('Cannot update finalized contract');
  }
  
  this.hhm_request_details = requestDetails;
  this.last_modified_by = modifiedBy;
  
  // Update status based on who modified and current state
  if (this.status === 'factory_offer') {
    this.status = 'hhm_pending'; // HHM made changes, now factory needs to respond
  }
  
  return this.save();
};

// Instance method to update Factory allowance list
contractSchema.methods.updateFactoryAllowance = function (allowanceList, modifiedBy = 'factory') {
  if (this.isFinalized) {
    throw new Error('Cannot update finalized contract');
  }
  
  this.factory_allowance_list = allowanceList;
  this.last_modified_by = modifiedBy;
  
  // Update status based on who modified and current state
  if (this.status === 'hhm_pending') {
    this.status = 'factory_offer'; // Factory made changes, now HHM needs to respond
  }
  
  return this.save();
};

// Instance method to extend expiration
contractSchema.methods.extendExpiration = function (days = 7) {
  if (this.isFinalized) {
    throw new Error('Cannot extend expiration for finalized contracts');
  }
  
  const newExpiration = new Date(this.expires_at || new Date());
  newExpiration.setDate(newExpiration.getDate() + days);
  this.expires_at = newExpiration;
  return this.save();
};

// Instance method to get contract summary
contractSchema.methods.getSummary = function () {
  return {
    id: this._id,
    hhm_id: this.hhm_id,
    factory_id: this.factory_id,
    status: this.status,
    initiated_by: this.initiated_by,
    title: this.title,
    priority: this.priority,
    contract_value: this.contract_value,
    duration_days: this.duration_days,
    revision_count: this.revision_count,
    isActive: this.isActive,
    isExpired: this.isExpired,
    daysUntilExpiration: this.daysUntilExpiration,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Post-save middleware for additional actions
contractSchema.post('save', async function (doc) {
  // Log status changes for audit trail
  if (doc.isModified('status')) {
    console.log(`Contract ${doc._id}: Status changed to ${doc.status}`);
  }
  
  // Here you could add notification logic, email sending, etc.
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;