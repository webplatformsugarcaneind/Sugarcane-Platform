const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const {
  comparePassword: compareLocalPassword,
  createLocalUser,
  findConflictingUser,
  findUserById,
  findUserByIdentifier,
  normalizeUser
} = require('../utils/localAuthStore');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone format
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

const getFallbackEmail = (username) => `${String(username).toLowerCase()}@canesetu.local`;

const buildUserResponse = (user) => ({
  id: user._id?.toString?.() || user.id,
  name: user.name,
  username: user.username,
  phone: user.phone,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, username, phone, email, role, password } = req.body;
    const resolvedEmail = (email || getFallbackEmail(username)).trim().toLowerCase();

    // Validation - Check required fields
    if (!name || !username || !phone || !role || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, username, phone, role, password'
      });
    }

    // Validate email format
    if (email && !isValidEmail(resolvedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Validate role
    const validRoles = ['Farmer', 'HHM', 'Labour', 'Factory'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be one of: Farmer, HHM, Labour, Factory'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    let userResponse;

    if (!isMongoConnected()) {
      const existingUser = await findConflictingUser({
        username: username.toLowerCase(),
        email: resolvedEmail,
        phone
      });

      if (existingUser) {
        let conflictField = '';
        const normalizedExisting = normalizeUser(existingUser);
        if (normalizedExisting.email === resolvedEmail) {
          conflictField = 'email';
        } else if (normalizedExisting.username === username.toLowerCase()) {
          conflictField = 'username';
        } else if (String(normalizedExisting.phone || '') === String(phone)) {
          conflictField = 'phone';
        }

        return res.status(409).json({
          success: false,
          message: `User with this ${conflictField} already exists`
        });
      }

      const localUser = await createLocalUser({
        name,
        username,
        phone,
        email: resolvedEmail,
        role,
        password
      });

      const token = generateToken(localUser.id);
      userResponse = buildUserResponse(localUser);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token
        }
      });
    }

    // Check if user already exists with email, username, or phone
    const existingUser = await User.findOne({
      $or: [
        { email: resolvedEmail },
        { username: username.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingUser) {
      let conflictField = '';
      if (existingUser.email === resolvedEmail) {
        conflictField = 'email';
      } else if (existingUser.username === username.toLowerCase()) {
        conflictField = 'username';
      } else if (existingUser.phone === phone) {
        conflictField = 'phone';
      }

      return res.status(409).json({
        success: false,
        message: `User with this ${conflictField} already exists`
      });
    }

    // Create new user (password will be hashed automatically by the pre-save hook)
    const user = new User({
      name,
      username: username.toLowerCase(),
      phone,
      email: resolvedEmail,
      role,
      password
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    userResponse = buildUserResponse(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors (just in case)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log(' Login attempt received:', { identifier: req.body.identifier, hasPassword: !!req.body.password });
    const { identifier, password } = req.body;

    // Validation - Check required fields
    if (!identifier || !password) {
      console.log(' Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email/phone and password'
      });
    }

    // Find user by username, email, or phone
    console.log(' Searching for user with identifier:', identifier);
    if (!isMongoConnected()) {
      const user = await findUserByIdentifier(identifier);

      console.log(' User found:', user ? `${user.name} (${user.username})` : 'Not found');

      if (!user) {
        console.log(' User not found or inactive');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await compareLocalPassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user.id);
      console.log(' Generated token for user:', user.username);
      console.log(' Token preview:', token.substring(0, 50) + '...');
      console.log(' Token length:', token.length);

      const userResponse = buildUserResponse(user);

      if (user.role === 'Farmer') {
        console.log(` FARMER LOGGED IN SUCCESSFULLY: ${user.name} (${user.username}) - ${new Date().toLocaleString()}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ],
      isActive: true
    }).select('+password'); // Include password field for comparison

    console.log(' User found:', user ? `${user.name} (${user.username})` : 'Not found');

    if (!user) {
      console.log(' User not found or inactive');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password using the model's method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    console.log(' Generated token for user:', user.username);
    console.log(' Token preview:', token.substring(0, 50) + '...');
    console.log(' Token length:', token.length);

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    // Log farmer login success to console
    if (user.role === 'Farmer') {
      console.log(` FARMER LOGGED IN SUCCESSFULLY: ${user.name} (${user.username}) - ${new Date().toLocaleString()}`);
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error(' Login error:', error.message);
    console.error('Full error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token and return user data
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isMongoConnected()) {
      const localUser = await findUserById(decoded.userId);

      if (!localUser || !localUser.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token verified successfully',
        data: {
          user: {
            id: localUser.id,
            name: localUser.name,
            username: localUser.username,
            phone: localUser.phone,
            email: localUser.email,
            role: localUser.role,
            isActive: localUser.isActive,
            createdAt: localUser.createdAt,
            listings: localUser.listings || []
          }
        }
      });
    }

    // Get user data
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    if (!isMongoConnected()) {
      const localUser = await findUserByIdentifier(user.username || user.email || user.phone);
      if (!localUser || !localUser.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Token verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          listings: user.listings || [] // Include user's embedded listings
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during token verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
