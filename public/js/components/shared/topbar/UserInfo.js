// User Info Component for Topbar
const UserInfo = ({ user }) => {
  return React.createElement(
    "div",
    {
      className: "topbar-btn user-info",
    },
    React.createElement(
      "span",
      {
        className: "user-name",
      },
      user.username || user.email
    ),
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
