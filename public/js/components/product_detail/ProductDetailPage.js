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
  const { product, reviews, loading, error } = useProductDetail(productId);

  // State for quantity selection
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);

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

  const imageSection = () => {
    return React.createElement(
      "div",
      {
        className: "product-image-section",
      },

      // Main product image
      React.createElement("img", {
        className: "product-image-large",
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
      }),

      // Image previews section
      React.createElement(
        "div",
        {
          className: "image-previews-section",
        },
        product.images &&
          product.images.map((image, index) =>
            // small image previews
            React.createElement("img", {
              key: index,
              src: image.url,
              alt: image.alt || `Image ${index + 1}`,
              className: "image-preview",
              onClick: () => {
                document.querySelector(".product-image-large").src = image.url;
              },
            })
          )
      )
    );
  };

  const reviewStarSection = () => {
    return React.createElement(
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
        `${reviews.length || 0} reviews`
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
    );
  };

  // ...existing code...

  const reviewsSection = () => {
    // If no reviews available, show empty state
    if (!reviews || reviews.length === 0) {
      return React.createElement(
        "div",
        { className: "reviews-empty" },
        "No reviews yet for this product."
      );
    }

    // Render reviews table with two-row layout
    return React.createElement(
      "div",
      { className: "reviews-list-container" },
      React.createElement(
        "table",
        { className: "reviews-table-two-row" },
        React.createElement(
          "tbody",
          null,
          reviews
            .map((review, index) => [
              // First row: rating (stars), date, and buyer
              React.createElement(
                "tr",
                {
                  key: `${review._id || index}-header`,
                  className: "review-header-row",
                },
                React.createElement(
                  "td",
                  { className: "review-rating-cell" },
                  React.createElement(
                    "div",
                    { className: "review-rating-stars" },
                    ...Array.from({ length: 5 }, (_, starIndex) => {
                      const isFilled = starIndex < (review.rating || 0);
                      return React.createElement(
                        "span",
                        {
                          key: starIndex,
                          className: `star ${isFilled ? "filled" : "empty"}`,
                        },
                        "★"
                      );
                    })
                  )
                ),
                React.createElement(
                  "td",
                  { className: "review-date-cell" },
                  review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : "Unknown date"
                ),
                React.createElement(
                  "td",
                  { className: "review-buyer-cell" },
                  review.user?.username || review.author || "Anonymous"
                )
              ),
              // Second row: comment with bottom border
              React.createElement(
                "tr",
                {
                  key: `${review._id || index}-comment`,
                  className: "review-comment-row",
                },
                React.createElement(
                  "td",
                  {
                    className: "review-comment-cell",
                    colSpan: 3,
                  },
                  React.createElement(
                    "p",
                    { className: "review-comment-text" },
                    review.comment || "No comment provided"
                  )
                )
              ),
            ])
            .flat()
        )
      )
    );
  };

  const addToCartSection = () => {
    return React.createElement(
      "div",
      {
        className: "add-to-cart-section",
      },

      // Quantity selector
      React.createElement(
        "div",
        {
          className: "quantity-selector",
        },
        React.createElement(
          "label",
          {
            htmlFor: "quantity-select",
            style: { fontWeight: "600" },
          },
          "Quantity:"
        ),
        // Quantity select dropdown
        React.createElement(
          "select",
          {
            className: "quantity-select-dropdown",
            id: "quantity-select",
            value: selectedQuantity,
            onChange: (e) => setSelectedQuantity(parseInt(e.target.value)),
          },
          // Create options for quantities 1-5
          ...Array.from({ length: 5 }, (_, index) => {
            const quantity = index + 1;
            return React.createElement(
              "option",
              {
                key: quantity,
                value: quantity,
              },
              quantity
            );
          })
        )
      ),
      // Add to cart button
      React.createElement(
        "button",
        {
          className: "btn btn-primary checkout-btn",
          onClick: () => {
            // TODO: Implement add to cart functionality
            console.log(
              "Add to cart clicked for product:",
              product._id,
              "with quantity:",
              selectedQuantity
            );
          },
          onMouseOver: (e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.3)";
          },
          onMouseOut: (e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          },
        },
        "Add to Cart"
      )
    );
  };

  // Render the product detail page
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
        },

        // Left section - Product image and reviews
        React.createElement(
          "div",
          {
            className: "product-details-left",
          },

          imageSection(),
          reviewStarSection(),
          reviewsSection()
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
          addToCartSection()
        )
      )
    )
  );
};

window.ProductDetailPage = ProductDetailPage;
