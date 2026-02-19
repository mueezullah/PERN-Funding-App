import React, { useState } from "react";
import RefreshHandler from "./RefreshHandler";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} setIsLoading={setIsLoading} />
      <AppRoutes isAuthenticated={isAuthenticated} isLoading={isLoading} />
    </div>
  );
};

export default App;
