// CartSummary Component - Shows subtotal, tax, total and checkout button
const CartSummary = ({ cart, loading, selectedItems = [] }) => {
  // Calculate subtotal for checked items only
  const subtotal = cart.items.reduce((sum, item) => {
    const productId =
      item.productId || item.product?._id || item._id || item.product?._id;
    const isSelected =
      selectedItems.includes(productId) || selectedItems.length === 0; // Default to all selected if no selection info

    if (isSelected) {
      const price = item.product?.price || item.price || 0;
      return sum + price * item.quantity;
    }
    return sum;
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

    // Check if any items are selected
    const selectedItemsCount =
      selectedItems.length > 0 ? selectedItems.length : cart.items.length;
    if (selectedItemsCount === 0) {
      alert("Please select items to checkout!");
      return;
    }

    // For now, show a summary
    const itemCount = cart.items.reduce((count, item) => {
      const productId =
        item.productId || item.product?._id || item._id || item.product?._id;
      const isSelected =
        selectedItems.includes(productId) || selectedItems.length === 0;
      return isSelected ? count + item.quantity : count;
    }, 0);

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
      React.createElement("p", { className: "info-text" }),
      React.createElement("p", { className: "info-text" })
    )
  );
};

// Expose CartSummary to global scope
window.CartSummary = CartSummary;
