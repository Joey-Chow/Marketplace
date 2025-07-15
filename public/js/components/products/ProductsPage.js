// ProductsPage component - Handles authentication and product page layout
const ProductsPage = () => {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);

  // Use ref to store search handler to avoid render-time setState
  const searchHandlerRef = React.useRef(null);
  const [, forceUpdate] = React.useState({});

  // Handle search handler updates
  const handleSearchHandlerReady = React.useCallback((handler) => {
    searchHandlerRef.current = handler;
    // Force update to re-initialize topbar with new handler
    forceUpdate({});
  }, []);

  // Initialize SharedTopbar when component mounts and user is authenticated
  React.useEffect(() => {
    if (user && window.SharedTopbar) {
      window.SharedTopbar.initialize("shared-topbar-root", {
        activeTab: "products",
        onSearch: searchHandlerRef.current,
      });
    }
  }, [user, searchHandlerRef.current]);

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

  // Show login form if not authenticated
  if (!user) {
    return React.createElement(LoginForm, {
      onLogin: handleLogin,
      loading: loginLoading,
      error: loginError,
    });
  }

  // Show main products page if authenticated
  return React.createElement(
    "div",
    { className: "app-layout" },
    // SharedTopbar container
    React.createElement("div", { id: "shared-topbar-root" }),
    // Main content area with products
    window.SharedLayout.render(
      React.createElement(ProductsContainer, {
        user,
        onSearchHandlerReady: handleSearchHandlerReady,
      })
    )
  );
};

window.ProductsPage = ProductsPage;
