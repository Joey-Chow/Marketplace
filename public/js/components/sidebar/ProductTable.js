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
            className: "product-image-container",
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
        React.createElement(
          "div",
          {
            className: "product-details-section",
          },
          React.createElement(
            "div",
            {
              className: "product-name",
            },
            product.name
          ),
          React.createElement(
            "div",
            { className: "product-price-display" },
            `$${product.price}`
          ),
          React.createElement(
            "div",
            { className: "product-category-display" },
            product.category?.name || "N/A"
          ),
          // Add to Cart button in info column
          (user?.role === "buyer" || user?.role === "admin") &&
            React.createElement(
              "div",
              { className: "product-cart-section" },
              React.createElement(
                "button",
                {
                  className: "btn-sm btn-success product-cart-btn",
                  onClick: () => onAddToCart && onAddToCart(product),
                },
                "Add to Cart"
              )
            ),
          // Admin Edit/Delete buttons below Add to Cart
          user?.role === "admin" &&
            React.createElement(
              "div",
              {
                className: "product-admin-actions",
              },
              React.createElement(
                "button",
                {
                  className: "btn-sm btn-primary product-edit-btn",
                  onClick: () => onEdit(product),
                },
                "Edit"
              ),
              React.createElement(
                "button",
                {
                  className: "btn-sm btn-danger product-delete-btn",
                  onClick: () => onDelete(product._id),
                },
                "Delete"
              )
            )
        )
      )
    )
  );
};

window.ProductTable = ProductTable;
