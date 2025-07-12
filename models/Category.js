const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    icon: {
      type: String,
      trim: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    attributes: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "number", "boolean", "select", "multiselect"],
          required: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
        options: [String], // For select and multiselect types
      },
    ],
    statistics: {
      productCount: {
        type: Number,
        default: 0,
      },
      avgPrice: {
        type: Number,
        default: 0,
      },
      totalSales: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Pre-save middleware to generate slug
categorySchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }
  next();
});

// Virtual for full path
categorySchema.virtual("fullPath").get(function () {
  // This would need to be populated with parent categories
  return this.name;
});

// Method to get all children categories
categorySchema.methods.getChildren = function () {
  return mongoose.model("Category").find({ parent: this._id });
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "children",
        maxDepth: 3,
      },
    },
    { $match: { parent: null } },
    { $sort: { sortOrder: 1, name: 1 } },
  ]);
};

module.exports = mongoose.model("Category", categorySchema);
