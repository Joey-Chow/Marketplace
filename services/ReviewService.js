const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { CustomError } = require("../utils/errors");
const logger = require("../utils/logger");

class ReviewService {
  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Created review
   */
  async createReview(reviewData) {
    try {
      const { user, product, rating, comment } = reviewData;

      // Check if product exists
      const productExists = await Product.findById(product);
      if (!productExists) {
        throw new CustomError("Product not found", 404);
      }

      // Check if user has purchased this product
      const userPurchasedProduct = await Order.findOne({
        user: user,
        "items.product": product,
        status: "delivered",
      });

      if (!userPurchasedProduct) {
        throw new CustomError(
          "You can only review products you have purchased",
          400
        );
      }

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({ user, product });
      if (existingReview) {
        throw new CustomError("You have already reviewed this product", 400);
      }

      // Create review
      const review = await Review.create({
        user,
        product,
        rating,
        comment,
      });

      // Update product's average rating
      await this.updateProductRating(product);

      return await Review.findById(review._id).populate("user", "name");
    } catch (error) {
      logger.error("Error creating review:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to create review", 500);
    }
  }

  /**
   * Get reviews for a product
   * @param {string} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews data
   */
  async getProductReviews(productId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        rating,
      } = options;

      const query = { product: productId };
      if (rating) {
        query.rating = rating;
      }

      const reviews = await Review.find(query)
        .populate("user", "name")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments(query);

      // Get rating distribution
      const ratingStats = await Review.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
      ratingStats.forEach((stat) => {
        ratingDistribution[stat._id] = stat.count;
      });

      return {
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        ratingDistribution,
      };
    } catch (error) {
      logger.error("Error getting product reviews:", error);
      throw new CustomError("Failed to get reviews", 500);
    }
  }

  /**
   * Get user's reviews
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's reviews
   */
  async getUserReviews(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const reviews = await Review.find({ user: userId })
        .populate("product", "name price image")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments({ user: userId });

      return {
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
      };
    } catch (error) {
      logger.error("Error getting user reviews:", error);
      throw new CustomError("Failed to get user reviews", 500);
    }
  }

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated review
   */
  async updateReview(reviewId, userId, updateData) {
    try {
      const { rating, comment } = updateData;

      const review = await Review.findOne({ _id: reviewId, user: userId });
      if (!review) {
        throw new CustomError("Review not found", 404);
      }

      // Update review
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { rating, comment },
        { new: true, runValidators: true }
      ).populate("user", "name");

      // Update product's average rating
      await this.updateProductRating(review.product);

      return updatedReview;
    } catch (error) {
      logger.error("Error updating review:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to update review", 500);
    }
  }

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      if (!review) {
        throw new CustomError("Review not found", 404);
      }

      const productId = review.product;
      await Review.findByIdAndDelete(reviewId);

      // Update product's average rating
      await this.updateProductRating(productId);

      return { message: "Review deleted successfully" };
    } catch (error) {
      logger.error("Error deleting review:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to delete review", 500);
    }
  }

  /**
   * Get review by ID
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Review details
   */
  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate("user", "name")
        .populate("product", "name price");

      if (!review) {
        throw new CustomError("Review not found", 404);
      }

      return review;
    } catch (error) {
      logger.error("Error getting review by ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to get review", 500);
    }
  }

  /**
   * Update product's average rating
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async updateProductRating(productId) {
    try {
      const ratingStats = await Review.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      const avgRating =
        ratingStats.length > 0 ? ratingStats[0].averageRating : 0;
      const totalReviews =
        ratingStats.length > 0 ? ratingStats[0].totalReviews : 0;

      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        totalReviews,
      });
    } catch (error) {
      logger.error("Error updating product rating:", error);
      throw new CustomError("Failed to update product rating", 500);
    }
  }

  /**
   * Get review statistics
   * @param {string} productId - Product ID (optional)
   * @returns {Promise<Object>} Review statistics
   */
  async getReviewStats(productId = null) {
    try {
      let matchStage = {};
      if (productId) {
        matchStage = { product: productId };
      }

      const stats = await Review.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: productId ? null : "$product",
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ]);

      if (productId) {
        return stats.length > 0
          ? {
              ...stats[0],
              averageRating: Math.round(stats[0].averageRating * 10) / 10,
            }
          : {
              totalReviews: 0,
              averageRating: 0,
              rating5: 0,
              rating4: 0,
              rating3: 0,
              rating2: 0,
              rating1: 0,
            };
      }

      return stats.map((stat) => ({
        ...stat,
        averageRating: Math.round(stat.averageRating * 10) / 10,
      }));
    } catch (error) {
      logger.error("Error getting review stats:", error);
      throw new CustomError("Failed to get review statistics", 500);
    }
  }

  /**
   * Check if user can review product
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Can review status
   */
  async canUserReviewProduct(userId, productId) {
    try {
      // Check if user has purchased this product
      const userPurchasedProduct = await Order.findOne({
        user: userId,
        "items.product": productId,
        status: "delivered",
      });

      if (!userPurchasedProduct) {
        return false;
      }

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        user: userId,
        product: productId,
      });
      if (existingReview) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error checking if user can review product:", error);
      throw new CustomError("Failed to check review eligibility", 500);
    }
  }
}

module.exports = new ReviewService();
