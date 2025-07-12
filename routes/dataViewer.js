const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Cart = require("../models/Cart");
const Category = require("../models/Category");

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "DataViewer routes working" });
});

// Get database overview
router.get("/overview", async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Cart.countDocuments(),
      Category.countDocuments(),
    ]);

    const overview = {
      collections: [
        { name: "Users", count: stats[0], icon: "👥" },
        { name: "Products", count: stats[1], icon: "📦" },
        { name: "Orders", count: stats[2], icon: "🛒" },
        { name: "Reviews", count: stats[3], icon: "⭐" },
        { name: "Carts", count: stats[4], icon: "🛍️" },
        { name: "Categories", count: stats[5], icon: "📂" },
      ],
      total: stats.reduce((sum, count) => sum + count, 0),
    };

    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "username email role profile.firstName profile.lastName sellerInfo.storeName createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        totalItems: total,
        count: users.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "username sellerInfo.storeName")
      .populate("category", "name icon")
      .select(
        "name price inventory.quantity ratings.average status featured images createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const total = await Product.countDocuments();

    res.json({
      success: true,
      data: {
        products,
        totalItems: total,
        count: products.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "username email profile.firstName profile.lastName")
      .select("orderNumber status pricing payment.status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments();

    res.json({
      success: true,
      data: {
        orders,
        totalItems: total,
        count: orders.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("buyer", "username")
      .populate("product", "name")
      .select("rating title comment verified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const total = await Review.countDocuments();

    res.json({
      success: true,
      data: {
        reviews,
        totalItems: total,
        count: reviews.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get categories
router.get("/categories", async (req, res) => {
  try {
    console.log("=== CATEGORIES ENDPOINT CALLED ===");
    const categories = await Category.find()
      .select("name description icon slug sortOrder")
      .sort({ sortOrder: 1 })
      .lean();

    console.log("Categories found:", categories.length);

    // Get product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          status: "active",
        });
        console.log(`Category ${category.name} has ${productCount} products`);
        return {
          ...category,
          productCount,
        };
      })
    );

    console.log("Categories with count:", categoriesWithCount.length);
    console.log(
      "First category:",
      JSON.stringify(categoriesWithCount[0], null, 2)
    );

    const total = await Category.countDocuments();

    res.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        totalItems: total,
        count: categoriesWithCount.length,
      },
    });
  } catch (error) {
    console.error("Categories endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single category by ID
router.get("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .select("name description icon slug")
      .lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics data
router.get("/analytics", async (req, res) => {
  try {
    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top Products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $sort: { totalRevenue: -1 } },
      { $limit: 50 }, // Show top 50 products
      {
        $project: {
          name: "$product.name",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Category Performance
    const categoryPerformance = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        revenueByMonth,
        topProducts,
        categoryPerformance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search functionality
router.get("/search", async (req, res) => {
  try {
    const { q: query, type = "products" } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ success: false, error: "Query is required" });
    }

    let results = [];
    let total = 0;

    const searchRegex = new RegExp(query, "i");

    switch (type) {
      case "products":
        results = await Product.find({
          $or: [{ name: searchRegex }, { description: searchRegex }],
        })
          .populate("seller", "username")
          .populate("category", "name")
          .select("name price inventory.quantity status")
          .sort({ createdAt: -1 })
          .lean();
        total = results.length;
        break;

      case "users":
        results = await User.find({
          $or: [
            { username: searchRegex },
            { email: searchRegex },
            { "profile.firstName": searchRegex },
            { "profile.lastName": searchRegex },
          ],
        })
          .select("username email role createdAt")
          .sort({ createdAt: -1 })
          .lean();
        total = results.length;
        break;

      case "orders":
        results = await Order.find({
          $or: [{ orderNumber: searchRegex }, { status: searchRegex }],
        })
          .populate("buyer", "username email")
          .select("orderNumber status pricing.total createdAt")
          .sort({ createdAt: -1 })
          .lean();
        total = results.length;
        break;

      default:
        return res
          .status(400)
          .json({ success: false, error: "Invalid search type" });
    }

    res.json({
      success: true,
      data: {
        results,
        totalItems: total,
        count: results.length,
        query,
        type,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
