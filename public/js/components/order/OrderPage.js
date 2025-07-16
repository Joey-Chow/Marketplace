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

  // Define which fields to display in the orders table
  const formatOrdersData = (data) => {
    const orders = data.orders || data;
    return {
      headers: [
        "Product",
        "Quantity",
        "Price",
        "Customer",
        "Status",
        "Payment",
        "Date",
        "Order Number",
      ],
      rows: orders.map((order) => {
        const productName = order.items[0]?.product?.name || "N/A";
        const quantity = order.items[0]?.quantity || 0;
        const price = order.items[0]?.price || 0;
        const customer = order.buyer?.username || "N/A";
        const date = order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "-";

        return [
          productName,
          quantity,
          `$${price.toFixed(2)}`,
          customer,
          React.createElement(
            "span",
            { className: `badge ${order.status}` },
            order.status
          ),
          React.createElement(
            "span",
            { className: `badge ${order.payment?.status}` },
            order.payment?.status
          ),
          date,
          order.orderNumber,
        ];
      }),
    };
  };

  // define orders table
  const OrdersView = ({ data, loading, error }) => {
    const ordersData = formatOrdersData(data);
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
