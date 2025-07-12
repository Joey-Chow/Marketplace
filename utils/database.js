const mongoose = require("mongoose");

class DatabaseManager {
  constructor() {
    this.connection = null;
  }

  // Connect to MongoDB
  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB Connected: ${this.connection.connection.host}`);

      // Set up connection event listeners
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      console.error("Database connection error:", error);
      process.exit(1);
    }
  }

  // Set up event listeners
  setupEventListeners() {
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  // Disconnect from MongoDB
  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  }

  // Get database statistics
  async getStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        database: mongoose.connection.name,
        collections: stats.collections,
        documents: stats.objects,
        dataSize: this.formatBytes(stats.dataSize),
        storageSize: this.formatBytes(stats.storageSize),
        indexes: stats.indexes,
        indexSize: this.formatBytes(stats.indexSize),
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      throw error;
    }
  }

  // List all collections
  async listCollections() {
    try {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      return collections.map((col) => col.name);
    } catch (error) {
      console.error("Error listing collections:", error);
      throw error;
    }
  }

  // Get collection stats
  async getCollectionStats(collectionName) {
    try {
      const stats = await mongoose.connection.db
        .collection(collectionName)
        .stats();
      return {
        collection: collectionName,
        documents: stats.count,
        avgDocSize: this.formatBytes(stats.avgObjSize),
        dataSize: this.formatBytes(stats.size),
        storageSize: this.formatBytes(stats.storageSize),
        indexes: stats.nindexes,
        indexSize: this.formatBytes(stats.totalIndexSize),
      };
    } catch (error) {
      console.error(
        `Error getting stats for collection ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Create indexes for better performance
  async createIndexes() {
    try {
      console.log("Creating database indexes...");

      // User indexes
      await mongoose.connection.db
        .collection("users")
        .createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db
        .collection("users")
        .createIndex({ username: 1 }, { unique: true });
      await mongoose.connection.db.collection("users").createIndex({ role: 1 });
      await mongoose.connection.db
        .collection("users")
        .createIndex({ "profile.firstName": 1, "profile.lastName": 1 });

      // Product indexes
      await mongoose.connection.db
        .collection("products")
        .createIndex({ name: "text", description: "text" });
      await mongoose.connection.db
        .collection("products")
        .createIndex({ category: 1 });
      await mongoose.connection.db
        .collection("products")
        .createIndex({ price: 1 });
      await mongoose.connection.db
        .collection("products")
        .createIndex({ sellerId: 1 });
      await mongoose.connection.db
        .collection("products")
        .createIndex({ createdAt: -1 });
      await mongoose.connection.db
        .collection("products")
        .createIndex({ "inventory.quantity": 1 });

      // Order indexes
      await mongoose.connection.db
        .collection("orders")
        .createIndex({ userId: 1 });
      await mongoose.connection.db
        .collection("orders")
        .createIndex({ status: 1 });
      await mongoose.connection.db
        .collection("orders")
        .createIndex({ createdAt: -1 });
      await mongoose.connection.db
        .collection("orders")
        .createIndex({ "items.productId": 1 });

      // Review indexes
      await mongoose.connection.db
        .collection("reviews")
        .createIndex({ productId: 1 });
      await mongoose.connection.db
        .collection("reviews")
        .createIndex({ userId: 1 });
      await mongoose.connection.db
        .collection("reviews")
        .createIndex({ rating: 1 });

      // Cart indexes
      await mongoose.connection.db
        .collection("carts")
        .createIndex({ userId: 1 }, { unique: true });
      await mongoose.connection.db
        .collection("carts")
        .createIndex({ "items.productId": 1 });

      // Category indexes
      await mongoose.connection.db
        .collection("categories")
        .createIndex({ name: 1 }, { unique: true });
      await mongoose.connection.db
        .collection("categories")
        .createIndex({ parentId: 1 });

      console.log("All indexes created successfully");
    } catch (error) {
      console.error("Error creating indexes:", error);
      throw error;
    }
  }

  // Drop all indexes (be careful with this)
  async dropIndexes(collectionName) {
    try {
      await mongoose.connection.db.collection(collectionName).dropIndexes();
      console.log(`Dropped all indexes for collection: ${collectionName}`);
    } catch (error) {
      console.error(`Error dropping indexes for ${collectionName}:`, error);
      throw error;
    }
  }

  // Backup database
  async backupDatabase() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = `./backups/marketplace-${timestamp}`;

      // This would typically use mongodump command
      console.log(`Backup would be created at: ${backupPath}`);

      // For now, we'll return collection data
      const collections = await this.listCollections();
      const backup = {};

      for (const collectionName of collections) {
        const data = await mongoose.connection.db
          .collection(collectionName)
          .find({})
          .toArray();
        backup[collectionName] = data;
      }

      return backup;
    } catch (error) {
      console.error("Error creating backup:", error);
      throw error;
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const ping = await mongoose.connection.db.admin().ping();
      const stats = await this.getStats();

      return {
        status: "healthy",
        ping: ping.ok === 1,
        connection: mongoose.connection.readyState === 1,
        database: stats.database,
        collections: stats.collections,
        documents: stats.documents,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  // Utility function to format bytes
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  // Advanced query examples
  async exampleQueries() {
    try {
      // Aggregation examples
      const topProducts = await mongoose.connection.db
        .collection("products")
        .aggregate([
          { $match: { "inventory.quantity": { $gt: 0 } } },
          { $sort: { averageRating: -1 } },
          { $limit: 10 },
          { $project: { name: 1, price: 1, averageRating: 1 } },
        ])
        .toArray();

      const userOrderSummary = await mongoose.connection.db
        .collection("orders")
        .aggregate([
          { $match: { status: "completed" } },
          {
            $group: {
              _id: "$userId",
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: "$totalAmount" },
              avgOrderValue: { $avg: "$totalAmount" },
            },
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 20 },
        ])
        .toArray();

      const monthlySales = await mongoose.connection.db
        .collection("orders")
        .aggregate([
          { $match: { status: "completed" } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              totalSales: { $sum: "$totalAmount" },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
        ])
        .toArray();

      return {
        topProducts,
        userOrderSummary,
        monthlySales,
      };
    } catch (error) {
      console.error("Error running example queries:", error);
      throw error;
    }
  }
}

module.exports = new DatabaseManager();
