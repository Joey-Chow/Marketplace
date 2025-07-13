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

// StatsOverview Component - Used for dashboard-style displays
const StatsOverview = ({ stats }) => {
  return React.createElement(
    "div",
    null,
    React.createElement("h2", null, "📊 Database Overview"),
    React.createElement(
      "div",
      { className: "stats-grid" },
      Object.entries(stats).map(([key, value]) =>
        React.createElement(
          "div",
          { key, className: "stat-card" },
          React.createElement("h3", null, value),
          React.createElement("p", null, `${getIcon(key)} ${capitalize(key)}`)
        )
      )
    )
  );
};

// Helper functions
const getIcon = (key) => {
  const icons = {
    users: "👥",
    products: "📦",
    orders: "🛒",
    reviews: "⭐",
    categories: "📂",
    carts: "🛍️",
  };
  return icons[key] || "📊";
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Export shared components
window.SharedComponents = {
  DataTable,
  StatsOverview,
};
