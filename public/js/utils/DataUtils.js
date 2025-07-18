// Data formatting utilities
// Define which attributes to display for each data type

const DataUtils = {
  formatUsersData: (data) => {
    const users = data.users || data;
    return {
      headers: ["Username", "Email", "Role", "Name", "Store", "Joined"],
      rows: users.map((user) => {
        const name = `${user.profile?.firstName || ""} ${
          user.profile?.lastName || ""
        }`.trim();
        const store = user.sellerInfo?.storeName || "-";
        const joined = user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "-";

        return [
          user.username,
          user.email,
          React.createElement(
            "span",
            { className: `badge ${user.role}` },
            user.role
          ),
          name,
          store,
          joined,
        ];
      }),
    };
  },
};

window.DataUtils = DataUtils;
