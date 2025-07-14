const Order = require("../models/Order");
const { CustomError } = require("../utils/errors");
const logger = require("../utils/logger");

class OrderService {
  /**
   * Get user's orders
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User's orders
   */
  async getUserOrders(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const query = { user: userId };
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate("items.product")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(query);

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      };
    } catch (error) {
      logger.error("Error getting user orders:", error);
      throw new CustomError("Failed to get orders", 500);
    }
  }

  /**
   * Get all orders (admin access)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} All orders
   */
  async getAllOrders(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const query = {};
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate("buyer", "username email")
        .populate("items.product")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(query);

      return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      };
    } catch (error) {
      logger.error("Error getting all orders:", error);
      throw new CustomError("Failed to get orders", 500);
    }
  }
}

module.exports = new OrderService();
