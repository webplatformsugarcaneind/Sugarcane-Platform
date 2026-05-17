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
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'HHM';
      },
      message: 'Referenced user must exist and have role "HHM"'
    }
  },

  // Contract Status
  status: {
    type: String,
    required: [true, 'Contract status is required'],
    enum: {
      values: ['farmer_pending', 'hhm_accepted', 'hhm_rejected', 'auto_cancelled', 'completed'],
      message: 'Status must be one of: farmer_pending, hhm_accepted, hhm_rejected, auto_cancelled, completed'
    },
    default: 'farmer_pending',
    index: true
  },

  // NEW STRUCTURED FIELDS
  
  // SECTION 1: WORK DETAILS
  farmLocation: { type: String, required: true },
  workType: { type: String, default: 'Sugarcane harvesting' },
  landArea: { type: Number, required: true },
  labourRequired: { type: Number, required: true },
  workTypeDetails: [{ 
    type: String, 
    enum: ['cutting', 'loading', 'transport'] 
  }],

  // SECTION 2: EQUIPMENT & CONDITIONS
  equipment: {
    tractor: { type: Boolean, default: false },
    loadingTools: { type: Boolean, default: false }
  },
  fieldAccessibility: { 
    type: String, 
    enum: ['easy', 'medium', 'difficult'],
    default: 'easy'
  },
  cropCondition: { 
    type: String, 
    enum: ['ready', 'almost_ready'],
    default: 'ready'
  },

  // SECTION 3: PAYMENT TERMS
  paymentType: { 
    type: String, 
    enum: ['per_day', 'per_acre', 'contract'],
    default: 'per_day'
  },
  amount: { type: Number, required: true },
  advancePayment: { type: Boolean, default: false },
  isNegotiable: { type: Boolean, default: false },

  // SECTION 4: TIMELINE
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration_days: {
    type: Number,
    required: [true, 'Contract duration in days is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  grace_period_days: {
    type: Number,
    required: [true, 'Grace period is required'],
    default: 2
  },
  urgency: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isFlexibleStart: { type: Boolean, default: false },

  // SECTION 5: LOGISTICS & NOTES
  roadAccess: { 
    type: String, 
    enum: ['good', 'limited', 'none'],
    default: 'good'
  },
  waterAvailability: { 
    type: String, 
    enum: ['available', 'nearby', 'not_available'],
    default: 'available'
  },
  additionalNotes: { type: String, maxlength: 500 },

  // LEGACY COMPATIBILITY
  contract_details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Operational Fields
  delivery_date: { type: Date },
  payment_date: { type: Date },
  payment_status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true,
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

// Indexes
farmerContractSchema.index({ farmer_id: 1, hhm_id: 1 });
farmerContractSchema.index({ status: 1, createdAt: -1 });
farmerContractSchema.index({ createdAt: -1 });

// Instance methods
farmerContractSchema.methods.isPending = function () { return this.status === 'farmer_pending'; };
farmerContractSchema.methods.isAccepted = function () { return this.status === 'hhm_accepted'; };
farmerContractSchema.methods.isRejectedOrCancelled = function () { 
  return this.status === 'hhm_rejected' || this.status === 'auto_cancelled'; 
};

farmerContractSchema.methods.acceptContract = function () {
  if (!this.isPending()) throw new Error('Only pending contracts can be accepted');
  this.status = 'hhm_accepted';
  return this.save();
};

farmerContractSchema.methods.rejectContract = function () {
  if (!this.isPending()) throw new Error('Only pending contracts can be rejected');
  this.status = 'hhm_rejected';
  return this.save();
};

// Static methods
farmerContractSchema.statics.findByFarmer = function (farmerId) {
  return this.find({ farmer_id: farmerId }).populate('farmer_id hhm_id', 'name username email phone');
};

farmerContractSchema.statics.findByHHM = function (hhmId) {
  return this.find({ hhm_id: hhmId }).populate('farmer_id hhm_id', 'name username email phone');
};

farmerContractSchema.statics.findExpiredPendingContracts = function () {
  const now = new Date();
  return this.find({
    status: 'farmer_pending',
    $expr: {
      $gte: [
        { $subtract: [now, '$createdAt'] },
        { $multiply: ['$grace_period_days', 24 * 60 * 60 * 1000] }
      ]
    }
  });
};

farmerContractSchema.pre('save', function (next) {
  if (this.farmer_id && this.hhm_id && this.farmer_id.toString() === this.hhm_id.toString()) {
    return next(new Error('Farmer and HHM cannot be the same user'));
  }
  next();
});

module.exports = mongoose.model('FarmerContract', farmerContractSchema);