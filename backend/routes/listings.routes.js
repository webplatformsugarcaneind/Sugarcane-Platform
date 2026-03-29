const express = require('express');
const router = express.Router();
const CropListing = require('../models/cropListing.model');
<<<<<<< HEAD
const multer = require('multer');
const path = require('path');

// DEBUG: Confirm this file is being loaded
console.log('🔥 LOADING MAIN listings.routes.js - this file should be the only one!');
=======
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

<<<<<<< HEAD
// Configure multer for handling FormData
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/farms/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to sanitize listing data for consistent frontend display
const sanitizeListingData = (listing) => {
  const sanitized = listing.toObject ? listing.toObject() : listing;
  
  // Ensure quantity_available has both value and unit
  if (!sanitized.quantity_available) {
    sanitized.quantity_available = { value: 0, unit: 'gunthas' };
  } else {
    sanitized.quantity_available = {
      value: sanitized.quantity_available.value || 0,
      unit: sanitized.quantity_available.unit || 'gunthas'
    };
  }
  
  // Ensure price_details has all required fields
  if (!sanitized.price_details) {
    sanitized.price_details = { price_per_unit: 0, price_negotiable: true };
  } else {
    sanitized.price_details = {
      price_per_unit: sanitized.price_details.price_per_unit || 0,
      price_negotiable: sanitized.price_details.price_negotiable !== false,
      minimum_order_quantity: sanitized.price_details.minimum_order_quantity || 1
    };
  }
  
  // Ensure delivery_timeframe exists
  if (!sanitized.delivery_timeframe) {
    sanitized.delivery_timeframe = {
      available_from: sanitized.harvest_availability_date || new Date(),
      available_until: null,
      preferred_delivery_time: 'Flexible'
    };
  }
  
  // Ensure seed_quality exists
  if (!sanitized.seed_quality) {
    sanitized.seed_quality = {
      disease_free_status: 'Standard Quality',
      certification_details: ''
    };
  }
  
  // Ensure farm_images is an array
  if (!sanitized.farm_images || !Array.isArray(sanitized.farm_images)) {
    sanitized.farm_images = [];
  }
  
  // Ensure numeric fields have valid values
  sanitized.crop_age = sanitized.crop_age || 0;
  sanitized.germination_percentage = sanitized.germination_percentage || 0;
  
  return sanitized;
};

// Helper function to parse JSON fields from FormData
const parseFormData = (req, res, next) => {
  try {
    console.log('🔍 Raw FormData received:', req.body);
    
    // Parse JSON fields that are stringified in FormData
    if (req.body.seed_quality) {
      try {
        req.body.seed_quality = JSON.parse(req.body.seed_quality);
        console.log('✅ Parsed seed_quality:', req.body.seed_quality);
      } catch (e) {
        console.log('❌ Failed to parse seed_quality:', req.body.seed_quality);
      }
    }
    
    if (req.body.quantity_available) {
      try {
        req.body.quantity_available = JSON.parse(req.body.quantity_available);
        console.log('✅ Parsed quantity_available:', req.body.quantity_available);
      } catch (e) {
        console.log('❌ Failed to parse quantity_available:', req.body.quantity_available);
      }
    }
    
    if (req.body.price_details) {
      try {
        req.body.price_details = JSON.parse(req.body.price_details);
        console.log('✅ Parsed price_details:', req.body.price_details);
      } catch (e) {
        console.log('❌ Failed to parse price_details:', req.body.price_details);
      }
    }
    
    if (req.body.delivery_timeframe) {
      try {
        req.body.delivery_timeframe = JSON.parse(req.body.delivery_timeframe);
        console.log('✅ Parsed delivery_timeframe:', req.body.delivery_timeframe);
      } catch (e) {
        console.log('❌ Failed to parse delivery_timeframe:', req.body.delivery_timeframe);
      }
    }
    
    // Convert string numbers to numbers
    if (req.body.crop_age) {
      req.body.crop_age = parseInt(req.body.crop_age);
      console.log('✅ Converted crop_age:', req.body.crop_age);
    }
    if (req.body.germination_percentage) {
      req.body.germination_percentage = parseInt(req.body.germination_percentage);
      console.log('✅ Converted germination_percentage:', req.body.germination_percentage);
    }
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.body.farm_images = req.files.map(file => ({
        url: `/uploads/farms/${file.filename}`,
        caption: file.originalname,
        image_type: 'crop_closeup'
      }));
      console.log('✅ Processed farm images:', req.body.farm_images);
    }
    
    console.log('✅ FormData parsed successfully. Final body:', req.body);
    next();
  } catch (error) {
    console.error('❌ Error parsing FormData:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in form data',
      error: error.message
    });
  }
};

