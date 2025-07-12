const express = require("express");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const UserService = require("../services/UserService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  validate("register"),
  asyncHandler(async (req, res) => {
    const result = await UserService.register(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, result, "User registered successfully"));
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  validate("login"),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await UserService.login(email, password);
    res.json(new ApiResponse(200, result, "Login successful"));
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.user.id);
    res.json(new ApiResponse(200, { user }));
  })
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  validate("updateProfile"),
  asyncHandler(async (req, res) => {
    const updatedUser = await UserService.updateProfile(req.user.id, req.body);
    res.json(
      new ApiResponse(
        200,
        { user: updatedUser },
        "Profile updated successfully"
      )
    );
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post(
  "/logout",
  auth,
  asyncHandler(async (req, res) => {
    res.json(new ApiResponse(200, null, "Logged out successfully"));
  })
);

module.exports = router;
