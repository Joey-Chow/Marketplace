// Shared UI Components used across all views

// Shared layout component for consistent page structure across all pages
window.SharedLayout = {
  render(content) {
    return React.createElement(
      "div",
      { className: "main-content-full" },

      // Header section with title and description
      React.createElement(
        "div",
        { className: "content-header" },
        React.createElement("h1", null, "Advertisement"),
        React.createElement("p", null, "Enjoy our marketplace!")
      ),

      // Main content area
      React.createElement(
        "div",
        { className: "dashboard" },
        React.createElement("div", { className: "content" }, content)
      )
    );
  },
};

// DataTable Component - Used by UsersView, OrdersView, ReviewsView, etc.
const DataTable = ({ headers, rows, loading, error }) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading data..."
    );
  }

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  return React.createElement(
    "div",
    { className: "table-container" },
    React.createElement(
      "table",
      { className: "data-table" },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          headers.map((header, index) =>
            React.createElement("th", { key: index }, header)
          )
        )
      ),
      React.createElement(
        "tbody",
        null,
        rows.map((row, index) =>
          React.createElement(
            "tr",
            { key: index },
            row.map((cell, cellIndex) =>
              React.createElement("td", { key: cellIndex }, cell)
            )
          )
        )
      )
    )
  );
};

// AdSection Component
const AdSection = ({ content }) => {
  return React.createElement(
    "div",
    { className: "main-content-full" },

    // Header section with title and description
    React.createElement(
      "div",
      { className: "content-header" },
      React.createElement("h1", null, "Advertisement"),
      React.createElement("p", null, "Enjoy our marketplace!")
    ),

    // Main content area
    React.createElement(
      "div",
      { className: "dashboard" },
      React.createElement("div", { className: "content" }, content)
    )
  );
};

const QuantityModifier = ({ quantity, onQuantityChange, productId }) => {
  return React.createElement(
    "div",
    { className: "cart-item-quantity-controls" },

    // Decrease quantity button
    React.createElement(
      "span",
      {
        className: "quantity-controls-btn",
        onMouseDown: (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (quantity > 0) {
            onQuantityChange(quantity - 1);
          }
          return false;
        },
      },
      "-"
    ),

    // Display current quantity
    React.createElement("span", { className: "quantity-display" }, quantity),

    // Increase quantity button
    React.createElement(
      "span",
      {
        className: "quantity-controls-btn",
        onMouseDown: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onQuantityChange(quantity + 1);
          return false;
        },
      },
      "+"
    )
  );
};

// Export shared components
window.SharedComponents = {
  DataTable,
  AdSection,
  QuantityModifier,
};
