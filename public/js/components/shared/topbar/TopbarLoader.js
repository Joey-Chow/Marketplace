// Shared topbar functionality
window.SharedTopbar = {
  async initialize(containerId = "shared-topbar-root", options = {}) {
    try {
      // Check authentication
      const auth = this.checkAuth();
      if (!auth) {
        return this.renderUnauthenticated(containerId);
      }

      // Load cart data if user is buyer or admin
      let cartData = null;
      if (auth.user.role === "buyer" || auth.user.role === "admin") {
        cartData = await this.loadCartData();
      }

      // Render topbar
      const root = ReactDOM.createRoot(document.getElementById(containerId));
      root.render(
        React.createElement(Topbar, {
          user: auth.user,
          cart: cartData,
          onLogout: this.handleLogout.bind(this),
          onCartClick: () => (window.location.href = "MyCart.html"),
          showCartDropdown: false,
          currentTab: options.activeTab || null,
          onTabChange: this.handleTabChange.bind(this),
          onNavigateToDashboard: () =>
            (window.location.href = "dashboard.html"),
        })
      );

      return { success: true, authenticated: true, user: auth.user };
    } catch (error) {
      console.error("Shared topbar initialization error:", error);
      return { success: false, error: error.message };
    }
  },

  checkAuth() {
    try {
      const token =
        localStorage.getItem("marketplace_token") ||
        sessionStorage.getItem("marketplace_token");
      const user = localStorage.getItem("marketplace_user");

      if (token && user) {
        return { token, user: JSON.parse(user) };
      }
      return null;
    } catch (error) {
      console.error("Auth check error:", error);
      return null;
    }
  },

  async loadCartData() {
    try {
      const token =
        localStorage.getItem("marketplace_token") ||
        sessionStorage.getItem("marketplace_token");

      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Handle ApiResponse format
        return result.data?.cart || result.data || result.cart || result;
      }
      return null;
    } catch (error) {
      console.error("Cart loading error:", error);
      return null;
    }
  },

  renderUnauthenticated(containerId) {
    const root = ReactDOM.createRoot(document.getElementById(containerId));
    root.render(
      React.createElement(
        "div",
        { className: "topbar unauthenticated" },
        React.createElement(
          "div",
          { className: "topbar-left" },
          React.createElement("h2", null, "Marketplace")
        ),
        React.createElement(
          "div",
          { className: "topbar-right" },
          React.createElement(
            "a",
            {
              href: "index.html",
              className: "topbar-btn",
            },
            "Login"
          )
        )
      )
    );
    return { success: true, authenticated: false };
  },

  handleLogout() {
    localStorage.removeItem("marketplace_token");
    localStorage.removeItem("marketplace_user");
    sessionStorage.removeItem("marketplace_token");
    sessionStorage.removeItem("marketplace_user");
    window.location.href = "index.html";
  },

  handleTabChange(tabId) {
    // Navigate to appropriate page based on tab
    const pageMap = {
      users: "Users.html",
      products: "index.html", // Main app for products
      orders: "Orders.html",
      reviews: "Reviews.html",
    };

    if (pageMap[tabId]) {
      window.location.href = pageMap[tabId];
    }
  },
};
