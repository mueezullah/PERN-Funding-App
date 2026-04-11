import { useEffect, type FC } from "react";
import { useLocation } from "react-router-dom";

interface RefreshHandlerProps {
  setIsAuthenticated: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
}

const RefreshHandler: FC<RefreshHandlerProps> = ({ setIsAuthenticated, setIsLoading }) => {
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
