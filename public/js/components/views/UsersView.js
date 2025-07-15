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

  // Get total count from pagination data, fallback to users array length
  const totalCount = data.pagination?.total || (data.users || data).length;

  return React.createElement(
    "div",
    null,
    React.createElement("h2", null, `👥 Users (${totalCount} total)`),
    React.createElement(SharedComponents.DataTable, {
      headers: usersData.headers,
      rows: usersData.rows,
      loading,
      error,
    })
  );
};

window.UsersView = UsersView;
