// Main DataViewer component - Orchestrates the application layout and navigation
const DataViewer = () => {
  const { currentTab, loading, error, data, setCurrentTab, loadTabData } =
    useDataViewer();
  const productCRUD = useProductCRUD();
  const { user, loading: authLoading, login, logout } = useAuth();
  const cart = useCart();
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [showCartDropdown, setShowCartDropdown] = React.useState(false);

  // Load initial data only when authenticated
  React.useEffect(() => {
    if (user) {
      loadTabData("products");
    }
  }, [loadTabData, user]);

  // Load cart separately when user is authenticated and has cart access
  React.useEffect(() => {
    console.log(
      "DataViewer: Cart loading effect, user:",
      user?.role,
      "authLoading:",
      authLoading
    );
    if (
      user &&
      !authLoading &&
      (user.role === "admin" || user.role === "buyer")
    ) {
      // Small delay to ensure authentication is fully stable
      const timeoutId = setTimeout(() => {
        console.log(
          "DataViewer: Loading cart for user:",
          user.role,
          user.username
        );
        cart.loadCart();
      }, 300); // Increased delay slightly

      return () => clearTimeout(timeoutId);
    }
  }, [user, authLoading, cart.loadCart]);

  // Handle tab change
  const handleTabChange = React.useCallback(
    (tab) => {
      setCurrentTab(tab);
      loadTabData(tab);
      productCRUD.hideForm(); // Hide any open forms when switching tabs

      // Reload cart data when switching to cart tab
      if (
        tab === "cart" &&
        user &&
        (user.role === "admin" || user.role === "buyer")
      ) {
        cart.loadCart();
      }
    },
    [setCurrentTab, loadTabData, productCRUD.hideForm]
  );

  // Handle navigation to dashboard
  const handleNavigateToDashboard = React.useCallback(() => {
    window.location.href = "dashboard.html";
  }, []);

  // Handle login
  const handleLogin = async (email, password) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await login(email, password);
      if (!result.success) {
        setLoginError(result.error || "Login failed");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle product operations
  const handleProductSave = React.useCallback(
    async (productData) => {
      const success = await productCRUD.saveProduct(productData);
      if (success) {
        // Reload products data
        await loadTabData("products");
      }
    },
    [productCRUD.saveProduct, loadTabData]
  );

  const handleProductDelete = React.useCallback(
    async (productId) => {
      try {
        const result = await productCRUD.deleteProduct(productId);
        if (result) {
          // Reload products data only if deletion was successful
          await loadTabData("products");
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    },
    [productCRUD.deleteProduct, loadTabData]
  );

  // Handle add to cart
  const handleAddToCart = React.useCallback(
    async (product) => {
      try {
        const result = await cart.addToCart(product._id, 1);
        if (result.success) {
          alert(`✅ ${product.name} added to cart!`);
          // Log cart update for debugging
          console.log("Cart updated after adding item:", cart.cart);
        } else {
          alert(`❌ Failed to add to cart: ${result.error}`);
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        alert("❌ Failed to add item to cart. Please try again.");
      }
    },
    [cart.addToCart, cart.cart]
  );

  // Handle cart button click
  const handleCartClick = React.useCallback(() => {
    setCurrentTab("cart");
    loadTabData("cart");
    productCRUD.hideForm();
    setShowCartDropdown(false);

    // Reload cart data
    if (user && (user.role === "admin" || user.role === "buyer")) {
      cart.loadCart();
    }
  }, [setCurrentTab, loadTabData, productCRUD.hideForm, user, cart.loadCart]);

  // Handle topbar logout
  const handleTopbarLogout = React.useCallback(() => {
    logout();
    setCurrentTab("products");
  }, [logout, setCurrentTab]);

  // Render tab content using view components
  const renderTabContent = React.useMemo(() => {
    // Show loading/error states
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

    if (!data) {
      return React.createElement(
        "div",
        { className: "loading" },
        "No data available"
      );
    }

    // Route to appropriate view component
    switch (currentTab) {
      case "users":
        return React.createElement(UsersView, {
          data,
          loading,
          error,
        });

      case "products":
        return React.createElement(ProductsView, {
          data,
          loading,
          error,
          productCRUD,
          user,
          onProductSave: handleProductSave,
          onProductDelete: handleProductDelete,
          onAddToCart: handleAddToCart,
        });

      case "orders":
        return React.createElement(OrdersView, {
          data,
          loading,
          error,
        });

      case "reviews":
        return React.createElement(ReviewsView, {
          data,
          loading,
          error,
        });

      case "cart":
        return React.createElement(CartView, {
          cart,
          loading,
          error,
        });

      default:
        return React.createElement(
          "div",
          { className: "error" },
          "Unknown tab"
        );
    }
  }, [
    currentTab,
    loading,
    error,
    data,
    productCRUD,
    user,
    handleProductSave,
    handleProductDelete,
    handleAddToCart,
    cart,
  ]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return React.createElement(
      "div",
      { className: "loading-screen" },
      React.createElement("div", { className: "loading-spinner" }),
      React.createElement("p", null, "Loading...")
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return React.createElement(LoginForm, {
      onLogin: handleLogin,
      loading: loginLoading,
      error: loginError,
    });
  }

  // Show main application if authenticated
  return React.createElement(
    "div",
    { className: "app-layout" },
    // Topbar with navigation
    React.createElement(Topbar, {
      user,
      cart,
      onLogout: handleTopbarLogout,
      onCartClick: handleCartClick,
      showCartDropdown,
      currentTab,
      onTabChange: handleTabChange,
      onNavigateToDashboard: handleNavigateToDashboard,
    }),
    // Main content area (no sidebar)
    React.createElement(
      "div",
      { className: "main-content-full" },
      React.createElement(
        "div",
        { className: "content-header" },
        React.createElement("h1", null, "Advertisment"),
        React.createElement("p", null, "Enjoy our marketplace!")
      ),
      React.createElement(
        "div",
        { className: "dashboard" },
        React.createElement("div", { className: "content" }, renderTabContent)
      )
    ),
    // Product Form Modal
    productCRUD.showForm &&
      React.createElement(ProductForm, {
        product: productCRUD.editingProduct,
        onSave: handleProductSave,
        onCancel: productCRUD.hideForm,
        loading: productCRUD.loading,
      })
  );
};

window.DataViewer = DataViewer;
