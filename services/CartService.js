const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { CustomError } = require("../utils/errors");
const logger = require("../utils/logger");

class CartService {
  /**
   * Get user's cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart object
   */
  static async getUserCart(userId) {
    try {
      let cart = await Cart.findOne({ user: userId }).populate("items.product");

      if (!cart) {
        // Create new cart if doesn't exist
        cart = await Cart.create({
          user: userId,
          items: [],
          totals: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
          },
        });
      } else {
        // Filter out items with invalid product references
        const validItems = cart.items.filter(
          (item) => item.product && item.product._id
        );
        if (validItems.length !== cart.items.length) {
          console.log(
            `Removing ${
              cart.items.length - validItems.length
            } invalid items from cart`
          );
          cart.items = validItems;
        }
      }

      // Calculate totals using current product prices
      await cart.calculateTotals();
      await cart.save();

      return cart;
    } catch (error) {
      logger.error("Error getting user cart:", error);
      throw new CustomError("Failed to get cart", 500);
    }
  }

  /**
   * Add item to cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Object>} Updated cart
   */
  static async addToCart(userId, productId, quantity = 1) {
    try {
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new CustomError("Product not found", 404);
      }

      // Check stock availability
      if (product.inventory.quantity < quantity) {
        throw new CustomError("Insufficient stock", 400);
      }

      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        // Create new cart
        cart = await Cart.create({
          user: userId,
          items: [
            {
              product: productId,
              quantity: quantity,
            },
          ],
          totals: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
          },
        });
      } else {
        // Check if item already exists in cart
        const existingItem = cart.items.find(
          (item) => item.product.toString() === productId
        );

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          if (product.inventory.quantity < newQuantity) {
            throw new CustomError("Insufficient stock", 400);
          }
          existingItem.quantity = newQuantity;
        } else {
          // Add new item
          cart.items.push({
            product: productId,
            quantity: quantity,
          });
        }

        await cart.save();
      }

      // Calculate totals and return cart with populated products
      await cart.calculateTotals();
      await cart.save();

      return await Cart.findById(cart._id).populate("items.product");
    } catch (error) {
      logger.error("Error adding to cart:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to add item to cart", 500);
    }
  }

  /**
   * Update cart item quantity
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  static async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity < 0) {
        throw new CustomError("Quantity cannot be negative", 400);
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new CustomError("Cart not found", 404);
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        throw new CustomError("Item not found in cart", 404);
      }

      if (quantity === 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock availability
        const product = await Product.findById(productId);
        if (!product) {
          throw new CustomError("Product not found", 404);
        }

        if (product.inventory.quantity < quantity) {
          throw new CustomError("Insufficient stock", 400);
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      // Calculate totals and return cart with populated products
      await cart.calculateTotals();
      await cart.save();

      return await Cart.findById(cart._id).populate("items.product");
    } catch (error) {
      logger.error("Error updating cart item:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to update cart item", 500);
    }
  }

  /**
   * Remove item from cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Updated cart
   */
  static async removeFromCart(userId, productId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new CustomError("Cart not found", 404);
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        throw new CustomError("Item not found in cart", 404);
      }

      // Remove item
      cart.items.splice(itemIndex, 1);

      await cart.save();

      // Calculate totals and return cart with populated products
      await cart.calculateTotals();
      await cart.save();

      return await Cart.findById(cart._id).populate("items.product");
    } catch (error) {
      logger.error("Error removing from cart:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to remove item from cart", 500);
    }
  }

  /**
   * Clear cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Empty cart
   */
  static async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new CustomError("Cart not found", 404);
      }

      cart.items = [];
      cart.totals = {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      };
      await cart.save();

      return cart;
    } catch (error) {
      logger.error("Error clearing cart:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to clear cart", 500);
    }
  }

  /**
   * Get cart summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart summary
   */
  static async getCartSummary(userId) {
    try {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );

      if (!cart) {
        return {
          itemCount: 0,
          totalPrice: 0,
          items: [],
        };
      }

      // Calculate totals
      await cart.calculateTotals();
      await cart.save();

      return {
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: cart.totals.total,
        items: cart.items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
      };
    } catch (error) {
      logger.error("Error getting cart summary:", error);
      throw new CustomError("Failed to get cart summary", 500);
    }
  }
}

module.exports = CartService;
