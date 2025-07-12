# 🛒 Marketplace - E-Commerce Platform

A full-stack e-commerce marketplace application built with **Node.js**, **Express**, **MongoDB**, and **React**. Features user authentication, product management, shopping cart functionality, order processing, and comprehensive data analytics.

## ✨ Features

### 🔐 Authentication & Authorization

- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Admin, Seller, Buyer)
- **User Profile Management** with seller store information
- **Secure Logout** with automatic redirection

### 📦 Product Management

- **CRUD Operations** for products with full validation
- **Category Organization** with hierarchical structure
- **Inventory Management** with stock tracking
- **Product Search & Filtering** capabilities
- **Image Support** with metadata storage

### 🛍️ Shopping Cart

- **Persistent Cart** storage across sessions
- **Real-time Price Calculations** with tax and shipping
- **Quantity Management** with stock validation
- **Cart Operations**: Add, Update, Remove, Clear
- **Dynamic Totals** with tax and shipping calculations

### 📊 Order Management

- **Complete Order Lifecycle** from cart to delivery
- **ACID Transactions** for data consistency
- **Multiple Payment Methods** support
- **Order Status Tracking** with real-time updates
- **Order History** and detailed receipts

### ⭐ Review System

- **Product Reviews** with 5-star ratings
- **Verified Purchase** reviews
- **Review Analytics** with average ratings
- **Seller Response** capabilities

### 📈 Analytics Dashboard

- **Real-time Sales Metrics** and revenue tracking
- **Interactive Charts** with Chart.js integration
- **Product Performance** analytics
- **User Activity** monitoring
- **Category Performance** insights

## 🏗️ Architecture

### Backend (Node.js/Express)

```
├── server.js              # Main application entry point
├── app.js                 # Express app configuration
├── config/                # Configuration files
│   ├── database.js        # MongoDB connection
│   └── index.js          # App settings
├── models/               # Mongoose schemas
│   ├── User.js           # User authentication & profiles
│   ├── Product.js        # Product catalog
│   ├── Cart.js           # Shopping cart
│   ├── Order.js          # Order management
│   ├── Review.js         # Product reviews
│   └── Category.js       # Product categories
├── routes/               # API endpoints
│   ├── auth.js           # Authentication
│   ├── products.js       # Product CRUD
│   ├── cart.js           # Cart operations
│   ├── orders.js         # Order processing
│   ├── reviews.js        # Review system
│   ├── users.js          # User management
│   └── dataViewer.js     # Analytics data
├── middleware/           # Custom middleware
│   ├── auth.js           # JWT verification
│   ├── errorHandler.js   # Error handling
│   └── security.js       # Security headers
├── services/             # Business logic
│   ├── CartService.js    # Cart operations
│   ├── OrderService.js   # Order processing
│   ├── ProductService.js # Product management
│   └── UserService.js    # User operations
└── utils/                # Helper utilities
    ├── ApiResponse.js    # Standardized responses
    ├── asyncHandler.js   # Async error handling
    ├── errors.js         # Custom error classes
    └── logger.js         # Application logging
```

### Frontend (React/Vanilla JS)

```
public/
├── index.html            # Main application page
├── dashboard.html        # Analytics dashboard
├── css/                  # Stylesheets
│   ├── main.css         # Main application styles
│   └── dashboard.css    # Dashboard-specific styles
└── js/
    ├── components/       # React components
    │   ├── AuthComponents.js     # Login/User info
    │   ├── DataViewer.js         # Main app component
    │   ├── SidebarComponents.js  # Navigation & forms
    │   └── DataViewerComponents.js # Data tables
    ├── hooks/            # React hooks
    │   ├── useAuth.js    # Authentication state
    │   ├── useCart.js    # Cart management
    │   └── useDataViewer.js # Data fetching
    └── utils/            # Utility functions
        └── DataUtils.js  # Data processing
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd marketplace
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file
   MONGODB_URI=mongodb://localhost:27017/marketplace
   JWT_SECRET=your-super-secure-jwt-secret-key
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB**

   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Windows/Linux
   mongod --dbpath /path/to/your/db
   ```

5. **Seed the database**

   ```bash
   node scripts/seedDatabase.js
   ```

6. **Start the server**

   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

7. **Access the application**
   - Main App: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard.html

## 👥 User Accounts

The seeded database includes these test accounts:

### Admin Account

- **Email**: `admin@marketplace.com`
- **Password**: `admin123`
- **Features**: Full system access, analytics dashboard, user management

### Seller Accounts

