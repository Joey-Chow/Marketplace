# Marketplace API Specification

## Overview

This document provides a comprehensive specification for the Marketplace API, including all endpoints, request/response formats, authentication requirements, and example data structures.

**Base URL:** `/api`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### User Roles
- admin: Full system access
- seller: Can manage own products and view own orders
- buyer: Can browse products, manage cart, and place orders

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

Access: Public

Request Body:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

Response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "buyer",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Authenticate user and receive JWT token.

Access: Public

Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "buyer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/me
Get current authenticated user information.

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "buyer",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      }
    }
  }
}
```

### PUT /auth/profile
Update user profile information.

**Access:** Private

**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "email": "john@example.com",
      "profile": {
        "firstName": "John",
        "lastName": "Smith",
        "phone": "+1234567890"
      }
    }
  }
}
```

### POST /auth/logout
Logout user (client-side token removal).

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

---

## Product Endpoints

### GET /products
Get all products with filtering and pagination.

**Access:** Public

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category ID
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `search` (string): Search term
- `seller` (string): Filter by seller ID
- `sortBy` (string): Sort field (default: "createdAt")
- `sortOrder` (string): "asc" or "desc" (default: "desc")

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced camera system",
        "price": 999,
        "inventory": {
          "quantity": 50,
          "lowStockThreshold": 10
        },
        "images": [
          {
            "url": "https://example.com/iphone15.jpg",
            "alt": "iPhone 15 Pro"
          }
        ],
        "seller": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "username": "techstore",
          "sellerInfo": {
            "storeName": "TechStore Electronics"
          }
        },
        "category": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "name": "Electronics"
        },
        "ratings": {
          "average": 4.5,
          "count": 25
        },
        "featured": true,
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 60,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /products/:id
Get product by ID.

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced camera system and A17 Pro chip",
      "price": 999,
      "inventory": {
        "quantity": 50,
        "lowStockThreshold": 10
      },
      "images": [
        {
          "url": "https://example.com/iphone15.jpg",
          "alt": "iPhone 15 Pro"
        }
      ],
      "specifications": {
        "brand": "Apple",
        "model": "iPhone 15 Pro",
        "color": "Space Black",
        "warranty": "1 year"
      },
      "tags": ["smartphone", "apple", "ios", "camera"],
      "seller": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "username": "techstore",
        "sellerInfo": {
          "storeName": "TechStore Electronics",
          "rating": 4.5
        }
      },
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Electronics"
      },
      "ratings": {
        "average": 4.5,
        "count": 25
      }
    }
  }
}
```

### POST /products
Create new product.

**Access:** Private (Seller/Admin only)

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "64f8a1b2c3d4e5f6a7b8c9d3",
  "inventory": {
    "quantity": 100,
    "lowStockThreshold": 10
  },
  "images": [
    {
      "url": "https://example.com/product.jpg",
      "alt": "Product Image"
    }
  ],
  "specifications": {
    "brand": "BrandName",
    "model": "ModelName"
  },
  "tags": ["tag1", "tag2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "New Product",
      "description": "Product description",
      "price": 99.99,
      "seller": "64f8a1b2c3d4e5f6a7b8c9d2",
      "category": "64f8a1b2c3d4e5f6a7b8c9d3",
      "status": "active"
    }
  }
}
```

### PUT /products/:id
Update product.

**Access:** Private (Seller - own products, Admin)

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 89.99,
  "inventory": {
    "quantity": 75
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "Updated Product Name",
      "price": 89.99,
      "inventory": {
        "quantity": 75,
        "lowStockThreshold": 10
      }
    }
  }
}
```

### DELETE /products/:id
Delete product.

**Access:** Private (Seller - own products, Admin)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product deleted successfully",
  "data": null
}
```

### GET /products/seller
Get products by seller.

**Access:** Private (Seller/Admin only)

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`, `status`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "products": [...],
    "pagination": {...}
  }
}
```

### GET /products/featured
Get featured products.

**Access:** Public

**Query Parameters:**
- `limit` (number): Number of products (default: 8)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "products": [...]
  }
}
```

### GET /products/trending
Get trending products.

**Access:** Public

**Query Parameters:**
- `limit` (number): Number of products (default: 8)

### GET /products/search/:query
Search products.

**Access:** Public

**Query Parameters:**
- `page`, `limit`, `category`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`

### GET /products/category/:categoryId
Get products by category.

**Access:** Public

### GET /products/:id/related
Get related products.

**Access:** Public

### PUT /products/:id/stock
Update product stock.

