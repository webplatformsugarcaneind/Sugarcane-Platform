// Minimal test version of order acceptance endpoint
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

router.use(protect);

// Simplified order status update route for testing
router.put('/:orderId/minimal-status', authorize('Farmer'), async (req, res) => {
  try {
    console.log('🧪 MINIMAL: Starting order status update...');
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    console.log(`🧪 MINIMAL: Order ${orderId}, Status ${status}, User ${userId}`);
    
    // Just validate and find the order without updating anything
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log('🧪 MINIMAL: Invalid order ID format');
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    
    console.log('🧪 MINIMAL: Finding farmer...');
    const farmer = await User.findById(userId);
    
    if (!farmer) {
      console.log('🧪 MINIMAL: Farmer not found');
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
    
    console.log(`🧪 MINIMAL: Found farmer: ${farmer.name}`);
    console.log(`🧪 MINIMAL: Farmer has ${farmer.receivedOrders ? farmer.receivedOrders.length : 0} received orders`);
    
    if (!farmer.receivedOrders || farmer.receivedOrders.length === 0) {
      console.log('🧪 MINIMAL: No received orders');
      return res.status(404).json({ success: false, message: 'No received orders' });
    }
    
    console.log('🧪 MINIMAL: Looking for specific order...');
    const orderIndex = farmer.receivedOrders.findIndex(order => 
      order.orderId.toString() === orderId
    );
    
    if (orderIndex === -1) {
      console.log('🧪 MINIMAL: Order not found in received orders');
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = farmer.receivedOrders[orderIndex];
    console.log(`🧪 MINIMAL: Found order with status: ${order.status}`);
    
    // Don't actually update anything, just return success
    console.log('🧪 MINIMAL: Test completed successfully');
    res.json({
      success: true,
      message: 'Order found successfully (test mode)',
      data: {
        orderId: orderId,
        currentStatus: order.status,
        requestedStatus: status
      }
    });
    
  } catch (error) {
    console.error('🧪 MINIMAL: Error:', error);
    console.error('🧪 MINIMAL: Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Minimal test failed',
      error: error.message
    });
  }
});

module.exports = router;