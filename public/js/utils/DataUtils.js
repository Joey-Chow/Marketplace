// Data formatting utilities
// Define which attributes to display for each data type

const DataUtils = {
  formatOverviewData: (data) => {
    const collections = {};
    data.collections.forEach((col) => {
      collections[col.name.toLowerCase()] = col.count;
    });
    return collections;
  },

  formatUsersData: (data) => {
    const users = data.users || data;
    return {
      headers: ["Username", "Email", "Role", "Name", "Store", "Joined"],
      rows: users.map((user) => {
        const name = `${user.profile?.firstName || ""} ${
          user.profile?.lastName || ""
        }`.trim();
        const store = user.sellerInfo?.storeName || "-";
        const joined = user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "-";

        return [
          user.username,
          user.email,
          React.createElement(
            "span",
            { className: `badge ${user.role}` },
            user.role
          ),
          name,
          store,
          joined,
        ];
      }),
    };
  },

  formatProductsData: (data) => {
    const products = data.products || data;
    return {
      headers: ["Name", "Price", "Stock", "Rating", "Seller", "Category"],
      rows: products.map((product) => {
        const rating = product.ratings?.average
          ? product.ratings.average.toFixed(1)
          : "N/A";
        const seller = product.seller?.username || "N/A";
        const category = product.category?.name || "N/A";

        return [
          product.name,
          `$${product.price}`,
          product.inventory?.quantity || 0,
          `${rating} ⭐`,
          seller,
          category,
        ];
      }),
    };
  },

  formatReviewsData: (data) => {
    const reviews = data.reviews || data;
    return {
      headers: ["Product", "Customer", "Rating", "Title", "Verified", "Date"],
      rows: reviews.map((review) => {
        const product = review.product?.name || "N/A";
        const customer = review.buyer?.username || "N/A";
        const verified = review.verified ? "✅" : "❌";
        const date = review.createdAt
          ? new Date(review.createdAt).toLocaleDateString()
          : "-";

        return [
          product,
          customer,
          `${review.rating} ⭐`,
          review.title || "N/A",
          verified,
          date,
        ];
      }),
    };
  },

  formatCategoriesData: (data) => {
    const categories = data.categories || data;
    return {
      headers: ["Icon", "Name", "Description", "Products"],
      rows: categories.map((category) => [
        category.icon || "📁",
        category.name,
        category.description || "-",
        category.productCount || 0,
      ]),
    };
  },

  formatAnalyticsData: (data) => {
    return {
      stats: {
        totalRevenue: data.sales?.totalRevenue?.toFixed(2) || "0.00",
        totalOrders: data.sales?.totalOrders || 0,
        avgOrderValue: data.sales?.avgOrderValue?.toFixed(2) || "0.00",
        avgRating: "4.2/5",
      },
      categoryPerformance: data.categoryPerformance || [],
      topProducts: data.topProducts || [],
    };
  },
};

window.DataUtils = DataUtils;