- **TechStore**: `tech@store.com` / `seller123`
- **Fashion**: `fashion@store.com` / `seller123`
- **Home**: `home@store.com` / `seller123`

### Buyer Account

- **Email**: `buyer1@email.com`
- **Password**: `buyer123`
- **Features**: Shopping, cart, orders, reviews

## 📊 Database Schema

### Collections Overview

- **40 Products** across 5 categories
- **24 Users** (1 admin, 3 sellers, 20 buyers)
- **6 Carts** with admin cart containing 20 items
- **40 Orders** with complete order history
- **25+ Reviews** with verified purchases
- **5 Categories** with hierarchical structure

### Key Features

- **Dynamic Pricing**: Real-time price calculations
- **Inventory Tracking**: Automatic stock management
- **ACID Transactions**: Data consistency for orders
- **Optimized Queries**: Indexed for performance

## 🔧 API Endpoints

### Authentication

```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user
PUT    /api/auth/profile     # Update profile
```

### Products

```
GET    /api/products         # List all products
GET    /api/products/:id     # Get product details
POST   /api/products         # Create product (sellers)
PUT    /api/products/:id     # Update product
DELETE /api/products/:id     # Delete product
```

### Shopping Cart

```
GET    /api/cart             # Get user's cart
POST   /api/cart/add         # Add item to cart
PUT    /api/cart/update      # Update item quantity
DELETE /api/cart/remove/:id  # Remove item
DELETE /api/cart/clear       # Clear entire cart
```

### Orders

```
GET    /api/orders           # List user's orders
GET    /api/orders/:id       # Get order details
POST   /api/orders           # Create new order
PUT    /api/orders/:id       # Update order status
```

### Data Analytics

```
GET    /api/dataViewer/overview    # Database overview
GET    /api/dataViewer/products    # Product analytics
GET    /api/dataViewer/orders      # Order analytics
GET    /api/dataViewer/analytics   # Sales analytics
GET    /api/dataViewer/search      # Search functionality
```

## 🎯 Application Features

### 🛍️ Shopping Experience

- **Product Browsing** with search and filters
- **Category Navigation** with intuitive UI
- **Shopping Cart** with persistent storage
- **Checkout Process** with order confirmation
- **Order Tracking** with status updates

### 👨‍💼 Seller Features

- **Product Management** with CRUD operations
- **Inventory Control** with stock tracking
- **Order Fulfillment** with status updates
- **Sales Analytics** and performance metrics
- **Store Profile** management

### 👑 Admin Features

- **User Management** across all roles
- **System Analytics** with comprehensive metrics
- **Data Visualization** with interactive charts
- **Content Moderation** for products and reviews
- **System Monitoring** and health checks

### 📱 User Interface

- **Responsive Design** for all devices
- **Intuitive Navigation** with sidebar menu
- **Real-time Updates** for cart and orders
- **Form Validation** with user feedback
- **Loading States** and error handling

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run seed       # Seed database with sample data
npm run clean      # Clean up carts and remove invalid data
```

### Database Management

```bash
# Seed database with sample data
node scripts/seedDatabase.js

# Clean up invalid cart items
node scripts/cleanupCarts.js

# Check cart contents
node scripts/checkCart.js
```

### Code Structure

- **MVC Pattern** with clear separation of concerns
- **Service Layer** for business logic
- **Middleware** for cross-cutting concerns
- **Error Handling** with custom error classes
- **Validation** with Joi schema validation

## 🔒 Security Features

### Authentication Security

- **JWT Tokens** with expiration
- **Password Hashing** with bcrypt
- **Token Verification** middleware
- **Secure Logout** with token cleanup

### Data Protection

- **Input Validation** with Joi
- **MongoDB Injection** prevention
- **XSS Protection** with sanitization
- **CORS Configuration** for cross-origin requests

### Access Control

- **Role-based Permissions** for all endpoints
- **Resource Ownership** validation
- **Admin-only Operations** protection

## 📈 Performance

### Database Optimization

- **Indexed Queries** for fast lookups
- **Optimized Aggregations** for analytics
- **Efficient Population** of related data
- **Connection Pooling** for scalability

### Caching Strategy

- **Local Storage** for user sessions
- **Memory Caching** for frequently accessed data
- **Query Result Caching** for analytics

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb
   # Restart if needed
   brew services restart mongodb-community
   ```

2. **JWT Token Issues**

   - Clear browser localStorage
   - Check token expiration
   - Verify JWT_SECRET environment variable

3. **Cart Operations Failing**

   - Run cart cleanup script
   - Check product availability
   - Verify user authentication

