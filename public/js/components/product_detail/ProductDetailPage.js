// Product Detail Page Component
const ProductDetailPage = () => {
  // Extract product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // Debug logging
  console.log("Current URL:", window.location.href);
  console.log("URL search params:", window.location.search);
  console.log("Extracted product ID:", productId);

  // Component logic goes here
  const { product, loading, error } = useProductDetail(productId);

  React.useEffect(() => {
    // Initialize SharedTopbar
    window.SharedTopbar.initialize("shared-topbar-root", {
      activeTab: "product-detail",
    });
  }, []);

  // Show loading state
  if (loading) {
    return React.createElement(
      "div",
      { className: "app-layout" },
      React.createElement("div", { id: "shared-topbar-root" }),
      window.SharedLayout.render(
        React.createElement(
          "div",
          { className: "product-detail-container" },
          React.createElement(
            "div",
            { className: "loading" },
            "Loading product details..."
          )
        )
      )
    );
  }

  return React.createElement(
    "div",
    { className: "app-layout" },
    // SharedTopbar container
    React.createElement("div", { id: "shared-topbar-root" }),

    // Main content area for product details
    window.SharedLayout.render(
      React.createElement(
        "div",
        {
          className: "product-detail-container",
          style: {
            display: "grid",
            gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr",
            gap: window.innerWidth > 768 ? "40px" : "30px",
            maxWidth: "1500px",
            margin: "0 auto",
            padding: "20px",
          },
        },

        // Left section - Product image and reviews
        React.createElement(
          "div",
          {
            className: "product-detail-left",
          },

          // Product image
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                minHeight: "400px",
              },
            },
            React.createElement("img", {
              style: {
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: "8px",
              },
              src:
                product.images && product.images.length > 0
                  ? product.images[0].url
                  : "/images/products/placeholder.jpg",
              alt:
                product.images && product.images.length > 0
                  ? product.images[0].alt
                  : `${product.name} image`,
              onError: (e) => {
                e.target.src = "/images/products/placeholder.jpg";
              },
            })
          ),

          // Product reviews section
          React.createElement(
            "div",
            {
              className: "product-reviews-section",
            },

            // Reviews count
            React.createElement(
              "span",
              {
                className: "product-reviews-title",
              },
              `${product.ratings?.count || 0} reviews`
            ),

            // Rating count
            React.createElement(
              "span",
              {
                className: "product-reviews-count",
              },
              `${product.ratings?.average || 0}`
            ),

            // Star rating display
            React.createElement(
              "div",
              {
                className: "star-rating",
              },
              // Generate 5 stars
              ...Array.from({ length: 5 }, (_, index) => {
                const starIndex = index + 1;
                const rating = product.ratings?.average || 0;
                const isFilled = starIndex <= Math.floor(rating);
                const isHalfFilled =
                  starIndex === Math.ceil(rating) && rating % 1 !== 0;

                return React.createElement(
                  "span",
                  {
                    key: index,
                    style: {
                      color: isFilled || isHalfFilled ? "#ffd700" : "#e0e0e0",
                      fontSize: "20px",
                      lineHeight: "1",
                    },
                  },
                  "★"
                );
              })
            )
          )
        ),

        // Right section - Product details and actions
        React.createElement(
          "div",
          {
            className: "product-details-right",
          },

          // Product name
          React.createElement(
            "h1",
            {
              className: "product-name",
            },
            product.name
          ),

          // Product price
          React.createElement(
            "div",
            {
              className: "product-price-display",
            },
            `$${product.price}`
          ),

          // Product description
          React.createElement(
            "p",
            {
              className: "product-description",
            },
            product.description
          ),

          // Add to cart button
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                gap: "15px",
                marginTop: "auto",
              },
            },
            React.createElement(
              "button",
              {
                style: {
                  flex: "1",
                  padding: "15px 30px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                },
                onClick: () => {
                  // TODO: Implement add to cart functionality
                  console.log("Add to cart clicked for product:", product._id);
                },
                onMouseOver: (e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 8px 20px rgba(102, 126, 234, 0.3)";
                },
                onMouseOut: (e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                },
              },
              "Add to Cart"
            )
          )
        )
      )
    )
  );
};

window.ProductDetailPage = ProductDetailPage;
