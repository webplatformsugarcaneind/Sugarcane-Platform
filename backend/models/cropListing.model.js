const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema({
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'sold', 'expired'],
    default: 'active'
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
    required: false,
    trim: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
cropListingSchema.index({ farmer_id: 1 });
cropListingSchema.index({ status: 1 });
cropListingSchema.index({ crop_variety: 1 });
cropListingSchema.index({ harvest_availability_date: 1 });
cropListingSchema.index({ createdAt: -1 });
cropListingSchema.index({ location: 1 });

// Virtual for formatted price
cropListingSchema.virtual('formattedPricePerTon').get(function() {
  return `₹${this.expected_price_per_ton.toLocaleString()}/ton`;
});

// Virtual for total expected value
cropListingSchema.virtual('totalExpectedValue').get(function() {
  return this.quantity_in_tons * this.expected_price_per_ton;
});

// Virtual for formatted total value
cropListingSchema.virtual('formattedTotalValue').get(function() {
  return `₹${this.totalExpectedValue.toLocaleString()}`;
});

// Virtual for days until harvest
cropListingSchema.virtual('daysUntilHarvest').get(function() {
  const now = new Date();
  const harvestDate = new Date(this.harvest_availability_date);
  const diffTime = harvestDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for listing age
cropListingSchema.virtual('listingAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Instance method to mark as sold
cropListingSchema.methods.markAsSold = function() {
  this.status = 'sold';
  return this.save();
};

// Instance method to mark as expired
cropListingSchema.methods.markAsExpired = function() {
  this.status = 'expired';
  return this.save();
};

// Instance method to reactivate listing
cropListingSchema.methods.reactivate = function() {
  this.status = 'active';
  return this.save();
};

// Static method to find active listings
cropListingSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate('farmer_id', 'name email phone');
};

// Static method to find active listings by crop variety
cropListingSchema.statics.findActiveByCropVariety = function(cropVariety) {
  return this.find({ 
    crop_variety: new RegExp(cropVariety, 'i'), 
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by farmer
cropListingSchema.statics.findByFarmer = function(farmerId) {
  return this.find({ farmer_id: farmerId }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by location
cropListingSchema.statics.findByLocation = function(location) {
  return this.find({ 
    location: new RegExp(location, 'i'), 
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by price range
cropListingSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({ 
    expected_price_per_ton: { $gte: minPrice, $lte: maxPrice },
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings available within date range
cropListingSchema.statics.findByHarvestDateRange = function(startDate, endDate) {
  return this.find({ 
    harvest_availability_date: { $gte: startDate, $lte: endDate },
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Pre-save middleware to ensure crop_variety is properly formatted
cropListingSchema.pre('save', function(next) {
  if (this.crop_variety) {
    this.crop_variety = this.crop_variety.charAt(0).toUpperCase() + this.crop_variety.slice(1).toLowerCase();
  }
  
  // Auto-expire listings if harvest date has passed and status is still active
  if (this.status === 'active' && this.harvest_availability_date < new Date()) {
    this.status = 'expired';
  }
  
  next();
});

// Pre-find middleware to automatically exclude expired listings for active queries
cropListingSchema.pre(/^find/, function() {
  // Auto-expire listings where harvest date has passed
  const now = new Date();
  this.where({ 
    $or: [
      { status: { $ne: 'active' } },
      { harvest_availability_date: { $gte: now } }
    ]
  });
});

const CropListing = mongoose.model('CropListing', cropListingSchema);

module.exports = CropListing;