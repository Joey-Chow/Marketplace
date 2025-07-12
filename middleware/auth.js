const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const ApiResponse = require("../utils/ApiResponse");
const { AuthenticationError, AuthorizationError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Authenticate user middleware
 * Validates JWT token and sets req.user
 * If valid: calls next()
 * If invalid: returns 401 Unauthorized
 * If user is not active, returns 403 Forbidden
 */
const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new AuthenticationError("Invalid token");
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account is deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AuthenticationError("Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new AuthenticationError("Invalid token");
    }
    throw error;
  }
});

/**
 * Authorization middleware factory
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Access denied. Required roles: ${roles.join(", ")}`
      );
    }

    next();
  };
};

/**
 * Optional authentication middleware
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      req.user = user;
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
});

module.exports = { auth, authorize, optionalAuth };

// Seller verification middleware
const verifySeller = (req, res, next) => {
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Seller access required" });
  }

  if (req.user.role === "seller" && !req.user.sellerInfo.isVerified) {
    return res.status(403).json({ message: "Seller verification required" });
  }

  next();
};

module.exports = { auth, authorize, verifySeller };
