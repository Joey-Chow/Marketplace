const useProductDetail = (productId) => {
  const [product, setProduct] = React.useState(null);
  const [reviews, setReviews] = React.useState([]);
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

  // Fetch reviews filtered by productId
  React.useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;

      try {
        const response = await fetch(`/api/reviews/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product reviews");
        }

        const data = await response.json();
        console.log("Parsed reviews JSON:", data);
        setReviews(data.data.reviews);
      } catch (err) {
        setError(err.message || "Failed to load product reviews");
      }
    };

    fetchReviews();
  }, [productId]);

  return { product, reviews, loading, error };
};
