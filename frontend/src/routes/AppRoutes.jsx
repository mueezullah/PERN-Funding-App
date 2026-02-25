import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import { PrivateRoute, PublicRoute, RoleRoute } from "../components/RouteGuards";

// Pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import AdminDashboard from "../pages/AdminDashboard";
import Landing from "../pages/Landing";

const AppRoutes = ({ isAuthenticated, setIsAuthenticated, isLoading }) => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const isAuthSync = isAuthenticated && !!token;

    const defaultTarget = role === "admin" ? "/adminDashboard" : "/home";

    return (
        <Routes>
            {/* Default redirect */}
            <Route
                path="/"
                element={isAuthSync ? <Navigate to={defaultTarget} /> : <Landing isAuthenticated={isAuthSync} />}
            />

            {/* Public routes — redirect to dashboard if already logged in */}
            <Route
                path="/login"
                element={
                    <PublicRoute element={<Login setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} isLoading={isLoading} />
                }
            />
            <Route
                path="/signup"
                element={
                    <PublicRoute element={<Signup setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} isLoading={isLoading} />
                }
            />

            {/* Private routes — any authenticated user */}
            <Route
                path="/home"
                element={
                    <PrivateRoute element={<Home setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} isLoading={isLoading} />
                }
            />

            {/* Role-restricted routes */}
            <Route
                path="/adminDashboard"
                element={
                    <RoleRoute
                        element={<AdminDashboard setIsAuthenticated={setIsAuthenticated} />}
                        allowedRoles={["admin"]}
                        isAuthenticated={isAuthenticated}
                        isLoading={isLoading}
                    />
                }
            />

            {/*
        To add more role-restricted routes in the future:

        <Route
          path="/moderatorPanel"
          element={
            <RoleRoute
              element={<ModeratorPanel />}
              allowedRoles={["admin", "moderator"]}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          }
        />
      */}
        </Routes>
    );
};

export default AppRoutes;
