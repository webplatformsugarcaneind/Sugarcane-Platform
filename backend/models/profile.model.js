const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileImage: {
    type: String,
    default: 'default.jpg',
    trim: true
  },
  farmLocation: {
    type: String,
    trim: true,
    maxLength: 200
  },
  farmSize: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        return value === null || value === undefined || value >= 0;
      },
      message: 'Farm size must be a positive number'
    }
  },
  contactDetails: {
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(phone) {
          // Indian phone number validation (10 digits)
          return !phone || /^[6-9]\d{9}$/.test(phone);
        },
        message: 'Please enter a valid phone number'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(email) {
          // Email validation
          return !email || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address'
      }
    }
  },
  bio: {
    type: String,
    maxLength: 500,
    trim: true
  },
  farmingExperience: {
    type: Number,
    min: 0,
    max: 100
  },
  cropSpecialties: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  socialLinks: {
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true }
    },
    language: {
      type: String,
      enum: ['english', 'hindi', 'punjabi', 'marathi', 'bengali'],
      default: 'english'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  skills: {
    type: [String],
    trim: true,
    validate: {
      validator: function(skills) {
        // Allow empty array, but if skills exist, ensure they're not empty strings
        return skills.every(skill => skill && skill.trim().length > 0);
      },
      message: 'All skills must be non-empty strings'
    }
  },
  availabilityStatus: {
    type: String,
    enum: {
      values: ['available', 'unavailable'],
      message: '{VALUE} is not a valid availability status. Must be either available or unavailable'
    },
    default: 'available'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
profileSchema.index({ userId: 1 });
profileSchema.index({ farmLocation: 1 });
profileSchema.index({ cropSpecialties: 1 });
profileSchema.index({ isVerified: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ availabilityStatus: 1 });

// Virtual for full profile image URL
profileSchema.virtual('profileImageUrl').get(function() {
  if (this.profileImage === 'default.jpg') {
    return `/uploads/profiles/default.jpg`;
  }
  return `/uploads/profiles/${this.profileImage}`;
});

// Virtual for contact availability
profileSchema.virtual('contactInfo').get(function() {
  const contact = {};
  
  // Ensure preferences exist with defaults
  const preferences = this.preferences || {};
  const privacy = preferences.privacy || {
    showPhone: true,
    showEmail: false,
    showLocation: true
  };
  
  if (privacy.showPhone && this.contactDetails && this.contactDetails.phone) {
    contact.phone = this.contactDetails.phone;
  }
  
  if (privacy.showEmail && this.contactDetails && this.contactDetails.email) {
    contact.email = this.contactDetails.email;
  }
  
  return contact;
});

// Virtual for farm size in different units
profileSchema.virtual('farmSizeFormatted').get(function() {
  if (!this.farmSize) return null;
  
  if (this.farmSize < 1) {
    return `${(this.farmSize * 1000).toFixed(0)} sq meters`;
  } else if (this.farmSize < 100) {
    return `${this.farmSize} acres`;
  } else {
    return `${(this.farmSize / 100).toFixed(1)} hectares`;
  }
});

// Instance method to update profile image
profileSchema.methods.updateProfileImage = function(imagePath) {
  this.profileImage = imagePath;
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to add crop specialty
profileSchema.methods.addCropSpecialty = function(crop) {
  if (!this.cropSpecialties.includes(crop.toLowerCase())) {
    this.cropSpecialties.push(crop.toLowerCase());
    this.lastUpdated = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove crop specialty
profileSchema.methods.removeCropSpecialty = function(crop) {
  this.cropSpecialties = this.cropSpecialties.filter(
    specialty => specialty !== crop.toLowerCase()
  );
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to add skill
profileSchema.methods.addSkill = function(skill) {
  const trimmedSkill = skill.trim();
  if (trimmedSkill && !this.skills.includes(trimmedSkill)) {
    this.skills.push(trimmedSkill);
    this.lastUpdated = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove skill
profileSchema.methods.removeSkill = function(skill) {
  this.skills = this.skills.filter(s => s !== skill.trim());
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to update availability status
profileSchema.methods.updateAvailabilityStatus = function(status) {
  if (['available', 'unavailable'].includes(status)) {
    this.availabilityStatus = status;
    this.lastUpdated = new Date();
    return this.save();
  }
  throw new Error('Invalid availability status. Must be either available or unavailable');
};

// Instance method to update notification preferences
profileSchema.methods.updateNotificationPreferences = function(preferences) {
  // Initialize preferences if undefined
  if (!this.preferences) {
    this.preferences = {
      notifications: { email: true, sms: true, push: true },
      privacy: { showPhone: true, showEmail: false, showLocation: true },
      language: 'english'
    };
  }
  this.preferences.notifications = { ...this.preferences.notifications, ...preferences };
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to update privacy settings
profileSchema.methods.updatePrivacySettings = function(privacy) {
  // Initialize preferences if undefined
  if (!this.preferences) {
    this.preferences = {
      notifications: { email: true, sms: true, push: true },
      privacy: { showPhone: true, showEmail: false, showLocation: true },
      language: 'english'
    };
  }
  this.preferences.privacy = { ...this.preferences.privacy, ...privacy };
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find profiles by location
profileSchema.statics.findByLocation = function(location) {
  return this.find({ 
    farmLocation: new RegExp(location, 'i'),
    'preferences.privacy.showLocation': true 
  }).populate('userId', 'name role');
};

// Static method to find profiles by crop specialty
profileSchema.statics.findByCropSpecialty = function(crop) {
  return this.find({ 
    cropSpecialties: crop.toLowerCase() 
  }).populate('userId', 'name role');
};

// Static method to find verified profiles
profileSchema.statics.findVerified = function() {
  return this.find({ isVerified: true }).populate('userId', 'name role');
};

// Static method to get profile with user details
profileSchema.statics.getFullProfile = function(userId) {
  return this.findOne({ userId }).populate('userId', 'name email role createdAt');
};

// Static method to find profiles by skills
profileSchema.statics.findBySkills = function(skillsArray) {
  return this.find({ 
    skills: { $in: skillsArray.map(skill => new RegExp(skill, 'i')) }
  }).populate('userId', 'name role');
};

// Static method to find available workers
profileSchema.statics.findAvailableWorkers = function() {
  return this.find({ 
    availabilityStatus: 'available' 
  }).populate('userId', 'name role');
};

// Static method to find workers by skills and availability
profileSchema.statics.findWorkersBySkillsAndAvailability = function(skillsArray, availabilityStatus = 'available') {
  return this.find({
    skills: { $in: skillsArray.map(skill => new RegExp(skill, 'i')) },
    availabilityStatus: availabilityStatus
  }).populate('userId', 'name email role');
};

// Pre-save middleware to ensure preferences exist
profileSchema.pre('save', function(next) {
  // Initialize preferences if undefined
  if (!this.preferences) {
    this.preferences = {
      notifications: { email: true, sms: true, push: true },
      privacy: { showPhone: true, showEmail: false, showLocation: true },
      language: 'english'
    };
  }
  
  // Update lastUpdated timestamp
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

// Pre-save middleware to ensure unique crop specialties and skills
profileSchema.pre('save', function(next) {
  if (this.cropSpecialties) {
    this.cropSpecialties = [...new Set(this.cropSpecialties)];
  }
  
  if (this.skills) {
    // Remove duplicates and empty strings, trim whitespace
    this.skills = [...new Set(this.skills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
    )];
  }
  
  next();
});

// Method to get safe profile data (respecting privacy settings)
profileSchema.methods.toSafeObject = function() {
  const profile = this.toObject();
  
  // Ensure preferences exist with defaults
  const preferences = this.preferences || {};
  const privacy = preferences.privacy || {
    showPhone: true,
    showEmail: false,
    showLocation: true
  };
  
  // Remove sensitive data based on privacy settings
  if (!privacy.showPhone && profile.contactDetails) {
    delete profile.contactDetails.phone;
  }
  
  if (!privacy.showEmail && profile.contactDetails) {
    delete profile.contactDetails.email;
  }
  
  if (!privacy.showLocation) {
    delete profile.farmLocation;
  }
  
  // Remove internal fields
  delete profile.preferences;
  delete profile.__v;
  
  return profile;
};

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;