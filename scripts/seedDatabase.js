const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Cart = require("../models/Cart");

// Sample data
const categories = [
  {
    name: "Electronics",
    description: "Electronic devices and gadgets",
    slug: "electronics",
    icon: "📱",
    level: 0,
    sortOrder: 1,
  },
  {
    name: "Clothing",
    description: "Fashion and apparel",
    slug: "clothing",
    icon: "👕",
    level: 0,
    sortOrder: 2,
  },
  {
    name: "Home & Garden",
    description: "Home improvement and garden supplies",
    slug: "home-garden",
    icon: "🏠",
    level: 0,
    sortOrder: 3,
  },
  {
    name: "Books",
    description: "Books and educational materials",
    slug: "books",
    icon: "📚",
    level: 0,
    sortOrder: 4,
  },
  {
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    slug: "sports-outdoors",
    icon: "⚽",
    level: 0,
    sortOrder: 5,
  },
];

const users = [
  // Admin user
  {
    username: "admin",
    email: "admin@marketplace.com",
    password: "admin123",
    role: "admin",
    profile: {
      firstName: "System",
      lastName: "Administrator",
    },
  },
  // Sellers
  {
    username: "techstore",
    email: "tech@store.com",
    password: "seller123",
    role: "seller",
    profile: {
      firstName: "John",
      lastName: "Tech",
      phone: "+1234567890",
    },
    sellerInfo: {
      storeName: "TechStore Electronics",
      storeDescription: "Premium electronics and gadgets",
      isVerified: true,
      rating: 4.5,
    },
  },
  {
    username: "fashionista",
    email: "fashion@store.com",
    password: "seller123",
    role: "seller",
    profile: {
      firstName: "Sarah",
      lastName: "Fashion",
      phone: "+1234567891",
    },
    sellerInfo: {
      storeName: "Fashionista Boutique",
      storeDescription: "Trendy clothing and accessories",
      isVerified: true,
      rating: 4.8,
    },
  },
  {
    username: "homemaker",
    email: "home@store.com",
    password: "seller123",
    role: "seller",
    profile: {
      firstName: "Mike",
      lastName: "Home",
      phone: "+1234567892",
    },
    sellerInfo: {
      storeName: "Home Sweet Home",
      storeDescription: "Home improvement and decoration",
      isVerified: true,
      rating: 4.3,
    },
  },
  // Buyers
  ...Array.from({ length: 20 }, (_, i) => ({
    username: `buyer${i + 1}`,
    email: `buyer${i + 1}@email.com`,
    password: "buyer123",
    role: "buyer",
    profile: {
      firstName: `Buyer${i + 1}`,
      lastName: `User`,
      phone: `+123456${(7900 + i).toString()}`,
    },
  })),
];