4. **Database Seeding Issues**
   - Ensure MongoDB is running
   - Check database permissions
   - Clear existing data if needed

### Debug Mode

```bash
DEBUG=marketplace:* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB** for flexible document storage
- **Express.js** for robust web framework
- **React** for dynamic user interfaces
- **Chart.js** for beautiful data visualizations
- **Joi** for comprehensive data validation

---

**Built with ❤️ for Database Management Systems**

_A comprehensive e-commerce platform demonstrating modern web development practices with MongoDB, Express, and React._
│ └── dashboard.html # Interactive dashboard
├── reports/ # Generated reports
├── server.js # Main application file
├── package.json # Dependencies
└── .env.example # Environment variables

````

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd marketplace
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**

   ```bash
   # Using MongoDB service
   brew services start mongodb/brew/mongodb-community

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database**

   ```bash
   npm run seed
   ```

6. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

7. **Access the application**
   - API: http://localhost:5000
   - Dashboard: http://localhost:5000/dashboard.html

## 🔐 Authentication

The system uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Accounts

- **Admin**: admin@marketplace.com / admin123
- **Seller**: tech@store.com / seller123
- **Buyer**: buyer1@email.com / buyer123

## 📊 Database Schema

### Collections Overview

1. **Users**: User accounts with role-based permissions
2. **Products**: Product catalog with inventory management
3. **Orders**: Transaction records with ACID compliance
4. **Reviews**: Customer feedback and ratings
5. **Categories**: Product categorization hierarchy
6. **Carts**: Shopping cart persistence

### Key Relationships

- Users → Products (seller relationship)
- Users → Orders (buyer relationship)
- Products → Reviews (product feedback)
- Orders → Reviews (verified purchases)
- Categories → Products (categorization)

## 🗄️ MongoDB Basic Commands

### Connecting to MongoDB

```bash
# Connect to local MongoDB instance
mongosh

# Connect to specific database
mongosh marketplace

# Connect with authentication
mongosh --username admin --password --authenticationDatabase admin
```

### Viewing Collections (Tables)

```javascript
// Show all databases
show dbs

// Switch to marketplace database
use marketplace

// Show all collections in current database
show collections

// List collections with more details
db.runCommand("listCollections")
```

### Viewing Collection Data

```javascript
// View all documents in a collection
db.products.find();

// View documents with pretty formatting
db.products.find().pretty();

// Count documents in collection
db.products.countDocuments();

// View first 5 documents
db.products.find().limit(5);

// View specific fields only
db.products.find({}, { name: 1, price: 1, _id: 0 });

// View with conditions
db.products.find({ price: { $gt: 50 } });

// Sort results
db.products.find().sort({ createdAt: -1 });
```

### Collection Stats and Info

```javascript
// Get collection statistics
db.products.stats();

// Get collection size
db.products.totalSize();

// View indexes on collection
db.products.getIndexes();

// Explain query execution
db.products.find({ category: "Electronics" }).explain();
```

### Useful Queries for This Marketplace

```javascript
// View all users by role
db.users.find({}, { username: 1, email: 1, role: 1 });

// View products with low inventory
db.products.find({ "inventory.quantity": { $lt: 10 } });

// View recent orders
db.orders.find().sort({ createdAt: -1 }).limit(10);

// View products by category
db.products.find({ "category.name": "Electronics" });

// View user order history
db.orders.find({ "buyer._id": ObjectId("USER_ID") });

// View product reviews with ratings
db.reviews.find({ rating: { $gte: 4 } });

// Count products by status
db.products.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
```

### Administrative Commands

```javascript
// Backup specific collection
mongodump --db marketplace --collection products

// Restore collection
mongorestore --db marketplace --collection products dump/marketplace/products.bson

// Drop collection (careful!)
db.products.drop()

// Create index
db.products.createIndex({ "category.name": 1 })

// Compact database
db.runCommand({ compact: "products" })
```

### Exit MongoDB Shell

```javascript
// Exit the MongoDB shell
exit;
```

## 🔄 ACID Transactions

Critical operations use MongoDB transactions to ensure data consistency:

### Order Creation

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Validate inventory
  // 2. Create order
  // 3. Update inventory
  // 4. Clear cart
  // 5. Update seller stats

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Rollback Scenarios

- Insufficient inventory
- Payment processing failure
- Database constraint violations
- Network timeouts

## 👥 Role-Based Access Control

### Buyer Permissions

- View products and categories
- Manage shopping cart
- Create and manage orders
- Write product reviews
- View personal dashboard

### Seller Permissions

