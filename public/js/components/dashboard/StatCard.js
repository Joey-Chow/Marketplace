// StatCard Component
const StatCard = ({ title, value, change }) => {
  return React.createElement(
    "div",
    { className: "stat-card" },
    React.createElement("h3", null, title),
    React.createElement("div", { className: "value" }, value),
    React.createElement(
      "div",
      { className: "change" },
      `${change} from last month`
    )
  );
};

window.StatCard = StatCard;
