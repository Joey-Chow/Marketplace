// Logout Component for Topbar
const Logout = ({ onLogout }) => {
  return React.createElement(
    "button",
    {
      className: "topbar-btn",
      onClick: onLogout,
      title: "Logout",
      onMouseOver: (e) => {
        e.target.style.backgroundColor = "#dc3545";
        e.target.style.color = "white";
        e.target.style.borderColor = "#dc3545";
      },
      onMouseOut: (e) => {
        e.target.style.backgroundColor = "transparent";
        e.target.style.color = "#333";
        e.target.style.borderColor = "#ddd";
      },
    },
    React.createElement("span", null, "🚪"),
    React.createElement("span", null, "Logout")
  );
};

window.Logout = Logout;
