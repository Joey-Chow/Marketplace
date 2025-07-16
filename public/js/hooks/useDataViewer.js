// Custom hook for data viewer
const useDataViewer = () => {
  const [state, setState] = React.useState({
    currentTab: "products",
    loading: false,
    error: null,
    data: null,
  });

  const fetchData = React.useCallback(async (endpoint) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `/api/data/${endpoint}?_t=${timestamp}`;
      console.log(`Fetching data from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Data received for ${endpoint}:`, result);

      return result.data || result;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }, []);

  const loadTabData = React.useCallback(
    async (tab) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let data;

        switch (tab) {
          case "users":
            data = await fetchData("users");
            break;
          case "products":
            const productsData = await fetchData("products");
            const categoriesData = await fetchData("categories");
            data = {
              products: productsData.products || productsData,
              categories: categoriesData.categories || categoriesData,
            };
            break;
          default:
            throw new Error("Unknown tab");
        }

        setState((prev) => ({
          ...prev,
          data,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Error loading data: ${error.message}`,
          loading: false,
        }));
      }
    },
    [fetchData]
  );

  return {
    ...state,
    loadTabData,
  };
};

window.useDataViewer = useDataViewer;
