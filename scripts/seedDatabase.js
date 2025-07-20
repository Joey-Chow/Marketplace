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
    images: [
      {
        url: "/images/products/iPhone 15 Pro1.jpg",
        alt: "iPhone 15 Pro",
      },
      {
        url: "/images/products/iPhone 15 Pro2.jpg",
        alt: "iPhone 15 Pro",
      },
      {
        url: "/images/products/iPhone 15 Pro3.jpg",
        alt: "iPhone 15 Pro",
      },
    ],
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
    images: [
      {
        url: "/images/products/Samsung Galaxy S24.jpg",
        alt: "Product Image",
        alt: "Samsung Galaxy S24",
      },
    ],
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
    images: [
      {
        url: "/images/products/MacBook Air M3.jpg",
        alt: "Product Image",
        alt: "MacBook Air M3",
      },
    ],
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
    images: [
      {
        url: "/images/products/Premium Cotton T-Shirt.jpg",
        alt: "Product Image",
        alt: "Premium Cotton T-Shirt",
      },
    ],
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
    images: [
      {
        url: "/images/products/Denim Jeans.jpg",
        alt: "Product Image",
        alt: "Denim Jeans",
      },
    ],
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
    images: [
      {
        url: "/images/products/LED Desk Lamp.jpg",
        alt: "Product Image",
        alt: "LED Desk Lamp",
      },
    ],
  },
  // Add more products with specific details and images
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation and 30-hour battery life",
    price: 199.99,
    inventory: { quantity: 75, lowStockThreshold: 15 },
    specifications: {
      brand: "AudioTech",
      model: "BT-3000",
      color: "Matte Black",
      warranty: "2 years",
    },
    tags: ["headphones", "bluetooth", "wireless", "noise-cancelling"],
    images: [
      {
        url: "/images/products/Wireless Bluetooth Headphones.jpg",
        alt: "Wireless Bluetooth Headphones",
      },
    ],
  },
  {
    name: "Gaming Mechanical Keyboard",
    description:
      "RGB backlit mechanical keyboard with cherry MX switches for gaming",
    price: 149.99,
    inventory: { quantity: 40, lowStockThreshold: 8 },
    specifications: {
      brand: "GameGear",
      model: "MK-RGB",
      color: "Black",
      warranty: "3 years",
    },
    tags: ["gaming", "keyboard", "mechanical", "rgb"],
    images: [
      {
        url: "/images/products/Gaming Mechanical Keyboard.jpg",
        alt: "Product Image",
        alt: "Gaming Mechanical Keyboard",
      },
    ],
  },
  {
    name: "4K Webcam",
    description:
      "Ultra HD webcam with auto-focus and built-in microphone for streaming",
    price: 89.99,
    inventory: { quantity: 60, lowStockThreshold: 12 },
    specifications: {
      brand: "StreamCam",
      model: "4K-PRO",
      color: "Black",
      warranty: "1 year",
    },
    tags: ["webcam", "4k", "streaming", "video"],
    images: [
      {
        url: "/images/products/4K Webcam.jpg",
        alt: "4K Webcam",
      },
    ],
  },
  {
    name: "Wireless Charging Pad",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices",
    price: 34.99,
    inventory: { quantity: 120, lowStockThreshold: 25 },
    specifications: {
      brand: "ChargeTech",
      model: "QI-15W",
      color: "White",
      warranty: "1 year",
    },
    tags: ["wireless", "charging", "qi", "fast-charge"],
    images: [
      {
        url: "/images/products/Wireless Charging Pad.jpg",
        alt: "Wireless Charging Pad",
      },
    ],
  },
  {
    name: "Bluetooth Speaker",
    description:
      "Portable waterproof speaker with 360-degree sound and 12-hour battery",
    price: 79.99,
    inventory: { quantity: 85, lowStockThreshold: 18 },
    specifications: {
      brand: "SoundWave",
      model: "360-BT",
      color: "Ocean Blue",
      warranty: "1 year",
    },
    tags: ["speaker", "bluetooth", "portable", "waterproof"],
    images: [
      {
        url: "/images/products/Bluetooth Speaker.jpg",
        alt: "Bluetooth Speaker",
      },
    ],
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitor and GPS connectivity",
    price: 249.99,
    inventory: { quantity: 35, lowStockThreshold: 7 },
    specifications: {
      brand: "FitTech",
      model: "SW-100",
      color: "Space Gray",
      warranty: "1 year",
    },
    tags: ["smartwatch", "fitness", "gps", "health"],
    images: [
      {
        url: "/images/products/Smart Watch.jpg",
        alt: "Smart Watch",
      },
    ],
  },
  {
    name: "Leather Jacket",
    description:
      "Genuine leather jacket with classic design and premium finish",
    price: 299.99,
    inventory: { quantity: 25, lowStockThreshold: 5 },
    specifications: {
      material: "Genuine Leather",
      brand: "LeatherCraft",
      color: "Brown",
      size: "L",
    },
    tags: ["jacket", "leather", "fashion", "premium"],
    images: [
      {
        url: "/images/products/Leather Jacket.jpg",
        alt: "Leather Jacket",
      },
    ],
  },
  {
    name: "Running Sneakers",
    description:
      "Lightweight running shoes with advanced cushioning technology",
    price: 129.99,
    inventory: { quantity: 90, lowStockThreshold: 20 },
    specifications: {
      brand: "RunFast",
      model: "RF-2024",
      color: "Black/White",
      size: "US 9",
    },
    tags: ["shoes", "running", "sports", "comfortable"],
    images: [
      {
        url: "/images/products/Running Sneakers.jpg",
        alt: "Running Sneakers",
      },
    ],
  },
  {
    name: "Wool Sweater",
    description: "Cozy merino wool sweater perfect for cold weather",
    price: 89.99,
    inventory: { quantity: 55, lowStockThreshold: 12 },
    specifications: {
      material: "Merino Wool",
      brand: "WoolWear",
      color: "Charcoal Gray",
      size: "M",
    },
    tags: ["sweater", "wool", "warm", "winter"],
    images: [
      {
        url: "/images/products/Wool Sweater.jpg",
        alt: "Wool Sweater",
      },
    ],
  },
  {
    name: "Casual Dress",
    description: "Elegant casual dress suitable for work and social events",
    price: 69.99,
    inventory: { quantity: 40, lowStockThreshold: 8 },
    specifications: {
      material: "Cotton Blend",
      brand: "ElegantWear",
      color: "Navy Blue",
      size: "S",
    },
    tags: ["dress", "casual", "elegant", "work"],
    images: [
      {
        url: "/images/products/Casual Dress.jpg",
        alt: "Casual Dress",
      },
    ],
  },
  {
    name: "Coffee Maker",
    description:
      "Programmable coffee maker with thermal carafe and auto-brew timer",
    price: 159.99,
    inventory: { quantity: 30, lowStockThreshold: 6 },
    specifications: {
      brand: "BrewMaster",
      model: "CM-2000",
      color: "Stainless Steel",
      warranty: "2 years",
    },
    tags: ["coffee", "kitchen", "appliance", "programmable"],
    images: [
      {
        url: "/images/products/Coffee Maker.jpg",
        alt: "Coffee Maker",
      },
    ],
  },
  {
    name: "Air Purifier",
    description: "HEPA air purifier with smart sensors and quiet operation",
    price: 199.99,
    inventory: { quantity: 45, lowStockThreshold: 10 },
    specifications: {
      brand: "PureAir",
      model: "AP-HEPA",
      color: "White",
      warranty: "3 years",
    },
    tags: ["air-purifier", "hepa", "smart", "home"],
    images: [
      {
        url: "/images/products/Air Purifier.jpg",
        alt: "Air Purifier",
      },
    ],
  },
  {
    name: "Yoga Mat",
    description:
      "Non-slip yoga mat with extra thickness for comfort and stability",
    price: 39.99,
    inventory: { quantity: 100, lowStockThreshold: 20 },
    specifications: {
      brand: "YogaPlus",
      model: "YM-PRO",
      color: "Purple",
      thickness: "6mm",
    },
    tags: ["yoga", "fitness", "exercise", "mat"],
    images: [{ url: "/images/products/Yoga Mat.jpg", alt: "Yoga Mat" }],
  },
  {
    name: "Ceramic Dinnerware Set",
    description: "16-piece ceramic dinnerware set perfect for family dining",
    price: 89.99,
    inventory: { quantity: 25, lowStockThreshold: 5 },
    specifications: {
      brand: "TableCraft",
      material: "Ceramic",
      color: "White",
      pieces: "16",
    },
    tags: ["dinnerware", "ceramic", "kitchen", "dining"],
    images: [
      {
        url: "/images/products/Ceramic Dinnerware Set.jpg",
        alt: "Ceramic Dinnerware Set",
      },
    ],
  },
  {
    name: "Garden Tool Set",
    description: "Complete 10-piece garden tool set with ergonomic handles",
    price: 79.99,
    inventory: { quantity: 35, lowStockThreshold: 8 },
    specifications: {
      brand: "GardenPro",
      material: "Steel",
      color: "Green/Silver",
      pieces: "10",
    },
    tags: ["garden", "tools", "outdoor", "gardening"],
    images: [
      {
        url: "/images/products/Garden Tool Set.jpg",
        alt: "Garden Tool Set",
      },
    ],
  },
  {
    name: "Throw Pillow Set",
    description: "Decorative throw pillow set with removable covers",
    price: 49.99,
    inventory: { quantity: 70, lowStockThreshold: 15 },
    specifications: {
      brand: "HomeDecor",
      material: "Cotton",
      color: "Beige",
      size: "18x18 inches",
    },
    tags: ["pillows", "home-decor", "comfort", "living-room"],
    images: [
      {
        url: "/images/products/Throw Pillow Set.jpg",
        alt: "Throw Pillow Set",
      },
    ],
  },
  {
    name: "Science Fiction Novel",
    description:
      "Bestselling sci-fi novel about space exploration and alien encounters",
    price: 14.99,
    inventory: { quantity: 150, lowStockThreshold: 30 },
    specifications: {
      author: "Alex Future",
      publisher: "Galaxy Books",
      pages: "342",
      format: "Paperback",
    },
    tags: ["book", "science-fiction", "novel", "bestseller"],
    images: [
      {
        url: "/images/products/Science Fiction Novel.jpg",
        alt: "Science Fiction Novel",
      },
    ],
  },
  {
    name: "Cookbook Collection",
    description:
      "Essential cookbook with 200 healthy recipes for everyday cooking",
    price: 24.99,
    inventory: { quantity: 80, lowStockThreshold: 16 },
    specifications: {
      author: "Chef Maria",
      publisher: "Culinary Press",
      pages: "288",
      format: "Hardcover",
    },
    tags: ["cookbook", "recipes", "cooking", "healthy"],
    images: [
      {
        url: "/images/products/Cookbook Collection.jpg",
        alt: "Cookbook Collection",
      },
    ],
  },
  {
    name: "Business Guide",
    description:
      "Comprehensive guide to starting and growing a successful business",
    price: 19.99,
    inventory: { quantity: 60, lowStockThreshold: 12 },
    specifications: {
      author: "John Success",
      publisher: "Business Books",
      pages: "256",
      format: "Paperback",
    },
    tags: ["business", "guide", "entrepreneurship", "success"],
    images: [
      {
        url: "/images/products/Business Guide.jpg",
        alt: "Business Guide",
      },
    ],
  },
  {
    name: "Photography Handbook",
    description:
      "Complete handbook for digital photography techniques and tips",
    price: 29.99,
    inventory: { quantity: 45, lowStockThreshold: 10 },
    specifications: {
      author: "Sarah Lens",
      publisher: "Photo Press",
      pages: "320",
      format: "Paperback",
    },
    tags: ["photography", "handbook", "digital", "techniques"],
    images: [
      {
        url: "/images/products/Photography Handbook.jpg",
        alt: "Photography Handbook",
      },
    ],
  },
  {
    name: "Basketball",
    description: "Official size basketball with superior grip and durability",
    price: 29.99,
    inventory: { quantity: 50, lowStockThreshold: 10 },
    specifications: {
      brand: "SportsPro",
      size: "Official",
      material: "Leather",
      color: "Orange",
    },
    tags: ["basketball", "sports", "outdoor", "recreation"],
    images: [
      {
        url: "/images/products/Basketball.jpg",
        alt: "Basketball",
      },
    ],
  },
  {
    name: "Camping Tent",
    description: "4-person waterproof camping tent with easy setup system",
    price: 149.99,
    inventory: { quantity: 20, lowStockThreshold: 4 },
    specifications: {
      brand: "OutdoorGear",
      capacity: "4 person",
      material: "Polyester",
      color: "Green",
    },
    tags: ["camping", "tent", "outdoor", "waterproof"],
    images: [
      {
        url: "/images/products/Camping Tent.jpg",
        alt: "Camping Tent",
      },
    ],
  },
  {
    name: "Fishing Rod Set",
    description: "Complete fishing rod set with reel, line, and tackle box",
    price: 89.99,
    inventory: { quantity: 25, lowStockThreshold: 5 },
    specifications: {
      brand: "FishMaster",
      length: "6.5 feet",
      material: "Carbon Fiber",
      color: "Black/Blue",
    },
    tags: ["fishing", "rod", "outdoor", "recreation"],
    images: [
      {
        url: "/images/products/Fishing Rod Set.jpg",
        alt: "Fishing Rod Set",
      },
    ],
  },
  {
    name: "Hiking Backpack",
    description:
      "40L hiking backpack with multiple compartments and hydration system",
    price: 119.99,
    inventory: { quantity: 35, lowStockThreshold: 8 },
    specifications: {
      brand: "TrailBlaze",
      capacity: "40L",
      material: "Nylon",
      color: "Forest Green",
    },
    tags: ["backpack", "hiking", "outdoor", "travel"],
    images: [
      {
        url: "/images/products/Hiking Backpack.jpg",
        alt: "Hiking Backpack",
      },
    ],
  },
  {
    name: "Dumbbells Set",
    description: "Adjustable dumbbell set with multiple weight options",
    price: 199.99,
    inventory: { quantity: 30, lowStockThreshold: 6 },
    specifications: {
      brand: "FitnessPro",
      material: "Steel",
      color: "Black",
    },
    tags: ["dumbbells", "fitness", "exercise", "strength"],
    images: [
      {
        url: "/images/products/Dumbbells Set.jpg",
        alt: "Dumbbells Set",
      },
    ],
  },
  {
    name: "Bike Helmet",
    description:
      "Lightweight cycling helmet with ventilation and LED safety light",
    price: 59.99,
    inventory: { quantity: 40, lowStockThreshold: 8 },
    specifications: {
      brand: "SafeRide",
      size: "Medium",
      material: "Polycarbonate",
      color: "Red",
    },
    tags: ["helmet", "cycling", "safety", "bike"],
    images: [
      {
        url: "/images/products/Bike Helmet.jpg",
        alt: "Bike Helmet",
      },
    ],
  },
  {
    name: "Tennis Racket",
    description:
      "Professional tennis racket with carbon fiber frame and premium strings",
    price: 179.99,
    inventory: { quantity: 20, lowStockThreshold: 4 },
    specifications: {
      brand: "TennisPro",
      material: "Carbon Fiber",
      color: "Black/Yellow",
    },
    tags: ["tennis", "racket", "sports", "professional"],
    images: [
      {
        url: "/images/products/Tennis Racket.jpg",
        alt: "Tennis Racket",
      },
    ],
  },
  {
    name: "Water Bottle",
    description:
      "Insulated stainless steel water bottle keeps drinks cold for 24 hours",
    price: 24.99,
    inventory: { quantity: 100, lowStockThreshold: 20 },
    specifications: {
      brand: "HydroTech",
      capacity: "32oz",
      material: "Stainless Steel",
      color: "Blue",
    },
    tags: ["water-bottle", "insulated", "hydration", "outdoor"],
    images: [
      {
        url: "/images/products/Water Bottle.jpg",
        alt: "Water Bottle",
      },
    ],
  },
  {
    name: "Skateboard",
    description:
      "Complete skateboard with maple deck and high-quality bearings",
    price: 89.99,
    inventory: { quantity: 25, lowStockThreshold: 5 },
    specifications: {
      brand: "SkateLife",
      deck: "Maple Wood",
      size: "31 inches",
      color: "Multi-Color",
    },
    tags: ["skateboard", "sports", "recreation", "youth"],
    images: [
      {
        url: "/images/products/Skateboard.jpg",
        alt: "Skateboard",
      },
    ],
  },
  {
    name: "Golf Club Set",
    description:
      "Complete golf club set with bag and accessories for beginners",
    price: 299.99,
    inventory: { quantity: 15, lowStockThreshold: 3 },
    specifications: {
      brand: "GolfPro",
      clubs: "11 piece",
      material: "Steel/Graphite",
      color: "Black/Silver",
    },
    tags: ["golf", "clubs", "sports", "beginner"],
    images: [
      {
        url: "/images/products/Golf Club Set.jpg",
        alt: "Golf Club Set",
      },
    ],
  },
  {
    name: "Soccer Ball",
    description:
      "FIFA approved soccer ball with traditional design and superior flight",
    price: 39.99,
    inventory: { quantity: 60, lowStockThreshold: 12 },
    specifications: {
      brand: "SoccerWorld",
      size: "Size 5",
      material: "Synthetic Leather",
      color: "Black/White",
    },
    tags: ["soccer", "ball", "sports", "fifa"],
    images: [
      {
        url: "/images/products/Soccer Ball.jpg",
        alt: "Soccer Ball",
      },
    ],
  },
  {
    name: "Resistance Bands",
    description:
      "Exercise resistance bands set with multiple resistance levels",
    price: 29.99,
    inventory: { quantity: 80, lowStockThreshold: 16 },
    specifications: {
      brand: "FitBands",
      resistance: "Light-Heavy",
      material: "Latex",
      color: "Multi-Color",
    },
    tags: ["resistance-bands", "fitness", "exercise", "portable"],
    images: [
      {
        url: "/images/products/Resistance Bands.jpg",
        alt: "Resistance Bands",
      },
    ],
  },
  {
    name: "Badminton Set",
    description: "Complete badminton set with rackets, net, and shuttlecocks",
    price: 69.99,
    inventory: { quantity: 30, lowStockThreshold: 6 },
    specifications: {
      brand: "BadmintonPro",
      rackets: "4 piece",
      material: "Aluminum",
      color: "Blue/White",
    },
    tags: ["badminton", "sports", "outdoor", "recreation"],
    images: [
      {
        url: "/images/products/Badminton Set.jpg",
        alt: "Badminton Set",
      },
    ],
  },
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

    // Helper function to get random product images
    const getRandomProductImages = () => {
      const fs = require("fs");
      const path = require("path");
      const imagesDir = path.join(__dirname, "../public/images/products");

      try {
        const allFiles = fs.readdirSync(imagesDir);
        const productFiles = allFiles.filter((file) =>
          file.startsWith("product-")
        );

        // Randomly select 2 images
        const randomImages = [];
        const shuffled = productFiles.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);

        return selected.map((filename) => ({
          url: `/images/products/${filename}`,
          alt: `Product Image ${filename.split("-")[1]}`,
        }));
      } catch (error) {
        console.log(
          "Could not read product images directory, using placeholders"
        );
        return [
          { url: "/images/products/placeholder.jpg", alt: "Product Image 1" },
          { url: "/images/products/placeholder.jpg", alt: "Product Image 2" },
        ];
      }
    };

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
    const productsWithSellers = products.map((product, index) => {
      // Add 2 additional random product images to each product
      const additionalImages = getRandomProductImages();
      const updatedImages = [...product.images, ...additionalImages];

      return {
        ...product,
        images: updatedImages,
        seller: sellers[index % sellers.length]._id,
        category: createdCategories[index % createdCategories.length]._id,
      };
    });

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
          images: [
            { url: "/images/products/placeholder.jpg", alt: "Product Image" },
          ], // Use placeholder for orders
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

    // Create some reviews - 3 reviews per product
    console.log("Creating sample reviews...");
    const completedOrders = createdOrders.filter(
      (order) =>
        order.status === "delivered" && order.payment.status === "completed"
    );

    const reviews = [];
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
      "Good value for money",
      "Works as expected",
      "Nice quality",
      "Solid product",
      "Happy with purchase",
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
      "Good build quality and arrived quickly.",
      "Works well and looks great.",
      "Solid construction and fair price.",
      "Does exactly what it's supposed to do.",
      "Nice addition to my collection.",
    ];

    // Generate exactly 3 reviews per product with unique buyers
    for (
      let productIndex = 0;
      productIndex < createdProducts.length;
      productIndex++
    ) {
      const product = createdProducts[productIndex];

      for (let reviewIndex = 0; reviewIndex < 3; reviewIndex++) {
        // Get a unique buyer for each review (cycle through buyers to ensure uniqueness)
        const buyerIndex = (productIndex * 3 + reviewIndex) % buyers.length;
        const buyer = buyers[buyerIndex];

        // Find a completed order from this buyer (or create a fictional one)
        let order = completedOrders.find(
          (o) => o.buyer.toString() === buyer._id.toString()
        );
        if (!order && completedOrders.length > 0) {
          order =
            completedOrders[Math.floor(Math.random() * completedOrders.length)];
        }

        const rating =
          Math.random() > 0.8
            ? Math.floor(Math.random() * 2) + 3
            : Math.floor(Math.random() * 2) + 4; // Mostly 4-5 stars

        reviews.push({
          product: product._id,
          buyer: buyer._id,
          order: order ? order._id : null,
          rating: rating,
          title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
          comment:
            reviewComments[Math.floor(Math.random() * reviewComments.length)],
          verified: order ? true : false,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
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
