// Authentication hook for managing user login and JWT tokens
const useAuth = () => {
  const [state, setState] = React.useState({
    user: null,
    token: localStorage.getItem("marketplace_token"),
    loading: true, // Start with loading true
    error: null,
    isAuthenticated: false,
  });

  const verifyToken = React.useCallback(async (token) => {
    console.log("Verifying token:", token.substring(0, 20) + "...");

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Token verification response:", response.status);

      if (response.ok) {
        const userData = await response.json();
        const user = userData.data.user || userData.data || userData;

        console.log("Token verification successful:", user);

        // Save user data to localStorage for persistence
        localStorage.setItem("marketplace_user", JSON.stringify(user));

        setState((prev) => ({
          ...prev,
          user: user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));
      } else {
        console.log("Token verification failed:", response.status);
        // Token is invalid, remove it
        localStorage.removeItem("marketplace_token");
        localStorage.removeItem("marketplace_user");
        setState((prev) => ({
          ...prev,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Token verification error:", error);
      localStorage.removeItem("marketplace_token");
      localStorage.removeItem("marketplace_user");
      setState((prev) => ({
        ...prev,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  // Check if user is authenticated on mount
  React.useEffect(() => {
    console.log("useAuth: Initial load effect running");
    const token = localStorage.getItem("marketplace_token");
    const savedUser = localStorage.getItem("marketplace_user");

    console.log("useAuth: Token exists:", !!token);
    console.log("useAuth: Saved user exists:", !!savedUser);

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log("useAuth: Restoring user from localStorage:", user);
        setState((prev) => ({
          ...prev,
          user: user,
          token: token,
          isAuthenticated: true,
          loading: false,
        }));

        // Still verify token in background (but don't show loading)
        setTimeout(() => verifyToken(token), 100);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        // If saved data is corrupted, verify token normally
        verifyToken(token);
      }
    } else if (token) {
      console.log("useAuth: Token exists but no saved user, verifying...");
      // Verify token with backend
      verifyToken(token);
    } else {
      console.log("useAuth: No token found, setting loading to false");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [verifyToken]);

  const login = React.useCallback(async (email, password) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle the nested response structure from the backend
        const { token, user } = data.data || data;
        localStorage.setItem("marketplace_token", token);
        localStorage.setItem("marketplace_user", JSON.stringify(user));

        setState((prev) => ({
          ...prev,
          user: user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));

        return { success: true };
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: data.message || "Login failed",
        }));
        return { success: false, error: data.message };
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem("marketplace_token");
    localStorage.removeItem("marketplace_user");
    setState({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
    // Redirect to login page
    window.location.href = "/";
  }, []);

  const getAuthHeaders = React.useCallback(() => {
    const token = state.token || localStorage.getItem("marketplace_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [state.token]);

  return {
    ...state,
    login,
    logout,
    getAuthHeaders,
    verifyToken,
  };
};

// Export the hook globally
window.useAuth = useAuth;
