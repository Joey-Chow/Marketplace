const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: false,
      maxlength: 2000,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
        alt: String,
      },
    ],
    inventory: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      sku: {
        type: String,
        unique: true,
        sparse: true,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
    },
    specifications: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      material: String,
      color: String,
      brand: String,
      model: String,
      warranty: String,
    },
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      freeShipping: {
        type: Boolean,
        default: false,
      },
      shippingCost: {
        type: Number,
        default: 0,
      },
    },
    pricing: {
      originalPrice: Number,
      discount: {
        percentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        validFrom: Date,
        validTo: Date,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    tags: [String],
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock", "discontinued"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      slug: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
productSchema.index({ name: "text", description: "text", tags: "text" }); // Full-text search across product name, description, and tags for search functionality
productSchema.index({ seller: 1 }); // Find all products by a specific seller for seller dashboard and product management
productSchema.index({ category: 1 }); // Filter products by category for category browsing and product listing pages
productSchema.index({ price: 1 }); // Sort and filter products by price for price range queries and price-based sorting
productSchema.index({ "ratings.average": -1 }); // Sort products by highest ratings first for "top-rated" product displays
productSchema.index({ totalSales: -1 }); // Sort products by sales performance for "best-selling" product displays and analytics
productSchema.index({ createdAt: -1 }); // Sort products by newest first for "recently added" product listings
productSchema.index({ status: 1 }); // Filter products by status (active, inactive, out_of_stock) for inventory management
productSchema.index({ featured: 1 }); // Quickly find featured products for homepage and promotional displays
productSchema.index({ "inventory.quantity": 1 }); // Filter products by stock availability and find low-stock items for inventory alerts

// Virtual for discounted price
productSchema.virtual("finalPrice").get(function () {
  if (this.pricing.discount.percentage > 0) {
    const now = new Date();
    const validFrom = this.pricing.discount.validFrom;
    const validTo = this.pricing.discount.validTo;

    if ((!validFrom || now >= validFrom) && (!validTo || now <= validTo)) {
      return this.price * (1 - this.pricing.discount.percentage / 100);
    }
  }
  return this.price;
});

// Virtual for stock status
productSchema.virtual("stockStatus").get(function () {
  if (this.inventory.quantity === 0) return "out_of_stock";
  if (this.inventory.quantity <= this.inventory.lowStockThreshold)
    return "low_stock";
  return "in_stock";
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre("save", function (next) {
  if (!this.inventory.sku) {
    this.inventory.sku = `SKU-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
