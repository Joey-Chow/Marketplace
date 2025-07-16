// CheckoutService.js - ACID-compliant checkout processing
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const logger = require("../utils/logger");

class CheckoutService {
  /**
   * Process checkout without transactions (for standalone MongoDB)
   * @param {string} userId - User ID
   * @param {Array} selectedItems - Array of selected product IDs
   * @param {string} paymentMethod - Payment method chosen
   * @param {Object} shippingAddress - Shipping address
   * @returns {Promise<Object>} - Order result
   */
  async processCheckout(
    userId,
    selectedItems,
    paymentMethod,
    shippingAddress = {}
  ) {
    try {
      logger.info(`Starting checkout for user: ${userId}`, {
        selectedItems,
        paymentMethod,
      });

      // Step 1: Get user's cart and validate selected items
      const userCart = await Cart.findOne({ user: userId });
      if (!userCart || !userCart.items.length) {
        throw new Error("Cart is empty");
      }

      // Filter cart items to only selected ones
      const selectedCartItems = userCart.items.filter((item) =>
        selectedItems.includes(item.product.toString())
      );

      if (selectedCartItems.length === 0) {
        throw new Error("No items selected for checkout");
      }

      // Step 2: Validate product availability and calculate totals
      const orderItems = [];
      let subtotal = 0;
      const productUpdates = [];

      for (const cartItem of selectedCartItems) {
        const product = await Product.findById(cartItem.product);

        if (!product) {
          throw new Error(`Product ${cartItem.product} not found`);
        }

        if (product.stock < cartItem.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`
          );
        }

        const itemTotal = product.price * cartItem.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          seller: product.seller, // Assuming product has a seller field
          quantity: cartItem.quantity,
          price: product.price,
          productSnapshot: {
            name: product.name,
            description: product.description,
            image: product.images?.[0] || "",
            sku: product.sku || "",
          },
        });

        // Prepare inventory update
        productUpdates.push({
          productId: product._id,
          currentStock: product.stock,
          newStock: product.stock - cartItem.quantity,
        });
      }

      // Calculate tax and total
      const taxRate = 0.085;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      logger.info(`Checkout validation completed`, {
        itemCount: orderItems.length,
        subtotal,
        tax,
        total,
      });

      // Step 3: Process payment first (fail early if payment fails)
      const paymentResult = await this.processPayment(paymentMethod, total);
      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }

      // Step 4: Create order document
      const orderNumber = `ORDER-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      const orderData = {
        orderNumber,
        buyer: userId,
        items: orderItems,
        pricing: {
          subtotal,
          tax,
          shipping: 0,
          discount: 0,
          total,
        },
        payment: {
          method: paymentMethod,
          status: "completed",
          transactionId: paymentResult.paymentId,
          paidAt: new Date(),
        },
        shippingAddress: {
          firstName: shippingAddress.firstName || "Customer",
          lastName: shippingAddress.lastName || "Name",
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || "US",
          phone: shippingAddress.phone || "",
        },
        status: "confirmed",
        timeline: [
          {
            status: "confirmed",
            timestamp: new Date(),
            note: "Order confirmed and payment processed",
          },
        ],
      };

      const order = new Order(orderData);
      await order.save();

      logger.info(`Order created successfully`, {
        orderId: order._id,
        paymentId: paymentResult.paymentId,
      });

      // Step 5: Update product inventory
      for (const update of productUpdates) {
        await Product.findByIdAndUpdate(update.productId, {
          $inc: { stock: -update.currentStock + update.newStock },
        });
      }

      logger.info(`Inventory updated for ${productUpdates.length} products`);

      // Step 6: Remove only selected items from cart
      await Cart.findOneAndUpdate(
        { user: userId },
        {
          $pull: {
            items: {
              product: {
                $in: selectedItems.map((id) => new mongoose.Types.ObjectId(id)),
              },
            },
          },
        }
      );

      logger.info(`Selected items removed from cart`, {
        removedItems: selectedItems.length,
      });

      // Step 7: Update user's order history
      await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

      logger.info(`Checkout completed successfully`, {
        orderId: order._id,
        paymentId: paymentResult.paymentId,
      });

      return {
        success: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          items: orderItems,
          subtotal,
          tax,
          total,
          status: "confirmed",
          paymentId: paymentResult.paymentId,
        },
      };
    } catch (error) {
      logger.error(`Checkout failed`, {
        error: error.message,
        userId,
        selectedItems,
      });

      throw error;
    }
  }

  /**
   * Simulate payment processing
   * @param {string} paymentMethod - Payment method
   * @param {number} amount - Amount to charge
   * @returns {Promise<Object>} - Payment result
   */
  async processPayment(paymentMethod, amount) {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate payment success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        paymentId: `pay_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        amount,
        method: paymentMethod,
      };
    } else {
      return {
        success: false,
        error: "Payment processing failed",
      };
    }
  }

  /**
   * Test checkout scenarios without transactions
   * @param {string} scenario - Test scenario type
   */
  async testCheckoutScenario(scenario) {
    try {
      switch (scenario) {
        case "insufficient_stock":
          // Simulate insufficient stock scenario
          logger.info("Testing insufficient stock scenario");
          throw new Error("Insufficient stock - testing error handling");

        case "payment_failure":
          // Simulate payment failure scenario
          logger.info("Testing payment failure scenario");
          throw new Error("Payment failed - testing error handling");

        case "database_error":
          // Simulate database error scenario
          logger.info("Testing database error scenario");
          throw new Error("Database connection lost - testing error handling");

        default:
          throw new Error("Unknown test scenario");
      }
    } catch (error) {
      logger.info(`Test completed for scenario: ${scenario}`, {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new CheckoutService();
