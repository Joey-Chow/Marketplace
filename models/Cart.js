const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        // Removed price field - we'll use current product prices
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totals: {
      subtotal: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      shipping: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    appliedCoupons: [
      {
        code: String,
        discount: Number,
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    savedForLater: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    session: {
      sessionId: String,
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

// Indexes for performance
cartSchema.index({ user: 1 });
cartSchema.index({ "items.product": 1 });
cartSchema.index({ updatedAt: -1 });

// Method to calculate totals using current product prices
cartSchema.methods.calculateTotals = async function () {
  // Populate products to get current prices
  await this.populate("items.product");

  this.totals.subtotal = this.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // Apply tax (simple 8% tax rate)
  this.totals.tax = this.totals.subtotal * 0.08;

  // Apply shipping (free shipping over $50)
  this.totals.shipping = this.totals.subtotal >= 50 ? 0 : 10;

  // Apply discounts
  this.totals.discount = this.appliedCoupons.reduce(
    (sum, coupon) => sum + coupon.discount,
    0
  );

  // Calculate total
  this.totals.total =
    this.totals.subtotal +
    this.totals.tax +
    this.totals.shipping -
    this.totals.discount;

  return this.totals;
};

// Method to add item to cart (using current price)
cartSchema.methods.addItem = function (productId, quantity) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity: quantity,
    });
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId);
    } else {
      item.quantity = quantity;
    }
  }
};

// Virtual for item count
cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
