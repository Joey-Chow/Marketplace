# Role-Based Access Control (RBAC) Documentation

## Overview

The Marketplace application implements a comprehensive Role-Based Access Control (RBAC) system that manages user permissions and access to different features based on user roles. The system ensures secure access to resources and maintains data integrity across all user interactions.

## Role Definitions

### 1. Admin Role

**Role Code:** `admin`
**Description:** System administrators with full access to all platform features and data.

**Permissions:**

- Full CRUD operations on all resources (users, products, orders, categories, reviews)
- Access to analytics dashboard and system metrics
- User management (activate/deactivate accounts, role assignments)
- System configuration and settings management
- Content moderation (approve/reject products, manage reviews)
- Financial reporting and transaction management
- Platform-wide data export and reporting

**Key Responsibilities:**

- System maintenance and monitoring
- User support and dispute resolution
- Platform security and compliance
- Data backup and recovery management

### 2. Seller Role

**Role Code:** `seller`
**Description:** Registered merchants who can list and sell products on the platform.

**Permissions:**

- Create, read, update, and delete their own products
- Manage product inventory and pricing
- View and manage orders for their products
- Access sales analytics for their store
- Respond to customer reviews
- Update store information and seller profile
- Upload product images and media

**Restrictions:**

- Cannot access other sellers' data
- Cannot modify system-wide settings
- Cannot manage users or admin functions
- Requires verification to access full seller features

**Verification Requirements:**

- Must have `sellerInfo.isVerified: true` to access full seller features
- Unverified sellers have limited product management capabilities

### 3. Buyer Role

**Role Code:** `buyer`
**Description:** Regular customers who can browse, purchase, and review products.

**Permissions:**

- Browse and search products
- Add products to cart and manage cart items
- Place orders and make payments
- View order history and track shipments
- Write and manage their own reviews
- Update personal profile information
- Contact sellers through platform messaging

**Restrictions:**

- Cannot create or manage products
- Cannot access seller or admin features
- Cannot view other users' personal information
- Cannot access system analytics or reports

## Permission Rules Implementation

### Authentication Middleware (`auth`)

**Location:** `/middleware/auth.js`

**Purpose:** Validates JWT tokens and sets user context

**Implementation:**

```javascript
const auth = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header
  // Verify JWT token signature and expiration
  // Fetch user from database and validate account status
  // Set req.user for downstream middleware
  // Handle token errors (expired, invalid, malformed)
});
```

**Error Handling:**

- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Account deactivated or suspended
- `401 Unauthorized`: Token expired or malformed JWT

### Authorization Middleware (`authorize`)

**Location:** `/middleware/auth.js`

**Purpose:** Enforces role-based access control

**Implementation:**

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    // Verify user role against required roles
    // Grant or deny access based on role match
  };
};
```
