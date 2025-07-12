const express = require("express");
const { auth, authorize } = require("../middleware/auth");
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
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.params.id);
    res.json(ApiResponse.success({ category }));
  })
);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post(
  "/",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const category = await CategoryService.createCategory(req.body);
    res
      .status(201)
      .json(ApiResponse.created({ category }, "Category created successfully"));
  })
);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const category = await CategoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.json(
      ApiResponse.success({ category }, "Category updated successfully")
    );
  })
);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    await CategoryService.deleteCategory(req.params.id);
    res.json(ApiResponse.success(null, "Category deleted successfully"));
  })
);

// @route   GET /api/categories/:id/products
// @desc    Get category with products
// @access  Public
router.get(
  "/:id/products",
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await CategoryService.getCategoryWithProducts(
      req.params.id,
      options
    );
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/categories/:id/stats
// @desc    Get category statistics
// @access  Public
router.get(
  "/:id/stats",
  asyncHandler(async (req, res) => {
    const stats = await CategoryService.getCategoryStats(req.params.id);
    res.json(ApiResponse.success({ stats }));
  })
);

// @route   GET /api/categories/search/:query
// @desc    Search categories
// @access  Public
router.get(
  "/search/:query",
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "name",
      sortOrder: req.query.sortOrder || "asc",
    };

    const result = await CategoryService.searchCategories(
      req.params.query,
      options
    );
    res.json(ApiResponse.success(result));
  })
);

module.exports = router;
