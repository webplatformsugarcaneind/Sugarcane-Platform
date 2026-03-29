const express = require('express');
const router = express.Router();

// Simple test route to check if we can get the order
router.get('/:orderId/test', async (req, res) => {
  try {
    console.log('🧪 Testing order retrieval:', req.params.orderId);
    
    const User = require('../models/user.model');
    const { orderId } = req.params;
    
    console.log('🔍 Looking for user with this order...');
    const farmer = await User.findOne({
      'receivedOrders.orderId': orderId
    });
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('✅ Found farmer:', farmer.name);
    const order = farmer.receivedOrders.find(o => o.orderId.toString() === orderId);
    console.log('📦 Order details:', order);
    
    res.json({
      success: true,
      message: 'Order found successfully',
      farmer: farmer.name,
      order: order
    });
    
  } catch (error) {
    console.error('❌ Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

module.exports = router;