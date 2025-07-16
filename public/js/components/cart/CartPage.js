// CartPage Component - Main cart page with improved layout structure
const CartPage = () => {
  const { cart, loading, error, loadCart, updateQuantity, removeItem } =
    window.useCart();

  // Track selected items for checkout
  const [selectedItems, setSelectedItems] = React.useState([]);

  React.useEffect(() => {
    // Initialize SharedTopbar
    window.SharedTopbar.initialize("shared-topbar-root", {
      activeTab: "cart",
    });

    // Load cart
    loadCart();
  }, [loadCart]);

  // Handle item selection change
  const handleItemSelectionChange = (productId, isSelected) => {
    setSelectedItems((prev) => {
      const newSelected = isSelected
        ? [...prev, productId]
        : prev.filter((id) => id !== productId);
      return newSelected;
    });
  };

  // empty cart check
  if (!cart || !cart.items || cart.items.length === 0) {
    return React.createElement(
      "div",
      { className: "app-layout" },
      React.createElement("div", { id: "shared-topbar-root" }),
      window.SharedLayout.render(
        React.createElement(
          "div",
          { className: "cart-empty" },
          React.createElement("h2", null, "Your Cart is Empty"),
          React.createElement(
            "p",
            null,
            "Add some items to your cart to get started."
          ),
          React.createElement(
            "a",
            {
              href: "index.html",
              className: "btn btn-primary",
            },
            "Continue Shopping"
          )
        )
      )
    );
  }

  // Render cart items and summary
  return React.createElement(
    "div",
    { className: "app-layout" },
    // SharedTopbar container
    React.createElement("div", { id: "shared-topbar-root" }),

    // SharedLayout wrapper
    window.SharedLayout.render(
      React.createElement(
        "div",
        { className: "cart-page-container" },

        // Cart items container
        React.createElement(
          "div",
          { className: "cart-items-container" },
          React.createElement("h2", null, "Shopping Cart"),

          // Cart items list
          React.createElement(
            "div",
            { className: "cart-items-list" },
            cart.items.map((item) => {
              const productId = item.product?._id || item.product;
              return React.createElement(window.CartItem, {
                key: item._id || item.productId || item.product?._id,
                item: item,
                loading: loading,
                onQuantityChange: updateQuantity,
                onRemove: removeItem,
                isSelected: selectedItems.includes(productId),
                onSelectionChange: handleItemSelectionChange,
              });
            })
          )
        ),

        // Cart summary container
        React.createElement(window.CartSummary, {
          cart: cart,
          loading: loading,
          selectedItems: selectedItems,
        })
      )
    )
  );
};

// Expose CartPage to global scope
console.log("Loading CartPage component...");
window.CartPage = CartPage;
console.log("CartPage loaded:", window.CartPage ? "SUCCESS" : "FAILED");
