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
  // Product Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  sugarcane_variety: {
    type: String,
    trim: true,
    enum: ['Co 86032', 'Co 0238', 'Co 62175', 'Co 06022', 'CoM 0265', 'Co 1148', 'Other']
  },
  crop_type: {
    type: String,
    enum: ['Planting Setts', 'Seed Cane', 'Harvest Cane'],
    default: 'Harvest Cane'
  },
  
  // Quality & Seed Information
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
  },
  germination_percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  seed_type: {
    type: String,
    enum: ['2-Bud Setts', '3-Bud Setts', 'Mixed Setts']
  },
  soil_type: {
    type: String,
    enum: ['Black Soil', 'Red Soil', 'Mixed']
  },
  irrigation_method: {
    type: String,
    enum: ['Drip', 'Flood', 'Rain-fed']
  },
  
  // Quantity & Pricing
  quantity_available: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['gunthas', 'acres'], default: 'gunthas' }
  },
  unit_type: { type: String, enum: ['Guntha', 'Acre'], default: 'Guntha' },
  price_details: {
    price_per_unit: { type: Number, min: 0 },
    price_negotiable: { type: Boolean, default: true },
    minimum_order_quantity: { type: Number, min: 0 }
  },
  bulk_discount: {
    available: { type: Boolean, default: false },
    details: { type: String }
  },
  
  // Delivery Information  
  delivery_location: { type: String, trim: true },
  delivery_method: {
    type: String,
    enum: ['Pickup', 'Farmer Delivery', 'Both'],
    default: 'Both'
  },
  transport_available: { type: Boolean, default: false },
  delivery_radius: { type: Number, min: 0 },
  delivery_timeframe: {
    available_from: { type: Date },
    available_until: { type: Date },
    preferred_delivery_time: {
      type: String,
      enum: ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-9PM)', 'Flexible']
    }
  },
  
  // Images
  farm_images: [{
    url: { type: String, required: true },
    caption: { type: String, trim: true },
    image_type: {
      type: String,
      enum: ['farm_overview', 'crop_closeup', 'quality_sample', 'equipment', 'other'],
      default: 'crop_closeup'
    }
  }],
  
  // Additional Details
  harvest_method: {
    type: String,
    enum: ['Manual', 'Machine'],
    default: 'Manual'
  },
  storage_condition: {
    type: String,
    enum: ['Fresh', 'Stored'],
    default: 'Fresh'
  },
  tags: [{ type: String }],
  
  // Legacy fields
  crop_variety: { type: String, trim: true },
  quantity_in_tons: { type: Number, min: 0 },
  expected_price_per_ton: { type: Number, min: 0 },
  harvest_availability_date: { type: Date },
  location: { type: String, trim: true },
  description: { type: String, trim: true },
  
  // Marketplace Display Fields (Newly Added)
  qualityTags: [{ type: String }],
  deliveryAvailable: { type: Boolean, default: true },
  pickupAvailable: { type: Boolean, default: true },
  sellerRating: { type: Number, default: 4.5 },
  successfulSales: { type: Number, default: 0 },
  isVerifiedFarmer: { type: Boolean, default: false },
  farming_method: { 
    type: String, 
    enum: ['Organic', 'Natural', 'Conventional', 'Hydroponic'],
    default: 'Conventional'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cropListingSchema.index({ farmer_id: 1 });
cropListingSchema.index({ status: 1 });
cropListingSchema.index({ sugarcane_variety: 1 });
cropListingSchema.index({ crop_type: 1 });
cropListingSchema.index({ createdAt: -1 });

// Virtuals
cropListingSchema.virtual('formattedPrice').get(function() {
  if (this.price_details?.price_per_unit) {
    return `₹${this.price_details.price_per_unit.toLocaleString()}/${this.quantity_available?.unit || 'unit'}`;
  }
  return 'Price not specified';
});

cropListingSchema.virtual('totalValue').get(function() {
  if (this.price_details?.price_per_unit && this.quantity_available?.value) {
    return this.quantity_available.value * this.price_details.price_per_unit;
  }
  return 0;
});

cropListingSchema.pre('save', function(next) {
  if (this.sugarcane_variety && !this.crop_variety) this.crop_variety = this.sugarcane_variety;
  if (this.delivery_location && !this.location) this.location = this.delivery_location;
  next();
});

const CropListing = mongoose.model('CropListing', cropListingSchema);
module.exports = CropListing;
