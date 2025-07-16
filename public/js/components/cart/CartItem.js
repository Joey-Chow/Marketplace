// CartItem Component - Individual cart item with checkbox, image, details, and quantity controls
const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  isSelected = false,
  onSelectionChange,
}) => {
  const product = item.product || item;
  const productName = product.name || "Unknown Product";
  const productPrice = product.price || item.price || 0;
  const productImage =
    product.images[0].url || product.image || "images/products/placeholder.jpg";

  // Get the correct product ID - try multiple possible properties
  const productId = item.product?._id || item.product;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 0) return; // Changed from < 1 to < 0

    // If quantity is 0, remove the item
    if (newQuantity === 0) {
      requestAnimationFrame(() => {
        Promise.resolve()
          .then(() => {
            return onRemove(productId);
          })
          .catch((error) => {
            console.error("Error removing item:", error);
          });
      });
      return;
    }

    // Use requestAnimationFrame to defer the API call and prevent blocking
    requestAnimationFrame(() => {
      // Make the API call in a way that can't cause navigation
      Promise.resolve()
        .then(() => {
          return onQuantityChange(productId, newQuantity);
        })
        .catch((error) => {
          console.error("Error updating quantity:", error);
        });
    });
  };

  const handleCheckboxChange = (e) => {
    if (onSelectionChange) {
      onSelectionChange(productId, e.target.checked);
    }
  };

  const quantityModifie = () => {
    return React.createElement(
      "div",
      { className: "cart-item-quantity-controls" },

      // Decrease quantity button
      React.createElement(
        "span",
        {
          className: "quantity-controls-btn",
          onMouseDown: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (item.quantity > 0) {
              handleQuantityChange(item.quantity - 1);
            }
            return false;
          },
        },
        "-"
      ),

      // Display current quantity
      React.createElement(
        "span",
        { className: "quantity-display" },
        item.quantity
      ),

      // Increase quantity button
      React.createElement(
        "span",
        {
          className: "quantity-controls-btn",
          onMouseDown: (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleQuantityChange(item.quantity + 1);
            return false;
          },
        },
        "+"
      )
    );
  };

  // Render the cart item row
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
        { className: "cart-item-quantity" },
        quantityModifie()
      )
    )
  );
};

// Expose CartItem to global scope
window.CartItem = CartItem;
