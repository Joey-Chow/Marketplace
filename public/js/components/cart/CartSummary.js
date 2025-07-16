// CartSummary Component - Shows subtotal, tax, total and checkout button
const CartSummary = ({ cart, loading, selectedItems = [] }) => {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  // Calculate subtotal for checked items only
  const subtotal = cart.items.reduce((sum, item) => {
    const productId = item.product?._id || item.product;
    const isSelected = selectedItems.includes(productId);

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

  // Get selected items for checkout
  const getSelectedItemsForCheckout = () => {
    return cart.items
      .filter((item) => {
        const productId = item.product?._id || item.product;
        return selectedItems.includes(productId) || selectedItems.length === 0;
      })
      .map((item) => item.product?._id || item.product);
  };

  const handleCheckout = () => {
    // Check if any items are selected
    const selectedItemsForCheckout = getSelectedItemsForCheckout();
    if (selectedItemsForCheckout.length === 0) {
      alert("Please select items to checkout!");
      return;
    }

    // Show payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async ({ paymentMethod, shippingAddress }) => {
    setCheckoutLoading(true);

    try {
      const selectedItemsForCheckout = getSelectedItemsForCheckout();

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("marketplace_token")}`,
        },
        body: JSON.stringify({
          selectedItems: selectedItemsForCheckout,
          paymentMethod,
          shippingAddress,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Order placed successfully! Order ID: ${result.order._id}`);
        setShowPaymentModal(false);

        // Refresh cart to remove selected items
        if (window.location.reload) {
          window.location.reload();
        }
      } else {
        alert(`❌ Checkout failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`❌ Checkout failed: ${error.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
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
            disabled: loading || cart.items.length === 0 || checkoutLoading,
            className: "btn btn-primary checkout-btn",
          },
          checkoutLoading ? "Processing..." : "Proceed to Checkout"
        )
      )
    ),

    // Payment Modal
    React.createElement(PaymentModal, {
      isOpen: showPaymentModal,
      onClose: handlePaymentCancel,
      onConfirm: handlePaymentConfirm,
      orderSummary: { subtotal, tax, total },
      loading: checkoutLoading,
    })
  );
};

// Expose CartSummary to global scope
window.CartSummary = CartSummary;
