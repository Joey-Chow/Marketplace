# Marketplace - E-Commerce Platform

A full-stack e-commerce marketplace application built with Node.js, Express, MongoDB, and React. Features user authentication, product management, shopping cart functionality, order processing, and comprehensive data analytics.

````

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

Note: This guide includes MongoDB installation instructions for users who don't have it installed,
It also includes MongoDB database setup.


### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Joey-Chow/Marketplace.git
   cd marketplace
````

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   #Install MongoDB server
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community

   # Create .env file
   MONGODB_URI=mongodb://localhost:27017/marketplace
   JWT_SECRET=your-super-secure-jwt-secret-key
   PORT=3000
   NODE_ENV=development
   ```

4. Start MongoDB
   Start MongoDB (only if using local installation)

   ```bash
   brew services start mongodb-community

   ```

5. Seed the database

   ```bash
   node scripts/seedDatabase.js
   ```

6. Start the server

   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

7. Access the application
   - Main App: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard.html


## Deliverables:
1, MongoDB database data population are under Models folde
2, Schemas that shows collections and relationships are under `models` folder.
3, MongoDB database data population is in the `seedDatabase.js` file under `scripts` folder.
4, API source code with implementation of CRUD operations are under `services` folder. For example, in `services/ProductService.js`, you can see methods like `createProduct`, `getProductById`, `updateProduct` and `deleteProduct`.
5, API documentation with endpoints, request/response examples are in this `README.md`, there is a section called `API Endpoints`
