const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Import middleware
const { protect, authorize, checkOwnership } = require('../middleware/auth.middleware');

// Import controllers
const {
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
} = require('../controllers/farmer.controller');

// Apply protection and authorization to all routes in this file
// All routes require user to be authenticated and have 'Farmer' role
router.use(protect);
router.use(authorize('Farmer'));

// Profile Routes
/**
 * @route   GET /api/farmer/profile
 * @desc    Get the logged-in farmer's profile
 * @access  Private (Farmer only)
 */
router.get('/profile', (req, res, next) => {
  console.log('🚀 FARMER ROUTES - Profile GET request received');
  console.log('🚀 User:', req.user?._id);
  return getProfile(req, res, next);
});

/**
 * @route   GET /api/farmer/test-profile
 * @desc    Test endpoint to check farmer controller
 * @access  Private (Farmer only)
 */
router.get('/test-profile', (req, res) => {
  console.log('🧪 TEST ENDPOINT - Farmer test profile called');
  res.json({
    success: true,
    message: 'Test endpoint working - this is from the NEW farmer controller',
    user: req.user._id,
    timestamp: new Date()
  });
});

/**
 * @route   PUT /api/farmer/profile
 * @desc    Update the logged-in farmer's profile
 * @access  Private (Farmer only)
 */
router.put('/profile', (req, res, next) => {
  console.log('🚀 FARMER ROUTES - Profile PUT request received');
  return updateProfile(req, res, next);
});

// Announcements Routes
/**
 * @route   GET /api/farmer/announcements
 * @desc    Get all announcements targeted to farmers
 * @access  Private (Farmer only)
 */
router.get('/announcements', getAnnouncements);

// Crop Listings Routes
/**
 * @route   POST /api/farmer/listings
 * @desc    Create a new crop listing for the farmer
 * @access  Private (Farmer only)
 */
router.post('/listings', createListing);

/**
 * @route   GET /api/farmer/listings
 * @desc    Get all crop listings from all farmers
 * @access  Private (Farmer only)
 */
router.get('/listings', getAllListings);

/**
 * @route   GET /api/farmer/listings/my
 * @desc    Get only the listings created by the logged-in farmer
 * @access  Private (Farmer only)
 */
router.get('/listings/my', getMyListings);

/**
 * @route   PUT /api/farmer/listings/:id
 * @desc    Update one of the farmer's own listings
 * @access  Private (Farmer only - own listings)
 */
router.put('/listings/:id', updateListing);

/**
 * @route   DELETE /api/farmer/listings/:id
 * @desc    Delete one of the farmer's own listings
 * @access  Private (Farmer only - own listings)
 */
router.delete('/listings/:id', deleteListing);

// Directory Routes
/**
 * @route   GET /api/farmer/hhms
 * @desc    Get all HHMs (Hub Head Managers) directory for farmers
 * @access  Private (Farmer only)
 */
router.get('/hhms', getHHMs);

/**
 * @route   GET /api/farmer/hhms/:id
 * @desc    Get specific HHM profile for farmers
 * @access  Private (Farmer only)
 */
router.get('/hhms/:id', async (req, res) => {
  try {
    console.log('Farmer HHM Profile API called:', {
      userId: req.user.id,
      role: req.user.role,
      hhmIdRequested: req.params.id
    });

    const hhmId = req.params.id;

    // Find the specific HHM - handle both uppercase and lowercase role
    let hhm = await User.findOne(
      { _id: hhmId, role: 'HHM' },
      {
        password: 0 // Exclude password field
      }
    );

    // If not found with uppercase, try lowercase
    if (!hhm) {
      hhm = await User.findOne(
        { _id: hhmId, role: 'hhm' },
        {
          password: 0 // Exclude password field
        }
      );
    }

    // If still not found, try case-insensitive search
    if (!hhm) {
      hhm = await User.findOne(
        { _id: hhmId, role: { $regex: /^hhm$/i } },
        {
          password: 0 // Exclude password field
        }
      );
    }

    if (!hhm) {
      console.log(`HHM not found with ID: ${hhmId}`);
      
      // Let's also check if the user exists at all
      const userExists = await User.findById(hhmId);
      if (userExists) {
        console.log(`User exists but role is: ${userExists.role}`);
        return res.status(404).json({
          success: false,
          message: `User found but role is '${userExists.role}', not an HHM`
        });
      } else {
        console.log(`No user found with ID: ${hhmId}`);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    console.log(`HHM profile retrieved for farmer: ${hhm.name} (${hhm.username}) with role: ${hhm.role}`);

    res.json({
      success: true,
      message: 'HHM profile retrieved successfully',
      data: hhm,
      hhm: hhm // Alternative property name for compatibility
    });

  } catch (error) {
    console.error('Error in farmer HHM profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching HHM profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/farmer/factories
 * @desc    Get all factories directory for farmers
 * @access  Private (Farmer only)
 */
router.get('/factories', getFactories);

module.exports = router;