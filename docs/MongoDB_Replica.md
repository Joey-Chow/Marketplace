# MongoDB Replication Setup & Benefits

## Overview

This document explains MongoDB replication setup and its benefits for the Marketplace e-commerce platform. MongoDB replication provides data redundancy, high availability, and enables advanced features like ACID transactions that are crucial for e-commerce applications.

## What is MongoDB Replication?

MongoDB replication is a process of synchronizing data across multiple MongoDB servers. A **replica set** is a group of MongoDB instances that maintain the same dataset, providing redundancy and increasing data availability.

### Key Components

- **Primary Node**: Accepts all write operations and replicates changes to secondary nodes
- **Secondary Node(s)**: Maintain copies of the primary's data and can serve read operations
- **Arbiter** (optional): Votes in elections but doesn't store data

## Why Replication is Required for This Project

### 1. **ACID Transactions Support**

The marketplace's checkout system requires ACID transactions to ensure:

- **Atomicity**: All checkout operations (inventory update, order creation, payment) succeed or fail together
- **Consistency**: Database remains in a valid state throughout the transaction
- **Isolation**: Concurrent transactions don't interfere with each other
- **Durability**: Committed transactions survive system failures

```javascript
// Example from CheckoutService.js
const session = await mongoose.startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
});
```

### 2. **E-commerce Data Integrity**

Critical operations that require transactional guarantees:

- **Order Processing**: Ensure inventory is decremented when orders are placed
- **Payment Processing**: Prevent double charging or lost payments
- **Cart Operations**: Maintain consistency between cart and inventory
- **User Account Updates**: Ensure profile and order history consistency

## Setup Instructions

### Option 1: Single-Node Replica Set (Development)

This is what we use in the marketplace for development with transaction support.

#### Step 1: Stop Existing MongoDB

```bash
# Stop the standard MongoDB service
brew services stop mongodb-community
```

#### Step 2: Start MongoDB with Replica Set

```bash
# Start MongoDB with replica set configuration
mongod --replSet rs0 --port 27017 --dbpath /opt/homebrew/var/mongodb --logpath /opt/homebrew/var/log/mongodb/mongo.log --fork
```

#### Step 3: Initialize Replica Set

```bash
# Connect to MongoDB shell
mongosh

# Initialize replica set
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "127.0.0.1:27017" }]
});

# Verify status
rs.status();

# Exit shell
exit;
```

#### Step 4: Update Connection String

```bash
# .env file
MONGODB_URI=mongodb://127.0.0.1:27017/marketplace?replicaSet=rs0
```

### Option 2: Multi-Node Replica Set (Production)

For production environments with high availability.

#### Step 1: Configure Multiple MongoDB Instances

```bash
# Node 1 (Primary)
mongod --replSet rs0 --port 27017 --dbpath /data/db1 --logpath /var/log/mongodb/mongo1.log --fork

# Node 2 (Secondary)
mongod --replSet rs0 --port 27018 --dbpath /data/db2 --logpath /var/log/mongodb/mongo2.log --fork

# Node 3 (Secondary)
mongod --replSet rs0 --port 27019 --dbpath /data/db3 --logpath /var/log/mongodb/mongo3.log --fork
```

#### Step 2: Initialize Multi-Node Replica Set

```javascript
// Connect to primary node
mongosh --port 27017

// Initialize replica set with multiple members
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "server1:27017", priority: 2 },
    { _id: 1, host: "server2:27018", priority: 1 },
    { _id: 2, host: "server3:27019", priority: 1 }
  ]
});
```

#### Step 3: Production Connection String

```bash
MONGODB_URI=mongodb://server1:27017,server2:27018,server3:27019/marketplace?replicaSet=rs0&readPreference=primary
```

## Benefits of MongoDB Replication

### 1. **Data Redundancy & Backup**

- **Automatic Backups**: Secondary nodes serve as live backups
- **Point-in-Time Recovery**: Can recover data from any point in time
- **Disaster Recovery**: System continues operating if primary fails

### 2. **High Availability**

- **Automatic Failover**: Secondary becomes primary if primary fails
- **Zero Downtime**: Applications continue running during failover
- **Load Distribution**: Read operations can be distributed across secondaries

### 3. **ACID Transaction Support**

- **Multi-Document Transactions**: Essential for e-commerce operations
- **Consistency Guarantees**: Ensures data integrity across related documents
- **Isolation Levels**: Prevents dirty reads and write conflicts

### 4. **Performance Benefits**

- **Read Scaling**: Distribute read load across multiple nodes
- **Write Concern Options**: Balance between speed and durability
- **Reduced Latency**: Geographically distributed secondaries

### 5. **Operational Benefits**

- **Maintenance Windows**: Perform maintenance without downtime
- **Backup Operations**: Run backups on secondary without affecting primary
- **Monitoring**: Better observability across multiple nodes
