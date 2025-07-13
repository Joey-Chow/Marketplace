// ChartContainer Component
const ChartContainer = ({ title, chartId, children }) => {
  return React.createElement(
    "div",
    { className: "chart-container" },
    React.createElement("h3", { className: "chart-title" }, title),
    React.createElement("canvas", { id: chartId })
  );
};

window.ChartContainer = ChartContainer;
