// Enhanced Product Table Component
const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onAddToCart,
  loading,
  user,
}) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading products..."
    );
  }

  return React.createElement(
    "div",
    {
      className: "products-grid",
    },
    products.map((product) =>
      React.createElement(
        "div",
        {
          key: product._id,
          className: "product-card",
        },
        React.createElement(
          "div",
          {
            className: "product-image-section",
          },
          React.createElement("img", {
            src:
              product.images && product.images.length > 0
                ? product.images[0].url
                : "/images/products/placeholder.jpg",
            alt:
              product.images && product.images.length > 0
                ? product.images[0].alt
                : `${product.name} thumbnail`,
            className: "product-main-image",
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
            React.createElement(
              "button",
              {
                className: "topbar-btn",
                onClick: () => onAddToCart && onAddToCart(product),
              },
              "Add to Cart"
            )
        ),
        // Admin Edit/Delete buttons
        user?.role === "admin" &&
          React.createElement(
            "div",
            {
              className: "product-admin-actions",
            },
            React.createElement(
              "button",
              {
                className: "topbar-btn",
                onClick: () => onEdit(product),
              },
              "Edit"
            ),
            React.createElement(
              "button",
              {
                className: "topbar-btn",
                onClick: () => onDelete(product._id),
              },
              "Delete"
            )
          )
      )
    )
  );
};

window.ProductTable = ProductTable;
