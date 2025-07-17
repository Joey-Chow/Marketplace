// useProductCRUD.js - Custom hook for product CRUD operations with Authentication
const useProductCRUD = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("marketplace_token");
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const showCreateForm = React.useCallback(() => {
    setEditingProduct(null);
    setShowForm(true);
    setError(null);
  }, []);

  const showEditForm = React.useCallback((product) => {
    setEditingProduct(product);
    setShowForm(true);
    setError(null);
  }, []);

  const hideForm = React.useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
    setError(null);
  }, []);

  // Create product function
  const createProduct = React.useCallback(
    async (productData) => {
      setLoading(true);
      setError(null);

      try {
        let finalProductData = { ...productData };

        // Ensure images array exists, use placeholder if none provided
        if (!finalProductData.images || finalProductData.images.length === 0) {
          finalProductData.images = [
            {
              url: "/images/products/placeholder.jpg",
              alt: `${finalProductData.name} - Image 1`,
              publicId: "placeholder-0",
            },
          ];
        }

        console.log("Sending product data:", finalProductData);

        const response = await fetch("/api/products", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(finalProductData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication required. Please login again.");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create product");
        }

        const newProduct = await response.json();
        hideForm();
        // Show success popup for product creation
        alert("✅ Product created successfully!");
        return newProduct;
      } catch (err) {
        setError(err.message);
        // Show error popup for create failures
        alert(`❌ Error creating product: ${err.message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [hideForm]
  );

  // Update product function
  const updateProduct = React.useCallback(
    async (productId, productData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication required. Please login again.");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update product");
        }

        const updatedProduct = await response.json();
        hideForm();
        // Show success popup for product update
        alert("✅ Product updated successfully!");
        return updatedProduct;
      } catch (err) {
        setError(err.message);
        // Show error popup for update failures
        alert(`Error updating product: ${err.message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [hideForm]
  );

  const deleteProduct = React.useCallback(async (productId) => {
    // Enhanced confirmation popup
    const confirmed = confirm(
      "⚠️ Are you sure you want to delete this product?\n\nThis action cannot be undone and will permanently remove the product from your store."
    );

    if (!confirmed) {
      return false; // Return false when user cancels
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      // Show success popup
      alert("✅ Product deleted successfully!");
      return true;
    } catch (err) {
      setError(err.message);
      // Show error popup for delete failures
      alert(`❌ Error deleting product: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProduct = React.useCallback(
    async (productData) => {
      try {
        if (editingProduct) {
          return await updateProduct(editingProduct._id, productData);
        } else {
          return await createProduct(productData);
        }
      } catch (err) {
        // Error is already set in the individual functions
        return false;
      }
    },
    [editingProduct, createProduct, updateProduct]
  );

  return {
    showForm,
    editingProduct,
    loading,
    error,
    showCreateForm,
    showEditForm,
    hideForm,
    saveProduct,
    deleteProduct,
  };
};

// Export to global scope
window.useProductCRUD = useProductCRUD;
