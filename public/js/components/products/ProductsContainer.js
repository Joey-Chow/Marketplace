// ProductsContainer - Handles product data loading and operations
const ProductsContainer = ({ user, onSearchHandlerReady }) => {
  const { loading, error, data, loadTabData } = useDataViewer();
  const productCRUD = useProductCRUD();
  const cart = useCart();

  // Product search state
  const [searchResults, setSearchResults] = React.useState(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState(null);

  // Search handler
  const handleProductSearch = React.useCallback(async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults(null);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const result = await response.json();
      const products = result.data?.products || result.data || [];
      setSearchResults(products);
    } catch (err) {
      setSearchError("Error searching products");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Use ref to track if we've already notified parent
  const notifiedRef = React.useRef(false);

  // Notify parent when search handler is ready - use useEffect to avoid render-time setState
  React.useEffect(() => {
    if (onSearchHandlerReady && handleProductSearch && !notifiedRef.current) {
      notifiedRef.current = true;
      onSearchHandlerReady(handleProductSearch);
    }
  }, [onSearchHandlerReady, handleProductSearch]); // Include dependencies but use ref to prevent duplicate calls

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

  // Render products view with modal
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(ProductsView, {
      data:
        searchResults !== null
          ? { products: searchResults, categories: data?.categories || [] }
          : data,
      loading: searchLoading || loading,
      error: searchError || error,
      productCRUD,
      user,
      onProductSave: handleProductSave,
      onProductDelete: handleProductDelete,
      onAddToCart: handleAddToCart,
      onSearch: handleProductSearch,
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
