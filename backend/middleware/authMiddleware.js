import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

// Middleware to protect routes - requires valid JWT token
export const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      // Check for Bearer token in Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Token may be invalid.' 
      });
    }

    // Check if user is verified (optional - depends on your requirements)
    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email before accessing this resource.' 
      });
    }

    // Attach user to request object (excluding sensitive fields)
    req.user = user.toJSON();
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error.' 
    });
  }
};

// Middleware to check if user is admin (optional for future use)
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    // Check if user has admin role (you can add this field to your User model later)
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Authorization error.' 
    });
  }
};

// Middleware to optionally authenticate user (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded && decoded.userId) {
          const user = await User.findById(decoded.userId);
          if (user && user.isVerified) {
            req.user = user.toJSON();
          }
        }
      } catch (tokenError) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth - invalid token:', tokenError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error.message);
    next(); // Continue even if there's an error
  }
};

// Middleware to validate user owns resource (for user-specific resources)
export const validateResourceOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required.' 
        });
      }

      // Check if the resource belongs to the authenticated user
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      
      if (resourceUserId && resourceUserId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only access your own resources.' 
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership validation error:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Authorization error.' 
      });
    }
  };
};