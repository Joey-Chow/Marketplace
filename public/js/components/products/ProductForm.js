// Product Form Component
const ProductForm = ({ product, onSave, onCancel, loading }) => {
  const [formData, setFormData] = React.useState(
    product
      ? {
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          category: product.category?._id || product.category || "",
          stock: product.inventory?.quantity || "",
          imageUrls:
            (product.images || []).map((img) => img.url).join("\n") || "",
        }
      : {
          name: "",
          description: "",
          price: "",
          category: "",
          stock: "",
          imageUrls: "",
        }
  );

  const [categories, setCategories] = React.useState([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [imagePreview, setImagePreview] = React.useState("");

  // Update image preview when URLs change
  React.useEffect(() => {
    if (formData.imageUrls) {
      const urls = formData.imageUrls.split("\n").filter((url) => url.trim());
      if (urls.length > 0) {
        setImagePreview(urls[0].trim());
      } else {
        setImagePreview("");
      }
    } else {
      setImagePreview("");
    }
  }, [formData.imageUrls]);

  // Fetch categories when component mounts
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/data/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data, excluding empty description
    const submitData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
    };

    // Only include description if it's not empty
    if (formData.description && formData.description.trim() !== "") {
      submitData.description = formData.description;
    }

    // Process image URLs if provided
    if (formData.imageUrls && formData.imageUrls.trim()) {
      const urls = formData.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url);

      if (urls.length > 0) {
        submitData.images = urls.map((url, index) => ({
          url: url,
          alt: `${formData.name} - Image ${index + 1}`,
          publicId: `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${
            index + 1
          }-${Date.now()}`,
        }));
      }
    }

    onSave(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return React.createElement(
    "div",
    { className: "modal-overlay" },
    React.createElement(
      "div",
      { className: "modal" },
      React.createElement(
        "div",
        { className: "modal-header" },
        React.createElement(
          "h3",
          null,
          product ? "Edit Product" : "Create Product"
        ),
        React.createElement(
          "button",
          { className: "close-btn", onClick: onCancel },
          "×"
        )
      ),
      React.createElement(
        "form",
        { className: "product-form", onSubmit: handleSubmit },
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", null, "Product Name"),
          React.createElement("input", {
            type: "text",
            value: formData.name,
            onChange: (e) => handleChange("name", e.target.value),
            required: true,
          })
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", null, "Description"),
          React.createElement("textarea", {
            value: formData.description,
            onChange: (e) => handleChange("description", e.target.value),
            rows: 3,
          })
        ),
        React.createElement(
          "div",
          { className: "form-row" },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", null, "Price ($)"),
            React.createElement("input", {
              type: "number",
              step: "0.01",
              value: formData.price,
              onChange: (e) => handleChange("price", e.target.value),
              required: true,
            })
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", null, "Stock"),
            React.createElement("input", {
              type: "number",
              value: formData.stock,
              onChange: (e) => handleChange("stock", e.target.value),
              required: true,
            })
          )
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", null, "Category"),
          loadingCategories
            ? React.createElement("div", null, "Loading categories...")
            : React.createElement(
                "select",
                {
                  value: formData.category,
                  onChange: (e) => handleChange("category", e.target.value),
                  required: true,
                },
                React.createElement(
                  "option",
                  { value: "" },
                  "Select a category"
                ),
                categories.map((cat) =>
                  React.createElement(
                    "option",
                    { key: cat._id, value: cat._id },
                    cat.name
                  )
                )
              )
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", null, "Product Images"),
          React.createElement("textarea", {
            value: formData.imageUrls,
            onChange: (e) => handleChange("imageUrls", e.target.value),
            placeholder:
              "Enter image URLs (one per line) - leave empty to use existing images",
            rows: 3,
            className: "image-urls-textarea",
          }),
          React.createElement(
            "small",
            { className: "form-help-text" },
            "💡 Tip: Provide custom URLs (one per line) or leave empty to keep existing images"
          )
        ),
        imagePreview &&
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", null, "Image Preview"),
            React.createElement("img", {
              src: imagePreview,
              alt: "Product preview",
              className: "product-form-preview-image",
              onError: (e) => {
                e.target.style.display = "none";
              },
            })
          ),
        React.createElement(
          "div",
          { className: "form-actions" },
          React.createElement(
            "button",
            { type: "button", className: "btn-secondary", onClick: onCancel },
            "Cancel"
          ),
          React.createElement(
            "button",
            { type: "submit", className: "btn-primary", disabled: loading },
            loading ? "Saving..." : "Save Product"
          )
        )
      )
    )
  );
};

window.ProductForm = ProductForm;
