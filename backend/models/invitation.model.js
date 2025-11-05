const mongoose = require('mongoose');

/**
 * Invitation Schema
 * 
 * Represents invitations sent by HHMs to specific workers for their schedules,
 * OR invitations sent by Factories to HHMs for partnership/association.
 * 
 * Two types:
 * 1. 'hhm-to-worker' - HHM invites worker for a job schedule
 * 2. 'factory-to-hhm' - Factory invites HHM for partnership/association
 */
const invitationSchema = new mongoose.Schema({
  // Invitation Type - determines which fields are required
  invitationType: {
    type: String,
    enum: {
      values: ['hhm-to-worker', 'factory-to-hhm'],
      message: '{VALUE} is not a valid invitation type'
    },
    required: [true, 'Invitation type is required'],
    default: 'hhm-to-worker',
    index: true
  },

  // Factory ID - Required for factory-to-hhm invitations
  factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    validate: {
      validator: function (value) {
        // Required if invitationType is 'factory-to-hhm'
        if (this.invitationType === 'factory-to-hhm') {
          return value != null;
        }
        return true;
      },
      message: 'Factory ID is required for factory-to-hhm invitations'
    }
  },

  // Worker ID - Required for hhm-to-worker invitations
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    validate: {
      validator: function (value) {
        // Required if invitationType is 'hhm-to-worker'
        if (this.invitationType === 'hhm-to-worker') {
          return value != null;
        }
        return true;
      },
      message: 'Worker ID is required for hhm-to-worker invitations'
    }
  },

  // HHM ID - Required for both types
  hhmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'HHM ID is required'],
    index: true
  },

  // Schedule ID - Required only for hhm-to-worker invitations
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    index: true,
    validate: {
      validator: function (value) {
        // Required if invitationType is 'hhm-to-worker'
        if (this.invitationType === 'hhm-to-worker') {
          return value != null;
        }
        return true;
      },
      message: 'Schedule ID is required for hhm-to-worker invitations'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'declined'],
      message: '{VALUE} is not a valid status. Status must be pending, accepted, or declined'
    },
    default: 'pending',
    index: true
  },
  // Additional useful fields
  personalMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Personal message cannot exceed 500 characters']
  },
  offeredWage: {
    type: Number,
    min: [0, 'Offered wage must be a positive number']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    validate: {
      validator: function (date) {
        return !date || date > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  respondedAt: {
    type: Date
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [300, 'Response message cannot exceed 300 characters']
  },
  invitationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Invitation reason cannot exceed 200 characters']
  },
  workerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  remindersSent: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  // Timestamp for when invitation was sent (for factory-to-hhm tracking)
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
// Prevent duplicate worker invitations for same schedule
// CRITICAL: Include invitationType as first field to completely separate hhm-to-worker from factory-to-hhm
// This ensures factory-to-hhm invitations (with undefined workerId/scheduleId) never conflict
invitationSchema.index(
  { invitationType: 1, workerId: 1, scheduleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      invitationType: 'hhm-to-worker',
      workerId: { $type: 'objectId' },
      scheduleId: { $type: 'objectId' }
    }
  }
);
// Prevent duplicate PENDING factory invitations to same HHM (allow reinvite after accept/decline)
invitationSchema.index(
  { factoryId: 1, hhmId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      invitationType: 'factory-to-hhm',
      factoryId: { $type: 'objectId' },
      hhmId: { $type: 'objectId' },
      status: 'pending'
    }
  }
);
invitationSchema.index({ hhmId: 1, status: 1 });
invitationSchema.index({ factoryId: 1, status: 1 });
invitationSchema.index({ scheduleId: 1, status: 1 });
invitationSchema.index({ invitationType: 1, status: 1 });
invitationSchema.index({ status: 1, createdAt: -1 });
invitationSchema.index({ expiresAt: 1 });

// Virtual for checking if invitation is expired
invitationSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if invitation is responded to
invitationSchema.virtual('isResponded').get(function () {
  return this.status !== 'pending';
});

// Virtual for calculating days until expiration
invitationSchema.virtual('daysUntilExpiration').get(function () {
  if (!this.expiresAt) return null;
  const diffTime = this.expiresAt.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for calculating response time (in hours)
invitationSchema.virtual('responseTimeHours').get(function () {
  if (!this.respondedAt) return null;
  const diffTime = this.respondedAt.getTime() - this.createdAt.getTime();
  return Math.round(diffTime / (1000 * 60 * 60));
});

// Pre-save middleware to set default expiration (7 days from creation)
invitationSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    this.expiresAt = expirationDate;
  }

  // Set respondedAt when status changes from pending
  if (this.isModified('status') && this.status !== 'pending' && !this.respondedAt) {
    this.respondedAt = new Date();
  }

  next();
});

// Static method to find invitations by worker
invitationSchema.statics.findByWorker = function (workerId, status = null) {
  const query = { workerId };
  if (status) query.status = status;

  return this.find(query)
    .populate('scheduleId', 'title startDate wageOffered status location requiredSkills')
    .populate('hhmId', 'name email phone companyName')
    .sort({ createdAt: -1 });
};

