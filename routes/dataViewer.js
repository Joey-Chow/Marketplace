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

module.exports = router;
