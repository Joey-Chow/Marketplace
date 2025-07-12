const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/marketplace", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanupCarts() {
  try {
    console.log("🧹 Starting cart cleanup...");

    // Get all carts
    const carts = await Cart.find({}).populate("items.product");
    console.log(`Found ${carts.length} carts to check`);

    let totalCleaned = 0;
    let cartsModified = 0;

    for (const cart of carts) {
      let hasInvalidItems = false;

      // Filter out items with invalid product references
      const validItems = cart.items.filter((item) => {
        const isValid = item.product && item.product._id && item.product.name;
        if (!isValid) {
          hasInvalidItems = true;
          totalCleaned++;
          console.log(
            `Removing invalid item from cart ${cart._id}: ${
              item.product
                ? "Product exists but missing data"
                : "Product reference is null"
            }`
          );
        }
        return isValid;
      });

      if (hasInvalidItems) {
        cart.items = validItems;

        // Recalculate totals
        await cart.calculateTotals();
        await cart.save();

        cartsModified++;
        console.log(
          `✅ Cleaned cart ${cart._id} - removed ${
            cart.items.length - validItems.length
          } invalid items`
        );
      }
    }

    console.log(`🎉 Cleanup completed!`);
    console.log(`- Carts checked: ${carts.length}`);
    console.log(`- Carts modified: ${cartsModified}`);
    console.log(`- Invalid items removed: ${totalCleaned}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupCarts();
