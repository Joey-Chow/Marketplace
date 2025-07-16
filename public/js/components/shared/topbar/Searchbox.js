// Search for products
const Searchbox = ({ onSearch }) => {
  const [query, setQuery] = React.useState("");

  const handleSearch = () => {
    if (onSearch && typeof onSearch === "function") {
      onSearch(query);
    } else {
      console.warn("Search function not available");
    }
  };

  return React.createElement(
    "div",
    {
      className: "searchbox",
    },
    // Search input field
    React.createElement("input", {
      type: "text",
      value: query,
      onChange: (e) => setQuery(e.target.value),
      onKeyPress: (e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      },
      placeholder: "Search product...",
    }),
    // Search button
    React.createElement(
      "button",
      {
        className: "search-button",
        onClick: handleSearch,
      },
      "Search"
    )
  );
};

window.Searchbox = Searchbox;
