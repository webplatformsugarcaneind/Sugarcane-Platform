const mongoose = require('mongoose');

const factorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Factory name is required'],
    trim: true,
    maxlength: [100, 'Factory name cannot be more than 100 characters'],
    minlength: [2, 'Factory name must be at least 2 characters']
  },
  location: {
    type: String,
    required: [true, 'Factory location is required'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Factory description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  imageUrls: [{
    type: String,
    validate: {
      validator: function(url) {
        // Basic URL validation
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return urlRegex.test(url);
      },
      message: 'Please provide a valid URL for factory image'
    }
  }],
  associatedHHMs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(userId) {
        // Validate that the referenced user exists and has role 'HHM'
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'HHM';
      },
      message: 'Associated user must exist and have role "HHM"'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  capacity: {
    type: Number,
    min: [1, 'Factory capacity must be at least 1'],
    max: [100000, 'Factory capacity cannot exceed 100,000']
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    }
  },
  operatingHours: {
    start: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
    },
    end: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
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
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for HHM count
factorySchema.virtual('hhmCount').get(function() {
  return this.associatedHHMs ? this.associatedHHMs.length : 0;
});

// Virtual for image count
factorySchema.virtual('imageCount').get(function() {
  return this.imageUrls ? this.imageUrls.length : 0;
});

// Pre-save middleware to update the updatedAt field
factorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find factories by location
factorySchema.statics.findByLocation = function(location) {
  return this.find({
    location: { $regex: location, $options: 'i' },
    isActive: true
  });
};

// Static method to find factories with available capacity
factorySchema.statics.findWithCapacity = function(minCapacity = 1) {
  return this.find({
    capacity: { $gte: minCapacity },
    isActive: true
  });
};

// Instance method to add HHM
factorySchema.methods.addHHM = async function(hhmId) {
  // Check if HHM is already associated
  if (this.associatedHHMs.includes(hhmId)) {
    throw new Error('HHM already associated with this factory');
  }

  // Verify the user exists and is an HHM
  const User = mongoose.model('User');
  const user = await User.findById(hhmId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.role !== 'HHM') {
    throw new Error('User must have role "HHM"');
  }

  this.associatedHHMs.push(hhmId);
  return this.save();
};

// Instance method to remove HHM
factorySchema.methods.removeHHM = function(hhmId) {
  this.associatedHHMs = this.associatedHHMs.filter(
    id => !id.equals(hhmId)
  );
  return this.save();
};

// Instance method to add image URL
factorySchema.methods.addImage = function(imageUrl) {
  if (!this.imageUrls.includes(imageUrl)) {
    this.imageUrls.push(imageUrl);
    return this.save();
  }
  throw new Error('Image URL already exists');
};

// Instance method to remove image URL
factorySchema.methods.removeImage = function(imageUrl) {
  this.imageUrls = this.imageUrls.filter(url => url !== imageUrl);
  return this.save();
};

// Instance method to get factory summary
factorySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    location: this.location,
    description: this.description.substring(0, 100) + '...',
    imageCount: this.imageCount,
    hhmCount: this.hhmCount,
    isActive: this.isActive,
    capacity: this.capacity
  };
};

// Indexes for better query performance
factorySchema.index({ name: 1 });
factorySchema.index({ location: 1 });
factorySchema.index({ isActive: 1 });
factorySchema.index({ 'associatedHHMs': 1 });
factorySchema.index({ createdAt: -1 });

// Compound index for location and active status
factorySchema.index({ location: 1, isActive: 1 });

// Pre-remove middleware to handle cleanup
factorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // You could add cleanup logic here if needed
  // For example, updating related documents
  console.log(`Factory ${this.name} is being deleted`);
  next();
});

// Export the model
module.exports = mongoose.model('Factory', factorySchema);