// User Info Component for Topbar
const UserInfo = ({ user }) => {
  return React.createElement(
    "div",
    {
      className: "topbar-btn user-info",
    },

    // Display user avatar or initials
    React.createElement(
      "span",
      {
        className: "user-name",
      },
      user.username || user.email
    ),

    // Display user role as a badge
    React.createElement(
      "span",
      {
        className: `badge ${user.role}`,
      },
      user.role
    )
  );
};

window.UserInfo = UserInfo;
