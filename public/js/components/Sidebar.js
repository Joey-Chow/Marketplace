// Sidebar Component
const Sidebar = ({
  currentTab,
  onTabChange,
  onNavigateToDashboard,
  user,
  onLogout,
}) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.roles) {
      return user && item.roles.includes(user.role);
    }
    return true;
  });

  return React.createElement(
    "div",
    { className: "sidebar" },
    React.createElement(
      "nav",
      { className: "sidebar-nav" },
      // Dashboard navigation button
      React.createElement(
        "button",
        {
          className: "nav-item dashboard-nav",
          onClick: onNavigateToDashboard,
        },
        React.createElement("span", { className: "nav-icon" }, "📈"),
        React.createElement("span", null, "Dashboard")
      ),
      // All menu items directly
      filteredMenuItems.map((item) =>
        React.createElement(
          "button",
          {
            key: item.id,
            className: `nav-item ${currentTab === item.id ? "active" : ""}`,
            onClick: () => onTabChange(item.id),
          },
          React.createElement("span", { className: "nav-icon" }, item.icon),
          React.createElement("span", null, item.label)
        )
      )
    )
  );
};

window.Sidebar = Sidebar;
