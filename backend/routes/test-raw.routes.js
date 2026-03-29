const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Minimal test endpoint - no formatting, just raw data
router.get('/raw/:userId', async (req, res) => {
  try {
    console.log('🧪 [TEST] Raw endpoint hit for user:', req.params.userId);
    
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('associatedHHMs', 'name username email phone')
      .lean();
    
    console.log('🧪 [TEST] User found:', !!user);
    console.log('🧪 [TEST] AssociatedHHMs:', user?.associatedHHMs);
    console.log('🧪 [TEST] AssociatedHHMs length:', user?.associatedHHMs?.length);
    
    res.json({
      success: true,
      rawUser: user,
      hhmCount: user?.associatedHHMs?.length || 0
    });
  } catch (error) {
    console.error('🧪 [TEST] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
