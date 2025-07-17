// Shared UI Components used across all views

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

// Export shared components
window.SharedComponents = {
  DataTable,
};
