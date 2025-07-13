// UsersView Component - Handles users display
const UsersView = ({ data, loading, error }) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading users..."
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

  const usersData = DataUtils.formatUsersData(data);

  return React.createElement(
    "div",
    null,
    React.createElement(
      "h2",
      null,
      `👥 Users (${(data.users || data).length} total)`
    ),
    React.createElement(DataViewerComponents.DataTable, {
      headers: usersData.headers,
      rows: usersData.rows,
      loading,
      error,
    })
  );
};

window.UsersView = UsersView;
