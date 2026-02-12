import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RefreshHandler = ({ setIsAuthenticated, setIsLoading }) => {
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [location, setIsAuthenticated, setIsLoading]);

  return null;
};

export default RefreshHandler;
