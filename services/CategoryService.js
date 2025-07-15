const Category = require("../models/Category");
const { CustomError } = require("../utils/errors");
const logger = require("../utils/logger");

class CategoryService {
  /**
   * Get all categories
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Categories
   */
  async getAllCategories(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = "name",
        sortOrder = "asc",
      } = options;

      const categories = await Category.find({})
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Category.countDocuments({});

      return {
        categories,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCategories: total,
      };
    } catch (error) {
      logger.error("Error getting all categories:", error);
      throw new CustomError("Failed to get categories", 500);
    }
  }
}

module.exports = new CategoryService();
