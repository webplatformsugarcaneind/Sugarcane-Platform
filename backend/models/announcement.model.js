const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true



    
  },
  author: {
    type: String,
    default: 'Platform Admin',
    trim: true
  },
  targetAudience: [{
    type: String,
    enum: ['farmer', 'hhm', 'labour', 'factory', 'all'],
    default: 'all'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ expiresAt: 1 });

// Virtual for content preview (first 100 characters)
announcementSchema.virtual('contentPreview').get(function() {
  return this.content.length > 100 
    ? this.content.substring(0, 100) + '...' 
    : this.content;
});

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for time since creation
announcementSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
});

// Instance method to deactivate announcement
announcementSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to set expiry date
announcementSchema.methods.setExpiry = function(days) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  this.expiresAt = expiryDate;
  return this.save();
};

// Static method to find active announcements
announcementSchema.statics.findActive = function() {
  return this.find({ 
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to find announcements by target audience
announcementSchema.statics.findByAudience = function(audience) {
  return this.find({ 
    targetAudience: { $in: [audience, 'all'] },
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to find announcements by priority
announcementSchema.statics.findByPriority = function(priority) {
  return this.find({ 
    priority: priority,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get urgent announcements
announcementSchema.statics.findUrgent = function() {
  return this.findByPriority('urgent');
};

// Pre-save middleware to handle target audience defaults
announcementSchema.pre('save', function(next) {
  // If no target audience specified, default to 'all'
  if (!this.targetAudience || this.targetAudience.length === 0) {
    this.targetAudience = ['all'];
  }
  
  // Remove duplicates from targetAudience
  this.targetAudience = [...new Set(this.targetAudience)];
  
  next();
});

// Pre-save middleware to auto-deactivate expired announcements
announcementSchema.pre('find', function() {
  // Auto-deactivate expired announcements during queries
  this.where({
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
      { isActive: false }
    ]
  });
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;