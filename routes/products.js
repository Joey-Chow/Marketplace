const express = require("express");
const { auth, authorize, verifySeller } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const ProductService = require("../services/ProductService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = {};

    // Only add filters if they have values
    if (req.query.category) filters.category = req.query.category;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);
    if (req.query.search) filters.search = req.query.search;
    if (req.query.seller) filters.seller = req.query.seller;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const sort = `${sortOrder === "desc" ? "-" : ""}${sortBy}`;

    const result = await ProductService.getProducts(filters, page, limit, sort);
    res.json(new ApiResponse(200, result));
  })
);

// @route   GET /api/products/seller
// @desc    Get products by seller
// @access  Private (Seller only)
router.get(
  "/seller",
  auth,
  authorize("seller", "admin"),
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      status: req.query.status,
    };

    const result = await ProductService.getSellerProducts(req.user.id, options);
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    ApiResponse.success(res, { product });
  })
);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Seller only)
router.post(
  "/",
  auth,
  authorize("seller", "admin"),
  validate("createProduct"),
  asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.user.id, req.body);
    return ApiResponse.created(
      res,
      { product },
      "Product created successfully"
    );
  })
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Seller only - own products)
router.put(
  "/:id",
  auth,
  authorize("seller", "admin"),
  validate("updateProduct"),
  asyncHandler(async (req, res) => {
    const product = await ProductService.updateProduct(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.json(new ApiResponse(200, { product }, "Product updated successfully"));
  })
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Seller only - own products)
router.delete(
  "/:id",
  auth,
  authorize("seller", "admin"),
  asyncHandler(async (req, res) => {
    await ProductService.deleteProduct(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json(new ApiResponse(200, null, "Product deleted successfully"));
  })
);

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Seller only - own products)
router.put(
  "/:id/stock",
  auth,
  authorize("seller", "admin"),
  validate("updateStock"),
  asyncHandler(async (req, res) => {
    const product = await ProductService.updateProductStock(
      req.params.id,
      req.user.id,
      req.body.stock
    );
    res.json(ApiResponse.success({ product }, "Stock updated successfully"));
  })
);

// @route   PUT /api/products/:id/status
// @desc    Update product status
// @access  Private (Seller only - own products)
router.put(
  "/:id/status",
  auth,
  authorize("seller", "admin"),
  validate("updateStatus"),
  asyncHandler(async (req, res) => {
    const product = await ProductService.updateProductStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    res.json(ApiResponse.success({ product }, "Status updated successfully"));
  })
);

// @route   GET /api/products/search/:query
// @desc    Search products
// @access  Public
router.get(
  "/search/:query",
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await ProductService.searchProducts(
      req.params.query,
      options
    );
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
router.get(
  "/category/:categoryId",
  asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await ProductService.getProductsByCategory(
      req.params.categoryId,
      options
    );
    res.json(ApiResponse.success(result));
  })
);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await ProductService.getFeaturedProducts(limit);
    res.json(ApiResponse.success({ products }));
  })
);

// @route   GET /api/products/trending
// @desc    Get trending products
// @access  Public
router.get(
  "/trending",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await ProductService.getTrendingProducts(limit);
    res.json(ApiResponse.success({ products }));
  })
);

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get(
  "/:id/related",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await ProductService.getRelatedProducts(
      req.params.id,
      limit
    );
    res.json(ApiResponse.success({ products }));
  })
);

// @route   GET /api/products/stats/overview
// @desc    Get product statistics
// @access  Private (Seller - own products, Admin - all products)
router.get(
  "/stats/overview",
  auth,
  authorize("seller", "admin"),
  asyncHandler(async (req, res) => {
    const sellerId = req.user.role === "seller" ? req.user.id : null;
    const stats = await ProductService.getProductStats(sellerId);
    res.json(ApiResponse.success({ stats }));
  })
);

module.exports = router;
