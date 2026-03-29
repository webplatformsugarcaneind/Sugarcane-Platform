const mongoose = require('mongoose');

// Sub-schema for features
const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Feature title is required'],
    trim: true,
    maxlength: [100, 'Feature title cannot be more than 100 characters'],
    minlength: [2, 'Feature title must be at least 2 characters']
  },
  description: {
    type: String,
    required: [true, 'Feature description is required'],
    trim: true,
    maxlength: [500, 'Feature description cannot be more than 500 characters'],
    minlength: [5, 'Feature description must be at least 5 characters']
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot be more than 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true, // Allow sub-documents to have their own _id
  timestamps: false // We'll manage timestamps manually for features
});

const roleFeatureSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    uppercase: true,
    enum: {
      values: ['FARMER', 'HHM', 'LABOUR', 'FACTORY', 'ADMIN'],
      message: 'Role name must be one of: FARMER, HHM, LABOUR, FACTORY, ADMIN'
    },
    unique: true
  },
  features: [featureSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    totalFeatures: {
      type: Number,
      default: 0
    },
    enabledFeatures: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for feature count
roleFeatureSchema.virtual('featureCount').get(function() {
  return this.features ? this.features.length : 0;
});

// Virtual for enabled feature count
roleFeatureSchema.virtual('enabledFeatureCount').get(function() {
  return this.features ? this.features.filter(f => f.isEnabled).length : 0;
});

// Virtual for disabled feature count
roleFeatureSchema.virtual('disabledFeatureCount').get(function() {
  return this.features ? this.features.filter(f => !f.isEnabled).length : 0;
});

// Pre-save middleware to update metadata and timestamps
roleFeatureSchema.pre('save', function(next) {
  // Update metadata
  this.metadata.totalFeatures = this.features.length;
  this.metadata.enabledFeatures = this.features.filter(f => f.isEnabled).length;
  this.metadata.lastUpdated = Date.now();
  
  // Update version if features have been modified
  if (this.isModified('features')) {
    this.version += 1;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to find role features by role name
roleFeatureSchema.statics.findByRole = function(roleName) {
  return this.findOne({ 
    roleName: roleName.toUpperCase(),
    isActive: true 
  });
};

// Static method to get all active roles with their features
roleFeatureSchema.statics.getAllActiveRoles = function() {
  return this.find({ isActive: true }).sort({ roleName: 1 });
};

// Static method to get roles with specific feature
roleFeatureSchema.statics.findRolesWithFeature = function(featureTitle) {
  return this.find({
    'features.title': { $regex: featureTitle, $options: 'i' },
    'features.isEnabled': true,
    isActive: true
  });
};

// Instance method to add a new feature
roleFeatureSchema.methods.addFeature = function(featureData) {
  // Check if feature with same title already exists
  const existingFeature = this.features.find(
    f => f.title.toLowerCase() === featureData.title.toLowerCase()
  );
  
  if (existingFeature) {
    throw new Error('Feature with this title already exists for this role');
  }
  
  this.features.push(featureData);
  return this.save();
};

// Instance method to remove a feature
roleFeatureSchema.methods.removeFeature = function(featureId) {
  this.features = this.features.filter(
    f => !f._id.equals(featureId)
  );
  return this.save();
};

// Instance method to update a feature
roleFeatureSchema.methods.updateFeature = function(featureId, updateData) {
  const feature = this.features.id(featureId);
  if (!feature) {
    throw new Error('Feature not found');
  }
  
  Object.assign(feature, updateData);
  return this.save();
};

// Instance method to enable/disable a feature
roleFeatureSchema.methods.toggleFeature = function(featureId, isEnabled = null) {
  const feature = this.features.id(featureId);
  if (!feature) {
    throw new Error('Feature not found');
  }
  
  feature.isEnabled = isEnabled !== null ? isEnabled : !feature.isEnabled;
  return this.save();
};

// Instance method to get enabled features only
roleFeatureSchema.methods.getEnabledFeatures = function() {
  return this.features.filter(f => f.isEnabled);
};

// Instance method to get features sorted by priority
roleFeatureSchema.methods.getFeaturesByPriority = function() {
  return [...this.features].sort((a, b) => b.priority - a.priority);
};

// Instance method to get role summary
roleFeatureSchema.methods.getRoleSummary = function() {
  return {
    roleName: this.roleName,
    totalFeatures: this.featureCount,
    enabledFeatures: this.enabledFeatureCount,
    disabledFeatures: this.disabledFeatureCount,
    version: this.version,
    isActive: this.isActive,
    lastUpdated: this.metadata.lastUpdated
  };
};

// Indexes for better query performance
roleFeatureSchema.index({ roleName: 1 });
roleFeatureSchema.index({ isActive: 1 });
roleFeatureSchema.index({ 'features.title': 1 });
roleFeatureSchema.index({ 'features.isEnabled': 1 });
roleFeatureSchema.index({ version: -1 });

// Compound indexes
roleFeatureSchema.index({ roleName: 1, isActive: 1 });
roleFeatureSchema.index({ roleName: 1, 'features.isEnabled': 1 });

// Pre-remove middleware
roleFeatureSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Role features for ${this.roleName} are being deleted`);
  next();
});

// Export the model
module.exports = mongoose.model('RoleFeature', roleFeatureSchema);