const express = require("express");
const CategoryService = require("../services/CategoryService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      sortBy: req.query.sortBy || "name",
      sortOrder: req.query.sortOrder || "asc",
    };

    const result = await CategoryService.getAllCategories(options);
    res.json(new ApiResponse(200, result, "Categories retrieved successfully"));
  })
);

module.exports = router;
