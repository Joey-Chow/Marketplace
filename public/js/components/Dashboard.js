// Main Dashboard Component
const Dashboard = () => {
  const { loading, error, data, connected, connectionStatus } =
    useDashboardData();
  const chartsRef = React.useRef({});

  // Prepare stats data
  const stats = React.useMemo(() => {
    if (!data) return [];

    const { overview } = data;
    return [
      {
        title: "Total Orders",
        value: overview.totalOrders.toLocaleString(),
        change: "+12.5%",
      },
      {
        title: "Total Revenue",
        value: `$${overview.totalRevenue.toLocaleString()}`,
        change: "+8.3%",
      },
      {
        title: "Avg Order Value",
        value: `$${overview.avgOrderValue}`,
        change: "+5.2%",
      },
      {
        title: "New Users",
        value: overview.newUsers.toString(),
        change: "+15.7%",
      },
      {
        title: "New Products",
        value: overview.newProducts.toString(),
        change: "+22.1%",
      },
    ];
  }, [data]);

  // Create charts when data is available
  React.useEffect(() => {
    if (data && !loading && !error) {
      // Clean up existing charts
      Object.values(chartsRef.current).forEach((chart) => {
        if (chart) chart.destroy();
      });

      // Create new charts
      setTimeout(() => {
        const salesCtx = document
          .getElementById("salesChart")
          ?.getContext("2d");
        const productsCtx = document
          .getElementById("productsChart")
          ?.getContext("2d");
        const categoryCtx = document
          .getElementById("categoryChart")
          ?.getContext("2d");

        if (salesCtx) {
          chartsRef.current.sales = ChartUtils.createSalesChart(
            salesCtx,
            data.salesAnalytics
          );
        }

        if (productsCtx) {
          chartsRef.current.products = ChartUtils.createProductsChart(
            productsCtx,
            data.topSellingProducts
          );
        }

        if (categoryCtx) {
          chartsRef.current.category = ChartUtils.createCategoryChart(
            categoryCtx,
            data.categoryPerformance
          );
        }
      }, 100);
    }
  }, [data, loading, error]);

  // Cleanup charts on unmount
  React.useEffect(() => {
    return () => {
      Object.values(chartsRef.current).forEach((chart) => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(RealTimeIndicator, {
      connected,
      status: connectionStatus,
    }),
    React.createElement(
      "div",
      { className: "dashboard" },
      React.createElement(
        "div",
        { className: "header" },
        React.createElement("h1", null, "🛍️ Marketplace Analytics"),
        React.createElement(
          "p",
          null,
          "Real-time insights and performance metrics"
        )
      ),
      React.createElement(StatsGrid, {
        stats,
        loading,
        error,
      }),
      React.createElement(
        "div",
        { className: "charts-section" },
        React.createElement(ChartContainer, {
          title: "Sales Over Time",
          chartId: "salesChart",
        }),
        React.createElement(ChartContainer, {
          title: "Top Selling Products",
          chartId: "productsChart",
        }),
        React.createElement(ChartContainer, {
          title: "Category Performance",
          chartId: "categoryChart",
        })
      )
    )
  );
};

window.Dashboard = Dashboard;
