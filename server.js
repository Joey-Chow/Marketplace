const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const databaseManager = require("./utils/database");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const cartRoutes = require("./routes/cart");
const dashboardRoutes = require("./routes/dashboard");
const dataViewerRoutes = require("./routes/dataViewer");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/auth");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Additional Safari-friendly headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(express.static("public"));

// Handle favicon.ico requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Connect to MongoDB using database manager
databaseManager
  .connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/data", dataViewerRoutes);

// Dashboard routes
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/simple-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "simple-dashboard.html"));
});

app.get("/debug", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "debug.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Database status endpoint
app.get("/api/db/status", async (req, res) => {
  try {
    const health = await databaseManager.healthCheck();
    const stats = await databaseManager.getStats();

    res.json({
      success: true,
      data: {
        health,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database status check failed",
      error: error.message,
    });
  }
});

// Database collections endpoint
app.get("/api/db/collections", async (req, res) => {
  try {
    const collections = await databaseManager.listCollections();

    res.json({
      success: true,
      data: { collections },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to list collections",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
