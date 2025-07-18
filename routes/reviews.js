const express = require("express");
const ReviewService = require("../services/ReviewService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   GET /api/reviews/all
// @desc    Get all reviews (Admin access or public for display)
// @access  Public (for display) or Private (for admin operations)
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      rating: req.query.rating,
    };

    const result = await ReviewService.getAllReviews(options);
    res.json(new ApiResponse(200, result, "Reviews retrieved successfully"));
  })
);

module.exports = router;

// @route   GET /api/reviews/:productId
// @desc    Get reviews for a specific product
// @access  Public
router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      rating: req.query.rating,
    };

    const result = await ReviewService.getAllReviews({
      ...options,
      productId, // Filter by product ID
    });

    res.json(
      new ApiResponse(200, result, "Product reviews retrieved successfully")
    );
  })
);
