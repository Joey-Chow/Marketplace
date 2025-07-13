// OverviewView Component - Handles overview statistics
const OverviewView = ({ data, loading, error }) => {
  if (loading) {
    return React.createElement(
      "div",
      { className: "loading" },
      "Loading overview..."
    );
  }

  if (error) {
    return React.createElement("div", { className: "error" }, error);
  }

  if (!data) {
    return React.createElement(
      "div",
      { className: "loading" },
      "No data available"
    );
  }

  const collections = DataUtils.formatOverviewData(data);

  return React.createElement(DataViewerComponents.StatsOverview, {
    stats: collections,
  });
};

window.OverviewView = OverviewView;
