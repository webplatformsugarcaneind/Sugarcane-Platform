const mongoose = require('mongoose');

/**
 * FarmerContract Schema
 * 
 * Manages job requests from a Farmer to an HHM.
 * This schema handles the contract process where:
 * 1. Farmer initiates a contract request to an HHM
 * 2. HHM can accept or reject the request
 * 3. Status tracks the current state of the contract
 * 4. Auto-cancellation occurs after grace period if no response
 */
const farmerContractSchema = new mongoose.Schema({
  // Farmer ID - Reference to the Farmer user who initiated the contract
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required'],
    index: true,
    validate: {
      validator: async function (userId) {
        // Validate that the referenced user exists and has role 'Farmer'
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'Farmer';
      },
      message: 'Referenced user must exist and have role "Farmer"'
    }
  },

  // HHM ID - Reference to the HHM user who will handle the contract
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

  // Contract Status - Tracks the current state of the farmer contract
  status: {
    type: String,
    required: [true, 'Contract status is required'],
    enum: {
      values: ['farmer_pending', 'hhm_accepted', 'hhm_rejected', 'auto_cancelled'],
      message: 'Status must be one of: farmer_pending, hhm_accepted, hhm_rejected, auto_cancelled'
    },
    default: 'farmer_pending',
    index: true
  },

  // Contract Details - Object containing specific contract information
  contract_details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Duration in Days - How long the contract is expected to last
  duration_days: {
    type: Number,
    required: [true, 'Contract duration in days is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },

  // Grace Period Days - Days to wait before auto-cancellation
  grace_period_days: {
    type: Number,
    required: [true, 'Grace period is required'],
    default: 2,
    min: [1, 'Grace period must be at least 1 day'],
    max: [30, 'Grace period cannot exceed 30 days']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for efficient queries
farmerContractSchema.index({ farmer_id: 1, hhm_id: 1 });
farmerContractSchema.index({ status: 1, createdAt: -1 });
farmerContractSchema.index({ createdAt: -1 });

// Instance method to check if contract is pending
farmerContractSchema.methods.isPending = function () {
  return this.status === 'farmer_pending';
};

// Instance method to check if contract is accepted
farmerContractSchema.methods.isAccepted = function () {
  return this.status === 'hhm_accepted';
};

// Instance method to check if contract is rejected or cancelled
farmerContractSchema.methods.isRejectedOrCancelled = function () {
  return this.status === 'hhm_rejected' || this.status === 'auto_cancelled';
};

// Instance method to accept the contract
farmerContractSchema.methods.acceptContract = function () {
  if (!this.isPending()) {
    throw new Error('Only pending contracts can be accepted');
  }
  this.status = 'hhm_accepted';
  return this.save();
};

// Instance method to reject the contract
farmerContractSchema.methods.rejectContract = function () {
  if (!this.isPending()) {
    throw new Error('Only pending contracts can be rejected');
  }
  this.status = 'hhm_rejected';
  return this.save();
};

// Instance method to auto-cancel the contract
farmerContractSchema.methods.autoCancelContract = function () {
  if (!this.isPending()) {
    throw new Error('Only pending contracts can be auto-cancelled');
  }
  this.status = 'auto_cancelled';
  return this.save();
};

// Static method to find contracts by farmer
farmerContractSchema.statics.findByFarmer = function (farmerId) {
  return this.find({ farmer_id: farmerId }).populate('farmer_id hhm_id', 'name username email phone');
};

// Static method to find contracts by HHM
farmerContractSchema.statics.findByHHM = function (hhmId) {
  return this.find({ hhm_id: hhmId }).populate('farmer_id hhm_id', 'name username email phone');
};

// Static method to find pending contracts
farmerContractSchema.statics.findPending = function () {
  return this.find({ status: 'farmer_pending' }).populate('farmer_id hhm_id', 'name username email phone');
};

// Static method to find contracts that should be auto-cancelled
farmerContractSchema.statics.findExpiredPendingContracts = function () {
  const now = new Date();
  return this.find({
    status: 'farmer_pending',
    $expr: {
      $gte: [
        { $subtract: [now, '$createdAt'] },
        { $multiply: ['$grace_period_days', 24 * 60 * 60 * 1000] } // Convert days to milliseconds
      ]
    }
  });
};

// Pre-save hook to validate contract details
farmerContractSchema.pre('save', function (next) {
  // Ensure farmer and HHM are different users
  if (this.farmer_id && this.hhm_id && this.farmer_id.toString() === this.hhm_id.toString()) {
    return next(new Error('Farmer and HHM cannot be the same user'));
  }
  
  next();
});

// Export the model
module.exports = mongoose.model('FarmerContract', farmerContractSchema);