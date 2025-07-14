// ProductsPage component - Handles authentication and product page layout
const ProductsPage = () => {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);

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

  // Handle topbar logout
  const handleTopbarLogout = React.useCallback(() => {
    logout();
  }, [logout]);

  // Handle navigation to dashboard
  const handleNavigateToDashboard = React.useCallback(() => {
    window.location.href = "dashboard.html";
  }, []);

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

  // Show main products page if authenticated
  return React.createElement(
    "div",
    { className: "app-layout" },
    // Topbar with navigation
    React.createElement(Topbar, {
      user,
      onLogout: handleTopbarLogout,
      onNavigateToDashboard: handleNavigateToDashboard,
    }),
    // Main content area with products
    SharedLayout.render(React.createElement(ProductsContainer, { user }))
  );
};

window.ProductsPage = ProductsPage;
