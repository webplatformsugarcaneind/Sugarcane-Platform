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
    console.log(' NEW FARMER CONTROLLER - getProfile called for farmer user:', req.user?._id);
    console.log(' User object keys:', Object.keys(req.user));
    console.log(' User location:', req.user.location);
    console.log(' User cropTypes:', req.user.cropTypes);
    console.log(' User irrigationType:', req.user.irrigationType);

    // The user is already attached to req.user by the protect middleware
    const farmer = req.user;

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    // Convert mongoose document to plain object with all virtuals and getters
    const farmerData = farmer.toObject ? farmer.toObject({ getters: true, virtuals: true }) : farmer;
    delete farmerData.password;

    res.status(200).json({
      success: true,
      message: 'Farmer profile retrieved successfully',
      profile: farmerData
    });

    console.log(' NEW FARMER CONTROLLER - Response sent:', {
      success: true,
      message: 'Farmer profile retrieved successfully',
      profileDataKeys: Object.keys(farmerData)
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
    console.log(' updateProfile called for farmer user:', req.user?._id);

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
      farmer_id: req.user._id,
      type,
      cropName,
      quantity,
      price,
      location
    });

    await listing.save();

    // Populate farmer details
    await listing.populate('farmer_id', 'name email phone');

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
      .populate('farmer_id', 'name email phone')
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
    const filter = { farmer_id: req.user._id };
    if (status) filter.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    const listings = await CropListing.find(filter)
      .populate('farmer_id', 'name email phone')
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
    if (listing.farmer_id.toString() !== req.user._id.toString()) {
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
    await listing.populate('farmer_id', 'name email phone');

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
    if (listing.farmer_id.toString() !== req.user._id.toString()) {
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
    // Find all active users with HHM role — return only decision-relevant public fields
    const hhms = await User.find({ 
      role: 'HHM', 
      isActive: true 
    })
    .select('_id name location teamSize managementExperience isActive createdAt associatedFactories')
    .lean()
    .sort({ name: 1 });

    // Look up all factories (safe for small/medium sets)
    const factories = await User.find({ role: 'Factory' })
      .select('_id name factoryName associatedHHMs')
      .lean();

    const data = hhms.map(hhm => {
      // Find all factories that have this HHM in their associatedHHMs array
      const linkedFactories = factories
        .filter(f => f.associatedHHMs && f.associatedHHMs.some(id => id.toString() === hhm._id.toString()))
        .map(f => ({ _id: f._id, name: f.factoryName || f.name }));
        
      // Merge with any existing associatedFactories if they exist in the DB, though they likely don't
      const combinedFactories = [...(hhm.associatedFactories || []), ...linkedFactories];
      // Deduplicate by ID
      const uniqueFactories = Array.from(new Map(combinedFactories.map(item => [item._id.toString(), item])).values());
      
      return { ...hhm, associatedFactories: uniqueFactories };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
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
    // Find all active users with Factory role and populate associated HHMs
    const factories = await User.find({ 
      role: 'Factory', 
      isActive: true 
    })
    .select('_id name factoryName factoryLocation factoryDescription capacity experience specialization contactInfo operatingSeason crushingStatus phone email username createdAt associatedHHMs')
    .populate({
      path: 'associatedHHMs',
      select: 'name username email phone location experience'
    })
    .sort({ factoryName: 1 });

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
      operatingSeason: factory.operatingSeason,
      crushingStatus: factory.crushingStatus || 'OFF',
      username: factory.username,
      createdAt: factory.createdAt,
      associatedHHMs: factory.associatedHHMs || [],
      hhmCount: (factory.associatedHHMs || []).length
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

/**
 * @desc    Get specific factory details with HHM associations
 * @route   GET /api/farmer/factories/:factoryId
 * @access  Private (Farmer only)
 */
const getFactoryById = async (req, res) => {
  try {
    const { factoryId } = req.params;

    const factory = await User.findById(factoryId)
      .populate('associatedHHMs', 'name username email phone location experience profilePicture')
      .lean();

    if (!factory || factory.role !== 'Factory') {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    res.status(200).json({
      success: true,
      data: factory
    });

  } catch (error) {
    console.error('Error in getFactoryById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve factory details',
      error: error.message
    });
  }
};

/**
 * @desc    Associate HHMs with a factory
 * @route   POST /api/farmer/factories/:factoryId/associate-hhms
 * @access  Private (Farmer only)
 */
const associateHHMs = async (req, res) => {
  try {
    const { factoryId } = req.params;
    const { hhmIds } = req.body;

    if (!hhmIds || !Array.isArray(hhmIds) || hhmIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid HHM IDs to associate'
      });
    }

    // Verify factory exists
    const factory = await User.findById(factoryId);
    if (!factory || factory.role !== 'Factory') {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    // Verify all HHM IDs exist and are HHMs
    const hhms = await User.find({ _id: { $in: hhmIds }, role: 'HHM' });
    if (hhms.length !== hhmIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some provided IDs are not valid HHMs'
      });
    }

    // Add new HHM IDs to existing associations (avoid duplicates)
    const currentAssociations = factory.associatedHHMs || [];
    const newAssociations = [...new Set([...currentAssociations.map(id => id.toString()), ...hhmIds])];

    // Update factory's associatedHHMs
    await User.findByIdAndUpdate(factoryId, {
      associatedHHMs: newAssociations
    });

    // Update each HHM's associatedFactories (bidirectional relationship)
    for (const hhmId of hhmIds) {
      const hhm = await User.findById(hhmId);
      if (hhm) {
        const currentFactories = hhm.associatedFactories || [];
        const factoryIdStr = factoryId.toString();
        if (!currentFactories.map(id => id.toString()).includes(factoryIdStr)) {
          currentFactories.push(factoryId);
          await User.findByIdAndUpdate(hhmId, {
            associatedFactories: currentFactories
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully associated ${hhmIds.length} HHMs with ${factory.name}`,
      data: {
        factoryId,
        totalAssociations: newAssociations.length,
        newlyAdded: hhmIds.length
      }
    });

  } catch (error) {
    console.error('Error in associateHHMs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to associate HHMs',
      error: error.message
    });
  }
};

/**
 * @desc    Remove HHM association from a factory
 * @route   DELETE /api/farmer/factories/:factoryId/remove-hhm/:hhmId
 * @access  Private (Farmer only)
 */
const removeHHMAssociation = async (req, res) => {
  try {
    const { factoryId, hhmId } = req.params;

    // Verify factory exists
    const factory = await User.findById(factoryId);
    if (!factory || factory.role !== 'Factory') {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    // Remove HHM from factory's associations
    const updatedAssociations = (factory.associatedHHMs || [])
      .filter(id => id.toString() !== hhmId);

    await User.findByIdAndUpdate(factoryId, {
      associatedHHMs: updatedAssociations
    });

    // Remove factory from HHM's associatedFactories (bidirectional relationship)
    const hhm = await User.findById(hhmId);
    if (hhm) {
      const updatedFactories = (hhm.associatedFactories || [])
        .filter(id => id.toString() !== factoryId.toString());
      await User.findByIdAndUpdate(hhmId, {
        associatedFactories: updatedFactories
      });
    }

    res.status(200).json({
      success: true,
      message: 'HHM association removed successfully',
      data: {
        factoryId,
        remainingAssociations: updatedAssociations.length
      }
    });

  } catch (error) {
    console.error('Error in removeHHMAssociation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove HHM association',
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
  getFactories,
  getFactoryById,
  associateHHMs,
  removeHHMAssociation
};
