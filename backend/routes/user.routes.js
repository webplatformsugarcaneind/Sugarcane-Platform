const express = require('express');
const User = require('../models/user.model');
const mongoose = require('mongoose');

console.log(' [USER.ROUTES] Loading user.routes.js file');

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get any user's public profile by ID (unified profile system)
// @access  Public (accessible to all users, returns public data only)
router.get('/profile/:userId', async (req, res) => {
  try {
    console.log(' [USER.ROUTES] GET /profile/:userId endpoint hit!');
    const userId = req.params.userId;
    console.log(' [DEBUG] Getting user profile with ID:', userId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(' [DEBUG] Invalid ObjectId format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Find user by ID and populate associations (HHMs for Factory, Factories for HHM)
    const user = await User.findById(userId)
      .select('-password -receivedOrders -sentOrders')
      .populate('associatedHHMs', 'name username email phone location experience profilePicture')
      .populate('associatedFactories', 'name username email phone location factoryName factoryLocation capacity specialization')
      .lean();

    if (!user) {
      console.log(' [DEBUG] User not found for ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(' [DEBUG] User found:', `YES (${user.role})`);
    console.log(' [DEBUG] User associatedHHMs:', user?.associatedHHMs);
    console.log(' [DEBUG] AssociatedHHMs length:', user?.associatedHHMs?.length || 0);
    console.log(' [DEBUG] User associatedFactories:', user?.associatedFactories);
    console.log(' [DEBUG] AssociatedFactories length:', user?.associatedFactories?.length || 0);

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
        console.log(' [DEBUG] Factory case - user.associatedHHMs:', user.associatedHHMs);
        console.log(' [DEBUG] Factory case - associatedHHMs length:', user.associatedHHMs?.length);
        formattedProfile = {
          ...formattedProfile,
          factoryName: user.factoryName || user.name + ' Factory',
          factoryLocation: user.factoryLocation || user.location || 'Location not specified',
          factoryDescription: user.factoryDescription || 'Modern sugar processing facility',
          capacity: user.capacity || 'Not specified',
          experience: user.experience || 'Not specified',
          specialization: user.specialization || 'Sugar Processing',
          associatedHHMs: user.associatedHHMs || [],
          contactInfo: {
            website: user.contactInfo?.website || '',
            fax: user.contactInfo?.fax || '',
            tollfree: user.contactInfo?.tollfree || '',
            landline: user.contactInfo?.landline || '',
            email: user.email,
            phone: user.phone
          },
          operatingSeason: user.operatingSeason,
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
        console.log(' [DEBUG] HHM case - user.associatedFactories:', user.associatedFactories);
        console.log(' [DEBUG] HHM case - associatedFactories length:', user.associatedFactories?.length);
        formattedProfile = {
          ...formattedProfile,
          managementExperience: user.managementExperience || user.experience || 'Not specified',
          teamSize: user.teamSize || 'Not specified',
          managementOperations: user.managementOperations || 'Not specified',
          servicesOffered: user.servicesOffered || 'Agricultural coordination and worker management',
          workingAreas: user.workingAreas || [],
          workerTypes: user.workerTypes || [],
          activeJobs: user.activeJobs || 0,
          completedJobs: user.completedJobs || 0,
          avgCompletionTime: user.avgCompletionTime || 'Not specified',
          priceRange: user.priceRange || 'Contact for pricing',
          isNegotiable: user.isNegotiable !== undefined ? user.isNegotiable : true,
          workHistory: user.workHistory || [],
          rating: user.rating || 0,
          reviews: user.reviews || [],
          associatedFactories: user.associatedFactories || [],
          profileType: 'hhm'
        };
        // Remove contact info for public/farmer view for privacy
        delete formattedProfile.email;
        delete formattedProfile.phone;
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

    console.log(' [DEBUG] Sending profile response for role:', user.role);
    console.log(' [DEBUG] formattedProfile.associatedHHMs:', formattedProfile.associatedHHMs);

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
