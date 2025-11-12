const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import middleware
const { protect, authorize } = require('../middleware/auth.middleware');

// Import models - we'll create a simple order schema or use User collection to store orders
const User = require('../models/user.model');
// CropListing will be required at runtime to avoid import issues

// Apply protection to all routes - user must be authenticated
router.use(protect);

/**
 * @route   POST /api/orders/create
 * @desc    Create a buy order request from one farmer to another
 * @access  Private (Farmer only)
 */
router.post('/create', authorize('Farmer'), async (req, res) => {
  try {
    console.log('📝 Creating buy order for farmer:', req.user._id);
    
    const {
      listingId,
      farmerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantityWanted,
      proposedPrice,
      deliveryLocation,
      message,
      urgency,
      totalAmount
    } = req.body;

    // Validate required fields
    if (!listingId || !farmerId || !buyerName || !buyerEmail || !buyerPhone || !quantityWanted || !proposedPrice || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: listingId, farmerId, buyerName, buyerEmail, buyerPhone, quantityWanted, proposedPrice, deliveryLocation'
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(listingId) || !mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID or farmer ID format'
      });
    }

    // Validate data types
    if (isNaN(quantityWanted) || quantityWanted <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity wanted must be a positive number'
      });
    }

    if (isNaN(proposedPrice) || proposedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Proposed price must be a positive number'
      });
    }

    // Check if the target farmer exists
    const targetFarmer = await User.findOne({ _id: farmerId, role: 'Farmer' });
    
    if (!targetFarmer) {
      return res.status(404).json({
        success: false,
        message: 'Target farmer not found'
      });
    }

    // Prevent farmers from ordering from themselves
    if (farmerId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot place buy orders for your own listings'
      });
    }

    // Create buy order object
    const buyOrder = {
      orderId: new mongoose.Types.ObjectId(),
      listingId,
      farmerId, // Seller farmer ID
      buyerId: req.user._id, // Buyer farmer ID
      buyerDetails: {
        name: buyerName.trim(),
        email: buyerEmail.trim(),
        phone: buyerPhone.trim()
      },
      orderDetails: {
        quantityWanted: parseFloat(quantityWanted),
        proposedPrice: parseFloat(proposedPrice),
        totalAmount: parseFloat(totalAmount) || parseFloat(quantityWanted) * parseFloat(proposedPrice),
        deliveryLocation: deliveryLocation.trim(),
        message: message ? message.trim() : '',
        urgency: urgency || 'normal'
      },
      status: 'pending', // pending, accepted, rejected, completed, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // For now, we'll store orders in the User collection as an embedded array
    // In a real application, you might want a separate Order collection
    
    // Add order to the seller's received orders
    await User.findByIdAndUpdate(farmerId, {
      $push: { 
        receivedOrders: buyOrder 
      }
    });

    // Add order to the buyer's sent orders  
    await User.findByIdAndUpdate(req.user._id, {
      $push: { 
        sentOrders: {
          ...buyOrder,
          targetFarmerName: targetFarmer.name,
          targetFarmerEmail: targetFarmer.email
        }
      }
    });

    console.log(`✅ Buy order created successfully: Order ${buyOrder.orderId} from ${req.user.name} to ${targetFarmer.name}`);

    // Here you might want to send an email notification to the target farmer
    // For now, we'll just return success response

    res.status(201).json({
      success: true,
      message: 'Buy order submitted successfully! The farmer will be notified.',
      data: {
        orderId: buyOrder.orderId,
        status: buyOrder.status,
        seller: {
          id: targetFarmer._id,
          name: targetFarmer.name,
          email: targetFarmer.email
        },
        orderSummary: {
          quantity: buyOrder.orderDetails.quantityWanted,
          pricePerTon: buyOrder.orderDetails.proposedPrice,
          totalAmount: buyOrder.orderDetails.totalAmount,
          deliveryLocation: buyOrder.orderDetails.deliveryLocation,
          urgency: buyOrder.orderDetails.urgency
        },
        createdAt: buyOrder.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error creating buy order:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating buy order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/received
 * @desc    Get all buy orders received by the farmer
 * @access  Private (Farmer only)
 */
router.get('/received', authorize('Farmer'), async (req, res) => {
  try {
    console.log('📥 Fetching received orders for farmer:', req.user._id);
    
    // Extract query parameters for filtering
    const {
      status,
      urgency,
      page = 1,
      limit = 20
    } = req.query;

    const farmer = await User.findById(req.user._id).select('receivedOrders');
    
    if (!farmer || !farmer.receivedOrders) {
      return res.json({
        success: true,
        data: [],
        message: 'No orders received yet'
      });
    }

    let orders = farmer.receivedOrders;

    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    if (urgency) {
      orders = orders.filter(order => order.orderDetails.urgency === urgency);
    }

    // Sort by most recent first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const paginatedOrders = orders.slice(skip, skip + limitNum);

    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      message: 'Received orders retrieved successfully',
      data: paginatedOrders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching received orders:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching received orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/sent
 * @desc    Get all buy orders sent by the farmer
 * @access  Private (Farmer only)
 */
router.get('/sent', authorize('Farmer'), async (req, res) => {
  try {
    console.log('📤 Fetching sent orders for farmer:', req.user._id);
    
    // Extract query parameters for filtering
    const {
      status,
      urgency,
      page = 1,
      limit = 20
    } = req.query;

    const farmer = await User.findById(req.user._id).select('sentOrders');
    
    if (!farmer || !farmer.sentOrders) {
      return res.json({
        success: true,
        data: [],
        message: 'No orders sent yet'
      });
    }

    let orders = farmer.sentOrders;

    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    if (urgency) {
      orders = orders.filter(order => order.orderDetails.urgency === urgency);
    }

    // Sort by most recent first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const paginatedOrders = orders.slice(skip, skip + limitNum);

    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      message: 'Sent orders retrieved successfully',
      data: paginatedOrders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching sent orders:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sent orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/listing/:listingId
 * @desc    Get all buy orders for a specific listing (only for listing owner)
 * @access  Private (Farmer only - must be listing owner)
 */
router.get('/listing/:listingId', authorize('Farmer'), async (req, res) => {
  try {
    const { listingId } = req.params;
    console.log('📋 Fetching orders for listing:', listingId);
    
    // Validate listing ID format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    // Get farmer with received orders
    const farmer = await User.findById(req.user._id).select('receivedOrders');
    
    if (!farmer || !farmer.receivedOrders) {
      return res.json({
        success: true,
        data: [],
        message: 'No orders found for this listing'
      });
    }

    // Filter orders for this specific listing
    const listingOrders = farmer.receivedOrders.filter(order => 
      order.listingId === listingId
    );

    // Sort by most recent first
    listingOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get buyer details for each order
    const ordersWithBuyerInfo = await Promise.all(
      listingOrders.map(async (order) => {
        try {
          const buyer = await User.findById(order.buyerId).select('name email phone username location');
          return {
            ...order.toObject(),
            buyer: buyer ? {
              id: buyer._id,
              name: buyer.name,
              email: buyer.email,
              phone: buyer.phone,
              username: buyer.username,
              location: buyer.location
            } : null
          };
        } catch (err) {
          console.warn('Warning: Could not fetch buyer info for order', order.orderId);
          return order;
        }
      })
    );

    res.json({
      success: true,
      message: `Found ${listingOrders.length} orders for this listing`,
      data: ordersWithBuyerInfo,
      totalOrders: listingOrders.length
    });

  } catch (error) {
    console.error('❌ Error fetching listing orders:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/orders/:orderId/status
 * @desc    Update order status (accept/reject)
 * @access  Private (Farmer only - must be order recipient)
 */
router.put('/:orderId/status', authorize('Farmer'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    console.log(`📝 Updating order status: ${orderId} to ${status}`);

    // Validate status
    if (!status || !['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: accepted, rejected, completed, cancelled'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Find the farmer and update the specific order in their receivedOrders array
    const farmer = await User.findById(req.user._id);
    
    if (!farmer || !farmer.receivedOrders) {
      return res.status(404).json({
        success: false,
        message: 'No orders found for this farmer'
      });
    }

    // Find the order in receivedOrders array
    const orderIndex = farmer.receivedOrders.findIndex(order => 
      order.orderId.toString() === orderId
    );

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to update this order'
      });
    }

    const order = farmer.receivedOrders[orderIndex];
    
    // If accepting the order, check quantity availability
    if (status === 'accepted') {
      console.log(`🔍 Checking quantity availability for order ${orderId}`);
      
      // Find the corresponding listing
      const listingId = order.listingId;
      let listing = null;
      let availableQuantity = 0;
      
      // First check if it's in User.listings (embedded)
      if (farmer.listings && farmer.listings.length > 0) {
        listing = farmer.listings.find(l => l._id.toString() === listingId);
        if (listing) {
          availableQuantity = listing.quantity_in_tons;
          console.log(`📋 Found listing in User.listings: ${availableQuantity} tons available`);
        }
      }
      
      // If not found in embedded, check CropListing collection
      if (!listing) {
        try {
          console.log(`🔍 Checking CropListing collection for listing ${listingId}...`);
          const CropListingModel = require('../models/cropListing.model');
          console.log(`🔍 CropListing re-required: ${typeof CropListingModel}`);
          listing = await CropListingModel.findById(listingId);
          if (listing) {
            availableQuantity = listing.quantity_in_tons;
            console.log(`📋 Found listing in CropListing collection: ${availableQuantity} tons available`);
          } else {
            console.log(`⚠️  Listing ${listingId} not found in CropListing collection`);
          }
        } catch (cropListingError) {
          console.error(`❌ Error accessing CropListing collection:`, cropListingError);
          // Continue without CropListing - rely on embedded listings only
        }
      }
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Associated listing not found'
        });
      }
      
      const requestedQuantity = order.orderDetails.quantityWanted;
      console.log(`📊 Requested: ${requestedQuantity} tons, Available: ${availableQuantity} tons`);
      
      // Check if we have enough quantity
      if (availableQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This listing is out of stock and cannot fulfill any orders'
        });
      }
      
      let finalQuantity = requestedQuantity;
      let isPartialFulfillment = false;
      
      // If requested quantity exceeds available, offer partial fulfillment
      if (requestedQuantity > availableQuantity) {
        finalQuantity = availableQuantity;
        isPartialFulfillment = true;
        console.log(`⚠️  Partial fulfillment: Can only provide ${finalQuantity} tons instead of ${requestedQuantity} tons`);
      }
      
      // Update the order with final quantity
      farmer.receivedOrders[orderIndex].orderDetails.quantityWanted = finalQuantity;
      farmer.receivedOrders[orderIndex].orderDetails.totalAmount = finalQuantity * order.orderDetails.proposedPrice;
      farmer.receivedOrders[orderIndex].isPartialFulfillment = isPartialFulfillment;
      farmer.receivedOrders[orderIndex].originalQuantityRequested = requestedQuantity;
      
      // Update listing quantity
      const newQuantity = availableQuantity - finalQuantity;
      console.log(`📦 Updating listing quantity: ${availableQuantity} - ${finalQuantity} = ${newQuantity} tons`);
      
      // Update embedded listing in User.listings if it exists
      if (farmer.listings && farmer.listings.length > 0) {
        const listingIndex = farmer.listings.findIndex(l => l._id.toString() === listingId);
        if (listingIndex !== -1) {
          if (newQuantity <= 0) {
            // Remove listing if quantity becomes 0
            farmer.listings.splice(listingIndex, 1);
            console.log(`🗑️  Listing removed from User.listings (quantity depleted)`);
          } else {
            farmer.listings[listingIndex].quantity_in_tons = newQuantity;
            console.log(`📝 Updated User.listings quantity to ${newQuantity} tons`);
          }
        } else {
          console.log(`⚠️  Listing ${listingId} not found in User.listings - will update CropListing only`);
        }
      } else {
        console.log(`⚠️  Farmer has no embedded listings - will update CropListing only`);
      }
      
      // ALSO update CropListing collection if the listing exists there
      try {
        console.log(`🔍 Checking for listing in CropListing collection...`);
        const CropListingModel = require('../models/cropListing.model');
        console.log(`🔍 CropListing re-required: ${typeof CropListingModel}`);
        const cropListing = await CropListingModel.findById(listingId);
        if (cropListing) {
          if (newQuantity <= 0) {
            await CropListingModel.findByIdAndDelete(listingId);
            console.log(`🗑️  Listing removed from CropListing collection (quantity depleted)`);
          } else {
            await CropListingModel.findByIdAndUpdate(listingId, { 
              quantity_in_tons: newQuantity 
            });
            console.log(`✅ Updated CropListing quantity to ${newQuantity} tons`);
          }
        } else {
          console.log(`ℹ️  Listing ${listingId} not found in CropListing collection`);
        }
      } catch (cropListingError) {
        console.error(`❌ Error updating CropListing collection:`, cropListingError);
        // Continue with order processing - embedded listing update succeeded
        console.log(`⚠️  Continuing with order processing despite CropListing error`);
      }
    }

    // Update the order status
    farmer.receivedOrders[orderIndex].status = status;
    farmer.receivedOrders[orderIndex].updatedAt = new Date();

    // Save the updated farmer document
    console.log(`💾 About to save farmer document...`);
    
    try {
      await farmer.save();
      console.log(`✅ Farmer document saved successfully`);
    } catch (farmerSaveError) {
      console.error(`❌ Error saving farmer document:`, farmerSaveError);
      console.error(`❌ Error details:`, JSON.stringify(farmerSaveError, null, 2));
      throw new Error(`Failed to save farmer document: ${farmerSaveError.message}`);
    }

    // Also update the corresponding order in the buyer's sentOrders array
    const buyerId = farmer.receivedOrders[orderIndex].buyerId;
    console.log(`🔍 Looking for buyer with ID: ${buyerId}`);
    
    if (!buyerId) {
      console.log('⚠️  No buyerId found in order');
    } else if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      console.log('⚠️  Invalid buyerId format:', buyerId);
    } else {
      try {
        const buyer = await User.findById(buyerId);
        
        if (!buyer) {
          console.log(`⚠️  Buyer not found with ID: ${buyerId}`);
        } else {
          console.log(`✅ Found buyer: ${buyer.name} (${buyer.username})`);
          
          if (buyer.sentOrders && Array.isArray(buyer.sentOrders)) {
            const buyerOrderIndex = buyer.sentOrders.findIndex(order => 
              order.orderId && order.orderId.toString() === orderId
            );

            if (buyerOrderIndex !== -1) {
              // Update buyer's order with same details
              if (status === 'accepted' && farmer.receivedOrders[orderIndex].isPartialFulfillment) {
                buyer.sentOrders[buyerOrderIndex].orderDetails.quantityWanted = farmer.receivedOrders[orderIndex].orderDetails.quantityWanted;
                buyer.sentOrders[buyerOrderIndex].orderDetails.totalAmount = farmer.receivedOrders[orderIndex].orderDetails.totalAmount;
                buyer.sentOrders[buyerOrderIndex].isPartialFulfillment = true;
                buyer.sentOrders[buyerOrderIndex].originalQuantityRequested = farmer.receivedOrders[orderIndex].originalQuantityRequested;
              }
              buyer.sentOrders[buyerOrderIndex].status = status;
              buyer.sentOrders[buyerOrderIndex].updatedAt = new Date();
              
              console.log(`💾 Saving buyer's updated sentOrders...`);
              await buyer.save();
              console.log(`✅ Updated buyer's sentOrders for order ${orderId}`);
            } else {
              console.log(`⚠️  Order ${orderId} not found in buyer's sentOrders`);
            }
          } else {
            console.log('⚠️  Buyer has no sentOrders array or it is not an array');
          }
        }
      } catch (buyerError) {
        console.error(`❌ Error updating buyer's sentOrders:`, buyerError);
        // Don't throw - continue with farmer update
        console.log(`⚠️  Continuing with farmer update despite buyer update error`);
      }
    }

    console.log(`✅ Order ${orderId} status updated to ${status}`);

    // Prepare response message
    let message = `Order ${status} successfully`;
    let responseData = {
      orderId: orderId,
      status: status,
      updatedAt: farmer.receivedOrders[orderIndex].updatedAt
    };

    if (status === 'accepted' && farmer.receivedOrders[orderIndex].isPartialFulfillment) {
      message = `Order accepted with partial fulfillment`;
      responseData.partialFulfillment = {
        originalQuantity: farmer.receivedOrders[orderIndex].originalQuantityRequested,
        fulfilledQuantity: farmer.receivedOrders[orderIndex].orderDetails.quantityWanted,
        newTotalAmount: farmer.receivedOrders[orderIndex].orderDetails.totalAmount
      };
    }

    res.json({
      success: true,
      message: message,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : undefined
    });
  }
});

module.exports = router;