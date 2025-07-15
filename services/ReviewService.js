const Review = require("../models/Review");
const { CustomError } = require("../utils/errors");
const logger = require("../utils/logger");

class ReviewService {
  /**
   * Get all reviews with pagination and filtering
   * @param {Object} options - Query options (page, limit, sortBy, sortOrder, rating)
   * @returns {Promise<Object>} All reviews with pagination
   */
  async getAllReviews(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        rating = null,
      } = options;

      // Build filter object
      const filter = {};
      if (rating) {
        filter.rating = rating;
      }

      const reviews = await Review.find(filter)
        .populate("buyer", "username email")
        .populate("product", "name price image")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments(filter);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting all reviews:", error);
      throw new CustomError("Failed to get all reviews", 500);
    }
  }
}

module.exports = new ReviewService();
