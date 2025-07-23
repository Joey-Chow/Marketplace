# ACID Transaction Implementation Documentation

## Overview

This document provides comprehensive documentation for the ACID-compliant checkout system implemented in the Marketplace application. The implementation ensures data consistency and integrity during the checkout process using MongoDB replica set transactions.

## 1. Codebase of ACID Implementation

### Core Implementation File

- File: `services/CheckoutService.js`
- Purpose: Implements ACID transactions for checkout processing
- Dependencies: MongoDB replica set, Mongoose ODM

### Key Components

#### 1.1 Transaction Initialization

```javascript
// Start session with ACID properties
const session = await mongoose.startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
});
```

#### 1.2 Three-Phase Transaction Pattern

The implementation follows the required pattern:

Phase 1: Read/Check Preconditions

```javascript
// 1. Read or check preconditions
const preconditions = await this._checkPreconditions(
  userId,
  selectedItems,
  session
);
```

Phase 2: Update Stock

```javascript
// 2. Update stock
await this._updateStock(preconditions.productUpdates, session);
```

Phase 3: Create Order

```javascript
// 3. Create order
const result = await this._createOrder(
  userId,
  preconditions,
  paymentMethod,
  shippingAddress,
  session
);
```

#### 1.3 Rollback Conditions Implementation

```javascript
// Rollback condition 1: Stock availability check
if (product.inventory.quantity < cartItem.quantity) {
  throw new Error(
    `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}, Requested: ${cartItem.quantity}`
  );
}

// Rollback condition 2: Payment success check
if (!result.paymentResult.success) {
  throw new Error(`Payment failed: ${result.paymentResult.error}`);
}
```

#### 1.4 Retry Logic for Transient Errors

```javascript
const maxRetries = 3;
let retryCount = 0;
while (retryCount < maxRetries) {
  // Transaction logic with retry on transient errors
  if (this._isRetryableError(error) && retryCount < maxRetries - 1) {
    retryCount++;
    await new Promise((resolve) => setTimeout(resolve, 100  retryCount));
    continue;
  }
}
```

### 1.5 Database Models Involved

- Cart: User shopping cart with selected items
- Product: Product inventory and details
- Order: Order creation and status tracking
- User: User order history updates

## 2. Transaction Boundaries and Error Handling Strategies

### 2.1 Transaction Boundaries

#### Transaction Start

```javascript
const session = await mongoose.startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
});
```

#### Transaction End

```javascript
// Success path
await session.commitTransaction();

// Failure path
await session.abortTransaction();

// Cleanup
session.endSession();
```

### 2.2 Collections and Documents Affected

#### Read Operations (with session)

- Cart: `Cart.findOne({ user: userId }).session(session)`
- Product: `Product.findById(cartItem.product).session(session)`

#### Write Operations (with session)

- Product: Update inventory quantities
- Order: Create new order document
- Cart: Remove selected items
- User: Update order history

### 2.3 Rollback Mechanisms

#### Automatic Rollback Triggers

1. Insufficient Stock: When `product.inventory.quantity < cartItem.quantity`
2. Payment Failure: When `paymentResult.success === false`
3. Database Errors: Connection issues, constraint violations
4. Validation Errors: Empty cart, invalid items

#### Error Handling Strategy

```javascript
try {
  // Transaction operations
  await session.commitTransaction();
  return result;
} catch (error) {
  // Abort transaction on any error
  await session.abortTransaction();

  // Retry logic for transient errors
  if (this._isRetryableError(error) && retryCount < maxRetries - 1) {
    retryCount++;
    continue;
  }

  throw error;
} finally {
  session.endSession();
}
```

#### Retryable Error Types

- `TransientTransactionError`
- `UnknownTransactionCommitResult`
- `WriteConflict` (code: 112)
- `LockTimeout` (code: 46)

### 2.4 Data Consistency Guarantees

#### Read Consistency

- Snapshot Isolation: All reads see consistent data snapshot
- Read Concern: `"snapshot"` level ensures consistent reads

#### Write Consistency

- Write Concern: `"majority"` ensures writes are acknowledged by majority of replica set members
- Atomicity: All writes succeed or all fail

## 3. Test Cases Demonstrating Transaction Success and Failure Scenarios

### 3.1 Successful Transaction Scenario

#### Test Setup

