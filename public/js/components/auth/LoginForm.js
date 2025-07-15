// Login Component
const LoginForm = ({ onLogin, loading, error }) => {
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData.email, formData.password);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Quick login buttons for testing
  const quickLogin = (email, password) => {
    setFormData({ email, password });
    onLogin(email, password);
  };

  return React.createElement(
    "div",
    { className: "login-overlay" },
    React.createElement(
      "div",
      { className: "login-container" },
      React.createElement(
        "div",
        { className: "login-header" },
        React.createElement("h2", null, "Marketplace Login"),
        React.createElement("p", null, "Please login to access the admin panel")
      ),
      error &&
        React.createElement("div", { className: "error-message" }, error),
      React.createElement(
        "form",
        { className: "login-form", onSubmit: handleSubmit },
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", null, "Email"),
          React.createElement("input", {
            type: "email",
            value: formData.email,
            onChange: (e) => handleChange("email", e.target.value),
            required: true,
            placeholder: "Enter your email",
          })
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", null, "Password"),
          React.createElement("input", {
            type: "password",
            value: formData.password,
            onChange: (e) => handleChange("password", e.target.value),
            required: true,
            placeholder: "Enter your password",
          })
        ),
        React.createElement(
          "button",
          {
            type: "submit",
            className: "btn-primary login-btn",
            disabled: loading,
          },
          loading ? "Logging in..." : "Login"
        )
      ),
      React.createElement(
        "div",
        { className: "quick-login" },
        React.createElement("p", null, "Quick Login (for testing):"),
        React.createElement(
          "div",
          { className: "quick-login-buttons" },
          React.createElement(
            "button",
            {
              type: "button",
              className: "btn-sm btn-secondary",
              onClick: () => quickLogin("admin@marketplace.com", "admin123"),
            },
            "Admin"
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "btn-sm btn-secondary",
              onClick: () => quickLogin("tech@store.com", "seller123"),
            },
            "Seller"
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "btn-sm btn-secondary",
              onClick: () => quickLogin("buyer1@email.com", "buyer123"),
            },
            "Buyer"
          )
        )
      )
    )
  );
};

window.LoginForm = LoginForm;
