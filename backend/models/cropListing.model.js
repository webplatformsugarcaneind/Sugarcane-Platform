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
<<<<<<< HEAD
  // Product Information
=======
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
  title: {
    type: String,
    required: true,
    trim: true
  },
<<<<<<< HEAD
  sugarcane_variety: {
    type: String,
    trim: true,
    enum: ['Co 86032', 'Co 0238', 'Co 62175', 'Co 06022', 'CoM 0265', 'Co 1148', 'Other']
  },
  
  // Quality & Seed Information (optional for backward compatibility)
  seed_quality: {
    disease_free_status: {
      type: String,
      enum: ['Certified Disease-Free', 'Tested Healthy', 'Standard Quality']
    },
    certification_details: {
      type: String,
      trim: true
    }
  },
  crop_age: {
    type: Number,
    min: 1,
    max: 24, // months
    description: 'Age of crop in months'
  },
  germination_percentage: {
    type: Number,
    min: 0,
    max: 100,
    description: 'Germination rate percentage'
  },
  seed_type: {
    type: String,
    enum: ['2-Bud Setts', '3-Bud Setts', 'Mixed Setts']
  },
  
  // Quantity & Pricing
  quantity_available: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['gunthas'],
      default: 'gunthas'
    }
  },
  price_details: {
    price_per_unit: {
      type: Number,
      min: 0
    },
    price_negotiable: {
      type: Boolean,
      default: true
    },
    minimum_order_quantity: {
      type: Number,
      min: 0
    }
  },
  
  // Delivery Information  
  delivery_location: {
    type: String,
    trim: true
  },
  delivery_timeframe: {
    available_from: {
      type: Date
    },
    available_until: {
      type: Date
    },
    preferred_delivery_time: {
      type: String,
      enum: ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-9PM)', 'Flexible']
    }
  },
  
  // Images
  farm_images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    },
    image_type: {
      type: String,
      enum: ['farm_overview', 'crop_closeup', 'quality_sample', 'equipment', 'other'],
      default: 'crop_closeup'
    }
  }],
  
  // Legacy fields for backward compatibility
  crop_variety: {
    type: String,
=======
  crop_variety: {
    type: String,
    required: true,
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    trim: true
  },
  quantity_in_tons: {
    type: Number,
<<<<<<< HEAD
=======
    required: true,
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    min: 0
  },
  expected_price_per_ton: {
    type: Number,
<<<<<<< HEAD
    min: 0
  },
  harvest_availability_date: {
    type: Date
  },
  location: {
    type: String,
=======
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
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    trim: true
  },
  description: {
    type: String,
<<<<<<< HEAD
=======
    required: false,
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    trim: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
cropListingSchema.index({ farmer_id: 1 });
cropListingSchema.index({ status: 1 });
<<<<<<< HEAD
cropListingSchema.index({ sugarcane_variety: 1 });
cropListingSchema.index({ 'seed_quality.disease_free_status': 1 });
cropListingSchema.index({ seed_type: 1 });
cropListingSchema.index({ 'delivery_timeframe.available_from': 1 });
cropListingSchema.index({ createdAt: -1 });
cropListingSchema.index({ delivery_location: 1 });
cropListingSchema.index({ 'quantity_available.value': 1 });
cropListingSchema.index({ 'price_details.price_per_unit': 1 });

// Legacy indexes for backward compatibility
cropListingSchema.index({ crop_variety: 1 });
cropListingSchema.index({ harvest_availability_date: 1 });
cropListingSchema.index({ location: 1 });

// Virtual for formatted price
cropListingSchema.virtual('formattedPrice').get(function() {
  if (this.price_details && this.price_details.price_per_unit) {
    return `₹${this.price_details.price_per_unit.toLocaleString()}/${this.quantity_available?.unit || 'unit'}`;
  }
  // Fallback to legacy format
  if (this.expected_price_per_ton) {
    return `₹${this.expected_price_per_ton.toLocaleString()}/ton`;
  }
  return 'Price not specified';
});

// Virtual for total value
cropListingSchema.virtual('totalValue').get(function() {
  if (this.price_details && this.quantity_available) {
    return this.quantity_available.value * this.price_details.price_per_unit;
  }
  // Fallback to legacy calculation
  if (this.quantity_in_tons && this.expected_price_per_ton) {
    return this.quantity_in_tons * this.expected_price_per_ton;
  }
  return 0;
=======
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
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
});

// Virtual for formatted total value
cropListingSchema.virtual('formattedTotalValue').get(function() {
<<<<<<< HEAD
  return `₹${this.totalValue.toLocaleString()}`;
});

// Virtual for availability status
cropListingSchema.virtual('availabilityStatus').get(function() {
  const now = new Date();
  if (this.delivery_timeframe) {
    const availableFrom = new Date(this.delivery_timeframe.available_from);
    const availableUntil = new Date(this.delivery_timeframe.available_until);
    
    if (now < availableFrom) {
      const daysUntil = Math.ceil((availableFrom - now) / (1000 * 60 * 60 * 24));
      return `Available in ${daysUntil} days`;
    } else if (now > availableUntil) {
      return 'Availability expired';
    } else {
      return 'Available now';
    }
  }
  
  // Fallback to legacy logic
  if (this.harvest_availability_date) {
    const harvestDate = new Date(this.harvest_availability_date);
    const diffTime = harvestDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `Available in ${diffDays} days` : 'Available now';
  }
  
  return 'Availability not specified';
});

// Virtual for quality score (based on germination percentage and disease-free status)
cropListingSchema.virtual('qualityScore').get(function() {
  let score = 0;
  
  if (this.germination_percentage) {
    score += this.germination_percentage * 0.6; // 60% weight for germination
  }
  
  if (this.seed_quality && this.seed_quality.disease_free_status) {
    switch (this.seed_quality.disease_free_status) {
      case 'Certified Disease-Free':
        score += 40; // 40% weight for disease-free status
        break;
      case 'Tested Healthy':
        score += 30;
        break;
      case 'Standard Quality':
        score += 20;
        break;
    }
  }
  
  return Math.min(100, Math.round(score));
});

// Legacy virtuals for backward compatibility
cropListingSchema.virtual('formattedPricePerTon').get(function() {
  if (this.expected_price_per_ton) {
    return `₹${this.expected_price_per_ton.toLocaleString()}/ton`;
  }
  return this.formattedPrice;
});

cropListingSchema.virtual('totalExpectedValue').get(function() {
  if (this.quantity_in_tons && this.expected_price_per_ton) {
    return this.quantity_in_tons * this.expected_price_per_ton;
  }
  return this.totalValue;
});

cropListingSchema.virtual('daysUntilHarvest').get(function() {
  if (this.harvest_availability_date) {
    const now = new Date();
    const harvestDate = new Date(this.harvest_availability_date);
    const diffTime = harvestDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

=======
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
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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

<<<<<<< HEAD
// Static method to find active listings by sugarcane variety
cropListingSchema.statics.findActiveBySugarcaneVariety = function(variety) {
  return this.find({ 
    sugarcane_variety: new RegExp(variety, 'i'), 
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by seed type
cropListingSchema.statics.findBySeedType = function(seedType) {
  return this.find({ 
    seed_type: seedType, 
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by disease-free status
cropListingSchema.statics.findByDiseaseStatus = function(status) {
  return this.find({ 
    'seed_quality.disease_free_status': status, 
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by minimum germination percentage
cropListingSchema.statics.findByMinGermination = function(minPercentage) {
  return this.find({ 
    germination_percentage: { $gte: minPercentage },
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by quantity range
cropListingSchema.statics.findByQuantityRange = function(minQty, maxQty, unit) {
  const query = { 
    'quantity_available.value': { $gte: minQty, $lte: maxQty },
    status: 'active' 
  };
  
  if (unit) {
    query['quantity_available.unit'] = unit;
  }
  
  return this.find(query).populate('farmer_id', 'name email phone');
};

// Static method to find listings by price range
cropListingSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({ 
    $or: [
      { 'price_details.price_per_unit': { $gte: minPrice, $lte: maxPrice } },
      { expected_price_per_ton: { $gte: minPrice, $lte: maxPrice } } // Legacy support
    ],
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by delivery location
cropListingSchema.statics.findByDeliveryLocation = function(location) {
  return this.find({ 
    $or: [
      { delivery_location: new RegExp(location, 'i') },
      { location: new RegExp(location, 'i') } // Legacy support
    ],
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings available within date range
cropListingSchema.statics.findByAvailabilityRange = function(startDate, endDate) {
  return this.find({ 
    $or: [
      { 
        'delivery_timeframe.available_from': { $lte: endDate },
        'delivery_timeframe.available_until': { $gte: startDate }
      },
      { // Legacy support
        harvest_availability_date: { $gte: startDate, $lte: endDate }
      }
    ],
=======
// Static method to find active listings by crop variety
cropListingSchema.statics.findActiveByCropVariety = function(cropVariety) {
  return this.find({ 
    crop_variety: new RegExp(cropVariety, 'i'), 
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

// Static method to find listings by farmer
cropListingSchema.statics.findByFarmer = function(farmerId) {
  return this.find({ farmer_id: farmerId }).populate('farmer_id', 'name email phone');
};

<<<<<<< HEAD
// Legacy static methods for backward compatibility
cropListingSchema.statics.findActiveByCropVariety = function(cropVariety) {
  return this.find({ 
    $or: [
      { crop_variety: new RegExp(cropVariety, 'i') },
      { sugarcane_variety: new RegExp(cropVariety, 'i') }
    ],
=======
// Static method to find listings by location
cropListingSchema.statics.findByLocation = function(location) {
  return this.find({ 
    location: new RegExp(location, 'i'), 
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    status: 'active' 
  }).populate('farmer_id', 'name email phone');
};

<<<<<<< HEAD
cropListingSchema.statics.findByLocation = function(location) {
  return this.findByDeliveryLocation(location);
};

cropListingSchema.statics.findByHarvestDateRange = function(startDate, endDate) {
  return this.findByAvailabilityRange(startDate, endDate);
};

// Pre-save middleware to ensure data consistency and validation
cropListingSchema.pre('save', function(next) {
  // Format sugarcane variety properly
  if (this.sugarcane_variety) {
    this.sugarcane_variety = this.sugarcane_variety.charAt(0).toUpperCase() + this.sugarcane_variety.slice(1).toLowerCase();
  }
  
  // Legacy support: format crop_variety properly
=======
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
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
  if (this.crop_variety) {
    this.crop_variety = this.crop_variety.charAt(0).toUpperCase() + this.crop_variety.slice(1).toLowerCase();
  }
  
<<<<<<< HEAD
  // Sync legacy fields with new structure if new fields are provided
  if (this.sugarcane_variety && !this.crop_variety) {
    this.crop_variety = this.sugarcane_variety;
  }
  
  if (this.quantity_available && !this.quantity_in_tons) {
    if (this.quantity_available.unit === 'gunthas') {
      this.quantity_in_tons = this.quantity_available.value;
    }
  }
  
  if (this.price_details && !this.expected_price_per_ton) {
    if (this.quantity_available && (this.quantity_available.unit === 'gunthas')) {
      this.expected_price_per_ton = this.price_details.price_per_unit;
    }
  }
  
  if (this.delivery_timeframe && !this.harvest_availability_date) {
    this.harvest_availability_date = this.delivery_timeframe.available_from;
  }
  
  if (this.delivery_location && !this.location) {
    this.location = this.delivery_location;
  }
  
  // Auto-expire listings if availability has passed
  const now = new Date();
  
  if (this.status === 'active') {
    // Check new format first
    if (this.delivery_timeframe && this.delivery_timeframe.available_until < now) {
      this.status = 'expired';
    }
    // Fallback to legacy format
    else if (this.harvest_availability_date && this.harvest_availability_date < now) {
      this.status = 'expired';
    }
  }
  
  // Ensure delivery timeframe is valid
  if (this.delivery_timeframe) {
    const availableFrom = new Date(this.delivery_timeframe.available_from);
    const availableUntil = new Date(this.delivery_timeframe.available_until);
    
    if (availableFrom >= availableUntil) {
      return next(new Error('Available from date must be before available until date'));
    }
  }
  
  // Validate germination percentage
  if (this.germination_percentage && (this.germination_percentage < 0 || this.germination_percentage > 100)) {
    return next(new Error('Germination percentage must be between 0 and 100'));
  }
  
  // Validate crop age
  if (this.crop_age && (this.crop_age < 1 || this.crop_age > 24)) {
    return next(new Error('Crop age must be between 1 and 24 months'));
=======
  // Auto-expire listings if harvest date has passed and status is still active
  if (this.status === 'active' && this.harvest_availability_date < new Date()) {
    this.status = 'expired';
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
  }
  
  next();
});

<<<<<<< HEAD
=======
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

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
const CropListing = mongoose.model('CropListing', cropListingSchema);

module.exports = CropListing;