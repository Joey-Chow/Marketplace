const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const ReviewService = require("../services/ReviewService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private (Buyer only)
router.post("/", 
  auth, 
  authorize("buyer", "admin"), 
  validate('createReview'),
  asyncHandler(async (req, res) => {
    const reviewData = { ...req.body, user: req.user.id };
    const review = await ReviewService.createReview(reviewData);
    res.status(201).json(ApiResponse.created({ review }, "Review created successfully"));
  })
);

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get("/product/:productId", asyncHandler(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc',
    rating: req.query.rating
  };

  const result = await ReviewService.getProductReviews(req.params.productId, options);
  res.json(ApiResponse.success(result));
}));

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private (User only)
router.get("/user", auth, asyncHandler(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc'
  };

  const result = await ReviewService.getUserReviews(req.user.id, options);
  res.json(ApiResponse.success(result));
}));

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get("/:id", asyncHandler(async (req, res) => {
  const review = await ReviewService.getReviewById(req.params.id);
  res.json(ApiResponse.success({ review }));
}));

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Review owner only)
router.put("/:id", 
  auth, 
  validate('updateReview'),
  asyncHandler(async (req, res) => {
    const review = await ReviewService.updateReview(req.params.id, req.user.id, req.body);
    res.json(ApiResponse.success({ review }, "Review updated successfully"));
  })
);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Review owner only)
router.delete("/:id", 
  auth, 
  asyncHandler(async (req, res) => {
    await ReviewService.deleteReview(req.params.id, req.user.id);
    res.json(ApiResponse.success(null, "Review deleted successfully"));
  })
);

// @route   GET /api/reviews/product/:productId/stats
// @desc    Get review statistics for a product
// @access  Public
router.get("/product/:productId/stats", asyncHandler(async (req, res) => {
  const stats = await ReviewService.getReviewStats(req.params.productId);
  res.json(ApiResponse.success({ stats }));
}));

// @route   GET /api/reviews/can-review/:productId
// @desc    Check if user can review a product
// @access  Private (User only)
router.get("/can-review/:productId", auth, asyncHandler(async (req, res) => {
  const canReview = await ReviewService.canUserReviewProduct(req.user.id, req.params.productId);
  res.json(ApiResponse.success({ canReview }));
}));

module.exports = router;
