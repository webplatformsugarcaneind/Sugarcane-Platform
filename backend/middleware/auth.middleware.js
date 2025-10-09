const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  try {
    let token;
    console.log('🔐 Auth middleware - checking authorization header');

    // Check if authorization header exists and starts with 'Bearer'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from 'Bearer TOKEN'
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token extracted:', token ? 'exists' : 'missing');
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload (using userId from token)
      const user = await User.findById(decoded.userId).select('-password');

      // Check if user still exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists.'
        });
      }

      // Check if user account is active (if you have an isActive field)
      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'User account has been deactivated.'
        });
      }

      // Attach user to request object
      req.user = user;
      next();

    } catch (tokenError) {
      // Handle specific JWT errors
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed.'
        });
      }
    }

  } catch (error) {
    console.error('Error in protect middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Authorize middleware - Checks if user has required role(s)
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // Check if user exists on request (should be set by protect middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not authenticated.'
        });
      }

      // Check if user has a role
      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User role not defined.'
        });
      }

      // Check if user's role is in the allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
        });
      }

      // User has required role, proceed to next middleware
      next();

    } catch (error) {
      console.error('Error in authorize middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization.'
      });
    }
  };
};

/**
 * Optional middleware - Checks for token but doesn't require it
 * Useful for routes that work differently for authenticated vs anonymous users
 */
const optional = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive !== false) {
          req.user = user;
        }
      } catch (tokenError) {
        // Token is invalid, but that's okay for optional routes
        console.log('Optional auth - Invalid token:', tokenError.message);
      }
    }

    // Always proceed to next middleware, whether user is found or not
    next();

  } catch (error) {
    console.error('Error in optional middleware:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Check if user owns the resource
 * Useful for routes where users should only access their own data
 */
const checkOwnership = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not authenticated.'
        });
      }

      // Get resource user ID from request parameters or body
      const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];

      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: `Resource ${resourceUserField} not found in request.`
        });
      }

      // Check if the authenticated user owns the resource
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();

    } catch (error) {
      console.error('Error in checkOwnership middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during ownership check.'
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  optional,
  checkOwnership
};