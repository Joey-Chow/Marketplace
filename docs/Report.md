
## Project description:

A full-stack e-commerce marketplace application built with Node.js, Express, MongoDB, and React. Features user authentication, product management, shopping cart functionality, order processing, and comprehensive data analytics.
Features

Authentication & Authorization
JWT-based Authentication with secure token management
Role-based Access Control (Admin, Seller, Buyer)
User Profile Management with seller store information
Secure Logout with automatic redirection

Product Management
CRUD Operations for products with full validation
Category Organization with hierarchical structure
Inventory Management with stock tracking
Product Search & Filtering capabilities
Image Support with metadata storage

Shopping Cart
Persistent Cart storage across sessions
Real-time Price Calculations with tax and shipping
Quantity Management with stock validation
Cart Operations: Add, Update, Remove, Clear
Dynamic Totals with tax and shipping calculations

Order Management
Complete Order Lifecycle from cart to delivery
ACID Transactions with MongoDB replica set for data consistency
Multiple Payment Methods support
Order Status Tracking with real-time updates
Order History and detailed receipts

Review System
Product Reviews with 5-star ratings
Verified Purchase reviews
Review Analytics with average ratings
Seller Response capabilities

Analytics Dashboard
Real-time Sales Metrics and revenue tracking
Interactive Charts with Chart.js integration
Product Performance analytics
User Activity monitoring
Category Performance insights

## Deliverables:
 ###Milestone 1:
 1, MongoDB database data population are under Models folder.
 2, Schemas that shows collections and relationships are under `models` folder.
 3, MongoDB database data population is in the `seedDatabase.js` file under `scripts` folder.
 4, API source code with implementation of CRUD operations are under `services` folder. For example, in `services/ProductService.js`, you can see methods like `createProduct`, `getProductById`, `updateProduct` and `deleteProduct`.
 5, API documentation with endpoints, request/response examples are in docs/api-spec.md

 ###Milestone 2:
 Given the length of those files, it has been placed in spcified files.
  ####Task 3: Transactions
  In docs/Tasks_Doc/'ACID_Transaction_Documentation.md'
  ####Task 4: Role based Access Control
  In docs/Tasks_Doc/'RBAC.md'
  ####Task 5: Advanced Queries(undone)
  In docs/Tasks_Doc/'Aggregation.md'
  ####Task 6: Query Optimization
  In docs/Tasks_Doc/'RBAC.md'
  ####Task 7: Data Replication
  In docs/Tasks_Doc/'MongoDB_Replica.md'
  ####Task 8: Dashboard
  In docs/Tasks_Doc/'DASHBOARD.md'(undone)


