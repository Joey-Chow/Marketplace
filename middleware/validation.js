const Joi = require("joi");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Validation middleware factory
 */
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      return res
        .status(500)
        .json(ApiResponse.error("Validation schema not found", 500));
    }

    const { error } = schema.validate(req.body);

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res
        .status(400)
        .json(new ApiResponse(400, details, "Validation failed", false));
    }

    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User validation
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("buyer", "seller", "admin").default("buyer"),
    profile: Joi.object({
      firstName: Joi.string().max(50),
      lastName: Joi.string().max(50),
      phone: Joi.string().pattern(/^[0-9+\-\s()]+$/),
      address: Joi.object({
        street: Joi.string().max(100),
        city: Joi.string().max(50),
        state: Joi.string().max(50),
        zipCode: Joi.string().max(20),
        country: Joi.string().max(50),
      }),
    }),
    sellerInfo: Joi.object({
      storeName: Joi.string().max(100),
      storeDescription: Joi.string().max(500),
      taxId: Joi.string().max(50),
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    profile: Joi.object({
      firstName: Joi.string().max(50),
      lastName: Joi.string().max(50),
      phone: Joi.string().pattern(/^[0-9+\-\s()]+$/),
      address: Joi.object({
        street: Joi.string().max(100),
        city: Joi.string().max(50),
        state: Joi.string().max(50),
        zipCode: Joi.string().max(20),
        country: Joi.string().max(50),
      }),
    }),
    sellerInfo: Joi.object({
      storeName: Joi.string().max(100),
      storeDescription: Joi.string().max(500),
      taxId: Joi.string().max(50),
    }),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
      }),
      currency: Joi.string().max(3),
      language: Joi.string().max(10),
    }),
  }),

  updateUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    role: Joi.string().valid("buyer", "seller", "admin"),
    isActive: Joi.boolean(),
    profile: Joi.object({
      firstName: Joi.string().max(50),
      lastName: Joi.string().max(50),
      phone: Joi.string().pattern(/^[0-9+\-\s()]+$/),
      address: Joi.object({
        street: Joi.string().max(100),
        city: Joi.string().max(50),
        state: Joi.string().max(50),
        zipCode: Joi.string().max(20),
        country: Joi.string().max(50),
      }),
    }),
  }),

  // Product validation
  createProduct: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().max(2000).allow(""),
    price: Joi.number().min(0).required(),
    category: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Category must be a valid category ID",
      }),
    images: Joi.array().items(Joi.string().uri()),
    stock: Joi.number().min(0).required(),
    sku: Joi.string().max(100),
    brand: Joi.string().max(100),
    weight: Joi.number().min(0),
    dimensions: Joi.object({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
    }),
    tags: Joi.array().items(Joi.string().max(50)),
    features: Joi.array().items(Joi.string().max(200)),
  }),

  updateProduct: Joi.object({
    name: Joi.string().max(200),
    description: Joi.string().max(2000).allow(""),
    price: Joi.number().min(0),
    category: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Category must be a valid category ID",
      }),
    images: Joi.array().items(Joi.string().uri()),
    stock: Joi.number().min(0),
    sku: Joi.string().max(100),
    brand: Joi.string().max(100),
    weight: Joi.number().min(0),
    dimensions: Joi.object({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
    }),
    tags: Joi.array().items(Joi.string().max(50)),
    features: Joi.array().items(Joi.string().max(200)),
    status: Joi.string().valid("active", "inactive", "draft"),
  }),

  updateStock: Joi.object({
    stock: Joi.number().min(0).required(),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid("active", "inactive", "draft").required(),
  }),

  // Cart validation
  addToCart: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
  }),

  updateCart: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
  }),

  updateCartItem: Joi.object({
    quantity: Joi.number().min(0).required(),
  }),

  // Order validation
  createOrder: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().max(100).required(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      zipCode: Joi.string().max(20).required(),
      country: Joi.string().max(50).required(),
    }).required(),
    paymentMethod: Joi.string()
      .valid("credit_card", "paypal", "cash_on_delivery")
      .default("pending"),
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
      .required(),
  }),

  // Review validation
  createReview: Joi.object({
    product: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).required(),
  }),

  updateReview: Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().max(1000),
  }),

  // Category validation
  createCategory: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500),
  }),

  updateCategory: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().max(500),
  }),
};

module.exports = { validate, schemas };
