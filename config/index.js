const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost/marketplace",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",

  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  // Rate limiting
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,

  // Security
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 12,

  // File upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB

  // Pagination
  DEFAULT_PAGE_SIZE: process.env.DEFAULT_PAGE_SIZE || 20,
  MAX_PAGE_SIZE: process.env.MAX_PAGE_SIZE || 100,
};

module.exports = config;
