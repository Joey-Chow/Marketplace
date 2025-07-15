// ReviewsView Component - Handles reviews display
const ReviewsView = ({ data, loading, error }) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading reviews..."
    );
  }

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  if (!data) {
    return React.createElement(
      "div",
      { className: "loading" },
      "No data available"
    );
  }

  const reviewsData = DataUtils.formatReviewsData(data);

  return React.createElement(
    "div",
    null,
    React.createElement(
      "h2",
      null,
      `⭐ Reviews (${(data.reviews || data).length} total)`
    ),
    React.createElement(SharedComponents.DataTable, {
      headers: reviewsData.headers,
      rows: reviewsData.rows,
      loading,
      error,
    })
  );
};

window.ReviewsView = ReviewsView;
