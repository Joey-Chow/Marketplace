const express = require("express");
const { auth } = require("../middleware/auth");
const OrderService = require("../services/OrderService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await OrderService.getUserOrders(req.user.id, options);
    res.json(new ApiResponse(200, result, "Orders retrieved successfully"));
  })
);

// @route   GET /api/orders/all
// @desc    Get all orders (admin only)
// @access  Private (Admin)
router.get(
  "/all",
  auth,
  asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Access denied. Admin only."));
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await OrderService.getAllOrders(options);
    res.json(new ApiResponse(200, result, "All orders retrieved successfully"));
  })
);

module.exports = router;
