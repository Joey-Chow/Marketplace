# Marketplace Application Architecture

This document provides a comprehensive overview of the marketplace application architecture, including the relationships between frontend, backend, server layer, service layer, and database components.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                        │
│                            (Client-Side / Browser)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐         │
│  │   HTML Pages     │    │  React Components│    │     JavaScript    │         │
│  │                  │    │                  │    │                   │         │
│  │ • index.html     │    │ • ProductsView   │    │ • useProductCRUD  │         │
│  │ • Users.html     │    │ • UsersView      │    │ • DataUtils       │         │
│  │ • Orders.html    │    │ • OrdersView     │    │ • API calls       │         │
│  │ • Reviews.html   │    │ • ReviewsView    │    │ • Form handling   │         │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘         │
│                                                                                 │
│                                    │                                           │
│                            HTTP Requests                                       │
│                         (POST, GET, PUT, DELETE)                              │
│                                    │                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND                                         │
│                            (Server-Side / Node.js)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVER LAYER                                    │   │
│  │                      (Express.js Application)                           │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │   Middleware    │  │     Routes      │  │   Controllers   │         │   │
│  │  │                 │  │                 │  │                 │         │   │
│  │  │ • auth.js       │  │ • products.js   │  │ • router.post() │         │   │
│  │  │ • authorize()   │  │ • users.js      │  │ • router.get()  │         │   │
│  │  │ • asyncHandler  │  │ • orders.js     │  │ • router.put()  │         │   │
│  │  │ • validation    │  │ • reviews.js    │  │ • router.delete │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                              Calls Service                                     │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        SERVICE LAYER                                    │   │
│  │                       (Business Logic)                                  │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ ProductService  │  │  UserService    │  │  OrderService   │         │   │
│  │  │                 │  │                 │  │                 │         │   │
│  │  │ • createProduct │  │ • getUsers      │  │ • getUserOrders │         │   │
│  │  │ • getProducts   │  │ • getUserById   │  │ • getAllOrders  │         │   │
│  │  │ • updateProduct │  │ • updateUser    │  │ • createOrder   │         │   │
│  │  │ • deleteProduct │  │ • deleteUser    │  │ • updateOrder   │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                            Database Queries                                    │
│                                    │                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                DATABASE                                         │
│                              (MongoDB)                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Collections   │  │     Models      │  │   Operations    │                 │
│  │                 │  │                 │  │                 │                 │
│  │ • products      │  │ • Product.js    │  │ • find()        │                 │
│  │ • users         │  │ • User.js       │  │ • findById()    │                 │
│  │ • orders        │  │ • Order.js      │  │ • create()      │                 │
│  │ • reviews       │  │ • Review.js     │  │ • updateOne()   │                 │
│  │ • categories    │  │ • Category.js   │  │ • deleteOne()   │                 │
│  │ • carts         │  │ • Cart.js       │  │ • aggregate()   │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Frontend (Client-Side)

**Technology Stack:** HTML5, CSS3, React 18 (via CDN), Vanilla JavaScript

**Components:**

- **HTML Pages**: Entry points for different sections (`index.html`, `Users.html`, `Orders.html`, `Reviews.html`)
- **React Components**: UI components for data display and user interaction
- **JavaScript Modules**: Hooks, utilities, and business logic for client-side operations

**Key Files:**

```
public/
├── index.html, Users.html, Orders.html, Reviews.html
├── js/components/
│   ├── views/ (ProductsView, UsersView, OrdersView, ReviewsView)
│   ├── shared/ (topbar, layout, components)
│   ├── products/ (ProductForm, ProductTable, ProductsContainer)
│   ├── auth/ (LoginForm)
│   └── pages/ (ProductsPage)
├── js/hooks/ (useProductCRUD, useDataViewer, useAuth, useCart)
└── js/utils/ (DataUtils)
```

**Responsibilities:**

- User interface rendering
- Form handling and validation
- HTTP requests to backend APIs
- State management
- User authentication flow

### 2. Backend (Server-Side)

**Technology Stack:** Node.js, Express.js, MongoDB, Mongoose

The backend is divided into two main layers:

#### Server Layer (Express.js Application)

**Components:**

- **Routes**: HTTP endpoint definitions
- **Middleware**: Authentication, authorization, error handling
- **Controllers**: Request/response handling logic

**Key Files:**

```
routes/
├── products.js    # Product CRUD operations
├── users.js       # User management
├── orders.js      # Order processing
├── reviews.js     # Review management
├── categories.js  # Category operations
├── cart.js        # Shopping cart
└── auth.js        # Authentication

middleware/
├── auth.js        # JWT authentication
├── authorize.js   # Role-based access control
└── asyncHandler.js # Error handling wrapper
```

**Route Example (products.js):**

