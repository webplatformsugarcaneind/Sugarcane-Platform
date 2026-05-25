const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['Farmer', 'HHM', 'Labour', 'Factory'],
      message: 'Role must be one of: Farmer, HHM, Labour, Factory'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Factory-specific fields
  factoryName: { type: String, trim: true },
  factoryLocation: { type: String, trim: true },
  factoryDescription: { type: String, trim: true },
  capacity: { type: String, trim: true },
  experience: { type: String, trim: true },
  specialization: { type: String, trim: true },
  crushingStatus: { type: String, enum: ['ON', 'OFF'], default: 'OFF', trim: true },
  establishedYear: { type: String, trim: true },
  description: { type: String, trim: true },
  contactInfo: {
    website: { type: String, trim: true },
    fax: { type: String, trim: true },
    tollfree: { type: String, trim: true },
    landline: { type: String, trim: true }
  },
  operatingHours: { season: { type: String, trim: true } },
  operatingSeason: { type: String, trim: true },

  // Farmer-specific fields
  farmSize: { type: String, trim: true },
  farmingExperience: { type: String, trim: true },
  farmingMethods: { type: String, trim: true },
  equipment: { type: String, trim: true },
  certifications: { type: String, trim: true },
  cropTypes: { type: String, trim: true },
  irrigationType: { type: String, trim: true },
  location: { type: String, trim: true },
  cropVariety: { type: String, trim: true },
  estimatedYield: { type: String, trim: true },
  cropStatus: { type: String, trim: true, default: 'Standing Crop' },
  farmType: { type: String, trim: true },
  preferredHarvestDate: { type: Date },
  harvestDate: { type: Date },
  workersNeeded: { type: String, trim: true },
  harvestType: { type: String, trim: true, default: 'Manual' },
  transportRequired: { type: Boolean, default: true },
  loadingSupport: { type: Boolean, default: false },
  machineRequired: { type: String, trim: true, default: 'Manual Preferred' },
  urgencyLevel: { type: String, trim: true, default: 'Normal Season' },
  village: { type: String, trim: true },
  region: { type: String, trim: true },
  district: { type: String, trim: true },
  distanceFromFactory: { type: String, trim: true },
  roadAccessibility: { type: String, trim: true, default: 'Truck Accessible' },
  loadingPoint: { type: String, trim: true },
  harvestWindow: { type: String, trim: true },
  dailyHours: { type: String, trim: true },
  shiftPreference: { type: String, trim: true, default: 'Day Shift' },
  peakDays: { type: String, trim: true },
  contractStatus: { type: String, trim: true, default: 'Open for Proposals' },
  preferredPayment: { type: String, trim: true, default: 'Bank Transfer' },
  previousContractType: { type: String, trim: true, default: 'Seasonal' },
  advanceRequired: { type: Boolean, default: false },
  settlementPreference: { type: String, trim: true, default: 'Per Harvest Cycle' },
  hhmPartnerships: { type: Number, default: 0 },
  seasonsCompleted: { type: Number, default: 0 },
  reliabilityRating: { type: Number, default: 0 },
  trackRecord: { type: String, trim: true },
  contactPreference: { type: String, trim: true, default: 'Any' },

  // HHM-specific fields
  managementExperience: {
    type: String,
    trim: true
  },
  teamSize: {
    type: String,
    trim: true
  },
  managementOperations: {
    type: String,
    trim: true
  },
  servicesOffered: {
    type: String,
    trim: true
  },
  workingAreas: [{
    type: String,
    trim: true
  }],
  workerTypes: [{
    type: String,
    trim: true
  }],
  activeJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  avgCompletionTime: {
    type: String,
    trim: true
  },
  priceRange: {
    type: String,
    trim: true
  },
  isNegotiable: {
    type: Boolean,
    default: true
  },
  workHistory: [{
    cropType: String,
    location: String,
    status: String,
    date: Date
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    farmerName: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  // Associated factories for HHM (list of factory IDs)
  associatedFactories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function (userId) {
        // Validate that the referenced user exists and has role 'Factory'
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'Factory';
      },
      message: 'Associated user must exist and have role "Factory"'
    }
  }],

  // Associated HHMs for Factory (list of HHM IDs)
  associatedHHMs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function (userId) {
        // Validate that the referenced user exists and has role 'HHM'
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'HHM';
      },
      message: 'Associated user must exist and have role "HHM"'
    }
  }],

  // Labour-specific fields
  skills: { type: String, trim: true },
  workPreferences: { type: String, trim: true },
  wageRate: { type: String, trim: true },
  availability: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' },
  workExperience: { type: String, trim: true },
  preferredLocation: { type: String, trim: true },

  // Marketplace fields for Farmers
  listings: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    crop_variety: {
      type: String,
      required: true,
      trim: true
    },
    quantity_in_tons: {
      type: Number,
      required: true,
      min: 0
    },
    expected_price_per_ton: {
      type: Number,
      required: true,
      min: 0
    },
    harvest_availability_date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Orders received by this farmer (as seller)
  receivedOrders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    listingId: {
      type: String,
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    buyerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    orderDetails: {
      quantityWanted: { type: Number, required: true, min: 0 },
      proposedPrice: { type: Number, required: true, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      deliveryLocation: { type: String, required: true },
      message: { type: String },
      urgency: { type: String, enum: ['normal', 'medium', 'high', 'urgent'], default: 'normal' }
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    isPartialFulfillment: {
      type: Boolean,
      default: false
    },
    originalQuantityRequested: {
      type: Number,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Orders sent by this farmer (as buyer)
  sentOrders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    listingId: {
      type: String,
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    buyerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    orderDetails: {
      quantityWanted: { type: Number, required: true, min: 0 },
      proposedPrice: { type: Number, required: true, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      deliveryLocation: { type: String, required: true },
      message: { type: String },
      urgency: { type: String, enum: ['normal', 'medium', 'high', 'urgent'], default: 'normal' }
    },
    targetFarmerName: { type: String, required: true },
    targetFarmerEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    isPartialFulfillment: {
      type: Boolean,
      default: false
    },
    originalQuantityRequested: {
      type: Number,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password; // Remove password from JSON output
      return ret;
    }
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method for HHM to add associated factory
userSchema.methods.addFactory = async function (factoryId) {
  // Only allow for HHM role
  if (this.role !== 'HHM') {
    throw new Error('Only HHMs can add associated factories');
  }

  // Check if factory is already associated
  if (this.associatedFactories && this.associatedFactories.includes(factoryId)) {
    throw new Error('Factory already associated with this HHM');
  }

  // Verify the factory exists and is a Factory
  const User = mongoose.model('User');
  const factory = await User.findById(factoryId);

  if (!factory) {
    throw new Error('Factory not found');
  }

  if (factory.role !== 'Factory') {
    throw new Error('User must have role "Factory"');
  }

  // Initialize array if undefined
  if (!this.associatedFactories) {
    this.associatedFactories = [];
  }

  this.associatedFactories.push(factoryId);
  return this.save();
};

// Instance method for HHM to remove associated factory
userSchema.methods.removeFactory = function (factoryId) {
  // Only allow for HHM role
  if (this.role !== 'HHM') {
    throw new Error('Only HHMs can remove associated factories');
  }

  if (!this.associatedFactories) {
    return this.save();
  }

  this.associatedFactories = this.associatedFactories.filter(
    id => !id.equals(factoryId)
  );
  return this.save();
};

// Instance method for Factory to add associated HHM
userSchema.methods.addHHM = async function (hhmId) {
  // Only allow for Factory role
  if (this.role !== 'Factory') {
    throw new Error('Only Factories can add associated HHMs');
  }

  // Check if HHM is already associated
  if (this.associatedHHMs && this.associatedHHMs.includes(hhmId)) {
    throw new Error('HHM already associated with this Factory');
  }

  // Verify the HHM exists and is an HHM
  const User = mongoose.model('User');
  const hhm = await User.findById(hhmId);

  if (!hhm) {
    throw new Error('HHM not found');
  }

  if (hhm.role !== 'HHM') {
    throw new Error('User must have role "HHM"');
  }

  // Initialize array if undefined
  if (!this.associatedHHMs) {
    this.associatedHHMs = [];
  }

  this.associatedHHMs.push(hhmId);
  return this.save();
};

// Instance method for Factory to remove associated HHM
userSchema.methods.removeHHM = function (hhmId) {
  // Only allow for Factory role
  if (this.role !== 'Factory') {
    throw new Error('Only Factories can remove associated HHMs');
  }

  if (!this.associatedHHMs) {
    return this.save();
  }

  this.associatedHHMs = this.associatedHHMs.filter(
    id => !id.equals(hhmId)
  );
  return this.save();
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function (identifier, password) {
  // Allow login with username, email, or phone
  const user = await this.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() },
      { phone: identifier }
    ]
  }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
});

// Export the model
module.exports = mongoose.model('User', userSchema);
