import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RefreshHandler from "./RefreshHandler";

const PrivateRoute = ({ element, isAuthenticated, isLoading }) => {
  if (isLoading) return null;
  return isAuthenticated ? element : <Navigate to="/login"></Navigate>;
};

const PublicRoute = ({ element, isAuthenticated, isLoading }) => {
  if (isLoading) return null;
  return !isAuthenticated ? element : <Navigate to="/home"></Navigate>;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} setIsLoading={setIsLoading} />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
        <Route path="/login" element={<PublicRoute element={<Login />} isAuthenticated={isAuthenticated} isLoading={isLoading} />} />
        <Route path="/signup" element={<PublicRoute element={<Signup />} isAuthenticated={isAuthenticated} isLoading={isLoading} />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} isAuthenticated={isAuthenticated} isLoading={isLoading} />} />
      </Routes>
    </div>
  );
};

export default App;
