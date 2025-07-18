// CartItem Component - Individual cart item with checkbox, image, details, and quantity controls
const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  onSelectionChange,
  toggleItemSelection,
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

  const handleCheckboxChange = async (e) => {
    const isChecked = e.target.checked;

    if (!toggleItemSelection) {
      console.error("toggleItemSelection function not provided");
      return;
    }

    try {
      // Use the toggleItemSelection function from useCart hook
      const result = await toggleItemSelection(productId, isChecked);

      if (result.success) {
        // Call the local callback to update UI state if needed
        if (onSelectionChange) {
          onSelectionChange(productId, isChecked);
        }
      } else {
        console.error("Failed to update item selection:", result.error);
        // Revert checkbox state on error
        e.target.checked = !isChecked;
      }
    } catch (error) {
      console.error("Error updating item selection:", error);
      // Revert checkbox state on error
      e.target.checked = !isChecked;
    }
  };

  // Render the row for this cart item
  return React.createElement(
    "div",
    {
      className: `cart-item-row ${item.isSelected ? "selected" : ""}`,
      "data-product-id": productId,
    },

    // Checkbox
    React.createElement(
      "div",
      { className: "cart-item-checkbox" },
      React.createElement("input", {
        type: "checkbox",
        checked: item.isSelected || false, // Use the database field
        onChange: handleCheckboxChange,
        className: "item-checkbox",
      })
    ),

    // Product Image
    React.createElement(
      "div",
      {
        style: { cursor: "pointer" },
        onClick: () => {
          window.location.href = `productdetail.html?id=${productId}`;
        },
      },
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
      React.createElement("div", { className: "product-name" }, productName),

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
        SharedComponents.QuantityModifier({
          quantity: item.quantity,
          onQuantityChange: handleQuantityChange,
          productId: productId,
        })
      )
    )
  );
};

// Expose CartItem to global scope
window.CartItem = CartItem;
