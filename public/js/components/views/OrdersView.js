// OrdersView Component - Handles orders display
const OrdersView = ({ data, loading, error }) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading orders..."
    );
  }

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  if (!data) {
    return React.createElement(
      "div",
      { className: "loading" },
      "No data available"
    );
  }

  const ordersData = DataUtils.formatOrdersData(data);

  return React.createElement(
    "div",
    null,
    React.createElement(
      "h2",
      null,
      `🛒 Orders (${(data.orders || data).length} total)`
    ),
    React.createElement(SharedComponents.DataTable, {
      headers: ordersData.headers,
      rows: ordersData.rows,
      loading,
      error,
    })
  );
};

window.OrdersView = OrdersView;
