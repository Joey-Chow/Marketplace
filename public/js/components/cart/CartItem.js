// CartItem Component - Individual cart item with checkbox, image, details, and quantity controls
const CartItem = ({ item, loading, onQuantityChange, onRemove }) => {
  const [isSelected, setIsSelected] = React.useState(true);

  const product = item.product || item;
  const productName = product.name || "Unknown Product";
  const productPrice = product.price || item.price || 0;
  const productImage =
    product.imageUrl || product.image || "images/products/placeholder.jpg";

  // Get the correct product ID - try multiple possible properties
  const productId =
    item.productId || item.product?._id || item._id || product._id;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await onQuantityChange(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove(productId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckboxChange = (e) => {
    setIsSelected(e.target.checked);
    // TODO: Implement selected items logic for bulk operations
  };

  return React.createElement(
    "div",
    {
      className: `cart-item-row ${isSelected ? "selected" : ""}`,
      "data-product-id": productId,
    },

    // Checkbox
    React.createElement(
      "div",
      { className: "cart-item-checkbox" },
      React.createElement("input", {
        type: "checkbox",
        checked: isSelected,
        onChange: handleCheckboxChange,
        className: "item-checkbox",
      })
    ),

    // Product Image
    React.createElement(
      "div",
      { className: "product-image-section" },
      React.createElement("img", {
        src: productImage,
        alt: productName,
        className: "cart-item-image",
        onError: (e) => {
          e.target.src = "images/products/placeholder.jpg";
        },
      })
    ),

    // Product Details (Name and Price in vertical layout)
    React.createElement(
      "div",
      { className: "cart-item-info" },

      // Product Name
      React.createElement(
        "div",
        { className: "product-name-cart" },
        productName
      ),

      // Product Price
      React.createElement(
        "div",
        { className: "product-price-display" },
        `$${productPrice.toFixed(2)}`
      ),

      // Quantity Modifier
      React.createElement(
        "div",
        { className: "cart-item-quantity-controls" },
        React.createElement(
          "button",
          {
            onClick: (e) => {
              e.preventDefault();
              handleQuantityChange(item.quantity - 1);
            },
            disabled: loading || item.quantity <= 1,
            className: "quantity-btn quantity-decrease",
            "aria-label": "Decrease quantity",
          },
          "-"
        ),
        React.createElement(
          "span",
          { className: "quantity-display" },
          item.quantity
        ),
        React.createElement(
          "button",
          {
            onClick: (e) => {
              e.preventDefault();
              handleQuantityChange(item.quantity + 1);
            },
            disabled: loading,
            className: "quantity-btn quantity-increase",
            "aria-label": "Increase quantity",
          },
          "+"
        )
      )
    )

    // Quantity Modifier
  );
};

// Expose CartItem to global scope
window.CartItem = CartItem;
