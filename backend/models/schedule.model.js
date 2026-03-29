const mongoose = require('mongoose');

/**
 * Schedule Schema
 * 
 * Represents work schedules created by HHMs (Hub Head Managers) for workers.
 * HHMs can post schedules with required skills, worker count, wages, and dates.
 */
const scheduleSchema = new mongoose.Schema({
  hhmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'HHM ID is required'],
    index: true
  },
  requiredSkills: {
    type: [String],
    required: [true, 'Required skills must be specified'],
    validate: {
      validator: function(skills) {
        return skills && skills.length > 0;
      },
      message: 'At least one required skill must be specified'
    }
  },
  workerCount: {
    type: Number,
    required: [true, 'Worker count is required'],
    min: [1, 'Worker count must be at least 1'],
    max: [1000, 'Worker count cannot exceed 1000']
  },
  wageOffered: {
    type: Number,
    required: [true, 'Wage offered is required'],
    min: [0, 'Wage offered must be a positive number']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'closed'],
      message: '{VALUE} is not a valid status. Status must be either open or closed'
    },
    default: 'open',
    index: true
  },
  jobType: {
    type: String,
    enum: ['harvesting', 'maintenance'],
    default: 'harvesting'
  },
  // Additional useful fields
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(endDate) {
        return !endDate || endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  applicationsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  acceptedWorkersCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
scheduleSchema.index({ hhmId: 1, status: 1 });
scheduleSchema.index({ startDate: 1, status: 1 });
scheduleSchema.index({ requiredSkills: 1, status: 1 });

// Virtual for checking if schedule is expired
scheduleSchema.virtual('isExpired').get(function() {
  return this.startDate < new Date();
});

// Virtual for checking if schedule is full
scheduleSchema.virtual('isFull').get(function() {
  return this.acceptedWorkersCount >= this.workerCount;
});

// Pre-save middleware to auto-close expired schedules
scheduleSchema.pre('save', function(next) {
  if (this.startDate < new Date() && this.status === 'open') {
    this.status = 'closed';
  }
  next();
});

// Static method to find open schedules
scheduleSchema.statics.findOpenSchedules = function(filters = {}) {
  return this.find({ 
    status: 'open', 
    startDate: { $gte: new Date() },
    ...filters 
  }).populate('hhmId', 'name email phone');
};

// Static method to find schedules by skills
scheduleSchema.statics.findBySkills = function(skills) {
  return this.find({
    status: 'open',
    startDate: { $gte: new Date() },
    requiredSkills: { $in: skills }
  }).populate('hhmId', 'name email phone');
};

// Instance method to check if worker can apply
scheduleSchema.methods.canWorkerApply = function() {
  return this.status === 'open' && 
         this.startDate >= new Date() && 
         this.acceptedWorkersCount < this.workerCount;
};

// Instance method to increment applications count
scheduleSchema.methods.incrementApplications = function() {
  this.applicationsCount += 1;
  return this.save();
};

// Instance method to increment accepted workers count
scheduleSchema.methods.incrementAcceptedWorkers = function() {
  this.acceptedWorkersCount += 1;
  if (this.acceptedWorkersCount >= this.workerCount) {
    this.status = 'closed';
  }
  return this.save();
};

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;