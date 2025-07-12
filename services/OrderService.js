const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { CustomError } = require("../utils/errors");
const logger = require("../utils/logger");

class OrderService {
  /**
   * Create order from cart
   * @param {string} userId - User ID
   * @param {Object} shippingAddress - Shipping address
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} Created order
   */
  async createOrder(userId, shippingAddress, paymentMethod = "pending") {
    try {
      // Get user's cart
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0) {
        throw new CustomError("Cart is empty", 400);
      }

      // Validate stock availability
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        if (!product) {
          throw new CustomError(`Product ${item.product.name} not found`, 404);
        }
        if (product.stock < item.quantity) {
          throw new CustomError(
            `Insufficient stock for ${item.product.name}`,
            400
          );
        }
      }

      // Create order
      const order = await Order.create({
        user: userId,
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cart.totalPrice,
        shippingAddress,
        paymentMethod,
        status: "pending",
      });

      // Update product stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart
      await Cart.findByIdAndUpdate(cart._id, {
        items: [],
        totalPrice: 0,
      });

      return await Order.findById(order._id).populate("items.product");
    } catch (error) {
      logger.error("Error creating order:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to create order", 500);
    }
  }

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
   * Get order by ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (optional, for authorization)
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId, userId = null) {
    try {
      const query = { _id: orderId };
      if (userId) {
        query.user = userId;
      }

      const order = await Order.findOne(query).populate("items.product");
      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      return order;
    } catch (error) {
      logger.error("Error getting order by ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to get order", 500);
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} userId - User ID (optional, for seller authorization)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status, userId = null) {
    try {
      const validStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new CustomError("Invalid order status", 400);
      }

      const order = await Order.findById(orderId);
      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      // If userId is provided, check if user owns any of the products in the order
      if (userId) {
        const orderItems = await Order.findById(orderId).populate(
          "items.product"
        );
        const userOwnsProduct = orderItems.items.some(
          (item) => item.product.seller.toString() === userId
        );

        if (!userOwnsProduct) {
          throw new CustomError("Unauthorized to update this order", 403);
        }
      }

      order.status = status;
      if (status === "delivered") {
        order.deliveredAt = new Date();
      }

      await order.save();

      return await Order.findById(order._id).populate("items.product");
    } catch (error) {
      logger.error("Error updating order status:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to update order status", 500);
    }
  }

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated order
   */
  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findOne({ _id: orderId, user: userId });
      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      if (order.status === "delivered") {
        throw new CustomError("Cannot cancel delivered order", 400);
      }

      if (order.status === "cancelled") {
        throw new CustomError("Order already cancelled", 400);
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      await order.save();

      return await Order.findById(order._id).populate("items.product");
    } catch (error) {
      logger.error("Error cancelling order:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to cancel order", 500);
    }
  }

  /**
   * Get all orders (admin)
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
        .populate("user", "name email")
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

  /**
   * Get order statistics
   * @param {string} userId - User ID (optional, for seller stats)
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStats(userId = null) {
    try {
      let matchStage = {};

      if (userId) {
        // Get orders for products sold by this user
        const products = await Product.find({ seller: userId }, "_id");
        const productIds = products.map((p) => p._id);

        matchStage = {
          "items.product": { $in: productIds },
        };
      }

      const stats = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            confirmedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
      ]);

      return stats.length > 0
        ? stats[0]
        : {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            confirmedOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
          };
    } catch (error) {
      logger.error("Error getting order stats:", error);
      throw new CustomError("Failed to get order statistics", 500);
    }
  }
}

module.exports = new OrderService();
