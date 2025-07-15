// ProductsView Component - Handles products display with category navigation
const ProductsView = ({
  data,
  error,
  productCRUD,
  user,
  onProductDelete,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [categories, setCategories] = React.useState([]);

  // Load categories when data changes
  React.useEffect(() => {
    if (data && data.categories) {
      setCategories(data.categories);
    }
  }, [data]);

  // Reset category filter when data changes
  React.useEffect(() => {
    setSelectedCategory("all");
  }, [data]);

  const allProducts = data?.products || data || [];

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter(
          (product) =>
            product.category?._id === selectedCategory ||
            product.category?.name === selectedCategory
        );

  const renderCreateButton = () => {
    // Show "Sell Your Product" button for sellers and admins
    if (user?.role === "seller" || user?.role === "admin") {
      return React.createElement(
        "button",
        {
          className: "topbar-btn",
          onClick: productCRUD.showCreateForm,
        },
        React.createElement("span", null, "+"),
        React.createElement("span", null, "Sell Your Product")
      );
    }
    return null;
  };

  const renderCategoryNavigation = () => {
    if (categories.length === 0) return null;

    // Render category navigation
    return React.createElement(
      "div",
      { className: "category-navigation" },
      React.createElement(
        "button",
        {
          className: `category-btn ${
            selectedCategory === "all" ? "active" : ""
          }`,
          onClick: () => setSelectedCategory("all"),
        },
        "All"
      ),
      categories.map((category) =>
        // Render each category button
        React.createElement(
          "button",
          {
            key: category._id,
            className: `category-btn ${
              selectedCategory === category._id ? "active" : ""
            }`,
            onClick: () => setSelectedCategory(category._id),
          },
          category.name
        )
      )
    );
  };

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { className: "section-header" },
      React.createElement(
        "h2",
        null,
        selectedCategory === "all"
          ? `All Products (${filteredProducts.length} total)`
          : `${
              categories.find((cat) => cat._id === selectedCategory)?.name ||
              "Products"
            } (${filteredProducts.length} total)`
      ),
      renderCreateButton()
    ),
    renderCategoryNavigation(),
    React.createElement(ProductTable, {
      products: filteredProducts,
      onEdit: productCRUD.showEditForm,
      onDelete: onProductDelete,
      onAddToCart: onAddToCart,
      loading: productCRUD.loading,
      user: user,
    })
  );
};

window.ProductsView = ProductsView;