```javascript
// @route   POST /api/products
// @desc    Create new product
// @access  Private (Seller only)
router.post(
  "/",
  auth, // Authentication middleware
  authorize("seller", "admin"), // Authorization middleware
  asyncHandler(async (req, res) => {
    // Error handling wrapper
    const product = await ProductService.createProduct(req.user.id, req.body);
    return ApiResponse.created(
      res,
      { product },
      "Product created successfully"
    );
  })
);
```

#### Service Layer (Business Logic)

**Components:**

- **Services**: Business logic and data processing
- **Models**: Database schema definitions
- **Utilities**: Helper functions and common operations

**Key Files:**

```
services/
├── ProductService.js  # Product business logic
├── UserService.js     # User operations
├── OrderService.js    # Order processing
├── ReviewService.js   # Review management
├── CategoryService.js # Category operations
└── CartService.js     # Cart operations

models/
├── Product.js    # Product schema
├── User.js       # User schema
├── Order.js      # Order schema
├── Review.js     # Review schema
├── Category.js   # Category schema
└── Cart.js       # Cart schema
```

**Service Example (ProductService.js):**

```javascript
class ProductService {
  static async createProduct(sellerId, productData) {
    // Validate category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      throw new Error("Invalid category");
    }

    // Create product with seller reference
    const product = new Product({
      ...productData,
      seller: sellerId,
      inventory: productData.stock || 0,
    });

    return await product.save();
  }
}
```

### 3. Database (MongoDB)

**Technology Stack:** MongoDB, Mongoose ODM

**Collections:**

- **products**: Product listings with seller information
- **users**: User accounts (buyers, sellers, admins)
- **orders**: Purchase transactions
- **reviews**: Product reviews and ratings
- **categories**: Product categorization
- **carts**: Shopping cart data

**Model Relationships:**

```javascript
// Product belongs to User (seller) and Category
Product: {
  seller: { type: ObjectId, ref: 'User' },
  category: { type: ObjectId, ref: 'Category' }
}

// Order contains multiple Products and belongs to User (buyer)
Order: {
  buyer: { type: ObjectId, ref: 'User' },
  items: [{ product: { type: ObjectId, ref: 'Product' }, quantity: Number }]
}

// Review belongs to User (buyer) and Product
Review: {
  buyer: { type: ObjectId, ref: 'User' },
  product: { type: ObjectId, ref: 'Product' }
}
```

## Data Flow Examples

### Example 1: Creating a Product

```
┌─────────────┐    HTTP POST     ┌─────────────┐    Method Call    ┌─────────────┐
│  FRONTEND   │ ──────────────→  │   SERVER    │ ──────────────→   │  SERVICE    │
│             │  /api/products   │   LAYER     │ createProduct()   │   LAYER     │
│ ProductForm │                  │ router.post │                   │ProductService│
└─────────────┘                  └─────────────┘                   └─────────────┘
                                                                           │
                                                                  Database Query
                                                                           │
                                                                           ▼
                                                                  ┌─────────────┐
                                                                  │  DATABASE   │
                                                                  │             │
                                                                  │  MongoDB    │
                                                                  │ Product.save│
                                                                  └─────────────┘
```

**Step-by-Step Flow:**

1. User fills out product form in `ProductForm` component
2. Form data sent via `useProductCRUD` hook to `/api/products`
3. Express router receives POST request
4. Authentication middleware verifies JWT token
5. Authorization middleware checks seller role
6. Route handler calls `ProductService.createProduct()`
7. Service validates data and creates Product model
8. MongoDB saves product document
9. Response sent back through layers to frontend
10. UI updates with success message

### Example 2: Displaying Users List

```
┌─────────────┐    HTTP GET      ┌─────────────┐    Method Call    ┌─────────────┐
│  FRONTEND   │ ──────────────→  │   SERVER    │ ──────────────→   │  SERVICE    │
│             │   /api/users     │   LAYER     │   getUsers()      │   LAYER     │
│ UsersView   │                  │ router.get  │                   │ UserService │
└─────────────┘                  └─────────────┘                   └─────────────┘
                                                                           │
                                                                  Database Query
                                                                           │
                                                                           ▼
                                                                  ┌─────────────┐
                                                                  │  DATABASE   │
                                                                  │             │
                                                                  │  MongoDB    │
                                                                  │ User.find() │
                                                                  └─────────────┘
```

**Step-by-Step Flow:**

1. `Users.html` page loads and initializes
2. Authentication check verifies admin role
3. HTTP GET request sent to `/api/users`
4. Route handler calls `UserService.getUsers()`
5. Service queries MongoDB with filters and pagination
6. User documents returned from database
7. Data formatted and sent as JSON response
8. Frontend renders users in `DataTable` component