const products = [
  // Electronics
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    price: 999,
    inventory: { quantity: 50, lowStockThreshold: 10 },
    specifications: {
      brand: "Apple",
      model: "iPhone 15 Pro",
      color: "Space Black",
      warranty: "1 year",
    },
    tags: ["smartphone", "apple", "ios", "camera"],
    featured: true,
  },
  {
    name: "Samsung Galaxy S24",
    description: "Flagship Android phone with AI features",
    price: 899,
    inventory: { quantity: 45, lowStockThreshold: 10 },
    specifications: {
      brand: "Samsung",
      model: "Galaxy S24",
      color: "Phantom Black",
      warranty: "1 year",
    },
    tags: ["smartphone", "samsung", "android", "5g"],
  },
  {
    name: "MacBook Air M3",
    description: "Ultra-thin laptop with M3 chip and all-day battery",
    price: 1299,
    inventory: { quantity: 30, lowStockThreshold: 5 },
    specifications: {
      brand: "Apple",
      model: "MacBook Air",
      color: "Silver",
      warranty: "1 year",
    },
    tags: ["laptop", "apple", "macbook", "portable"],
  },
  // Clothing
  {
    name: "Premium Cotton T-Shirt",
    description: "Comfortable cotton t-shirt in various colors",
    price: 29.99,
    inventory: { quantity: 100, lowStockThreshold: 20 },
    specifications: {
      material: "Cotton",
      brand: "FashionBrand",
      color: "Navy Blue",
    },
    tags: ["clothing", "tshirt", "cotton", "casual"],
  },
  {
    name: "Denim Jeans",
    description: "Classic fit denim jeans for everyday wear",
    price: 79.99,
    inventory: { quantity: 80, lowStockThreshold: 15 },
    specifications: {
      material: "Denim",
      brand: "JeansCo",
      color: "Blue",
    },
    tags: ["clothing", "jeans", "denim", "casual"],
  },
  // Home & Garden
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with USB charging port",
    price: 49.99,
    inventory: { quantity: 60, lowStockThreshold: 12 },
    specifications: {
      brand: "LightTech",
      color: "Black",
      warranty: "2 years",
    },
    tags: ["lighting", "desk", "led", "home"],
  },
  // Add more products...
  ...Array.from({ length: 34 }, (_, i) => ({
    name: `Product ${i + 7}`,
    description: `High-quality description for product ${
      i + 7
    }. This is a sample product with great features and excellent value.`,
    price: Math.floor(Math.random() * 500) + 20,
    inventory: {
      quantity: Math.floor(Math.random() * 100) + 10,
      lowStockThreshold: Math.floor(Math.random() * 10) + 5,
    },
    specifications: {
      brand: `Brand${i + 7}`,
      model: `Model${i + 7}`,
      color: ["Black", "White", "Blue", "Red", "Green"][i % 5],
      warranty: "1 year",
    },
    tags: ["sample", "product", "test", "quality"],
  })),
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
    ]);

    // Create categories
    console.log("Creating categories...");
    const createdCategories = await Category.create(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create users
    console.log("Creating users...");
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create products
    console.log("Creating products...");
    const sellers = createdUsers.filter((user) => user.role === "seller");
    const productsWithSellers = products.map((product, index) => ({
      ...product,
      seller: sellers[index % sellers.length]._id,
      category: createdCategories[index % createdCategories.length]._id,
    }));

    const createdProducts = await Product.create(productsWithSellers);
    console.log(`Created ${createdProducts.length} products`);

    // Create some orders
    console.log("Creating sample orders...");
    const buyers = createdUsers.filter((user) => user.role === "buyer");
    const orders = [];

    for (let i = 0; i < 40; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const orderProducts = createdProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      const items = orderProducts.map((product) => ({
        product: product._id,
        seller: product.seller,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: product.price,
        productSnapshot: {
          name: product.name,
          description: product.description,
          image: "/images/products/placeholder.jpg", // Use placeholder for orders
          sku: product.inventory.sku,
        },
      }));

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * 0.08;
      const shipping = subtotal >= 50 ? 0 : 10;
      const total = subtotal + tax + shipping;

      orders.push({
        orderNumber: `ORD-${Date.now()}-${i.toString().padStart(3, "0")}`,
        buyer: buyer._id,
        items,
        pricing: { subtotal, tax, shipping, total },
        shippingAddress: {
          firstName: buyer.profile.firstName,
          lastName: buyer.profile.lastName,
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
          country: "USA",
        },
        payment: {
          method: "credit_card",
          status: Math.random() > 0.15 ? "completed" : "pending",
        },
        status:
          i < 30
            ? "delivered"
            : ["pending", "confirmed", "processing", "shipped", "delivered"][
                Math.floor(Math.random() * 5)
              ],
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      });
    }

    const createdOrders = await Order.create(orders);
    console.log(`Created ${createdOrders.length} orders`);

    // Create some reviews
    console.log("Creating sample reviews...");
    const completedOrders = createdOrders.filter(
      (order) =>
        order.status === "delivered" && order.payment.status === "completed"
    );

    const reviews = [];
    const minReviews = 25;
    const maxReviews = Math.max(
      minReviews,
      Math.min(75, completedOrders.length * 2)
    );

    for (let i = 0; i < maxReviews; i++) {
      const order =
        completedOrders[Math.floor(Math.random() * completedOrders.length)];
      const item = order.items[Math.floor(Math.random() * order.items.length)];

      // Check if review already exists
      const existingReview = reviews.find(
        (r) =>
          r.product.toString() === item.product.toString() &&
          r.buyer.toString() === order.buyer.toString()
      );

      if (!existingReview) {
        const reviewTitles = [
          "Great product!",
          "Excellent quality",
          "Highly recommended",
          "Perfect purchase",
          "Amazing value",
          "Love it!",
          "Fantastic item",
          "Very satisfied",
          "Outstanding product",
          "Wonderful experience",
        ];

        const reviewComments = [
          "This product exceeded my expectations. Highly recommended!",
          "Excellent quality and fast shipping. Will buy again!",
          "Perfect for what I needed. Great value for money.",
          "Amazing product! Exactly as described.",
          "Very happy with this purchase. Top quality!",
          "Fantastic item, works perfectly. 5 stars!",
          "Great customer service and product quality.",
          "Exceeded expectations. Highly recommend to others.",
          "Perfect condition and fast delivery. Thank you!",
          "Outstanding product quality. Will definitely order again.",
        ];

        const rating =
          Math.random() > 0.8
            ? Math.floor(Math.random() * 2) + 3
            : Math.floor(Math.random() * 2) + 4; // Mostly 4-5 stars

        reviews.push({
          product: item.product,
          buyer: order.buyer,
          order: order._id,
          rating: rating,
          title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
          comment:
            reviewComments[Math.floor(Math.random() * reviewComments.length)],
          verified: true,
          createdAt: new Date(
            order.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    const createdReviews = await Review.create(reviews);
    console.log(`Created ${createdReviews.length} reviews`);

    // Update product ratings
    console.log("Updating product ratings...");
    for (const product of createdProducts) {
      const productReviews = createdReviews.filter(
        (review) => review.product.toString() === product._id.toString()
      );

      if (productReviews.length > 0) {
        const avgRating =
          productReviews.reduce((sum, review) => sum + review.rating, 0) /
          productReviews.length;
        await Product.findByIdAndUpdate(product._id, {
          "ratings.average": Math.round(avgRating * 10) / 10,
          "ratings.count": productReviews.length,
        });
      }
    }

    // Create some carts with one cart having 20 items
    console.log("Creating sample carts...");
    const cartBuyers = buyers.slice(0, 5); // 5 buyers with carts
    const admin = createdUsers.find((user) => user.role === "admin"); // Get admin user
    const carts = [];

    // Create admin cart with 20 items
    if (admin) {
      const adminCartProducts = createdProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 20); // Admin gets 20 different items

      const adminItems = adminCartProducts.map((product) => ({
        product: product._id,
        quantity: Math.floor(Math.random() * 3) + 1,
        // Removed price field - using current pricing model
      }));

      carts.push({
        user: admin._id,
        items: adminItems,
        status: "active",
        totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
      });
    }

    // Create buyer carts with fewer items
    for (let i = 0; i < cartBuyers.length; i++) {
      const buyer = cartBuyers[i];
      const itemsPerCart = Math.floor(Math.random() * 4) + 2; // 2-5 items per cart

      const cartProducts = createdProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, itemsPerCart);

      const items = cartProducts.map((product) => ({
        product: product._id,
        quantity: Math.floor(Math.random() * 3) + 1,
        // Removed price field - using current pricing model
      }));

      carts.push({
        user: buyer._id,
        items,
        status: "active",
        totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
      });
    }

    const createdCarts = await Cart.create(carts);

    // Calculate totals for each cart using the new pricing model
    for (const cart of createdCarts) {
      await cart.calculateTotals();
      await cart.save();
    }

    console.log(
      `Created ${createdCarts.length} carts with ${createdCarts.reduce(
        (total, cart) => total + cart.items.length,
        0
      )} total items`
    );

    console.log("Database seeding completed successfully!");

    // Print summary
    console.log("\n=== SEEDING SUMMARY ===");
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Users: ${createdUsers.length}`);
    console.log(
      `  - Admin: ${createdUsers.filter((u) => u.role === "admin").length}`
    );
    console.log(
      `  - Sellers: ${createdUsers.filter((u) => u.role === "seller").length}`
    );
    console.log(
      `  - Buyers: ${createdUsers.filter((u) => u.role === "buyer").length}`
    );
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Orders: ${createdOrders.length}`);
    console.log(`Reviews: ${createdReviews.length}`);
    console.log(`Carts: ${createdCarts.length}`);

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Admin: admin@marketplace.com / admin123");
    console.log("Seller 1: tech@store.com / seller123");
    console.log("Seller 2: fashion@store.com / seller123");
    console.log("Seller 3: home@store.com / seller123");
    console.log("Buyer: buyer1@email.com / buyer123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
