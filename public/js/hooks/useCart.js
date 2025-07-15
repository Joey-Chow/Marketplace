// Cart management hook
const useCart = () => {
  const [cart, setCart] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Load cart data
  const loadCart = React.useCallback(async () => {
    const token = localStorage.getItem("marketplace_token");
    if (!token) {
      console.log("No authentication token found for cart loading");
      setError("No authentication token found");
      return;
    }

    console.log("Loading cart with token:", token.substring(0, 20) + "...");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Cart API response:", data);

      if (response.ok && data.success) {
        setCart(data.data.cart);
        console.log("Cart loaded successfully:", data.data.cart);
      } else {
        setError(data.message || "Failed to load cart");
        console.error("Cart load error:", data.message);
      }
    } catch (err) {
      setError("Failed to load cart");
      console.error("Load cart error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = React.useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("marketplace_token")}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        return { success: true, message: data.message };
      } else {
        setError(data.message || "Failed to add item to cart");
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = "Failed to add item to cart";
      setError(errorMsg);
      console.error("Add to cart error:", err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity
  const updateQuantity = React.useCallback(async (productId, quantity) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("marketplace_token")}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        return { success: true };
      } else {
        setError(data.message || "Failed to update cart");
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = "Failed to update cart";
      setError(errorMsg);
      console.error("Update cart error:", err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeItem = React.useCallback(async (productId) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("marketplace_token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        return { success: true };
      } else {
        setError(data.message || "Failed to remove item");
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = "Failed to remove item";
      setError(errorMsg);
      console.error("Remove item error:", err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load cart when token is available
  React.useEffect(() => {
    console.log("useCart: Auto-load effect running");
    const token = localStorage.getItem("marketplace_token");
    const savedUser = localStorage.getItem("marketplace_user");

    if (token && savedUser && !cart && !loading) {
      try {
        const user = JSON.parse(savedUser);
        console.log("useCart: Auto-loading cart for user:", user.role);
        if (user.role === "admin" || user.role === "buyer") {
          setTimeout(() => loadCart(), 500); // Give time for auth to stabilize
        }
      } catch (error) {
        console.error("useCart: Error parsing saved user:", error);
      }
    }
  }, []); // Only run once on mount

  return {
    cart,
    loading,
    error,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
  };
};

// Expose useCart to global scope
window.useCart = useCart;
