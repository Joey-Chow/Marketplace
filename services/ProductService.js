const Product = require("../models/Product");
const Category = require("../models/Category");
const {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} = require("../utils/errors");

/**
 * Product service layer
 */
class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(productData, sellerId) {
    // Verify category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      throw new ValidationError("Category not found");
    }

    // Transform stock field to inventory.quantity if present
    const transformedData = { ...productData };
    if (transformedData.stock !== undefined) {
      transformedData.inventory = {
        quantity: transformedData.stock,
      };
      delete transformedData.stock;
    }

    const product = await Product.create({
      ...transformedData,
      seller: sellerId,
    });

    await product.populate("seller", "username sellerInfo.storeName");
    await product.populate("category", "name icon");

    return product;
  }

  /**
   * Get all products with filters and pagination
   */
  static async getProducts(
    filters = {},
    page = 1,
    limit = 20,
    sort = "-createdAt"
  ) {
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: "active", ...filters };

    // Handle price range
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      delete query.minPrice;
      delete query.maxPrice;
    }

    // Handle search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
      ];
      delete query.search;
    }

    const products = await Product.find(query)
      .populate("seller", "username sellerInfo.storeName")
      .populate("category", "name icon")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by ID
   */
  static async getProductById(id) {
    const product = await Product.findById(id)
      .populate("seller", "username sellerInfo.storeName")
      .populate("category", "name icon");

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  }

  /**
   * Update product
   */
  static async updateProduct(id, updateData, userId, userRole) {
    const product = await Product.findById(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check authorization
    if (userRole !== "admin" && product.seller.toString() !== userId) {
      throw new AuthorizationError("Not authorized to update this product");
    }

    // Verify category if being updated
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        throw new ValidationError("Category not found");
      }
    }

    // Transform stock field to inventory.quantity if present
    const transformedData = { ...updateData };
    if (transformedData.stock !== undefined) {
      transformedData.inventory = {
        ...product.inventory,
        quantity: transformedData.stock,
      };
      delete transformedData.stock;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      transformedData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("seller", "username sellerInfo.storeName")
      .populate("category", "name icon");

    return updatedProduct;
  }

  /**
   * Delete product
   */
  static async deleteProduct(id, userId, userRole) {
    const product = await Product.findById(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check authorization
    if (userRole !== "admin" && product.seller.toString() !== userId) {
      throw new AuthorizationError("Not authorized to delete this product");
    }

    await Product.findByIdAndDelete(id);

    return { message: "Product deleted successfully" };
  }

  /**
   * Get products by seller
   */
  static async getProductsBySeller(sellerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: sellerId })
      .populate("category", "name icon")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ seller: sellerId });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const products = await Product.find({
      category: categoryId,
      status: "active",
    })
      .populate("seller", "username sellerInfo.storeName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      category: categoryId,
      status: "active",
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search products
   */
  static async searchProducts(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const searchQuery = {
      $and: [
        { status: "active" },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $in: [new RegExp(query, "i")] } },
          ],
        },
      ],
    };

    const products = await Product.find(searchQuery)
      .populate("seller", "username sellerInfo.storeName")
      .populate("category", "name icon")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(searchQuery);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 10) {
    const products = await Product.find({
      featured: true,
      status: "active",
    })
      .populate("seller", "username sellerInfo.storeName")
      .populate("category", "name icon")
      .limit(limit)
      .sort({ createdAt: -1 });

    return products;
  }

  /**
   * Update inventory
   */
  static async updateInventory(productId, quantity, userId, userRole) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check authorization
    if (userRole !== "admin" && product.seller.toString() !== userId) {
      throw new AuthorizationError("Not authorized to update this product");
    }

    product.inventory.quantity = quantity;
    await product.save();

    return product;
  }
}

module.exports = ProductService;
