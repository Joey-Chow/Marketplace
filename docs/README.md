# 🛒 Marketplace - E-Commerce Platform

A full-stack e-commerce marketplace application built with **Node.js**, **Express**, **MongoDB**, and **React**. Features user authentication, product management, shopping cart functionality, order processing, and comprehensive data analytics.

````

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

**Note:** This guide includes MongoDB installation instructions for users who don't have it installed.

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

3. **Install and Set up MongoDB**

   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

4. **Start MongoDB (only if using local installation)**

   ```bash
   brew services start mongodb-community

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
