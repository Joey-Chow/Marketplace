const mongoose = require("mongoose");

/**
 * Advanced MongoDB Query Examples for Marketplace
 * These examples demonstrate complex queries you can use in your application
 */

class MarketplaceQueries {
  // 1. Product Queries
  static async getTopRatedProducts(limit = 10) {
    return mongoose.connection.db
      .collection("products")
      .aggregate([
        { $match: { "inventory.quantity": { $gt: 0 } } },
        { $sort: { averageRating: -1, reviewCount: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller",
          },
        },
        {
          $project: {
            name: 1,
            price: 1,
            averageRating: 1,
            reviewCount: 1,
            "seller.username": 1,
            "seller.sellerInfo.storeName": 1,
          },
        },
      ])
      .toArray();
  }

  static async searchProducts(searchTerm, filters = {}) {
    const matchStage = {
      $text: { $search: searchTerm },
    };

    // Add filters
    if (filters.category) matchStage.category = filters.category;
    if (filters.minPrice) matchStage.price = { $gte: filters.minPrice };
    if (filters.maxPrice) {
      matchStage.price = { ...matchStage.price, $lte: filters.maxPrice };
    }
    if (filters.minRating)
      matchStage.averageRating = { $gte: filters.minRating };

    return mongoose.connection.db
      .collection("products")
      .aggregate([
        { $match: matchStage },
        { $addFields: { score: { $meta: "textScore" } } },
        { $sort: { score: { $meta: "textScore" }, averageRating: -1 } },
        { $limit: filters.limit || 20 },
      ])
      .toArray();
  }

  // 2. User Analytics
  static async getUserOrderStats(userId) {
    return mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
        {
          $group: {
            _id: null,
            statusBreakdown: {
              $push: {
                status: "$_id",
                count: "$count",
                totalAmount: "$totalAmount",
              },
            },
            totalOrders: { $sum: "$count" },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
      ])
      .toArray();
  }

  static async getTopCustomers(limit = 10) {
    return mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: "$userId",
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            avgOrderValue: { $avg: "$totalAmount" },
            lastOrderDate: { $max: "$createdAt" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            "user.profile.firstName": 1,
            "user.profile.lastName": 1,
            "user.email": 1,
            totalOrders: 1,
            totalSpent: 1,
            avgOrderValue: 1,
            lastOrderDate: 1,
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: limit },
      ])
      .toArray();
  }

  // 3. Sales Analytics
  static async getMonthlySalesReport(year = new Date().getFullYear()) {
    return mongoose.connection.db
      .collection("orders")
      .aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${year + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalSales: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: "$_id",
            totalSales: { $round: ["$totalSales", 2] },
            orderCount: 1,
            avgOrderValue: { $round: ["$avgOrderValue", 2] },
          },
        },
      ])
      .toArray();
  }

  static async getCategoryPerformance() {
    return mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { status: "completed" } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
            totalQuantitySold: { $sum: "$items.quantity" },
            avgPrice: { $avg: "$items.price" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ])
      .toArray();
  }

  // 4. Product Recommendations
  static async getRecommendedProducts(userId, limit = 10) {
    // Get user's order history to find preferences
    const userOrders = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ])
      .toArray();

    const preferredCategories = userOrders.map((item) => item._id);

    // Find products in preferred categories that user hasn't ordered
    return mongoose.connection.db
      .collection("products")
      .aggregate([
        {
          $match: {
            category: { $in: preferredCategories },
            "inventory.quantity": { $gt: 0 },
          },
        },
        {
          $lookup: {
            from: "orders",
            let: { productId: "$_id" },
            pipeline: [
              { $match: { userId: new mongoose.Types.ObjectId(userId) } },
              { $unwind: "$items" },
              {
                $match: { $expr: { $eq: ["$items.productId", "$$productId"] } },
              },
            ],
            as: "userOrders",
          },
        },
        { $match: { userOrders: { $size: 0 } } }, // Not previously ordered
        { $sort: { averageRating: -1, reviewCount: -1 } },
        { $limit: limit },
      ])
      .toArray();
  }

  // 5. Inventory Management
  static async getLowStockProducts(threshold = 10) {
    return mongoose.connection.db
      .collection("products")
      .aggregate([
        { $match: { "inventory.quantity": { $lte: threshold } } },
        {
          $lookup: {
            from: "users",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller",
          },
        },
        {
          $project: {
            name: 1,
            "inventory.quantity": 1,
            price: 1,
            "seller.email": 1,
            "seller.sellerInfo.storeName": 1,
          },
        },
        { $sort: { "inventory.quantity": 1 } },
      ])
      .toArray();
  }

  // 6. Review Analytics
  static async getReviewSummary(productId) {
    return mongoose.connection.db
      .collection("reviews")
      .aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            ratingDistribution: {
              $push: {
                rating: "$_id",
                count: "$count",
              },
            },
            totalReviews: { $sum: "$count" },
            avgRating: {
              $avg: {
                $multiply: ["$_id", "$count"],
              },
            },
          },
        },
      ])
      .toArray();
  }

  // 7. Advanced Search with Facets
  static async facetedSearch(searchTerm) {
    return mongoose.connection.db
      .collection("products")
      .aggregate([
        { $match: { $text: { $search: searchTerm } } },
        {
          $facet: {
            products: [
              { $sort: { score: { $meta: "textScore" } } },
              { $limit: 20 },
            ],
            categories: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            priceRanges: [
              {
                $bucket: {
                  groupBy: "$price",
                  boundaries: [0, 25, 50, 100, 250, 500, 1000, Infinity],
                  default: "Other",
                  output: { count: { $sum: 1 } },
                },
              },
            ],
            ratings: [
              {
                $bucket: {
                  groupBy: "$averageRating",
                  boundaries: [0, 1, 2, 3, 4, 5],
                  default: "Unrated",
                  output: { count: { $sum: 1 } },
                },
              },
            ],
          },
        },
      ])
      .toArray();
  }

  // 8. Geographic Analysis (if you have location data)
  static async getOrdersByRegion() {
    return mongoose.connection.db
      .collection("orders")
      .aggregate([
        { $match: { status: "completed" } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: {
              city: "$user.profile.address.city",
              state: "$user.profile.address.state",
            },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 20 },
      ])
      .toArray();
  }
}

module.exports = MarketplaceQueries;