```javascript
// Mock data
const userId = "user123";
const selectedItems = ["product1", "product2"];
const paymentMethod = "credit_card";
const shippingAddress = {
  firstName: "John",
  lastName: "Doe",
  street: "123 Main St",
  city: "Boston",
  state: "MA",
  zipCode: "02101",
};
```

#### Expected Log Output

```
INFO: Starting checkout transaction for user: user123 (attempt 1)
INFO: Preconditions validated {
  itemCount: 2,
  subtotal: 299.98,
  tax: 25.50,
  total: 325.48
}
INFO: Stock updated for 2 products
INFO: Order created successfully {
  orderId: ObjectId("..."),
  paymentId: "pay_1690123456_abc123xyz"
}
INFO: Selected items removed from cart { removedItems: 2 }
INFO: Checkout transaction completed successfully {
  orderId: ObjectId("..."),
  paymentId: "pay_1690123456_abc123xyz",
  attempt: 1
}
```

### 3.2 Insufficient Stock Failure Scenario

#### Test Case

```javascript
// Product with insufficient stock
const product = {
  _id: "product1",
  name: "iPhone 15 Pro",
  inventory: { quantity: 1 },
  price: 999.99,
};

const cartItem = {
  product: "product1",
  quantity: 5, // Requesting more than available
};
```

#### Expected Log Output

```
INFO: Starting checkout transaction for user: user123 (attempt 1)
ERROR: Checkout transaction failed (attempt 1) {
  error: "Insufficient stock for iPhone 15 Pro. Available: 1, Requested: 5",
  userId: "user123",
  selectedItems: ["product1"]
}
```

#### Transaction Behavior

- Rollback: All changes reverted (no stock updates, no order creation)
- Error Thrown: "Insufficient stock for iPhone 15 Pro. Available: 1, Requested: 5"
- Database State: Unchanged (atomicity preserved)

### 3.3 Payment Failure Scenario

#### Test Case

```javascript
// Mock payment failure (10% failure rate in implementation)
const paymentResult = {
  success: false,
  error: "Payment processing failed",
};
```

#### Expected Log Output

```
INFO: Starting checkout transaction for user: user123 (attempt 1)
INFO: Preconditions validated {
  itemCount: 2,
  subtotal: 299.98,
  tax: 25.50,
  total: 325.48
}
INFO: Stock updated for 2 products
ERROR: Checkout transaction failed (attempt 1) {
  error: "Payment failed: Payment processing failed",
  userId: "user123",
  selectedItems: ["product1", "product2"]
}
```

#### Transaction Behavior

- Rollback: Stock updates reverted, order not created
- Error Thrown: "Payment failed: Payment processing failed"
- Database State: Restored to pre-transaction state

### 3.4 Transient Error Retry Scenario

#### Test Case

```javascript
// Simulate WriteConflict error
const error = new Error("WriteConflict");
error.code = 112;
```

#### Expected Log Output

```
INFO: Starting checkout transaction for user: user123 (attempt 1)
ERROR: Checkout transaction failed (attempt 1) {
  error: "WriteConflict",
  userId: "user123",
  selectedItems: ["product1"]
}
INFO: Retrying checkout transaction (attempt 2)
INFO: Starting checkout transaction for user: user123 (attempt 2)
INFO: Checkout transaction completed successfully {
  orderId: ObjectId("..."),
  paymentId: "pay_1690123456_def456uvw",
  attempt: 2
}
```

#### Transaction Behavior

- Retry Logic: Exponential backoff (100ms, 200ms, 300ms)
- Max Retries: 3 attempts
- Success: Transaction succeeds on retry

### 3.5 Database Connection Failure Scenario

#### Test Case

```javascript
// Simulate database connection loss
const error = new Error("MongoNetworkError: connection lost");
```

#### Expected Log Output

```
INFO: Starting checkout transaction for user: user123 (attempt 1)
ERROR: Checkout transaction failed (attempt 1) {
  error: "MongoNetworkError: connection lost",
  userId: "user123",
  selectedItems: ["product1"]
}
```

#### Transaction Behavior

- No Retry: Non-transient error, immediate failure
- Rollback: Transaction aborted automatically
- Error Propagation: Original error thrown to caller

### 3.6 Testing Built-in Scenarios

#### Test Implementation

```javascript
// Test insufficient stock scenario
await checkoutService.testCheckoutScenario("insufficient_stock");

// Test payment failure scenario
await checkoutService.testCheckoutScenario("payment_failure");

// Test database error scenario
await checkoutService.testCheckoutScenario("database_error");
```

