const mongoose = require('mongoose');

/**
 * Application Schema
 * 
 * Represents job applications submitted by workers to HHM schedules.
 * Workers can apply to open schedules, and HHMs can approve or reject applications.
 */
const applicationSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Worker ID is required'],
    index: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule ID is required'],
    index: true
  },
  hhmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'HHM ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status. Status must be pending, approved, or rejected'
    },
    default: 'pending',
    index: true
  },
  // Additional useful fields
  applicationMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Application message cannot exceed 500 characters']
  },
  workerSkills: {
    type: [String],
    validate: {
      validator: function(skills) {
        return skills && skills.length > 0;
      },
      message: 'Worker must specify at least one skill'
    }
  },
  experience: {
    type: String,
    trim: true,
    maxlength: [200, 'Experience description cannot exceed 200 characters']
  },
  expectedWage: {
    type: Number,
    min: [0, 'Expected wage must be a positive number']
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'flexible'],
    default: 'flexible'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [300, 'Review notes cannot exceed 300 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
applicationSchema.index({ workerId: 1, scheduleId: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ hhmId: 1, status: 1 });
applicationSchema.index({ scheduleId: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// Virtual for checking if application is reviewed
applicationSchema.virtual('isReviewed').get(function() {
  return this.status !== 'pending';
});

// Virtual for calculating days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  const diffTime = Date.now() - this.createdAt.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set reviewedAt when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to find applications by worker
applicationSchema.statics.findByWorker = function(workerId, status = null) {
  const query = { workerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('scheduleId', 'title startDate wageOffered status location')
    .populate('hhmId', 'name email phone')
    .sort({ createdAt: -1 });
};

// Static method to find applications by HHM
applicationSchema.statics.findByHHM = function(hhmId, status = null) {
  const query = { hhmId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('workerId', 'name email phone skills')
    .populate('scheduleId', 'title startDate workerCount')
    .sort({ createdAt: -1 });
};

// Static method to find applications by schedule
applicationSchema.statics.findBySchedule = function(scheduleId, status = null) {
  const query = { scheduleId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('workerId', 'name email phone skills experience')
    .sort({ createdAt: -1 });
};

// Static method to find pending applications older than specified days
applicationSchema.statics.findOldPendingApplications = function(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    status: 'pending',
    createdAt: { $lt: cutoffDate }
  }).populate('workerId scheduleId hhmId');
};

// Instance method to approve application
applicationSchema.methods.approve = function(reviewNotes = '') {
  this.status = 'approved';
  this.reviewedAt = new Date();
  if (reviewNotes) this.reviewNotes = reviewNotes;
  return this.save();
};

// Instance method to reject application
applicationSchema.methods.reject = function(reviewNotes = '') {
  this.status = 'rejected';
  this.reviewedAt = new Date();
  if (reviewNotes) this.reviewNotes = reviewNotes;
  return this.save();
};

// Instance method to check if worker skills match schedule requirements
applicationSchema.methods.checkSkillsMatch = async function() {
  await this.populate('scheduleId');
  if (!this.scheduleId || !this.workerSkills) return false;
  
  const requiredSkills = this.scheduleId.requiredSkills || [];
  return requiredSkills.some(skill => 
    this.workerSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  );
};

// Post-save middleware to update schedule applications count
applicationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    try {
      const Schedule = mongoose.model('Schedule');
      await Schedule.findByIdAndUpdate(
        doc.scheduleId,
        { $inc: { applicationsCount: 1 } }
      );
    } catch (error) {
      console.error('Error updating schedule applications count:', error);
    }
  }
  
  // Update accepted workers count if approved
  if (doc.isModified('status') && doc.status === 'approved') {
    try {
      const Schedule = mongoose.model('Schedule');
      const schedule = await Schedule.findById(doc.scheduleId);
      if (schedule) {
        await schedule.incrementAcceptedWorkers();
      }
    } catch (error) {
      console.error('Error updating accepted workers count:', error);
    }
  }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;