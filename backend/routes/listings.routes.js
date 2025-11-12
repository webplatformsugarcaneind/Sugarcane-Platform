const express = require('express');
const router = express.Router();
const CropListing = require('../models/cropListing.model');

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/listings/marketplace
 * @desc    Get all active crop listings (marketplace view)
 * @access  Public (No authentication required)
 */
router.get('/marketplace', async (req, res) => {
  try {
    console.log('🏪 Fetching marketplace listings (public access)');
    
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
      data: savedListing
    });

  } catch (error) {
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
    });
  }
});

/**
 * @route   GET /api/listings/my-listings
 * @desc    Get all listings created by the logged-in farmer
 * @access  Private (Farmer only)
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

    res.json({
      success: true,
      message: 'Your listings retrieved successfully',
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

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

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
    });
  }
});

module.exports = router;