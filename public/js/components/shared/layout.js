// Shared layout component for consistent page structure across all pages
window.SharedLayout = {
  render(content) {
    return React.createElement(
      "div",
      { className: "main-content-full" },

      // Header section with title and description
      React.createElement(
        "div",
        { className: "content-header" },
        React.createElement("h1", null, "Advertisement"),
        React.createElement("p", null, "Enjoy our marketplace!")
      ),

      // Main content area
      React.createElement(
        "div",
        { className: "dashboard" },
        React.createElement("div", { className: "content" }, content)
      )
    );
  },
};
