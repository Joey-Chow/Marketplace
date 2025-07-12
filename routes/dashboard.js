const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Review = require("../models/Review");
const Category = require("../models/Category");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/dashboard/analytics
// @desc    Get comprehensive analytics dashboard
// @access  Private (Admin only)
router.get("/analytics", auth, authorize("admin"), async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "30d";
    const startDate = getStartDate(timeRange);

    // 1. Sales Analytics
    const salesAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$pricing.total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$pricing.total" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // 2. Top Selling Products
    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productName: "$productInfo.name",
          productImage: { $arrayElemAt: ["$productInfo.images.url", 0] },
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // 3. Most Active Users (Buyers)
    const mostActiveUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: "$buyer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$pricing.total" },
          avgOrderValue: { $avg: "$pricing.total" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          username: "$userInfo.username",
          fullName: {
            $concat: [
              "$userInfo.profile.firstName",
              " ",
              "$userInfo.profile.lastName",
            ],
          },
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: 1,
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
    ]);

    // 4. Top Sellers by Revenue
    const topSellersByRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.seller",
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          totalOrders: { $sum: 1 },
          totalProducts: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      { $unwind: "$sellerInfo" },
      {
        $project: {
          storeName: "$sellerInfo.sellerInfo.storeName",
          username: "$sellerInfo.username",
          totalRevenue: 1,
          totalOrders: 1,
          totalProducts: 1,
          avgOrderValue: { $divide: ["$totalRevenue", "$totalOrders"] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // 5. Category Performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          categoryName: { $first: "$categoryInfo.name" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // 6. Overall Statistics
    const overallStats = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: startDate },
        "payment.status": "completed",
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.total" },
            avgOrderValue: { $avg: "$pricing.total" },
          },
        },
      ]),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Product.countDocuments({ createdAt: { $gte: startDate } }),
    ]);

    const [totalOrders, revenueStats, newUsers, newProducts] = overallStats;
    const revenue = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 };

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: revenue.totalRevenue,
          avgOrderValue: revenue.avgOrderValue,
          newUsers,
          newProducts,
        },
        salesAnalytics,
        topSellingProducts,
        mostActiveUsers,
        topSellersByRevenue,
        categoryPerformance,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/dashboard/seller
