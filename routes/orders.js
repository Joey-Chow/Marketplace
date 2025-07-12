const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const OrderService = require("../services/OrderService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private (Buyer only)
router.post(
  "/",
  auth,
  authorize("buyer", "admin"),
  asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await OrderService.createOrder(
      req.user.id,
      shippingAddress,
      paymentMethod
    );
    res
      .status(201)
      .json(ApiResponse.created({ order }, "Order created successfully"));
  })
);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private (Buyer only)
router.get(
  "/",
  auth,
  authorize("buyer", "admin"),
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await OrderService.getUserOrders(req.user.id, options);
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/orders/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin only)
router.get(
  "/all",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await OrderService.getAllOrders(options);
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Order owner or Admin)
router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const userId = req.user.role === "admin" ? null : req.user.id;
    const order = await OrderService.getOrderById(req.params.id, userId);
    res.json(ApiResponse.success({ order }));
  })
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Seller - own products, Admin - all orders)
router.put(
  "/:id/status",
  auth,
  authorize("seller", "admin"),
  asyncHandler(async (req, res) => {
    const userId = req.user.role === "admin" ? null : req.user.id;
    const order = await OrderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      userId
    );
    res.json(
      ApiResponse.success({ order }, "Order status updated successfully")
    );
  })
);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (Order owner only)
router.put(
  "/:id/cancel",
  auth,
  authorize("buyer", "admin"),
  asyncHandler(async (req, res) => {
    const order = await OrderService.cancelOrder(req.params.id, req.user.id);
    res.json(ApiResponse.success({ order }, "Order cancelled successfully"));
  })
);

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics
// @access  Private (Seller - own products, Admin - all orders)
router.get(
  "/stats/overview",
  auth,
  authorize("seller", "admin"),
  asyncHandler(async (req, res) => {
    const userId = req.user.role === "seller" ? req.user.id : null;
    const stats = await OrderService.getOrderStats(userId);
    res.json(ApiResponse.success({ stats }));
  })
);

module.exports = router;