// Static method to find invitations by HHM
invitationSchema.statics.findByHHM = function (hhmId, status = null) {
  const query = { hhmId };
  if (status) query.status = status;

  return this.find(query)
    .populate('workerId', 'name email phone skills experience')
    .populate('scheduleId', 'title startDate workerCount')
    .sort({ createdAt: -1 });
};

// Static method to find invitations by schedule
invitationSchema.statics.findBySchedule = function (scheduleId, status = null) {
  const query = { scheduleId };
  if (status) query.status = status;

  return this.find(query)
    .populate('workerId', 'name email phone skills')
    .sort({ createdAt: -1 });
};

// Static method to find factory invitations by Factory
invitationSchema.statics.findByFactory = function (factoryId, status = null) {
  const query = {
    factoryId,
    invitationType: 'factory-to-hhm'
  };
  if (status) query.status = status;

  return this.find(query)
    .populate('hhmId', 'name email phone experience specialization')
    .sort({ createdAt: -1 });
};

// Static method to find factory invitations received by HHM
invitationSchema.statics.findFactoryInvitationsByHHM = function (hhmId, status = null) {
  const query = {
    hhmId,
    invitationType: 'factory-to-hhm'
  };
  if (status) query.status = status;

  return this.find(query)
    .populate('factoryId', 'name email phone factoryName factoryLocation capacity')
    .sort({ createdAt: -1 });
};

// Static method to find expired invitations
invitationSchema.statics.findExpired = function () {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  }).populate('workerId scheduleId hhmId factoryId');
};

// Static method to find invitations expiring soon (within specified days)
invitationSchema.statics.findExpiringSoon = function (days = 2) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  return this.find({
    status: 'pending',
    expiresAt: { $lte: cutoffDate, $gt: new Date() }
  }).populate('workerId scheduleId hhmId');
};

// Instance method to accept invitation
invitationSchema.methods.accept = function (responseMessage = '') {
  this.status = 'accepted';
  this.respondedAt = new Date();
  if (responseMessage) this.responseMessage = responseMessage;
  return this.save();
};

// Instance method to decline invitation
invitationSchema.methods.decline = function (responseMessage = '') {
  this.status = 'declined';
  this.respondedAt = new Date();
  if (responseMessage) this.responseMessage = responseMessage;
  return this.save();
};

// Instance method to extend expiration
invitationSchema.methods.extendExpiration = function (days = 3) {
  if (this.status === 'pending') {
    const newExpiration = new Date(this.expiresAt);
    newExpiration.setDate(newExpiration.getDate() + days);
    this.expiresAt = newExpiration;
    return this.save();
  }
  throw new Error('Cannot extend expiration for non-pending invitations');
};

// Instance method to send reminder
invitationSchema.methods.sendReminder = function () {
  if (this.status === 'pending' && this.remindersSent < 3) {
    this.remindersSent += 1;
    return this.save();
  }
  throw new Error('Cannot send reminder for non-pending invitations or max reminders reached');
};

// Instance method to check if worker is available for the schedule
invitationSchema.methods.checkWorkerAvailability = async function () {
  await this.populate('scheduleId');
  if (!this.scheduleId) return false;

  // Check if worker has other accepted invitations or applications for the same time period
  const conflictingInvitations = await this.constructor.find({
    workerId: this.workerId,
    status: 'accepted',
    scheduleId: { $ne: this.scheduleId }
  }).populate('scheduleId', 'startDate endDate');

  // Simple overlap check - can be enhanced based on specific scheduling logic
  const currentSchedule = this.scheduleId;
  return !conflictingInvitations.some(inv => {
    const otherSchedule = inv.scheduleId;
    return currentSchedule.startDate <= (otherSchedule.endDate || otherSchedule.startDate) &&
      (currentSchedule.endDate || currentSchedule.startDate) >= otherSchedule.startDate;
  });
};

// Post-save middleware to update schedule when invitation is accepted
invitationSchema.post('save', async function (doc) {
  if (doc.isModified('status') && doc.status === 'accepted') {
    try {
      const Schedule = mongoose.model('Schedule');
      const schedule = await Schedule.findById(doc.scheduleId);
      if (schedule) {
        await schedule.incrementAcceptedWorkers();

        // Create an automatic application record for tracking
        const Application = mongoose.model('Application');
        const existingApplication = await Application.findOne({
          workerId: doc.workerId,
          scheduleId: doc.scheduleId
        });

        if (!existingApplication) {
          await Application.create({
            workerId: doc.workerId,
            scheduleId: doc.scheduleId,
            hhmId: doc.hhmId,
            status: 'approved',
            applicationMessage: 'Auto-approved through invitation acceptance',
            reviewNotes: 'Accepted invitation'
          });
        }
      }
    } catch (error) {
      console.error('Error updating schedule on invitation acceptance:', error);
    }
  }
});

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;