const express = require('express');
const User = require('../models/user.model'); // Use User model instead of Factory model
const RoleFeature = require('../models/roleFeature.model');
const mongoose = require('mongoose');

const router = express.Router();

// @route   GET /api/public/factories
// @desc    Get all factories (from Factory role users)
// @access  Public
router.get('/factories', async (req, res) => {
  try {
    // Query parameters for filtering and pagination
    const {
      page = 1,
      limit = 10,
      location,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object for Factory role users
    const filter = { role: 'Factory' };
    
    // Filter by location (case-insensitive partial match)
    if (location) {
      filter.factoryLocation = { $regex: location, $options: 'i' };
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query to get Factory role users
    const factoryUsers = await User.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination info
    const totalFactories = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalFactories / limitNum);

    // Format response data to match expected factory structure
    const formattedFactories = factoryUsers.map(user => ({
      id: user._id,
      name: user.factoryName || user.name + ' Factory',
      location: user.factoryLocation || 'Location not specified',
      description: user.factoryDescription || 'Modern sugar processing facility',
      imageUrls: [],
      imageCount: 0,
      associatedHHMs: [],
      hhmCount: 0,
      isActive: true,
      capacity: user.capacity || 'Not specified',
      contactInfo: {
        phone: user.phone,
        email: user.email,
        website: user.contactInfo?.website || '',
        ...user.contactInfo
      },
      operatingHours: user.operatingHours || {},
      experience: user.experience || 'Not specified',
      specialization: user.specialization || 'Sugar Processing',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Factories retrieved successfully',
      data: {
        factories: formattedFactories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFactories,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get factories error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching factories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/public/factories/:id
// @desc    Get single factory by ID (from Factory role user)
// @access  Public
router.get('/factories/:id', async (req, res) => {
  try {
    const factoryId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(factoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid factory ID format'
      });
    }

    // Find factory user by ID (Factory role user)
    const factoryUser = await User.findOne({ 
      _id: factoryId, 
      role: 'Factory' 
    }).lean();

    if (!factoryUser) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found'
      });
    }

    // Find associated HHMs for this factory (if applicable)
    const associatedHHMs = await User.find({ 
      role: 'HHM',
      // You might have a field linking HHMs to factories
      // factoryId: factoryId 
    }).select('name username email phone role isActive createdAt').lean();

    // Format response data to match expected factory structure
    const formattedFactory = {
      id: factoryUser._id,
      name: factoryUser.factoryName || factoryUser.name + ' Factory',
      location: factoryUser.factoryLocation || 'Location not specified',
      description: factoryUser.factoryDescription || 'Modern sugar processing facility',
      imageUrls: [],
      imageCount: 0,
      associatedHHMs: associatedHHMs || [],
      hhmCount: associatedHHMs ? associatedHHMs.length : 0,
      isActive: true,
      capacity: factoryUser.capacity || 'Not specified',
      contactInfo: {
        phone: factoryUser.phone,
        email: factoryUser.email,
        website: factoryUser.contactInfo?.website || '',
        ...factoryUser.contactInfo
      },
      operatingHours: factoryUser.operatingHours || {},
      experience: factoryUser.experience || 'Not specified',
      specialization: factoryUser.specialization || 'Sugar Processing',
      createdAt: factoryUser.createdAt,
      updatedAt: factoryUser.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Factory retrieved successfully',
      data: {
        factory: formattedFactory
      }
    });

  } catch (error) {
    console.error('Get factory by ID error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching factory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/public/roles-features
// @desc    Get all role features
// @access  Public
router.get('/roles-features', async (req, res) => {
  try {
    // Query parameters
    const {
      roleName,
      isActive = true,
      includeDisabledFeatures = false,
      sort = 'roleName',
      order = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Filter by active status
    if (isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }
    
    // Filter by specific role name
    if (roleName) {
      filter.roleName = roleName.toUpperCase();
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Execute query with optional population
    const roleFeatures = await RoleFeature.find(filter)
      .populate('lastModifiedBy', 'name username')
      .sort(sortObj)
      .lean();

    // Format response data
    const formattedRoleFeatures = roleFeatures.map(roleFeature => {
      // Filter features based on includeDisabledFeatures parameter
      let features = roleFeature.features || [];
      if (includeDisabledFeatures === 'false' || includeDisabledFeatures === false) {
        features = features.filter(feature => feature.isEnabled);
      }

      // Sort features by priority (highest first)
      features.sort((a, b) => (b.priority || 1) - (a.priority || 1));

      return {
        id: roleFeature._id,
        roleName: roleFeature.roleName,
        features: features.map(feature => ({
          id: feature._id,
          title: feature.title,
          description: feature.description,
          isEnabled: feature.isEnabled,
          priority: feature.priority || 1,
          icon: feature.icon,
          createdAt: feature.createdAt
        })),
        totalFeatures: roleFeature.features ? roleFeature.features.length : 0,
        enabledFeatures: features.length,
        isActive: roleFeature.isActive,
        version: roleFeature.version,
        lastModifiedBy: roleFeature.lastModifiedBy,
        metadata: roleFeature.metadata,
        createdAt: roleFeature.createdAt,
        updatedAt: roleFeature.updatedAt
      };
    });

    // Summary statistics
    const stats = {
      totalRoles: formattedRoleFeatures.length,
      activeRoles: formattedRoleFeatures.filter(rf => rf.isActive).length,
      totalFeatures: formattedRoleFeatures.reduce((sum, rf) => sum + rf.totalFeatures, 0),
      totalEnabledFeatures: formattedRoleFeatures.reduce((sum, rf) => sum + rf.enabledFeatures, 0)
    };

    res.status(200).json({
      success: true,
      message: 'Role features retrieved successfully',
      data: {
        roleFeatures: formattedRoleFeatures,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get role features error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching role features',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/public/roles-features/:roleName
// @desc    Get role features for a specific role
// @access  Public
router.get('/roles-features/:roleName', async (req, res) => {
  try {
    const { roleName } = req.params;
    const { includeDisabledFeatures = false } = req.query;

    // Validate role name
    const validRoles = ['FARMER', 'HHM', 'LABOUR', 'FACTORY', 'ADMIN'];
    const upperRoleName = roleName.toUpperCase();
    
    if (!validRoles.includes(upperRoleName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role name. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Find role features
    const roleFeature = await RoleFeature.findOne({ 
      roleName: upperRoleName, 
      isActive: true 
    })
    .populate('lastModifiedBy', 'name username')
    .lean();

    if (!roleFeature) {
      return res.status(404).json({
        success: false,
        message: `Role features not found for role: ${upperRoleName}`
      });
    }

    // Filter and sort features
    let features = roleFeature.features || [];
    if (includeDisabledFeatures === 'false' || includeDisabledFeatures === false) {
      features = features.filter(feature => feature.isEnabled);
    }

    // Sort features by priority (highest first)
    features.sort((a, b) => (b.priority || 1) - (a.priority || 1));

    const formattedRoleFeature = {
      id: roleFeature._id,
      roleName: roleFeature.roleName,
      features: features.map(feature => ({
        id: feature._id,
        title: feature.title,
        description: feature.description,
        isEnabled: feature.isEnabled,
        priority: feature.priority || 1,
        icon: feature.icon,
        createdAt: feature.createdAt
      })),
      totalFeatures: roleFeature.features ? roleFeature.features.length : 0,
      enabledFeatures: features.length,
      isActive: roleFeature.isActive,
      version: roleFeature.version,
      lastModifiedBy: roleFeature.lastModifiedBy,
      metadata: roleFeature.metadata,
      createdAt: roleFeature.createdAt,
      updatedAt: roleFeature.updatedAt
    };

    res.status(200).json({
      success: true,
      message: `Role features for ${upperRoleName} retrieved successfully`,
      data: {
        roleFeature: formattedRoleFeature
      }
    });

  } catch (error) {
    console.error('Get role features by role name error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching role features',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;