=======
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
/**
 * @route   GET /api/listings/marketplace
 * @desc    Get all active crop listings (marketplace view)
 * @access  Public (No authentication required)
 */
router.get('/marketplace', async (req, res) => {
  try {
    console.log('🏪 Fetching marketplace listings (public access)');
    
<<<<<<< HEAD
    // Build filter object - exclude listings with 0 quantity
    const filter = { 
      status: 'active',
      'quantity_available.value': { $gt: 0 }
    };

    // Query with population
    const listings = await CropListing.find(filter)
      .populate('farmer_id', 'name email phone location')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`📊 Initial query returned ${listings.length} listings`);
    
    // Filter out listings with invalid/missing farmer data to prevent "Unknown Farmer" display
    const validListings = listings.filter(listing => {
      const hasValidFarmer = listing.farmer_id && listing.farmer_id.name;
      
      if (!hasValidFarmer) {
        console.log(`⚠️  Filtering out listing "${listing.title}" - Invalid farmer_id: ${listing.farmer_id || 'null'}`);
        
        // Log the orphaned listing for debugging
        if (listing.farmer_id === null) {
          console.log(`   Listing ID ${listing._id} has null farmer_id - run fix-orphaned-listings.js`);
        } else if (listing.farmer_id && !listing.farmer_id.name) {
          console.log(`   Listing ID ${listing._id} farmer exists but missing name - farmer_id: ${listing.farmer_id._id || listing.farmer_id}`);
        }
      }
      
      return hasValidFarmer;
    });

    console.log(`✅ Returning ${validListings.length} valid listings (filtered out ${listings.length - validListings.length} with missing farmer data)`);
    
    // Sanitize all valid listings for consistent frontend display
    const sanitizedListings = validListings.map(listing => sanitizeListingData(listing));

    // Add debugging info in development mode
    if (process.env.NODE_ENV === 'development' && listings.length !== validListings.length) {
      console.log(`🔍 Debug: ${listings.length - validListings.length} listings filtered due to missing farmer data`);
      console.log('   Recommendation: Run "node diagnose-unknown-farmer.js" to identify orphaned listings');
    }

    res.json({
      success: true,
      message: 'Marketplace listings retrieved successfully',
      data: sanitizedListings,
      meta: {
        total_queried: listings.length,
        valid_returned: validListings.length,
        filtered_out: listings.length - validListings.length
=======
    // Extract query parameters for filtering/pagination
    const {
      crop_variety,
      location,
      min_price,
      max_price,
      min_quantity,
      max_quantity,
      farmer_id,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Add optional filters
    if (crop_variety) {
      filter.crop_variety = new RegExp(crop_variety, 'i');
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    if (farmer_id) {
      filter.farmer_id = farmer_id;
    }

    if (min_price || max_price) {
      filter.expected_price_per_ton = {};
      if (min_price) filter.expected_price_per_ton.$gte = parseFloat(min_price);
      if (max_price) filter.expected_price_per_ton.$lte = parseFloat(max_price);
    }

    if (min_quantity || max_quantity) {
      filter.quantity_in_tons = {};
      if (min_quantity) filter.quantity_in_tons.$gte = parseFloat(min_quantity);
      if (max_quantity) filter.quantity_in_tons.$lte = parseFloat(max_quantity);
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    let sortOrder = {};
    switch (sort) {
      case 'price_low':
        sortOrder = { expected_price_per_ton: 1 };
        break;
      case 'price_high':
        sortOrder = { expected_price_per_ton: -1 };
        break;
      case 'quantity_low':
        sortOrder = { quantity_in_tons: 1 };
        break;
      case 'quantity_high':
        sortOrder = { quantity_in_tons: -1 };
        break;
      case 'newest':
        sortOrder = { createdAt: -1 };
        break;
      case 'oldest':
        sortOrder = { createdAt: 1 };
        break;
      default:
        sortOrder = { createdAt: -1 }; // Default to newest first
    }

    // Get listings with pagination and populate farmer details
    const listings = await CropListing.find(filter)
      .populate('farmer_id', 'name username email phone location contact_details')
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalListings = await CropListing.countDocuments(filter);
    const totalPages = Math.ceil(totalListings / limitNum);

    console.log(`✅ Found ${listings.length} listings out of ${totalListings} total`);

    res.json({
      success: true,
      data: listings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalListings,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        crop_variety,
        location,
        min_price,
        max_price,
        min_quantity,
        max_quantity,
        farmer_id,
        sort
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      }
    });

  } catch (error) {
    console.error('❌ Error fetching marketplace listings:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching marketplace listings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

<<<<<<< HEAD
/**
 * @route   GET /api/listings/test
 * @desc    Simple test endpoint to verify routes are working
 * @access  Public 
 */
router.get('/test', (req, res) => {
  console.log('🧪 Simple test endpoint hit');
  res.json({
    success: true,
    message: 'Listings routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/listings/create-test
 * @desc    Create a new crop listing (test endpoint without auth)
 * @access  Public (for testing)
 */
router.post('/create-test', async (req, res) => {
  try {
    console.log('🧪 TEST: Creating listing without authentication');
    console.log('📝 Request body:', req.body);
    
    const testListing = {
      farmer_id: '507f1f77bcf86cd799439011', // Mock farmer ID for testing
      title: req.body.title || 'Test Listing',
      status: 'active',
      sugarcane_variety: req.body.sugarcane_variety || 'Test Variety',
      delivery_location: req.body.delivery_location || 'Test Location'
    };
    
    console.log('📝 Creating test listing:', testListing);
    
    const newListing = new CropListing(testListing);
    const savedListing = await newListing.save();
    
    console.log('✅ Test listing created successfully:', savedListing._id);
    
    return res.status(201).json({
      success: true,
      message: 'Test listing created successfully',
      data: savedListing
    });

  } catch (error) {
    console.error('❌ Error creating test listing:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating test listing',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/listings/create
 * @desc    Create a new crop listing (simplified for debugging)
 * @access  Private (Farmer only)
 */
router.post('/create', protect, authorize('Farmer'), upload.array('farm_images', 10), parseFormData, async (req, res) => {
  try {
    console.log('🌾 Creating new listing for farmer:', req.user._id);
    console.log('� User details:', { id: req.user._id, name: req.user.name, role: req.user.role });
    console.log('📝 Request body:', req.body);
    console.log('📦 Request headers:', req.headers);
    
    const listingData = req.body;
    
    // Basic validation
    if (!listingData.title) {
      console.log('❌ Validation failed: Title is required');
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    // Validate sugarcane variety if provided
    if (listingData.sugarcane_variety) {
      const validVarieties = ['Co 86032', 'Co 0238', 'Co 62175', 'Co 06022', 'CoM 0265', 'Co 1148', 'Other'];
      if (!validVarieties.includes(listingData.sugarcane_variety)) {
        console.log('❌ Validation failed: Invalid sugarcane variety:', listingData.sugarcane_variety);
        console.log('✅ Valid varieties are:', validVarieties);
        return res.status(400).json({
          success: false,
          message: `Invalid sugarcane variety. Valid options are: ${validVarieties.join(', ')}`
        });
      }
    }
    
    // Create comprehensive listing fields
    const listingFields = {
      farmer_id: req.user._id,
      title: listingData.title.trim(),
      status: 'active'
    };
    
    // Add all available fields
    if (listingData.sugarcane_variety) {
      listingFields.sugarcane_variety = listingData.sugarcane_variety;
      listingFields.crop_variety = listingData.sugarcane_variety; // Legacy compatibility
    }
    
    if (listingData.delivery_location) {
      listingFields.delivery_location = listingData.delivery_location.trim();
      listingFields.location = listingData.delivery_location.trim(); // Legacy compatibility
    }
    
    // Add quality & seed information
    if (listingData.seed_quality) {
      listingFields.seed_quality = listingData.seed_quality;
    }
    
    if (listingData.crop_age) {
      listingFields.crop_age = listingData.crop_age;
    }
    
    if (listingData.germination_percentage) {
      listingFields.germination_percentage = listingData.germination_percentage;
    }
    
    if (listingData.seed_type) {
      listingFields.seed_type = listingData.seed_type;
    }
    
    // Add quantity & pricing
    if (listingData.quantity_available) {
      listingFields.quantity_available = listingData.quantity_available;
      
      // Legacy compatibility
      if (listingData.quantity_available.unit === 'gunthas') {
        listingFields.quantity_in_tons = listingData.quantity_available.value;
      }
    }
    
    if (listingData.price_details) {
      listingFields.price_details = listingData.price_details;
      
      // Legacy compatibility
      if (listingData.price_details.price_per_unit) {
        listingFields.expected_price_per_ton = listingData.price_details.price_per_unit;
      }
    }
    
    // Add delivery information
    if (listingData.delivery_timeframe) {
      listingFields.delivery_timeframe = listingData.delivery_timeframe;
      
      // Legacy compatibility
      if (listingData.delivery_timeframe.available_from) {
        listingFields.harvest_availability_date = listingData.delivery_timeframe.available_from;
      }
    }
    
    // Add description
    if (listingData.description) {
      listingFields.description = listingData.description;
    }
    
    // Add farm images
    if (listingData.farm_images && listingData.farm_images.length > 0) {
      listingFields.farm_images = listingData.farm_images;
    }
    
    console.log('📝 Final listing fields:', JSON.stringify(listingFields, null, 2));
    
    const newListing = new CropListing(listingFields);
    
    console.log('💾 Attempting to save listing to database...');
    const savedListing = await newListing.save();
    console.log('✅ Listing saved successfully with ID:', savedListing._id);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
=======
// Apply protection to all other routes - user must be authenticated
router.use(protect);

/**
 * @route   POST /api/listings/create
 * @desc    Create a new crop listing (only for Farmers)
 * @access  Private (Farmer only)
 */
router.post('/create', authorize('Farmer'), async (req, res) => {
  try {
    console.log('🌾 Creating new crop listing for farmer:', req.user._id);
    
    const {
      title,
      crop_variety,
      quantity_in_tons,
      expected_price_per_ton,
      harvest_availability_date,
      location,
      description
    } = req.body;

    // Validate required fields
    if (!title || !crop_variety || !quantity_in_tons || !expected_price_per_ton || !harvest_availability_date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, crop_variety, quantity_in_tons, expected_price_per_ton, harvest_availability_date, location'
      });
    }

    // Validate data types
    if (isNaN(quantity_in_tons) || quantity_in_tons <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity in tons must be a positive number'
      });
    }

    if (isNaN(expected_price_per_ton) || expected_price_per_ton <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected price per ton must be a positive number'
      });
    }

    // Validate harvest date is not in the past
    const harvestDate = new Date(harvest_availability_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (harvestDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Harvest availability date cannot be in the past'
      });
    }

    // Create new crop listing
    const newListing = new CropListing({
      farmer_id: req.user._id,
      title: title.trim(),
      crop_variety: crop_variety.trim(),
      quantity_in_tons: parseFloat(quantity_in_tons),
      expected_price_per_ton: parseFloat(expected_price_per_ton),
      harvest_availability_date: harvestDate,
      location: location.trim(),
      description: description ? description.trim() : undefined,
      status: 'active' // Default status
    });

    // Save to database
    const savedListing = await newListing.save();

    // Populate the farmer details for response
    await savedListing.populate('farmer_id', 'name email phone');

    console.log('✅ Crop listing created successfully:', savedListing._id);

    res.status(201).json({
      success: true,
      message: 'Crop listing created successfully',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      data: savedListing
    });

  } catch (error) {
<<<<<<< HEAD
    console.error('❌ Error creating listing:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Specific error handling for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating listing',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/listings/:id
 * @desc    Update an existing crop listing
 * @access  Private (Farmer only - own listings)
 */
router.put('/:id', protect, authorize('Farmer'), upload.array('farm_images', 10), parseFormData, async (req, res) => {
  try {
    console.log('✏️ Updating listing:', req.params.id);
    console.log('👤 Farmer:', req.user._id);
    console.log('📝 Update data:', req.body);
    
    // Find the listing
    const listing = await CropListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check ownership
    if (listing.farmer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this listing'
      });
    }
    
    const updateData = req.body;
    
    // Validate sugarcane variety if provided
    if (updateData.sugarcane_variety) {
      const validVarieties = ['Co 86032', 'Co 0238', 'Co 62175', 'Co 06022', 'CoM 0265', 'Co 1148', 'Other'];
      if (!validVarieties.includes(updateData.sugarcane_variety)) {
        return res.status(400).json({
          success: false,
          message: `Invalid sugarcane variety. Valid options are: ${validVarieties.join(', ')}`
        });
      }
    }
    
    // Update fields if provided
    if (updateData.title) listing.title = updateData.title.trim();
    if (updateData.sugarcane_variety) {
      listing.sugarcane_variety = updateData.sugarcane_variety;
      listing.crop_variety = updateData.sugarcane_variety; // Legacy compatibility
    }
    if (updateData.delivery_location) {
      listing.delivery_location = updateData.delivery_location.trim();
      listing.location = updateData.delivery_location.trim(); // Legacy compatibility
    }
    
    // Update quality & seed information
    if (updateData.seed_quality) {
      listing.seed_quality = updateData.seed_quality;
    }
    if (updateData.crop_age !== undefined) {
      listing.crop_age = updateData.crop_age;
    }
    if (updateData.germination_percentage !== undefined) {
      listing.germination_percentage = updateData.germination_percentage;
    }
    if (updateData.seed_type) {
      listing.seed_type = updateData.seed_type;
    }
    
    // Update quantity & pricing
    if (updateData.quantity_available) {
      listing.quantity_available = updateData.quantity_available;
      
      // Legacy compatibility
      if (updateData.quantity_available.unit === 'gunthas') {
        listing.quantity_in_tons = updateData.quantity_available.value;
      }
    }
    
    if (updateData.price_details) {
      listing.price_details = updateData.price_details;
      
      // Legacy compatibility - handle both base_price_per_ton and price_per_unit
      if (updateData.price_details.base_price_per_ton) {
        listing.expected_price_per_ton = updateData.price_details.base_price_per_ton;
      } else if (updateData.price_details.price_per_unit) {
        listing.expected_price_per_ton = updateData.price_details.price_per_unit;
      }
    }
    
    // Update delivery information
    if (updateData.delivery_timeframe) {
      listing.delivery_timeframe = updateData.delivery_timeframe;
      
      // Legacy compatibility
      if (updateData.delivery_timeframe.available_from) {
        listing.harvest_availability_date = updateData.delivery_timeframe.available_from;
      }
    }
    
    // Update description
    if (updateData.description) {
      listing.description = updateData.description;
    }
    
    // Handle farm images
    // If keep_existing_images is provided, start with those
    // Then add new uploaded images
    let finalImages = [];
    
    if (updateData.keep_existing_images) {
      try {
        const keepImages = typeof updateData.keep_existing_images === 'string' 
          ? JSON.parse(updateData.keep_existing_images) 
          : updateData.keep_existing_images;
        finalImages = Array.isArray(keepImages) ? keepImages : [];
        console.log('🖼️ Keeping existing images:', finalImages.length);
      } catch (e) {
        console.log('❌ Error parsing keep_existing_images:', e);
      }
    }
    
    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/farms/${file.filename}`,
        caption: file.originalname,
        image_type: 'crop_closeup'
      }));
      finalImages = [...finalImages, ...newImages];
      console.log('🖼️ Added new images:', newImages.length);
    }
    
    // Update farm_images only if there are changes
    if (finalImages.length > 0 || updateData.keep_existing_images) {
      listing.farm_images = finalImages;
      console.log('🖼️ Total images after update:', finalImages.length);
    }
    
    // Update status if provided
    if (updateData.status) {
      listing.status = updateData.status;
    }
    
    console.log('💾 Saving updated listing...');
    const updatedListing = await listing.save();
    console.log('✅ Listing updated successfully');

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedListing
    });

  } catch (error) {
    console.error('❌ Error updating listing:', error);
    
    // Specific error handling for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Private (Farmer only - own listings)
 */
router.delete('/:id', protect, authorize('Farmer'), async (req, res) => {
  try {
    console.log('🗑️ Deleting listing:', req.params.id);
    console.log('👤 Farmer:', req.user._id);
    
    // Find the listing
    const listing = await CropListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check ownership
    if (listing.farmer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing'
      });
    }
    
    await listing.deleteOne();
    console.log('✅ Listing deleted successfully');

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing',
      error: error.message
=======
    console.error('❌ Error creating crop listing:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating crop listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    });
  }
});

/**
 * @route   GET /api/listings/my-listings
 * @desc    Get all listings created by the logged-in farmer
 * @access  Private (Farmer only)
<<<<<<< HEAD
 * NOTE: This route MUST come before /:id to avoid route conflicts
 */
router.get('/my-listings', protect, authorize('Farmer'), async (req, res) => {
  try {
    console.log('📋 Fetching my listings for farmer:', req.user._id);
    console.log('👤 Farmer name:', req.user.name);
    console.log('📧 Farmer email:', req.user.email);
    
    // Build filter - optionally exclude 0 quantity listings
    const filter = { farmer_id: req.user._id };
    console.log('🔍 Filter being used:', JSON.stringify(filter));
    
    // Add query parameter to show/hide zero quantity listings
    const hideZeroQuantity = req.query.hideZero === 'true';
    if (hideZeroQuantity) {
      filter['quantity_available.value'] = { $gt: 0 };
      console.log('⚠️ Filtering out zero quantity listings');
    }
    
    const listings = await CropListing.find(filter)
      .populate('farmer_id', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`✅ Retrieved ${listings.length} listings for farmer: ${req.user.name}`);
    
    if (listings.length === 0) {
      console.log('⚠️ No listings found for this farmer.');
      console.log('🔍 Checking all listings in database...');
      const allListings = await CropListing.find({}).select('_id farmer_id title').lean();
      console.log(`📊 Total listings in database: ${allListings.length}`);
      if (allListings.length > 0) {
        console.log('📋 Listing farmer_ids:');
        allListings.forEach(listing => {
          console.log(`   - ${listing._id}: farmer_id = ${listing.farmer_id}`);
        });
        console.log(`👤 Your user ID: ${req.user._id}`);
        console.log(`🔍 Type of your ID: ${typeof req.user._id}`);
        console.log(`🔍 Type of listing farmer_id: ${typeof allListings[0].farmer_id}`);
      }
    }
    
    // Sanitize all listings for consistent frontend display
    const sanitizedListings = listings.map(listing => sanitizeListingData(listing));
=======
 */
router.get('/my-listings', authorize('Farmer'), async (req, res) => {
  try {
    console.log('📋 Fetching my listings for farmer:', req.user._id);
    
    // Extract query parameters for filtering/pagination
    const {
      status,
      crop_variety,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    // Build filter object
    const filter = { farmer_id: req.user._id };

    // Add optional filters
    if (status) {
      filter.status = status;
    }

    if (crop_variety) {
      filter.crop_variety = new RegExp(crop_variety, 'i');
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalListings = await CropListing.countDocuments(filter);

    // Build sort object
    const sortObj = {};
    if (sort === 'createdAt') sortObj.createdAt = -1;
    else if (sort === 'price') sortObj.expected_price_per_ton = 1;
    else if (sort === 'quantity') sortObj.quantity_in_tons = -1;
    else if (sort === 'harvest') sortObj.harvest_availability_date = 1;
    else sortObj.createdAt = -1; // Default sort

    // Fetch farmer's listings with pagination
    const listings = await CropListing.find(filter)
      .populate('farmer_id', 'name email phone') // Populate for consistency
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(totalListings / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    console.log(`✅ Retrieved ${listings.length} listings for farmer: ${req.user.name}`);
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3

    res.json({
      success: true,
      message: 'Your listings retrieved successfully',
<<<<<<< HEAD
      data: sanitizedListings
=======
      data: listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalListings,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      filters: {
        status,
        crop_variety,
        sort
      }
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    });

  } catch (error) {
    console.error('❌ Error fetching farmer listings:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your listings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
<<<<<<< HEAD
 * @route   GET /api/listings/:id
 * @desc    Get a single listing by ID
 * @access  Public
 * NOTE: This route MUST come after specific routes like /my-listings
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching listing:', req.params.id);
    
    const listing = await CropListing.findById(req.params.id)
      .populate('farmer_id', 'name email phone location');
    
=======
 * @route   GET /api/listings/:listingId
 * @desc    Get a single crop listing by ID
 * @access  Private (All logged-in users)
 */
router.get('/:listingId', async (req, res) => {
  try {
    const listingId = req.params.listingId;
    console.log('🔍 Fetching listing details for:', listingId);

    // Validate MongoDB ObjectId format
    if (!listingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    // Find the listing and populate farmer details
    const listing = await CropListing.findById(listingId)
      .populate('farmer_id', 'name username email phone location profilePicture contact_details');

    if (!listing) {
      console.log(`❌ Listing not found: ${listingId}`);
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    console.log(`✅ Listing details retrieved: ${listing.title}`);

    res.json({
      success: true,
      message: 'Listing details retrieved successfully',
      data: listing
    });

  } catch (error) {
    console.error('❌ Error fetching listing details:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/listings/:listingId
 * @desc    Update a listing (only the owner farmer can update)
 * @access  Private (Farmer only - owner verification)
 */
router.put('/:listingId', authorize('Farmer'), async (req, res) => {
  try {
    const listingId = req.params.listingId;
    console.log(`📝 Updating listing ${listingId} for farmer:`, req.user._id);
    
    // Validate MongoDB ObjectId format
    if (!listingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    // Find the listing first
    const existingListing = await CropListing.findById(listingId);

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check ownership - farmer can only update their own listings
    if (existingListing.farmer_id.toString() !== req.user._id.toString()) {
      console.log(`❌ Unauthorized update attempt by farmer ${req.user._id} on listing ${listingId} owned by ${existingListing.farmer_id}`);
      return res.status(403).json({
        success: false,
        message: 'You can only update your own listings'
      });
    }

    // Extract updatable fields from request body
    const {
      title,
      crop_variety,
      quantity_in_tons,
      expected_price_per_ton,
      harvest_availability_date,
      location,
      description,
      status
    } = req.body;

    // Prepare update object with only provided fields
    const updateFields = {};
    
    if (title !== undefined) updateFields.title = title.trim();
    if (crop_variety !== undefined) updateFields.crop_variety = crop_variety.trim();
    if (quantity_in_tons !== undefined) {
      if (isNaN(quantity_in_tons) || quantity_in_tons <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity in tons must be a positive number'
        });
      }
      updateFields.quantity_in_tons = parseFloat(quantity_in_tons);
    }
    if (expected_price_per_ton !== undefined) {
      if (isNaN(expected_price_per_ton) || expected_price_per_ton <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Expected price per ton must be a positive number'
        });
      }
      updateFields.expected_price_per_ton = parseFloat(expected_price_per_ton);
    }
    if (harvest_availability_date !== undefined) {
      const harvestDate = new Date(harvest_availability_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (harvestDate < today && status !== 'expired') {
        return res.status(400).json({
          success: false,
          message: 'Harvest availability date cannot be in the past unless marking as expired'
        });
      }
      updateFields.harvest_availability_date = harvestDate;
    }
    if (location !== undefined) updateFields.location = location.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (status !== undefined) {
      if (!['active', 'sold', 'expired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: active, sold, expired'
        });
      }
      updateFields.status = status;
    }

    // Check if any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    // Update the listing
    const updatedListing = await CropListing.findByIdAndUpdate(
      listingId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('farmer_id', 'name email phone');

    console.log(`✅ Listing updated successfully: ${updatedListing.title}`);

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedListing,
      updatedFields: Object.keys(updateFields)
    });

  } catch (error) {
    console.error('❌ Error updating listing:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/listings/:listingId
 * @desc    Delete a listing (only the owner farmer can delete)
 * @access  Private (Farmer only - owner verification)
 */
router.delete('/:listingId', authorize('Farmer'), async (req, res) => {
  try {
    const listingId = req.params.listingId;
    console.log(`🗑️ Deleting listing ${listingId} for farmer:`, req.user._id);
    
    // Validate MongoDB ObjectId format
    if (!listingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    // Find the listing first
    const listing = await CropListing.findById(listingId);

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
<<<<<<< HEAD
    
    // Sanitize listing data
    const sanitizedListing = sanitizeListingData(listing);

    res.json({
      success: true,
      message: 'Listing retrieved successfully',
      data: sanitizedListing
    });

  } catch (error) {
    console.error('❌ Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing',
      error: error.message
=======

    // Check ownership - farmer can only delete their own listings
    if (listing.farmer_id.toString() !== req.user._id.toString()) {
      console.log(`❌ Unauthorized delete attempt by farmer ${req.user._id} on listing ${listingId} owned by ${listing.farmer_id}`);
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings'
      });
    }

    // Store listing details for response
    const deletedListingInfo = {
      _id: listing._id,
      title: listing.title,
      crop_variety: listing.crop_variety,
      quantity_in_tons: listing.quantity_in_tons,
      status: listing.status
    };

    // Delete the listing
    await CropListing.findByIdAndDelete(listingId);

    console.log(`✅ Listing deleted successfully: ${listing.title}`);

    res.json({
      success: true,
      message: 'Listing deleted successfully',
      deletedListing: deletedListingInfo
    });

  } catch (error) {
    console.error('❌ Error deleting listing:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/listings/:listingId/status
 * @desc    Change listing status (only the owner farmer can change status)
 * @access  Private (Farmer only - owner verification)
 */
router.put('/:listingId/status', authorize('Farmer'), async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const { status } = req.body;
    
    console.log(`🔄 Changing status for listing ${listingId} to:`, status);
    
    // Validate MongoDB ObjectId format
    if (!listingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    // Validate status
    if (!status || !['active', 'sold', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: active, sold, expired'
      });
    }

    // Find the listing first
    const listing = await CropListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check ownership - farmer can only update their own listings
    if (listing.farmer_id.toString() !== req.user._id.toString()) {
      console.log(`❌ Unauthorized status change attempt by farmer ${req.user._id} on listing ${listingId} owned by ${listing.farmer_id}`);
      return res.status(403).json({
        success: false,
        message: 'You can only change status of your own listings'
      });
    }

    // Update status
    const updatedListing = await CropListing.findByIdAndUpdate(
      listingId,
      { $set: { status: status } },
      { new: true, runValidators: true }
    ).populate('farmer_id', 'name email phone');

    console.log(`✅ Listing status changed successfully: ${listing.title} -> ${status}`);

    res.json({
      success: true,
      message: `Listing status changed to ${status}`,
      data: updatedListing,
      previousStatus: listing.status,
      newStatus: status
    });

  } catch (error) {
    console.error('❌ Error changing listing status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while changing listing status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    });
  }
});

module.exports = router;