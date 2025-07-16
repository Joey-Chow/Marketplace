// Initialize orders page
const OrderPage = () => {
  const { orders, loading, error, loadOrders } = window.useOrders();

  React.useEffect(() => {
    // Initialize SharedTopbar
    window.SharedTopbar.initialize("shared-topbar-root", {
      activeTab: "orders",
    });

    // Load orders
    loadOrders();
  }, [loadOrders]);

  // define orders table
  const OrdersView = ({ data, loading, error }) => {
    const ordersData = DataUtils.formatOrdersData(data);
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        null,
        `Orders (${(data.orders || data).length} total)`
      ),
      React.createElement(SharedComponents.DataTable, {
        headers: ordersData.headers,
        rows: ordersData.rows,
        loading,
        error,
      })
    );
  };

  // Render Orders table
  return React.createElement(
    "div",
    { className: "app-layout" },

    // SharedTopbar container
    React.createElement("div", { id: "shared-topbar-root" }),

    // Render OrdersView with orders data
    window.SharedLayout.render(
      React.createElement(OrdersView, {
        data: { orders }, // Wrap orders in an object to match OrdersView expectations
        loading,
        error,
      })
    )
  );
};

// Expose component globally
window.OrdersPage = OrderPage;
