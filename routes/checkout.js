// routes/checkout.js - Checkout API routes
const express = require("express");
const router = express.Router();
const CheckoutService = require("../services/CheckoutService");
const asyncHandler = require("../utils/asyncHandler");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

// Fixed authentication middleware import

/**
 * POST /api/checkout - Process checkout
 */
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const { selectedItems, paymentMethod, shippingAddress } = req.body;
    const userId = req.user.id;

    logger.info(`Checkout request received`, {
      userId,
      selectedItems,
      paymentMethod,
    });

    // Validate required fields
    if (
      !selectedItems ||
      !Array.isArray(selectedItems) ||
      selectedItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Selected items are required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Payment method is required",
      });
    }

    try {
      const result = await CheckoutService.processCheckout(
        userId,
        selectedItems,
        paymentMethod,
        shippingAddress
      );

      logger.info(`Checkout completed successfully`, {
        userId,
        orderId: result.order._id,
        total: result.order.total,
      });

      res.json(result);
    } catch (error) {
      logger.error(`Checkout failed`, {
        userId,
        error: error.message,
        selectedItems,
      });

      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  })
);

/**
 * POST /api/checkout/test-scenario - Test checkout scenarios
 */
router.post(
  "/test-scenario",
  auth,
  asyncHandler(async (req, res) => {
    const { scenario } = req.body;

    if (!scenario) {
      return res.status(400).json({
        success: false,
        error: "Test scenario is required",
      });
    }

    try {
      await CheckoutService.testCheckoutScenario(scenario);
      res.json({
        success: false,
        message: `Test completed for scenario: ${scenario}`,
      });
    } catch (error) {
      res.json({
        success: false,
        message: `Test completed for scenario: ${scenario}`,
        error: error.message,
      });
    }
  })
);

module.exports = router;
