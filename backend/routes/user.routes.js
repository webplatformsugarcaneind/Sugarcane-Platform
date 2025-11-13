const express = require('express');
const User = require('../models/user.model');
const mongoose = require('mongoose');

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get any user's public profile by ID (unified profile system)
// @access  Public (accessible to all users, returns public data only)
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('🔍 [DEBUG] Getting user profile with ID:', userId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ [DEBUG] Invalid ObjectId format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Find user by ID (exclude sensitive information)
    const user = await User.findById(userId)
      .select('-password -associatedFactories -associatedHHMs -receivedOrders -sentOrders')
      .lean();

    console.log('🔍 [DEBUG] User found:', user ? `YES (${user.role})` : 'NO');

    if (!user) {
      console.log('❌ [DEBUG] User not found for ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format response data based on user role
    let formattedProfile = {
      _id: user._id,
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      isActive: user.isActive || true,
      joinedAt: user.createdAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add role-specific information based on user type
    switch (user.role) {
      case 'Factory':
        formattedProfile = {
          ...formattedProfile,
          factoryName: user.factoryName || user.name + ' Factory',
          factoryLocation: user.factoryLocation || user.location || 'Location not specified',
          factoryDescription: user.factoryDescription || 'Modern sugar processing facility',
          capacity: user.capacity || 'Not specified',
          experience: user.experience || 'Not specified',
          specialization: user.specialization || 'Sugar Processing',
          contactInfo: {
            website: user.contactInfo?.website || '',
            fax: user.contactInfo?.fax || '',
            tollfree: user.contactInfo?.tollfree || '',
            landline: user.contactInfo?.landline || '',
            email: user.email,
            phone: user.phone
          },
          operatingHours: user.operatingHours || {},
          profileType: 'factory'
        };
        break;

      case 'Farmer':
        formattedProfile = {
          ...formattedProfile,
          farmSize: user.farmSize || 'Not specified',
          farmingExperience: user.farmingExperience || user.experience || 'Not specified',
          farmingMethods: user.farmingMethods || 'Not specified',
          equipment: user.equipment || 'Not specified',
          certifications: user.certifications || 'Not specified',
          cropTypes: user.cropTypes || 'Not specified',
          irrigationType: user.irrigationType || 'Not specified',
          profileType: 'farmer'
        };
        break;

      case 'HHM':
        formattedProfile = {
          ...formattedProfile,
          managementExperience: user.managementExperience || user.experience || 'Not specified',
          teamSize: user.teamSize || 'Not specified',
          managementOperations: user.managementOperations || 'Not specified',
          servicesOffered: user.servicesOffered || 'Agricultural coordination and worker management',
          description: user.servicesOffered || 'Experienced Hub Head Manager coordinating agricultural operations and partnerships.',
          profileType: 'hhm'
        };
        break;

      case 'Labour':
        formattedProfile = {
          ...formattedProfile,
          skills: user.skills || 'Not specified',
          workPreferences: user.workPreferences || 'Not specified',
          wageRate: user.wageRate || 'Not specified',
          availability: user.availability || 'Available',
          workExperience: user.workExperience || user.experience || 'Not specified',
          profileType: 'worker'
        };
        break;

      default:
        formattedProfile.profileType = 'basic';
    }

    console.log('📤 [DEBUG] Sending profile response for role:', user.role);

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: formattedProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by role, name, or location (for directory features)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const {
      role,
      name,
      location,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Filter by role if specified
    if (role) {
      const validRoles = ['Farmer', 'HHM', 'Labour', 'Factory'];
      if (validRoles.includes(role)) {
        filter.role = role;
      }
    }

    // Filter by name (case-insensitive partial match)
    if (name) {
      filter.$or = [
        { name: { $regex: name, $options: 'i' } },
        { username: { $regex: name, $options: 'i' } },
        { factoryName: { $regex: name, $options: 'i' } }
      ];
    }

    // Filter by location (case-insensitive partial match)
    if (location) {
      filter.$or = [
        ...(filter.$or || []),
        { location: { $regex: location, $options: 'i' } },
        { factoryLocation: { $regex: location, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query (exclude sensitive information)
    const users = await User.find(filter)
      .select('-password -associatedFactories -associatedHHMs -receivedOrders -sentOrders')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Format users for response
    const formattedUsers = users.map(user => ({
      _id: user._id,
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location || user.factoryLocation,
      displayName: user.factoryName || user.name,
      isActive: user.isActive || true,
      joinedAt: user.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;