// @desc    Get seller-specific dashboard
// @access  Private (Seller only)
router.get("/seller", auth, authorize("seller", "admin"), async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "30d";
    const startDate = getStartDate(timeRange);
    const sellerId = req.user.id;

    // 1. Seller's Products Performance
    const productsPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
          "items.seller": mongoose.Types.ObjectId(sellerId),
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productName: "$productInfo.name",
          productImage: { $arrayElemAt: ["$productInfo.images.url", 0] },
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgPrice: { $divide: ["$totalRevenue", "$totalQuantity"] },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // 2. Sales Over Time
    const salesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
          "items.seller": mongoose.Types.ObjectId(sellerId),
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          dailyRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          dailyOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // 3. Recent Orders
    const recentOrders = await Order.find({
      "items.seller": sellerId,
      createdAt: { $gte: startDate },
    })
      .populate("buyer", "username profile.firstName profile.lastName")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .limit(10);

    // 4. Product Reviews Summary
    const reviewsSummary = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          "productInfo.seller": mongoose.Types.ObjectId(sellerId),
          status: "active",
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    // 5. Low Stock Products
    const lowStockProducts = await Product.find({
      seller: sellerId,
      status: "active",
      $expr: { $lte: ["$inventory.quantity", "$inventory.lowStockThreshold"] },
    })
      .select("name inventory.quantity inventory.lowStockThreshold images")
      .sort({ "inventory.quantity": 1 })
      .limit(10);

    // 6. Overall Stats
    const overallStats = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            "payment.status": "completed",
            "items.seller": mongoose.Types.ObjectId(sellerId),
          },
        },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": mongoose.Types.ObjectId(sellerId),
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            totalOrders: { $sum: 1 },
            totalProducts: { $sum: "$items.quantity" },
          },
        },
      ]),
      Product.countDocuments({ seller: sellerId, status: "active" }),
    ]);

    const [revenueStats, activeProducts] = overallStats;
    const stats = revenueStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalOrders,
          totalProductsSold: stats.totalProducts,
          activeProducts,
          avgOrderValue:
            stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
        },
        productsPerformance,
        salesOverTime,
        recentOrders,
        reviewsSummary: reviewsSummary[0] || { totalReviews: 0, avgRating: 0 },
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/dashboard/buyer
// @desc    Get buyer-specific dashboard
// @access  Private (Buyer only)
router.get("/buyer", auth, async (req, res) => {
  try {
    const buyerId = req.user.id;
    const timeRange = req.query.timeRange || "30d";
    const startDate = getStartDate(timeRange);

    // 1. Recent Orders
    const recentOrders = await Order.find({
      buyer: buyerId,
      createdAt: { $gte: startDate },
    })
      .populate("items.product", "name images")
      .populate("items.seller", "username sellerInfo.storeName")
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Purchase History Summary
    const purchaseHistory = await Order.aggregate([
      {
        $match: {
          buyer: mongoose.Types.ObjectId(buyerId),
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSpent: { $sum: "$pricing.total" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // 3. Favorite Categories
    const favoriteCategories = await Order.aggregate([
      {
        $match: {
          buyer: mongoose.Types.ObjectId(buyerId),
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          categoryName: { $first: "$categoryInfo.name" },
          totalSpent: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          totalItems: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    // 4. Reviews Written
    const reviewsWritten = await Review.countDocuments({
      buyer: buyerId,
      status: "active",
    });

    // 5. Wishlist/Saved Items
    const savedItems = await Cart.findOne({ user: buyerId })
      .populate("savedForLater.product", "name price images")
      .select("savedForLater");

    // 6. Overall Stats
    const overallStats = await Order.aggregate([
      {
        $match: {
          buyer: mongoose.Types.ObjectId(buyerId),
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$pricing.total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$pricing.total" },
        },
      },
    ]);

    const stats = overallStats[0] || {
      totalSpent: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalSpent: stats.totalSpent,
          totalOrders: stats.totalOrders,
          avgOrderValue: stats.avgOrderValue,
          reviewsWritten,
          savedItems: savedItems?.savedForLater?.length || 0,
        },
        recentOrders,
        purchaseHistory,
        favoriteCategories,
        savedItems: savedItems?.savedForLater || [],
      },
    });
  } catch (error) {
    console.error("Buyer dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/dashboard/recommendations
// @desc    Get personalized product recommendations
// @access  Private
router.get("/recommendations", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Collaborative Filtering - Users who bought similar products
    const similarUsers = await Order.aggregate([
      {
        $match: {
          buyer: mongoose.Types.ObjectId(userId),
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$items.product" },
          pipeline: [
            { $match: { "payment.status": "completed" } },
            { $unwind: "$items" },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$items.product", "$$productId"] },
                    { $ne: ["$buyer", mongoose.Types.ObjectId(userId)] },
                  ],
                },
              },
            },
            { $group: { _id: "$buyer", commonProducts: { $sum: 1 } } },
          ],
          as: "similarBuyers",
        },
      },
      { $unwind: "$similarBuyers" },
      {
        $group: {
          _id: "$similarBuyers._id",
          commonProducts: { $sum: "$similarBuyers.commonProducts" },
        },
      },
      { $sort: { commonProducts: -1 } },
      { $limit: 10 },
    ]);

    // 2. Get recommended products from similar users
    const recommendedProducts = await Order.aggregate([
      {
        $match: {
          buyer: { $in: similarUsers.map((u) => u._id) },
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$items.product" },
          pipeline: [
            {
              $match: {
                buyer: mongoose.Types.ObjectId(userId),
                "payment.status": "completed",
              },
            },
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $eq: ["$items.product", "$$productId"] },
              },
            },
          ],
          as: "alreadyBought",
        },
      },
      { $match: { alreadyBought: { $size: 0 } } },
      {
        $group: {
          _id: "$items.product",
          score: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          "productInfo.status": "active",
        },
      },
      {
        $project: {
          product: "$productInfo",
          score: 1,
        },
      },
      { $sort: { score: -1 } },
      { $limit: 12 },
    ]);

    // 3. Category-based recommendations
    const categoryRecommendations = await Order.aggregate([
      {
        $match: {
          buyer: mongoose.Types.ObjectId(userId),
          "payment.status": "completed",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          purchaseCount: { $sum: 1 },
        },
      },
      { $sort: { purchaseCount: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
                status: "active",
              },
            },
            { $sample: { size: 4 } },
          ],
          as: "categoryProducts",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          categoryName: "$categoryInfo.name",
          products: "$categoryProducts",
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        collaborativeFiltering: recommendedProducts,
        categoryBased: categoryRecommendations,
      },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to get start date based on time range
function getStartDate(timeRange) {
  const now = new Date();

  switch (timeRange) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

module.exports = router;