**Access:** Private (Seller - own products, Admin)

**Request Body:**
```json
{
  "stock": 25
}
```

### PUT /products/:id/status
Update product status.

**Access:** Private (Seller - own products, Admin)

**Request Body:**
```json
{
  "status": "inactive"
}
```

### GET /products/stats/overview
Get product statistics.

**Access:** Private (Seller - own products, Admin - all products)

---

## Category Endpoints

### GET /categories
Get all categories.

**Access:** Public

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "categories": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Electronics",
        "description": "Electronic devices and gadgets",
        "slug": "electronics",
        "icon": "📱",
        "level": 0,
        "sortOrder": 1
      }
    ],
    "pagination": {...}
  }
}
```

### GET /categories/:id
Get category by ID.

**Access:** Public

### POST /categories
Create new category.

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "slug": "new-category",
  "icon": "🆕"
}
```

### PUT /categories/:id
Update category.

**Access:** Private (Admin only)

### DELETE /categories/:id
Delete category.

**Access:** Private (Admin only)

### GET /categories/:id/products
Get category with products.

**Access:** Public

### GET /categories/:id/stats
Get category statistics.

**Access:** Public

### GET /categories/search/:query
Search categories.

**Access:** Public

---

## Cart Endpoints

### GET /cart
Get user's cart.

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cart retrieved successfully",
  "data": {
    "cart": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "user": "64f8a1b2c3d4e5f6a7b8c9d0",
      "items": [
        {
          "product": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "name": "iPhone 15 Pro",
            "price": 999,
            "images": [...]
          },
          "quantity": 2,
          "_id": "64f8a1b2c3d4e5f6a7b8c9d6"
        }
      ],
      "totals": {
        "subtotal": 1998,
        "tax": 159.84,
        "shipping": 0,
        "discount": 0,
        "total": 2157.84
      },
      "status": "active"
    }
  }
}
```

### POST /cart/add
Add item to cart.

**Access:** Private

**Request Body:**
```json
{
  "productId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item added to cart successfully",
  "data": {
    "cart": {...}
  }
}
```

### POST /cart/items
Add item to cart (alternate endpoint).

**Access:** Private

### PUT /cart/update
Update item quantity in cart.

**Access:** Private

**Request Body:**
```json
{
  "productId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "quantity": 3
}
```

### PUT /cart/items/:productId
Update item quantity in cart (alternate endpoint).

**Access:** Private

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /cart/remove/:productId
Remove item from cart.

**Access:** Private

### DELETE /cart/items/:productId
Remove item from cart (alternate endpoint).

**Access:** Private

### DELETE /cart/clear
Clear cart.

**Access:** Private

### DELETE /cart
Clear cart (alternate endpoint).

**Access:** Private

---

## Order Endpoints

### POST /orders
Create new order from cart.

**Access:** Private (Buyer/Admin only)

**Request Body:**
```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "orderNumber": "ORD-1704067200000-001",
      "buyer": "64f8a1b2c3d4e5f6a7b8c9d0",
      "items": [
        {
          "product": "64f8a1b2c3d4e5f6a7b8c9d1",
          "seller": "64f8a1b2c3d4e5f6a7b8c9d2",
          "quantity": 2,
          "price": 999,
          "productSnapshot": {
            "name": "iPhone 15 Pro",
            "description": "Latest iPhone...",
            "image": "https://example.com/iphone15.jpg"
          }
        }
      ],
      "pricing": {
        "subtotal": 1998,
        "tax": 159.84,
        "shipping": 0,
        "total": 2157.84
      },
      "shippingAddress": {...},
      "payment": {
        "method": "credit_card",
        "status": "pending"
      },
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /orders
Get user's orders.

**Access:** Private (Buyer/Admin only)

