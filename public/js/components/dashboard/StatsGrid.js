// StatsGrid Component
const StatsGrid = ({ stats, loading, error }) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "stats-grid" },
      React.createElement(
        "div",
        { className: "loading" },
        "Loading dashboard data..."
      )
    );
  }

  if (error) {
    return React.createElement(
      "div",
      { className: "stats-grid" },
      React.createElement("div", { className: "error" }, error)
    );
  }

  return React.createElement(
    "div",
    { className: "stats-grid" },
    stats.map((stat, index) =>
      React.createElement(StatCard, {
        key: index,
        title: stat.title,
        value: stat.value,
        change: stat.change,
      })
    )
  );
};

window.StatsGrid = StatsGrid;
