const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const express = require("express");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Security middleware configuration
 */
const securityMiddleware = (app) => {
  // Trust proxy
  app.set("trust proxy", 1);

  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://unpkg.com",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdnjs.cloudflare.com",
          ],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://fonts.googleapis.com",
          ],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })
  );

  // CORS
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Body parser middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent HTTP Parameter Pollution
  app.use(
    hpp({
      whitelist: ["tags", "category", "sort", "fields", "page", "limit"],
    })
  );

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
};

module.exports = securityMiddleware;
