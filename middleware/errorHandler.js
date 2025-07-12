const logger = require("../utils/logger");
const ApiResponse = require("../utils/ApiResponse");
const config = require("../config");

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    return ApiResponse.notFound(res, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    return ApiResponse.conflict(res, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.validationError(res, message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    return ApiResponse.unauthorized(res, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    return ApiResponse.unauthorized(res, message);
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Don't leak error details in production
  const errorResponse =
    config.NODE_ENV === "production"
      ? { message: statusCode === 500 ? "Internal Server Error" : message }
      : { message, stack: err.stack };

  return ApiResponse.error(
    res,
    errorResponse.message,
    statusCode,
    config.NODE_ENV === "development" ? { stack: err.stack } : null
  );
};

module.exports = errorHandler;
