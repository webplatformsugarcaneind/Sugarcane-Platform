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
      values: ['Farmer', 'HHM', 'Worker', 'Factory'],
      message: 'Role must be one of: Farmer, HHM, Worker, Factory'
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
  factoryName: {
    type: String,
    trim: true
  },
  factoryLocation: {
    type: String,
    trim: true
  },
  factoryDescription: {
    type: String,
    trim: true
  },
  capacity: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  contactInfo: {
    website: { type: String, trim: true },
    fax: { type: String, trim: true },
    tollfree: { type: String, trim: true },
    landline: { type: String, trim: true }
  },
  operatingHours: {
    season: { type: String, trim: true },
    daily: { type: String, trim: true },
    monday: { type: String, trim: true },
    tuesday: { type: String, trim: true },
    wednesday: { type: String, trim: true },
    thursday: { type: String, trim: true },
    friday: { type: String, trim: true },
    saturday: { type: String, trim: true },
    sunday: { type: String, trim: true },
    shift1: { type: String, trim: true },
    shift2: { type: String, trim: true },
    maintenance: { type: String, trim: true }
  },
  
  // Farmer-specific fields
  farmSize: {
    type: String,
    trim: true
  },
  farmingExperience: {
    type: String,
    trim: true
  },
  farmingMethods: {
    type: String,
    trim: true
  },
  equipment: {
    type: String,
    trim: true
  },
  certifications: {
    type: String,
    trim: true
  },
  cropTypes: {
    type: String,
    trim: true
  },
  irrigationType: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
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
  
  // Worker-specific fields
  skills: {
    type: String,
    trim: true
  },
  workPreferences: {
    type: String,
    trim: true
  },
  wageRate: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  },
  workExperience: {
    type: String,
    trim: true
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
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password; // Remove password from JSON output
      return ret;
    }
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(identifier, password) {
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
userSchema.virtual('profile').get(function() {
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