const Category = require("../models/Category");
const Product = require("../models/Product");
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

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category details
   */
  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new CustomError("Category not found", 404);
      }

      return category;
    } catch (error) {
      logger.error("Error getting category by ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to get category", 500);
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    try {
      const { name, description } = categoryData;

      // Check if category already exists
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (existingCategory) {
        throw new CustomError("Category already exists", 400);
      }

      const category = await Category.create({
        name,
        description,
      });

      return category;
    } catch (error) {
      logger.error("Error creating category:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to create category", 500);
    }
  }

  /**
   * Update category
   * @param {string} categoryId - Category ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(categoryId, updateData) {
    try {
      const { name, description } = updateData;

      const category = await Category.findById(categoryId);
      if (!category) {
        throw new CustomError("Category not found", 404);
      }

      // Check if name already exists (if name is being updated)
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") },
          _id: { $ne: categoryId },
        });

        if (existingCategory) {
          throw new CustomError("Category name already exists", 400);
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { name, description },
        { new: true, runValidators: true }
      );

      return updatedCategory;
    } catch (error) {
      logger.error("Error updating category:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to update category", 500);
    }
  }

  /**
   * Delete category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCategory(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new CustomError("Category not found", 404);
      }

      // Check if category is being used by any products
      const productsCount = await Product.countDocuments({
        category: categoryId,
      });
      if (productsCount > 0) {
        throw new CustomError(
          `Cannot delete category. ${productsCount} products are using this category`,
          400
        );
      }

      await Category.findByIdAndDelete(categoryId);

      return { message: "Category deleted successfully" };
    } catch (error) {
      logger.error("Error deleting category:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to delete category", 500);
    }
  }

  /**
   * Get category with products
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Category with products
   */
  async getCategoryWithProducts(categoryId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const category = await Category.findById(categoryId);
      if (!category) {
        throw new CustomError("Category not found", 404);
      }

      const products = await Product.find({ category: categoryId })
        .populate("seller", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalProducts = await Product.countDocuments({
        category: categoryId,
      });

      return {
        category,
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      };
    } catch (error) {
      logger.error("Error getting category with products:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to get category with products", 500);
    }
  }

  /**
   * Get category statistics
   * @param {string} categoryId - Category ID (optional)
   * @returns {Promise<Object>} Category statistics
   */
  async getCategoryStats(categoryId = null) {
    try {
      let matchStage = {};
      if (categoryId) {
        matchStage = { category: categoryId };
      }

      const stats = await Product.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: categoryId ? null : "$category",
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      if (categoryId) {
        return stats.length > 0
          ? stats[0]
          : {
              totalProducts: 0,
              totalStock: 0,
              avgPrice: 0,
              minPrice: 0,
              maxPrice: 0,
            };
      }

      return stats;
    } catch (error) {
      logger.error("Error getting category stats:", error);
      throw new CustomError("Failed to get category statistics", 500);
    }
  }

  /**
   * Search categories
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchCategories(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "asc",
      } = options;

      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };

      const categories = await Category.find(searchQuery)
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Category.countDocuments(searchQuery);

      return {
        categories,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCategories: total,
        query,
      };
    } catch (error) {
      logger.error("Error searching categories:", error);
      throw new CustomError("Failed to search categories", 500);
    }
  }
}

module.exports = new CategoryService();
