const useProductDetail = (productId) => {
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // Fetch product details by ID
  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      // Don't fetch if productId is null or undefined
      if (!productId) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data.data.product);
      } catch (err) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};