#### Expected Test Logs

```
INFO: Testing insufficient stock scenario
INFO: Test completed for scenario: insufficient_stock {
  error: "Insufficient stock - testing error handling"
}

INFO: Testing payment failure scenario
INFO: Test completed for scenario: payment_failure {
  error: "Payment failed - testing error handling"
}

INFO: Testing database error scenario
INFO: Test completed for scenario: database_error {
  error: "Database connection lost - testing error handling"
}
```

## 4. Configuration Requirements

### 4.1 MongoDB Replica Set Setup

```bash
# Initialize replica set
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "127.0.0.1:27017" }]
});
```

### 4.2 Connection String

```javascript
MONGODB_URI=mongodb://127.0.0.1:27017/marketplace?replicaSet=rs0
```

### 4.3 Transaction Configuration

```javascript
{
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
}
```

## 5. Performance Considerations

### 5.1 Transaction Timeout

- Default: 60 seconds
- Configurable via MongoDB settings

### 5.2 Retry Strategy

- Maximum retries: 3
- Exponential backoff: 100ms, 200ms, 300ms
- Only for transient errors

### 5.3 Concurrency Handling

- Optimistic locking via snapshot isolation
- Write conflicts trigger automatic retry
- Session-based isolation prevents interference

## 6. Monitoring and Logging

### 6.1 Transaction Lifecycle Logging

- Transaction start/end events
- Retry attempts and reasons
- Success/failure outcomes
- Performance metrics

### 6.2 Error Tracking

- Categorized by error type
- Retry statistics
- Performance impact analysis

This implementation ensures full ACID compliance while maintaining high performance and reliability in the checkout process.

- Connection Lost: Transaction aborts, session closed gracefully
- Write Conflicts: Transaction retries up to 3 times before failing
- Constraint Violations: Transaction aborts with specific error message

## Rollback Mechanisms

### Automatic Rollback Scenarios

1. Stock Validation Failure

   ```javascript
   // Product stock insufficient
   if (product.stock < cartItem.quantity) {
     throw new Error(`Insufficient stock for ${product.name}`);
   }
   ```

2. Payment Processing Failure

   ```javascript
   // Payment simulation failure
   if (!paymentResult.success) {
     throw new Error(`Payment failed: ${paymentResult.error}`);
   }
   ```

3. Database Operation Failure
   ```javascript
   // Any database operation failure triggers rollback
   await session.abortTransaction();
   ```

### Manual Rollback Testing

The system includes test endpoints to simulate various failure scenarios:

- `/api/checkout/test-rollback` - Test rollback mechanisms
- Scenarios: `insufficient_stock`, `payment_failure`, `database_error`

## Test Cases and Scenarios

### 1. Successful Checkout Test

Scenario: User selects 2 items, provides valid payment info
Expected Result: Order created, stock updated, selected items removed from cart

Test Log:

```
INFO: Starting checkout transaction for user: 64a1b2c3d4e5f6789012345
INFO: Checkout validation completed - itemCount: 2, subtotal: 45.99, tax: 3.91, total: 49.90
INFO: Order created successfully - orderId: 64a1b2c3d4e5f6789012346
INFO: Inventory updated for 2 products
INFO: Selected items removed from cart - removedItems: 2
INFO: Checkout transaction completed successfully
```

### 2. Insufficient Stock Test

Scenario: User selects item with quantity > available stock
Expected Result: Transaction aborts, no changes made

Test Log:

```
INFO: Starting checkout transaction for user: 64a1b2c3d4e5f6789012345
ERROR: Insufficient stock for Premium T-Shirt. Available: 5, Requested: 10
ERROR: Checkout transaction failed - Rolling back
INFO: Transaction aborted - no changes made
```

### 3. Payment Failure Test

Scenario: Payment processing fails after order creation
Expected Result: Complete rollback including order deletion

Test Log:

```
INFO: Starting checkout transaction for user: 64a1b2c3d4e5f6789012345
INFO: Order created successfully - orderId: 64a1b2c3d4e5f6789012346
INFO: Inventory updated for 2 products
ERROR: Payment failed: Payment processing failed
ERROR: Checkout transaction failed - Rolling back
INFO: Order deleted, inventory restored, cart unchanged
```
