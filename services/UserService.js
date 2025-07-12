const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const {
  AuthenticationError,
  ValidationError,
  NotFoundError,
} = require("../utils/errors");

/**
 * User service layer
 */
class UserService {
  /**
   * Register a new user
   */
  static async register(userData) {
    const { username, email, password, role, profile } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ValidationError(
        "User already exists with this email or username"
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      profile,
    });

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  /**
   * Generate JWT token
   */
  static generateToken(userId) {
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    return jwt.verify(token, config.JWT_SECRET);
  }

  /**
   * Remove sensitive data from user object
   */
  static sanitizeUser(user) {
    const userObject = user.toObject ? user.toObject() : user;
    delete userObject.password;
    return userObject;
  }

  /**
   * Get all users with pagination
   */
  static async getUsers(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;

    const users = await User.find(filters)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = UserService;
