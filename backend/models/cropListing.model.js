const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sell', 'buy'],
    required: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
cropListingSchema.index({ farmerId: 1 });
cropListingSchema.index({ type: 1 });
cropListingSchema.index({ cropName: 1 });
cropListingSchema.index({ status: 1 });
cropListingSchema.index({ createdAt: -1 });

// Virtual for formatted price
cropListingSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString()}`;
});

// Virtual for age of listing
cropListingSchema.virtual('listingAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Instance method to close listing
cropListingSchema.methods.closeListing = function() {
  this.status = 'closed';
  return this.save();
};

// Static method to find active listings
cropListingSchema.statics.findActiveByCrop = function(cropName) {
  return this.find({ 
    cropName: new RegExp(cropName, 'i'), 
    status: 'active' 
  }).populate('farmerId', 'name email phone');
};

// Static method to find listings by farmer
cropListingSchema.statics.findByFarmer = function(farmerId) {
  return this.find({ farmerId }).populate('farmerId', 'name email phone');
};

// Pre-save middleware to ensure cropName is capitalized
cropListingSchema.pre('save', function(next) {
  if (this.cropName) {
    this.cropName = this.cropName.charAt(0).toUpperCase() + this.cropName.slice(1).toLowerCase();
  }
  next();
});

const CropListing = mongoose.model('CropListing', cropListingSchema);

module.exports = CropListing;