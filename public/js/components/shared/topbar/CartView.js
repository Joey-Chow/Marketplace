// CartView Component - Handles cart display with full functionality
const CartView = ({ cart, loading, error }) => {
  // Force re-render when cart changes
  const [renderKey, setRenderKey] = React.useState(0);

  React.useEffect(() => {
    setRenderKey((prev) => prev + 1);
  }, [cart]);

  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading cart..."
    );
  }

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  if (!cart || !cart.cart || !cart.cart.items || cart.cart.items.length === 0) {
    return React.createElement(
      "div",
      null,
      React.createElement("h2", null, "🛍️ My Cart"),
      React.createElement(
        "div",
        { className: "empty-cart" },
        React.createElement("h3", null, "🛍️ Your cart is empty"),
        React.createElement("p", null, "Add some products to get started!")
      )
    );
  }

  const cartData = cart.cart;

  // Calculate total item count dynamically
  const itemCount = cartData.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Calculate subtotal dynamically - always recalculate for real-time updates
  const subtotal = cartData.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return React.createElement(
    "div",
    { key: renderKey },
    React.createElement("h2", null, "🛍️ My Cart"),
    React.createElement(
      "div",
      { className: "cart-container" },
      React.createElement(
        "div",
        { className: "cart-header" },
        React.createElement("h3", null, `🛍️ My Cart (${itemCount} items)`),
        React.createElement(
          "div",
          { className: "cart-actions" },
          React.createElement(
            "button",
            {
              className: "btn-sm btn-danger",
              onClick: async () => {
                console.log("Clear Cart button clicked");
                if (confirm("Are you sure you want to clear your cart?")) {
                  try {
                    const result = await cart.clearCart();
                    console.log("Clear cart result:", result);
                    if (result && !result.success) {
                      alert(`Failed to clear cart: ${result.error}`);
                    }
                  } catch (error) {
                    console.error("Clear cart error:", error);
                    alert("Failed to clear cart");
                  }
                }
              },
            },
            "Clear Cart"
          )
        )
      ),
      React.createElement(
        "table",
        { className: "data-table cart-table" },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "Product"),
            React.createElement("th", null, "Price"),
            React.createElement("th", null, "Quantity"),
            React.createElement("th", null, "Total"),
            React.createElement("th", null, "Actions")
          )
        ),
        React.createElement(
          "tbody",
          null,
          cartData.items.map((item) => {
            const product = item.product;
            const currentPrice = product?.price || 0;
            const itemTotal = currentPrice * item.quantity;

            return React.createElement(
              "tr",
              { key: item._id || item.product?._id },
              React.createElement(
                "td",
                { style: { verticalAlign: "middle" } },
                React.createElement(
                  "div",
                  { className: "product-info" },
                  React.createElement(
                    "strong",
                    null,
                    product?.name || "Unknown Product"
                  )
                )
              ),
              React.createElement(
                "td",
                { style: { verticalAlign: "middle" } },
                `$${currentPrice.toFixed(2)}`
              ),
              React.createElement(
                "td",
                { style: { verticalAlign: "middle" } },
                React.createElement(
                  "div",
                  {
                    className: "quantity-control",
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      overflow: "hidden",
                      width: "fit-content",
                    },
                  },
                  React.createElement(
                    "button",
                    {
                      className: "quantity-btn",
                      onClick: async () => {
                        console.log(
                          "Reduce quantity button clicked for product:",
                          product._id,
                          "current quantity:",
                          item.quantity
                        );
                        try {
                          if (item.quantity > 1) {
                            const result = await cart.updateQuantity(
                              product._id,
                              item.quantity - 1
                            );
                            console.log("Reduce quantity result:", result);
                            if (result && !result.success) {
                              alert(
                                `Failed to reduce quantity: ${result.error}`
                              );
                            }
                          }
                        } catch (error) {
                          console.error("Reduce quantity error:", error);
                          alert("Failed to reduce quantity");
                        }
                      },
                      style: {
                        padding: "4px 8px",
                        fontSize: "12px",
                        border: "none",
                        background: "#f8f9fa",
                        cursor: "pointer",
                        borderRight: "1px solid #ddd",
                      },
                      title: "Reduce quantity by 1",
                      disabled: item.quantity <= 1,
                    },
                    "−"
                  ),
                  React.createElement("input", {
                    type: "number",
                    min: "1",
                    value: item.quantity,
                    onChange: async (e) => {
                      const newQuantity = parseInt(e.target.value);
                      if (newQuantity > 0) {
                        console.log(
                          "Updating quantity for product:",
                          product._id,
                          "to:",
                          newQuantity
                        );
                        try {
                          const result = await cart.updateQuantity(
                            product._id,
                            newQuantity
                          );
                          console.log("Update quantity result:", result);
                          if (result && !result.success) {
                            alert(`Failed to update quantity: ${result.error}`);
                          }
                        } catch (error) {
                          console.error("Update quantity error:", error);
                          alert("Failed to update quantity");
                        }
                      }
                    },
                    style: {
                      width: "50px",
                      padding: "4px",
                      border: "none",
                      textAlign: "center",
                      outline: "none",
                    },
                  }),
                  React.createElement(
                    "button",
                    {
                      className: "quantity-btn",
                      onClick: async () => {
                        console.log(
                          "Add quantity button clicked for product:",
                          product._id,
                          "current quantity:",
                          item.quantity
                        );
                        try {
                          const result = await cart.updateQuantity(
                            product._id,
                            item.quantity + 1
                          );
                          console.log("Add quantity result:", result);
                          if (result && !result.success) {
                            alert(`Failed to add quantity: ${result.error}`);
                          }
                        } catch (error) {
                          console.error("Add quantity error:", error);
                          alert("Failed to add quantity");
                        }
                      },
                      style: {
                        padding: "4px 8px",
                        fontSize: "12px",
                        border: "none",
                        background: "#f8f9fa",
                        cursor: "pointer",
                        borderLeft: "1px solid #ddd",
                      },
                      title: "Add 1 to quantity",
                    },
                    "+"
                  )
                )
              ),
              React.createElement(
                "td",
                { style: { verticalAlign: "middle" } },
                `$${itemTotal.toFixed(2)}`
              ),
              React.createElement(
                "td",
                { className: "actions", style: { verticalAlign: "middle" } },
                React.createElement(
                  "button",
                  {
                    className: "btn-sm btn-danger",
                    onClick: async () => {
                      console.log(
                        "Remove item button clicked for product:",
                        product._id
                      );
                      try {
                        const result = await cart.removeItem(product._id);
                        console.log("Remove result:", result);
                        if (result && !result.success) {
                          alert(`Failed to remove item: ${result.error}`);
                        }
                      } catch (error) {
                        console.error("Remove item error:", error);
                        alert("Failed to remove item from cart");
                      }
                    },
                    style: { padding: "4px 8px", fontSize: "12px" },
                    title: "Remove item completely from cart",
                  },
                  "Remove"
                )
              )
            );
          })
        )
      ),
      React.createElement(
        "div",
        { className: "cart-summary" },
        React.createElement(
          "div",
          { className: "summary-row" },
          React.createElement("span", null, "Subtotal:"),
          React.createElement("strong", null, `$${subtotal.toFixed(2)}`)
        ),
        React.createElement(
          "div",
          { className: "summary-row" },
          React.createElement("span", null, "Tax:"),
          React.createElement(
            "span",
            null,
            `$${(cartData.totals?.tax || 0).toFixed(2)}`
          )
        ),
        React.createElement(
          "div",
          { className: "summary-row" },
          React.createElement("span", null, "Shipping:"),
          React.createElement(
            "span",
            null,
            `$${(cartData.totals?.shipping || 0).toFixed(2)}`
          )
        ),
        React.createElement(
          "div",
          { className: "summary-row total-row" },
          React.createElement("span", null, "Total:"),
          React.createElement(
            "strong",
            null,
            `$${(cartData.totals?.total || 0).toFixed(2)}`
          )
        ),
        React.createElement(
          "button",
          {
            className: "btn-primary checkout-btn",
            onClick: () => alert("Checkout functionality coming soon!"),
          },
          "Proceed to Checkout"
        )
      )
    )
  );
};

window.CartView = CartView;
