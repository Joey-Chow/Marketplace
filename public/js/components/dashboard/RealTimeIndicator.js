// RealTimeIndicator Component
const RealTimeIndicator = ({ connected, status }) => {
  const className = connected
    ? "real-time-indicator"
    : "real-time-indicator disconnected";
  const text = connected ? "🟢 Connected" : "🔴 Disconnected";

  return React.createElement(
    "div",
    {
      className: className,
      id: "connectionStatus",
    },
    status || text
  );
};

window.RealTimeIndicator = RealTimeIndicator;
