// Custom hook for orders data
const useOrders = () => {
  const [state, setState] = React.useState({
    orders: [],
    loading: false,
    error: null,
  });

  // Load orders data
  const loadOrders = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const token = localStorage.getItem("marketplace_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get user role from the user object
      let role = "buyer"; // default role
      try {
        const userData = localStorage.getItem("marketplace_user");
        if (userData) {
          const user = JSON.parse(userData);
          role = user.role || "buyer";
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }

      const response =
        role === "admin"
          ? await fetch("/api/orders/all", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
          : await fetch("/api/orders", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // The API returns { success: true, data: { orders, currentPage, totalPages, totalOrders } }
      const ordersData = result.data?.orders || result.orders || [];

      setState((prev) => ({
        ...prev,
        orders: ordersData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading orders:", error);
      setState((prev) => ({
        ...prev,
        error: `Error loading orders: ${error.message}`,
        loading: false,
      }));
    }
  }, []);

  return {
    orders: state.orders,
    loading: state.loading,
    error: state.error,
    loadOrders,
  };
};

window.useOrders = useOrders;
