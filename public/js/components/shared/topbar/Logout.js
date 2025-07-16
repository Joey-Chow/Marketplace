// Logout Component for Topbar
const Logout = ({ onLogout }) => {
  return React.createElement(
    "button",
    {
      className: "topbar-btn topbar-nav-item",
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
    "Logout"
  );
};

window.Logout = Logout;
