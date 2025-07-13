// ProductsContainer - Handles product data loading and operations
const ProductsContainer = ({ user }) => {
  const { loading, error, data, loadTabData } = useDataViewer();
  const productCRUD = useProductCRUD();
  const cart = useCart();

  // Load products data when component mounts
  React.useEffect(() => {
    if (user) {
      loadTabData("products");
    }
  }, [loadTabData, user]);

  // Load cart for users who can add to cart
  React.useEffect(() => {
    if (user && (user.role === "admin" || user.role === "buyer")) {
      const timeoutId = setTimeout(() => {
        cart.loadCart();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [user, cart.loadCart]);

  // Handle product save
  const handleProductSave = React.useCallback(
    async (productData) => {
      const success = await productCRUD.saveProduct(productData);
      if (success) {
        // Reload products data
        await loadTabData("products");
      }
    },
    [productCRUD.saveProduct, loadTabData]
  );

  // Handle product delete
  const handleProductDelete = React.useCallback(
    async (productId) => {
      try {
        const result = await productCRUD.deleteProduct(productId);
        if (result) {
          // Reload products data only if deletion was successful
          await loadTabData("products");
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    },
    [productCRUD.deleteProduct, loadTabData]
  );

  // Handle add to cart
  const handleAddToCart = React.useCallback(
    async (product) => {
      try {
        const result = await cart.addToCart(product._id, 1);
        if (result.success) {
          alert(`✅ ${product.name} added to cart!`);
        } else {
          alert(`❌ Failed to add to cart: ${result.error}`);
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        alert("❌ Failed to add item to cart. Please try again.");
      }
    },
    [cart.addToCart]
  );

  // Show loading/error states
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading products..."
    );
  }

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  if (!data) {
    return React.createElement(
      "div",
      { className: "loading" },
      "No product data available"
    );
  }

  // Render products view with modal
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(ProductsView, {
      data,
      loading,
      error,
      productCRUD,
      user,
      onProductSave: handleProductSave,
      onProductDelete: handleProductDelete,
      onAddToCart: handleAddToCart,
    }),
    // Product Form Modal
    productCRUD.showForm &&
      React.createElement(ProductForm, {
        product: productCRUD.editingProduct,
        onSave: handleProductSave,
        onCancel: productCRUD.hideForm,
        loading: productCRUD.loading,
      })
  );
};

window.ProductsContainer = ProductsContainer;
