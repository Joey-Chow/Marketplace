const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");

mongoose.connect("mongodb://localhost/marketplace").then(async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      const adminCart = await Cart.findOne({ user: admin._id }).populate(
        "items.product"
      );
      console.log(
        "Admin cart items count:",
        adminCart ? adminCart.items.length : "No cart found"
      );
      if (adminCart) {
        console.log("Items in admin cart:");
        adminCart.items.forEach((item, index) => {
          console.log(
            `  ${index + 1}. ${item.product?.name || "Unknown"} (Qty: ${
              item.quantity
            })`
          );
        });
      }
    }

    // Check total product count
    const productCount = await Product.countDocuments();
    console.log(`\nTotal products in database: ${productCount}`);

    // Check all carts
    const allCarts = await Cart.find();
    console.log(`\nAll carts:`);
    allCarts.forEach((cart, index) => {
      console.log(`  Cart ${index + 1}: ${cart.items.length} items`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
});
