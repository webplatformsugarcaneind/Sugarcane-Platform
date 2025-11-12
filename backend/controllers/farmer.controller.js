const Announcement = require('../models/announcement.model');
const CropListing = require('../models/cropListing.model');
const User = require('../models/user.model');

/**
 * @desc    Get the logged-in farmer's profile
 * @route   GET /api/farmer/profile
 * @access  Private (Farmer only)
 */
const getProfile = async (req, res) => {
  try {
    console.log('🔥 NEW FARMER CONTROLLER - getProfile called for farmer user:', req.user?._id);
    console.log('🔥 User object keys:', Object.keys(req.user));
    console.log('🔥 User location:', req.user.location);
    console.log('🔥 User cropTypes:', req.user.cropTypes);
    console.log('🔥 User irrigationType:', req.user.irrigationType);

    // The user is already attached to req.user by the protect middleware
    const farmer = req.user;

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    // Format profile data specific to farmer users
    const profileData = {
      _id: farmer._id,
      name: farmer.name,
      username: farmer.username,
      email: farmer.email,
      phone: farmer.phone,
      role: farmer.role,
      location: farmer.location,
      farmSize: farmer.farmSize,
      farmingExperience: farmer.farmingExperience,
      farmingMethods: farmer.farmingMethods,
      equipment: farmer.equipment,
      certifications: farmer.certifications,
      cropTypes: farmer.cropTypes,
      irrigationType: farmer.irrigationType,
      isActive: farmer.isActive,
      createdAt: farmer.createdAt,
      updatedAt: farmer.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Farmer profile retrieved successfully',
      profile: profileData
    });

    console.log('🔥 NEW FARMER CONTROLLER - Response sent:', {
      success: true,
      message: 'Farmer profile retrieved successfully',
      profileDataKeys: Object.keys(profileData)
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving farmer profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update the logged-in farmer's profile
 * @route   PUT /api/farmer/profile
 * @access  Private (Farmer only)
 */
const updateProfile = async (req, res) => {
  try {
    console.log('🔄 updateProfile called for farmer user:', req.user?._id);

    const farmerId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via profile
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;

    // Update farmer profile
    const updatedFarmer = await User.findByIdAndUpdate(
      farmerId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!updatedFarmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      profile: updatedFarmer
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating farmer profile',
      error: error.message
    });
  }
};

/**
 * @desc    Get all announcements targeted to farmers
 * @route   GET /api/farmer/announcements
 * @access  Private (Farmer only)
 */
const getAnnouncements = async (req, res) => {
  try {
    // Get announcements for farmers or all users
    const announcements = await Announcement.findByAudience('farmer');

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });

  } catch (error) {
    console.error('Error in getAnnouncements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcements',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new crop listing for the farmer
 * @route   POST /api/farmer/listings
 * @access  Private (Farmer only)
 */
const createListing = async (req, res) => {
  try {
    const { type, cropName, quantity, price, location } = req.body;

    // Validate required fields
    if (!type || !cropName || !quantity || !price || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: type, cropName, quantity, price, location'
      });
    }

    // Create new listing
    const listing = new CropListing({
      farmerId: req.user._id,
      type,
      cropName,
      quantity,
      price,
      location
    });

    await listing.save();

    // Populate farmer details
    await listing.populate('farmerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Crop listing created successfully',
      data: listing
    });

  } catch (error) {
    console.error('Error in createListing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message
    });
  }
};

/**
 * @desc    Get all crop listings from all farmers
 * @route   GET /api/farmer/listings
 * @access  Private (Farmer only)
 */
const getAllListings = async (req, res) => {
  try {
    const { type, cropName, location, status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (cropName) filter.cropName = new RegExp(cropName, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (status) filter.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    const listings = await CropListing.find(filter)
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CropListing.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: listings
    });

  } catch (error) {
    console.error('Error in getAllListings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve listings',
      error: error.message
    });
  }
};

/**
 * @desc    Get only the listings created by the logged-in farmer
 * @route   GET /api/farmer/listings/my
 * @access  Private (Farmer only)
 */
const getMyListings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { farmerId: req.user._id };
    if (status) filter.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    const listings = await CropListing.find(filter)
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CropListing.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: listings
    });

  } catch (error) {
    console.error('Error in getMyListings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your listings',
      error: error.message
    });
  }
};

/**
 * @desc    Update one of the farmer's own listings
 * @route   PUT /api/farmer/listings/:id
 * @access  Private (Farmer only - own listings)
 */
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, cropName, quantity, price, location, status } = req.body;

    // Find the listing
    const listing = await CropListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if the listing belongs to the authenticated farmer
    if (listing.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own listings.'
      });
    }

    // Update the listing
    Object.assign(listing, {
      type: type || listing.type,
      cropName: cropName || listing.cropName,
      quantity: quantity !== undefined ? quantity : listing.quantity,
      price: price !== undefined ? price : listing.price,
      location: location || listing.location,
      status: status || listing.status
    });

    await listing.save();
    await listing.populate('farmerId', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });

  } catch (error) {
    console.error('Error in updateListing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update listing',
      error: error.message
    });
  }
};

/**
 * @desc    Delete one of the farmer's own listings
 * @route   DELETE /api/farmer/listings/:id
 * @access  Private (Farmer only - own listings)
 */
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the listing
    const listing = await CropListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if the listing belongs to the authenticated farmer
    if (listing.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own listings.'
      });
    }

    await CropListing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteListing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: error.message
    });
  }
};

/**
 * @desc    Get all HHMs (Hub Head Managers) directory
 * @route   GET /api/farmer/hhms
 * @access  Private (Farmer only)
 */
const getHHMs = async (req, res) => {
  try {
    // Find all active users with HHM role
    const hhms = await User.find({ 
      role: 'HHM', 
      isActive: true 
    }).select('_id name phone email username createdAt').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hhms.length,
      data: hhms
    });

  } catch (error) {
    console.error('Error in getHHMs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve HHMs directory',
      error: error.message
    });
  }
};

/**
 * @desc    Get all factories directory
 * @route   GET /api/farmer/factories
 * @access  Private (Farmer only)
 */
const getFactories = async (req, res) => {
  try {
    // Find all active users with Factory role
    const factories = await User.find({ 
      role: 'Factory', 
      isActive: true 
    }).select('_id name factoryName factoryLocation factoryDescription capacity experience specialization contactInfo operatingHours phone email username createdAt').sort({ factoryName: 1 });

    // Format the response to match expected factory structure
    const formattedFactories = factories.map(factory => ({
      id: factory._id,
      name: factory.factoryName || factory.name + ' Factory',
      location: factory.factoryLocation || 'Location not specified',
      description: factory.factoryDescription || 'Sugar processing facility',
      capacity: factory.capacity || 'Not specified',
      experience: factory.experience || 'Not specified',
      specialization: factory.specialization || 'Sugar Processing',
      contactInfo: {
        phone: factory.phone,
        email: factory.email,
        ...factory.contactInfo
      },
      operatingHours: factory.operatingHours || {},
      username: factory.username,
      createdAt: factory.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedFactories.length,
      data: formattedFactories
    });

  } catch (error) {
    console.error('Error in getFactories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve factories directory',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAnnouncements,
  createListing,
  getAllListings,
  getMyListings,
  updateListing,
  deleteListing,
  getHHMs,
  getFactories
};