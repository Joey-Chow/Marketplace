// CartSummary Component - Shows subtotal, tax, total and checkout button
const CartSummary = ({ cart, loading }) => {
  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Calculate tax (assuming 8.5% tax rate)
  const taxRate = 0.085;
  const tax = subtotal * taxRate;

  // Calculate total
  const total = subtotal + tax;

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    if (cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // For now, show a summary
    const itemCount = cart.items.reduce(
      (count, item) => count + item.quantity,
      0
    );
    const confirmMessage = `Proceed to checkout?\n\nItems: ${itemCount}\nSubtotal: $${subtotal.toFixed(
      2
    )}\nTax: $${tax.toFixed(2)}\nTotal: $${total.toFixed(2)}`;

    if (confirm(confirmMessage)) {
      alert(
        "Checkout functionality not implemented yet. This would redirect to payment page."
      );
      // window.location.href = "checkout.html";
    }
  };

  return React.createElement(
    "div",
    { className: "cart-summary-container" },

    React.createElement(
      "div",
      { className: "cart-summary-header" },
      React.createElement("h3", null, "Order Summary")
    ),

    React.createElement(
      "div",
      { className: "cart-summary-details" },

      // Subtotal
      React.createElement(
        "div",
        { className: "summary-line" },
        React.createElement("span", null, "Subtotal:"),
        React.createElement(
          "span",
          { className: "amount" },
          `$${subtotal.toFixed(2)}`
        )
      ),

      // Tax
      React.createElement(
        "div",
        { className: "summary-line" },
        React.createElement("span", null, "Tax (8.5%):"),
        React.createElement(
          "span",
          { className: "amount" },
          `$${tax.toFixed(2)}`
        )
      ),

      // Shipping (free for now)
      React.createElement(
        "div",
        { className: "summary-line" },
        React.createElement("span", null, "Shipping:"),
        React.createElement("span", { className: "amount free" }, "FREE")
      ),

      // Total
      React.createElement(
        "div",
        { className: "summary-line total-line" },
        React.createElement("span", { className: "total-label" }, "Total:"),
        React.createElement(
          "span",
          { className: "total-amount" },
          `$${total.toFixed(2)}`
        )
      )
    ),

    React.createElement(
      "div",
      { className: "cart-summary-actions" },

      // Continue Shopping Button
      React.createElement(
        "a",
        {
          href: "index.html",
          className: "btn btn-secondary continue-shopping-btn",
        },
        "Continue Shopping"
      ),

      // Checkout Button
      React.createElement(
        "button",
        {
          onClick: handleCheckout,
          disabled: loading || cart.items.length === 0,
          className: "btn btn-primary checkout-btn",
        },
        loading ? "Processing..." : "Proceed to Checkout"
      )
    ),

    // Additional info
    React.createElement(
      "div",
      { className: "cart-summary-info" },
      React.createElement(
        "p",
        { className: "info-text" },
        "🚚 Free shipping on orders over $50"
      ),
      React.createElement(
        "p",
        { className: "info-text" },
        "🔒 Secure checkout with SSL encryption"
      )
    )
  );
};

// Expose CartSummary to global scope
window.CartSummary = CartSummary;
