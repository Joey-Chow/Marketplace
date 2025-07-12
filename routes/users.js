const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const UserService = require("../services/UserService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin only)
router.get(
  "/",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      search: req.query.search,
    };

    const result = await UserService.getUsers(options.page, options.limit, {
      role: options.role,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      search: options.search,
    });
    ApiResponse.success(res, result);
  })
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get(
  "/:id",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    ApiResponse.success(res, { user });
  })
);

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin only)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  validate("updateUser"),
  asyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    ApiResponse.success(res, { user }, "User updated successfully");
  })
);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin only)
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    await UserService.deleteUser(req.params.id);
    ApiResponse.success(res, null, "User deleted successfully");
  })
);

// @route   PUT /api/users/:id/activate
// @desc    Activate user account (Admin only)
// @access  Private (Admin only)
router.put(
  "/:id/activate",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await UserService.activateUser(req.params.id);
    ApiResponse.success(res, { user }, "User activated successfully");
  })
);

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user account (Admin only)
// @access  Private (Admin only)
router.put(
  "/:id/deactivate",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await UserService.deactivateUser(req.params.id);
    ApiResponse.success(res, { user }, "User deactivated successfully");
  })
);

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (Admin only)
// @access  Private (Admin only)
router.get(
  "/stats/overview",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const stats = await UserService.getUserStats();
    ApiResponse.success(res, { stats });
  })
);

// @route   GET /api/users/search/:query
// @desc    Search users (Admin only)
// @access  Private (Admin only)
router.get(
  "/search/:query",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await UserService.searchUsers(req.params.query, options);
    ApiResponse.success(res, result);
  })
);

module.exports = router;