**Query Parameters:**
- `page`, `limit`, `status`, `sortBy`, `sortOrder`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "orders": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "orderNumber": "ORD-1704067200000-001",
        "status": "delivered",
        "pricing": {
          "total": 2157.84
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "items": [...]
      }
    ],
    "pagination": {...}
  }
}
```

### GET /orders/all
Get all orders.

**Access:** Private (Admin only)

### GET /orders/:id
Get order by ID.

**Access:** Private (Order owner or Admin)

### PUT /orders/:id/status
Update order status.

**Access:** Private (Seller - own products, Admin)

**Request Body:**
```json
{
  "status": "shipped"
}
```

### PUT /orders/:id/cancel
Cancel order.

**Access:** Private (Order owner only)

### GET /orders/stats/overview
Get order statistics.

**Access:** Private (Seller - own products, Admin)

---

## Review Endpoints

### POST /reviews
Create new review.

**Access:** Private (Buyer/Admin only)

**Request Body:**
```json
{
  "product": "64f8a1b2c3d4e5f6a7b8c9d1",
  "order": "64f8a1b2c3d4e5f6a7b8c9d7",
  "rating": 5,
  "title": "Great product!",
  "comment": "This product exceeded my expectations. Highly recommended!"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "review": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "product": "64f8a1b2c3d4e5f6a7b8c9d1",
      "buyer": "64f8a1b2c3d4e5f6a7b8c9d0",
      "order": "64f8a1b2c3d4e5f6a7b8c9d7",
      "rating": 5,
      "title": "Great product!",
      "comment": "This product exceeded my expectations...",
      "verified": true,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /reviews/product/:productId
Get reviews for a product.

**Access:** Public

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`, `rating`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "reviews": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
        "buyer": {
          "username": "johndoe",
          "profile": {
            "firstName": "John",
            "lastName": "Doe"
          }
        },
        "rating": 5,
        "title": "Great product!",
        "comment": "This product exceeded my expectations...",
        "verified": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

### GET /reviews/user
Get user's reviews.

**Access:** Private

### GET /reviews/:id
Get review by ID.

**Access:** Public

### PUT /reviews/:id
Update review.

**Access:** Private (Review owner only)

### DELETE /reviews/:id
Delete review.

**Access:** Private (Review owner only)

### GET /reviews/product/:productId/stats
Get review statistics for a product.

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "stats": {
      "totalReviews": 25,
      "averageRating": 4.5,
      "ratingDistribution": {
        "5": 15,
        "4": 8,
        "3": 2,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

### GET /reviews/can-review/:productId
Check if user can review a product.

**Access:** Private

---

## User Management Endpoints

### GET /users
Get all users.

**Access:** Private (Admin only)

**Query Parameters:**
- `page`, `limit`, `role`, `sortBy`, `sortOrder`, `search`

### GET /users/:id
Get user by ID.

**Access:** Private (Admin only)

### PUT /users/:id
Update user.

**Access:** Private (Admin only)

### DELETE /users/:id
Delete user.

**Access:** Private (Admin only)

### PUT /users/:id/activate
Activate user account.

**Access:** Private (Admin only)

### PUT /users/:id/deactivate
Deactivate user account.

**Access:** Private (Admin only)

### GET /users/stats/overview
Get user statistics.

**Access:** Private (Admin only)

### GET /users/search/:query
Search users.

**Access:** Private (Admin only)

---

## Dashboard Endpoints

### GET /dashboard/analytics
Get comprehensive analytics dashboard.

**Access:** Private (Admin only)

**Query Parameters:**
- `timeRange`: "7d", "30d", "90d", "1y" (default: "30d")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 150,
      "totalRevenue": 45000,
      "avgOrderValue": 300,
      "newUsers": 25,
      "newProducts": 10
    },
    "salesAnalytics": [...],
    "topSellingProducts": [...],
    "mostActiveUsers": [...],
    "topSellersByRevenue": [...],
    "categoryPerformance": [...]
  }
}
```

### GET /dashboard/seller
Get seller-specific dashboard.

**Access:** Private (Seller/Admin only)

**Query Parameters:**
- `timeRange`: "7d", "30d", "90d", "1y" (default: "30d")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 15000,
      "totalOrders": 50,
      "totalProductsSold": 120,
      "activeProducts": 25,
      "avgOrderValue": 300
    },
    "productsPerformance": [...],
    "salesOverTime": [...],
    "recentOrders": [...],
    "reviewsSummary": {
      "totalReviews": 45,
      "avgRating": 4.5
    },
    "lowStockProducts": [...]
  }
}
```

### GET /dashboard/buyer
Get buyer-specific dashboard.

**Access:** Private (Buyer only)

**Query Parameters:**
- `timeRange`: "7d", "30d", "90d", "1y" (default: "30d")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSpent": 2500,
      "totalOrders": 8,
      "avgOrderValue": 312.5,
      "reviewsWritten": 5,
      "savedItems": 3
    },
    "recentOrders": [...],
    "purchaseHistory": [...],
    "favoriteCategories": [...],
    "savedItems": [...]
  }
}
```

### GET /dashboard/recommendations
Get personalized product recommendations.

**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "data": {
    "collaborativeFiltering": [...],
    "categoryBased": [...]
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error

