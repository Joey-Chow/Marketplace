// Chart utilities
const ChartUtils = {
  createSalesChart: (ctx, salesData) => {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: salesData.map((item) => `${item._id.month}/${item._id.day}`),
        datasets: [
          {
            label: "Sales ($)",
            data: salesData.map((item) => item.totalSales),
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "$" + value.toLocaleString();
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  },

  createProductsChart: (ctx, productsData) => {
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: productsData.map((item) => item.productName),
        datasets: [
          {
            label: "Quantity Sold",
            data: productsData.map((item) => item.totalQuantity),
            backgroundColor: [
              "#667eea",
              "#764ba2",
              "#f093fb",
              "#f5576c",
              "#4facfe",
            ],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  },

  createCategoryChart: (ctx, categoryData) => {
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categoryData.map((item) => item.categoryName),
        datasets: [
          {
            data: categoryData.map((item) => item.totalRevenue),
            backgroundColor: [
              "#667eea",
              "#764ba2",
              "#f093fb",
              "#f5576c",
              "#4facfe",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  },
};

window.ChartUtils = ChartUtils;
