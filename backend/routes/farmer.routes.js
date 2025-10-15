const express = require('express');
const router = express.Router();

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
 * @route   GET /api/farmer/factories
 * @desc    Get all factories directory for farmers
 * @access  Private (Farmer only)
 */
router.get('/factories', getFactories);

module.exports = router;