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

  const ProductTable = ({
    products,
    onEdit,
    onDelete,
    onAddToCart,
    loading,
    user,
  }) => {
    return React.createElement(
      "div",
      {
        className: "products-grid",
      },
      products.map((product) =>
        // Render each product card
        React.createElement(
          "div",
          {
            key: product._id,
            className: "product-card",
            onClick: () =>
              (window.location.href = `ProductDetail.html?id=${product._id}`),
          },

          // Product image section
          React.createElement(
            "div",
            {
              className: "product-image-section",
            },
            React.createElement("img", {
              className: "product-main-image",
              src:
                product.images && product.images.length > 0
                  ? product.images[0].url
                  : "/images/products/placeholder.jpg",
              alt:
                product.images && product.images.length > 0
                  ? product.images[0].alt
                  : `${product.name} thumbnail`,
              onError: (e) => {
                e.target.src = "/images/products/placeholder.jpg";
              },
            })
          ),

          // Product name under image
          React.createElement(
            "div",
            {
              className: "product-name",
            },
            product.name
          ),

          // Product description
          React.createElement(
            "div",
            { className: "product-description" },
            product.description
              ? product.description.length > 100
                ? product.description.substring(0, 100) + "..."
                : product.description
              : "No description available"
          ),

          // Price and Add to Cart section
          React.createElement(
            "div",
            { className: "product-price-cart-section" },
            React.createElement(
              "div",
              { className: "product-price-display" },
              `$${product.price}`
            ),
            (user?.role === "buyer" || user?.role === "admin") &&
              React.createElement("img", {
                className: "add-to-cart-icon",
                src: "/images/logo/cart.png",
                onClick: (e) => {
                  onAddToCart && onAddToCart(product);
                  e.stopPropagation();
                },
              })
          ),

          // Admin section
          user?.role === "admin" &&
            React.createElement(
              "div",
              {
                className: "product-admin-actions",
              },

              // stock status
              React.createElement(
                "div",
                { className: "topbar-btn" },
                `Stock: ${product.inventory?.quantity}`
              ),

              // Edit button
              React.createElement(
                "button",
                {
                  className: "topbar-btn",
                  onClick: (e) => {
                    onEdit(product);
                    e.stopPropagation();
                  },
                },
                "Edit"
              ),

              // Delete button
              React.createElement(
                "button",
                {
                  className: "topbar-btn",
                  onClick: (e) => {
                    onDelete(product._id);
                    e.stopPropagation();
                  },
                },
                "Delete"
              )
            )
        )
      )
    );
  };

  // Show all products
  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { className: "section-header" },
      renderCreateButton()
    ),
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
