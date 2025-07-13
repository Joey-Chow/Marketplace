# 🛒 Marketplace - E-Commerce Platform

A full-stack e-commerce marketplace application built with **Node.js**, **Express**, **MongoDB**, and **React**. Features user authentication, product management, shopping cart functionality, order processing, and comprehensive data analytics.

````

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
````

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
