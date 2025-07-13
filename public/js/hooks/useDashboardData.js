// Create hooks directory first
// Custom hook for dashboard data
const useDashboardData = () => {
  const [state, setState] = React.useState({
    loading: true,
    error: null,
    data: null,
    connected: false,
    connectionStatus: "🔴 Connecting...",
  });

  const [socket, setSocket] = React.useState(null);

  const updateConnectionStatus = React.useCallback((connected) => {
    setState((prev) => ({
      ...prev,
      connected,
      connectionStatus: connected ? "🟢 Connected" : "🔴 Disconnected",
    }));
  }, []);

  const connectSocket = React.useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        const socketInstance = io("http://localhost:3000");
        setSocket(socketInstance);

        const timeout = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, 5000);

        socketInstance.on("connect", () => {
          clearTimeout(timeout);
          console.log("Connected to server");
          updateConnectionStatus(true);
          resolve();
        });

        socketInstance.on("disconnect", () => {
          console.log("Disconnected from server");
          updateConnectionStatus(false);
        });

        socketInstance.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.error("Connection error:", error);
          updateConnectionStatus(false);
          reject(error);
        });
      } catch (error) {
        console.error("Socket initialization error:", error);
        updateConnectionStatus(false);
        reject(error);
      }
    });
  }, [updateConnectionStatus]);

  const loadDashboardData = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [overviewResponse, analyticsResponse] = await Promise.all([
        fetch("/api/data/overview"),
        fetch("/api/data/analytics"),
      ]);

      if (!overviewResponse.ok) {
        throw new Error(`Overview API failed: ${overviewResponse.status}`);
      }

      if (!analyticsResponse.ok) {
        throw new Error(`Analytics API failed: ${analyticsResponse.status}`);
      }

      const overview = await overviewResponse.json();
      const analytics = await analyticsResponse.json();

      // Transform the data
      const overviewData = overview.data.collections.reduce((acc, col) => {
        acc[col.name.toLowerCase()] = col.count;
        return acc;
      }, {});

      const dashboardData = {
        overview: {
          totalOrders: overviewData.orders || 0,
          totalRevenue: Math.round(analytics.data?.sales?.totalRevenue || 0),
          avgOrderValue: Math.round(analytics.data?.sales?.avgOrderValue || 0),
          newUsers: overviewData.users || 0,
          newProducts: overviewData.products || 0,
        },
        salesAnalytics: analytics.data?.monthlySales?.map((month, index) => ({
          _id: {
            year: month._id.year,
            month: month._id.month,
            day: index + 1,
          },
          totalSales: month.revenue,
          totalOrders: month.orderCount,
        })) || [
          {
            _id: { year: 2025, month: 6, day: 1 },
            totalSales: 25030,
            totalOrders: 17,
          },
          {
            _id: { year: 2025, month: 7, day: 2 },
            totalSales: 8020,
            totalOrders: 6,
          },
        ],
        topSellingProducts:
          analytics.data?.topProducts?.slice(0, 5).map((product) => ({
            productName: product.name,
            totalQuantity: product.totalSold,
            totalRevenue: product.totalRevenue,
          })) || [],
        categoryPerformance:
          analytics.data?.categoryPerformance?.map((cat) => ({
            categoryName: cat.categoryName || cat._id,
            totalRevenue: cat.totalRevenue || 0,
            totalOrders: cat.totalOrders || 0,
            totalQuantity: cat.totalQuantity || 0,
          })) || [],
      };

      setState((prev) => ({
        ...prev,
        data: dashboardData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load dashboard data: " + error.message,
        loading: false,
      }));
    }
  }, []);

  const showNotification = React.useCallback((message) => {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }, []);

  React.useEffect(() => {
    const init = async () => {
      await loadDashboardData();

      try {
        await connectSocket();
        console.log("Socket connected successfully");
      } catch (socketError) {
        console.warn(
          "Socket connection failed, continuing without real-time updates:",
          socketError
        );
        updateConnectionStatus(false);
      }
    };

    init();
  }, [loadDashboardData, connectSocket, updateConnectionStatus]);

  React.useEffect(() => {
    if (socket) {
      socket.on("orderCreated", (data) => {
        console.log("New order created:", data);
        showNotification("📦 New order received!");
      });

      socket.on("orderStatusUpdated", (data) => {
        console.log("Order status updated:", data);
        showNotification("📋 Order status updated");
      });

      socket.on("paymentCompleted", (data) => {
        console.log("Payment completed:", data);
        showNotification("💳 Payment completed");
      });

      return () => {
        socket.off("orderCreated");
        socket.off("orderStatusUpdated");
        socket.off("paymentCompleted");
      };
    }
  }, [socket, showNotification]);

  return {
    ...state,
    loadDashboardData,
  };
};

window.useDashboardData = useDashboardData;
