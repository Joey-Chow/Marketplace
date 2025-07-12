const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        url: String,
        publicId: String,
        caption: String,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    response: {
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: String,
      respondedAt: Date,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "flagged", "deleted"],
      default: "active",
    },
    flags: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: ["inappropriate", "spam", "fake", "offensive", "other"],
        },
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ buyer: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ status: 1 });

// Compound index for unique review per user per product
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

// Virtual for review age
reviewSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to mark as helpful
reviewSchema.methods.markHelpful = function (userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
};

// Method to unmark as helpful
reviewSchema.methods.unmarkHelpful = function (userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index > -1) {
    this.helpful.users.splice(index, 1);
    this.helpful.count -= 1;
  }
};

module.exports = mongoose.model("Review", reviewSchema);