- All buyer permissions
- Create and manage products
- View order details for their products
- Respond to product reviews
- Access seller analytics

### Admin Permissions

- All system permissions
- User management
- System-wide analytics
- Verify seller accounts
- Moderate content

## 📈 Advanced Aggregations

### 1. Top Selling Products

```javascript
Order.aggregate([
  { $match: { "payment.status": "completed" } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product",
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: {
        $sum: { $multiply: ["$items.price", "$items.quantity"] },
      },
    },
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 10 },
]);
```

### 2. User Purchase Patterns

```javascript
Order.aggregate([
  { $match: { "payment.status": "completed" } },
  {
    $group: {
      _id: "$buyer",
      totalOrders: { $sum: 1 },
      totalSpent: { $sum: "$pricing.total" },
      avgOrderValue: { $avg: "$pricing.total" },
    },
  },
  { $sort: { totalOrders: -1 } },
]);
```

### 3. Category Performance

```javascript
Order.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product",
      foreignField: "_id",
      as: "productInfo",
    },
  },
  {
    $group: {
      _id: "$productInfo.category",
      totalRevenue: { $sum: "$items.price" },
    },
  },
]);
```

### 4. Seller Analytics

```javascript
Order.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.seller",
      totalRevenue: { $sum: "$items.price" },
      totalOrders: { $sum: 1 },
    },
  },
  { $sort: { totalRevenue: -1 } },
]);
```

### 5. Review Analysis

```javascript
Review.aggregate([
  { $match: { status: "active" } },
  {
    $group: {
      _id: "$product",
      avgRating: { $avg: "$rating" },
      totalReviews: { $sum: 1 },
    },
  },
  { $sort: { avgRating: -1 } },
]);
```

## 🚀 Performance Optimization

### Indexing Strategy

- **Products**: Text search, category, price, seller, ratings
- **Orders**: Buyer, seller, date, status, payment status
- **Users**: Email, username, role, seller rating
- **Reviews**: Product, buyer, rating, date

### Query Optimization

- Compound indexes for common query patterns
- Text indexes for search functionality
- Sparse indexes for optional fields
- TTL indexes for temporary data

### Benchmarking

```bash
npm run benchmark
```

The benchmarking script tests query performance before and after indexing, providing detailed reports on:

- Query execution times
- Index effectiveness
- Performance recommendations
- Explain plan analysis

## 📊 Analytics Dashboard

The interactive dashboard provides real-time insights:

- Sales trends and revenue metrics
- Top-selling products and categories
- User activity and engagement
- Real-time order notifications
- Performance indicators

Access at: http://localhost:5000/dashboard.html

## 🔒 Security Features

### Authentication Security

- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Account lockout after failed attempts

### Data Security

- Input validation with Joi
- MongoDB injection prevention
- XSS protection
- CORS configuration
- Helmet security headers

### Role-Based Security

- Middleware-based authorization
- Resource-level permissions
- API endpoint protection
- Database-level access control

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products

- `GET /api/products` - List products (with filtering)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order (with ACID transaction)
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/payment` - Process payment

### Reviews

- `GET /api/reviews/product/:id` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark as helpful

### Cart

- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item

### Dashboard

- `GET /api/dashboard/analytics` - System analytics (admin)
- `GET /api/dashboard/seller` - Seller dashboard
- `GET /api/dashboard/buyer` - Buyer dashboard
- `GET /api/dashboard/recommendations` - Personalized recommendations

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Manual Testing

1. Use the seeded data for testing
2. Test authentication with provided credentials
3. Test CRUD operations through API
4. Verify ACID transactions during checkout
5. Check dashboard analytics

## 🚀 Deployment

### Production Checklist

- [ ] Set production environment variables
- [ ] Configure MongoDB replica set
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your-super-secure-secret
# ... other configuration
```

## 🔄 Data Replication & Sharding

### Replication Setup

```javascript
// MongoDB replica set configuration
rs.initiate({
  _id: "marketplaceReplSet",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" },
  ],
});
```

### Sharding Strategy

- **Products**: Shard by category for balanced distribution
- **Orders**: Shard by buyer ID for user-centric queries
- **Users**: Shard by geographic location

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [JWT Authentication](https://jwt.io/introduction/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Check MongoDB service status
2. **JWT Token Invalid**: Verify token format and expiration
3. **Permission Denied**: Check user roles and permissions
4. **Transaction Timeout**: Increase transaction timeout settings

### Debug Mode

```bash
DEBUG=marketplace:* npm run dev
```

## 📞 Support

For questions or issues, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Built with ❤️ for CS5200 Database Management Systems**
