// Topbar Component - Integrates all topbar components including navigation
const Topbar = ({
  user,
  cart,
  onLogout,
  onCartClick,
  showCartDropdown = false,
  currentTab = null,
  onTabChange,
  onNavigateToDashboard,
  onSearch,
}) => {
  // Menu items (excluding Overview as requested)
  const menuItems = [
    { id: "users", label: "Users" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "reviews", label: "Reviews" },
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
    {
      className: "topbar",
    },

    // Left side: Navigation items
    React.createElement(
      "div",
      {
        className: "topbar-left",
      },
      // Dashboard button
      React.createElement(
        "button",
        {
          className: "topbar-btn topbar-nav-item dashboard-nav",
          onClick: onNavigateToDashboard,
        },
        React.createElement("span", null, "Dashboard")
      ),
      // Menu items
      filteredMenuItems.map((item) =>
        React.createElement(
          "button",
          {
            key: item.id,
            className: `topbar-btn topbar-nav-item ${
              currentTab === item.id ? "active" : ""
            }`,
            onClick: () => {
              // Direct navigation for specific items
              if (item.id === "users") {
                window.location.href = "Users.html";
              } else if (item.id === "orders") {
                window.location.href = "Orders.html";
              } else if (item.id === "reviews") {
                window.location.href = "Reviews.html";
              } else if (item.id === "products") {
                window.location.href = "index.html";
              }
            },
          },
          React.createElement("span", null, item.icon),
          React.createElement("span", null, item.label)
        )
      )
    ),

    // Right side: User Info, Logout, and Cart Button together
    React.createElement(
      "div",
      {
        className: "topbar-right",
      },
      // Searchbox Component
      React.createElement(Searchbox, {
        onSearch:
          onSearch ||
          ((query) => {
            console.log("Searching for:", query);
          }),
      }),
      // User Info Component
      user &&
        React.createElement(UserInfo, {
          user: user,
        }),
      // Logout Component
      user &&
        React.createElement(Logout, {
          onLogout: onLogout,
        }),
      // Cart Button - Show for buyers and admins
      (user?.role === "buyer" || user?.role === "admin") &&
        React.createElement(CartButton, {
          cart: cart,
          onClick: onCartClick,
          showDropdown: showCartDropdown,
        })
    )
  );
};

// Cart Button Component - Separate component for the cart button
const CartButton = ({ cart, onClick, showDropdown }) => {
  // Calculate total item count - cart data comes from API as direct cart object
  const itemCount =
    cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  return React.createElement(
    "div",
    {
      className: "cart-button-container",
    },
    React.createElement(
      "a",
      {
        className: "topbar-btn",
        href: "MyCart.html",
        style: { textDecoration: "none", color: "inherit" },
      },
      React.createElement("span", null, "🛒"),
      React.createElement("span", null, "My Cart"),
      itemCount > 0 &&
        React.createElement(
          "span",
          {
            className: "cart-badge",
          },
          itemCount
        )
    )
  );
};

window.Topbar = Topbar;
window.CartButton = CartButton;
