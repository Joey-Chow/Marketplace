// PaymentModal.js - Payment method selection modal
const PaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderSummary,
  loading,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState("credit_card");
  const [shippingAddress, setShippingAddress] = React.useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  // Add styles to document head when component mounts
  React.useEffect(() => {
    const styleId = "payment-modal-styles";

    // Check if styles already exist
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;

    document.head.appendChild(style);
  }, []);

  const paymentMethods = [
    { id: "credit_card", name: "Credit Card", icon: "💳" },
    { id: "debit_card", name: "Debit Card", icon: "💳" },
    { id: "paypal", name: "PayPal", icon: "🟦" },
    { id: "apple_pay", name: "Apple Pay", icon: "🍎" },
    { id: "google_pay", name: "Google Pay", icon: "🟨" },
  ];

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    onConfirm({
      paymentMethod: selectedPaymentMethod,
      shippingAddress,
    });
  };

  if (!isOpen) return null;

  return React.createElement(
    "div",
    { className: "modal-overlay" },
    React.createElement(
      "div",
      { className: `payment-modal ${loading ? "loading" : ""}` },

      // Modal Header
      React.createElement(
        "div",
        { className: "modal-header" },
        React.createElement("h2", null, "Complete Your Order"),
        React.createElement(
          "button",
          {
            className: "close-btn",
            onClick: onClose,
            disabled: loading,
          },
          "×"
        )
      ),

      // Order Summary
      React.createElement(
        "div",
        { className: "order-summary-section" },
        React.createElement("h3", null, "Order Summary"),
        React.createElement(
          "div",
          { className: "summary-details" },
          React.createElement(
            "div",
            { className: "summary-line" },
            React.createElement("span", null, "Subtotal:"),
            React.createElement(
              "span",
              null,
              `$${orderSummary.subtotal.toFixed(2)}`
            )
          ),
          React.createElement(
            "div",
            { className: "summary-line" },
            React.createElement("span", null, "Tax:"),
            React.createElement("span", null, `$${orderSummary.tax.toFixed(2)}`)
          ),
          React.createElement(
            "div",
            { className: "summary-line" },
            React.createElement("span", null, "Shipping:"),
            React.createElement("span", { className: "free" }, "FREE")
          ),
          React.createElement(
            "div",
            { className: "summary-line total" },
            React.createElement("span", null, "Total:"),
            React.createElement(
              "span",
              null,
              `$${orderSummary.total.toFixed(2)}`
            )
          )
        )
      ),

      // Shipping Address
      React.createElement(
        "div",
        { className: "shipping-section" },
        React.createElement("h3", null, "Shipping Address"),
        React.createElement(
          "div",
          { className: "address-form" },
          React.createElement(
            "div",
            { className: "address-row" },
            React.createElement("input", {
              type: "text",
              placeholder: "First Name",
              value: shippingAddress.firstName,
              onChange: (e) => handleAddressChange("firstName", e.target.value),
              disabled: loading,
            }),
            React.createElement("input", {
              type: "text",
              placeholder: "Last Name",
              value: shippingAddress.lastName,
              onChange: (e) => handleAddressChange("lastName", e.target.value),
              disabled: loading,
            })
          ),
          React.createElement("input", {
            type: "text",
            placeholder: "Street Address",
            value: shippingAddress.street,
            onChange: (e) => handleAddressChange("street", e.target.value),
            disabled: loading,
          }),
          React.createElement(
            "div",
            { className: "address-row" },
            React.createElement("input", {
              type: "text",
              placeholder: "City",
              value: shippingAddress.city,
              onChange: (e) => handleAddressChange("city", e.target.value),
              disabled: loading,
            }),
            React.createElement("input", {
              type: "text",
              placeholder: "State",
              value: shippingAddress.state,
              onChange: (e) => handleAddressChange("state", e.target.value),
              disabled: loading,
            }),
            React.createElement("input", {
              type: "text",
              placeholder: "ZIP Code",
              value: shippingAddress.zipCode,
              onChange: (e) => handleAddressChange("zipCode", e.target.value),
              disabled: loading,
            })
          )
        )
      ),

      // Payment Methods
      React.createElement(
        "div",
        { className: "payment-methods-section" },
        React.createElement("h3", null, "Payment Method"),
        React.createElement(
          "div",
          { className: "payment-methods" },
          paymentMethods.map((method) =>
            React.createElement(
              "div",
              {
                key: method.id,
                className: `payment-method ${
                  selectedPaymentMethod === method.id ? "selected" : ""
                }`,
                onClick: () => !loading && setSelectedPaymentMethod(method.id),
              },
              React.createElement(
                "div",
                { className: "method-info" },
                React.createElement(
                  "span",
                  { className: "method-icon" },
                  method.icon
                ),
                React.createElement(
                  "span",
                  { className: "method-name" },
                  method.name
                )
              ),
              React.createElement("input", {
                type: "radio",
                name: "paymentMethod",
                value: method.id,
                checked: selectedPaymentMethod === method.id,
                onChange: () => setSelectedPaymentMethod(method.id),
                disabled: loading,
              })
            )
          )
        )
      ),

      // Action Buttons
      React.createElement(
        "div",
        { className: "modal-actions" },
        React.createElement(
          "button",
          {
            className: "btn btn-secondary",
            onClick: onClose,
            disabled: loading,
          },
          "Cancel"
        ),
        React.createElement(
          "button",
          {
            className: "btn btn-primary",
            onClick: handleConfirmPayment,
            disabled: loading,
          },
          loading ? "Processing..." : "Complete Order"
        )
      )
    )
  );
};

// Expose to global scope
window.PaymentModal = PaymentModal;
