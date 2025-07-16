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
    style.textContent = `
      /* Payment Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .payment-modal {
        background: white;
        border-radius: 12px;
        padding: 28px;
        max-width: 550px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        border: 1px solid #e1e5e9;
      }

      @keyframes slideIn {
        from { 
          transform: translateY(-20px);
          opacity: 0;
        }
        to { 
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* Modal Header */
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #f1f3f4;
      }

      .modal-header h2 {
        margin: 0;
        color: #1a1a1a;
        font-size: 24px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #6c757d;
        padding: 4px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .close-btn:hover {
        color: #dc3545;
        background-color: #f8f9fa;
      }

      .close-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Order Summary Section */
      .order-summary-section {
        margin-bottom: 24px;
      }

      .order-summary-section h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
      }

      .summary-details {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        background-color: #f8f9fa;
      }

      .summary-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .summary-line:last-child {
        margin-bottom: 0;
      }

      .summary-line.total {
        font-weight: 600;
        font-size: 16px;
        border-top: 1px solid #dee2e6;
        padding-top: 8px;
        margin-top: 8px;
        color: #2c3e50;
      }

      .summary-line .free {
        color: #28a745;
        font-weight: 600;
        font-size: 12px;
      }

      /* Shipping Section */
      .shipping-section {
        margin-bottom: 24px;
      }

      .shipping-section h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
      }

      .address-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .address-row {
        display: flex;
        gap: 12px;
      }

      .address-form input {
        padding: 12px 16px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 14px;
        transition: all 0.2s ease;
        background-color: white;
        font-family: inherit;
      }

      .address-form input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .address-form input:disabled {
        background-color: #f8f9fa;
        color: #6c757d;
        cursor: not-allowed;
      }

      .address-form input::placeholder {
        color: #6c757d;
      }

      /* Payment Methods Section */
      .payment-methods-section {
        margin-bottom: 24px;
      }

      .payment-methods-section h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
      }

      .payment-methods {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .payment-method {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: white;
        position: relative;
      }

      .payment-method:hover {
        border-color: #007bff;
        background-color: #f8f9fa;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
      }

      .payment-method.selected {
        border-color: #007bff;
        background-color: #e3f2fd;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
      }

      .payment-method.selected::after {
        content: '✓';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #007bff;
        font-weight: bold;
        font-size: 16px;
      }

      .method-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .method-icon {
        font-size: 22px;
        width: 32px;
        display: flex;
        justify-content: center;
      }

      .method-name {
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }

      .payment-method input[type="radio"] {
        display: none;
      }

      /* Modal Actions */
      .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e9ecef;
      }

      .modal-actions .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
      }

      .modal-actions .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .modal-actions .btn-secondary:hover {
        background-color: #5a6268;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
      }

      .modal-actions .btn-primary {
        background-color: #007bff;
        color: white;
        position: relative;
      }

      .modal-actions .btn-primary:hover {
        background-color: #0056b3;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
      }

      .modal-actions .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .modal-actions .btn:disabled:hover {
        transform: none;
        box-shadow: none;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .payment-modal {
          width: 95%;
          padding: 20px;
          max-height: 90vh;
        }
        
        .modal-header h2 {
          font-size: 20px;
        }
        
        .address-row {
          flex-direction: column;
          gap: 8px;
        }
        
        .modal-actions {
          flex-direction: column;
        }
        
        .modal-actions .btn {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .payment-modal {
          width: 100%;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
          }
          to { 
            transform: translateY(0);
          }
        }
      }

      /* Loading state styles */
      .payment-modal.loading {
        pointer-events: none;
      }

      .payment-modal.loading .address-form input,
      .payment-modal.loading .payment-method {
        opacity: 0.7;
      }

      /* Enhanced visual feedback */
      .payment-method:active {
        transform: translateY(1px);
      }

      .modal-actions .btn:active {
        transform: translateY(1px);
      }

      /* Custom scrollbar for modal */
      .payment-modal::-webkit-scrollbar {
        width: 6px;
      }

      .payment-modal::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      .payment-modal::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      .payment-modal::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;

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

    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode
    ) {
      alert("Please fill in all shipping address fields");
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
