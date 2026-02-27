import { Navigate } from "react-router-dom";

/**
   Redirects unauthenticated users to /login.
   Used for any route that requires a logged-in user.
 */
export const PrivateRoute = ({ element, isAuthenticated, isLoading }) => {
    if (isLoading) return null;  // future update -> if (isLoading) return <LoadingSpinner />;
    return isAuthenticated ? element : <Navigate to="/" />;
};

/**
   Redirects authenticated users away from public pages (login/signup)
   to their role-appropriate dashboard.
 */
export const PublicRoute = ({ element, isAuthenticated, isLoading }) => {
    if (isLoading) return null; // future update -> if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return element;

    const role = localStorage.getItem("role");
    const target = role === "admin" ? "/admin/dashboard" : role === "user" ? "/feed" : "/";
    return <Navigate to={target} />;
};

/**
   Generic role-based route guard.
   Pass `allowedRoles` as an array, the user's role must be in the list.
  
   Usage:
     <RoleRoute element={<AdminDashboard />} allowedRoles={["admin"]} ... />
     <RoleRoute element={<ModPanel />} allowedRoles={["admin", "moderator"]} ... />
 */
export const RoleRoute = ({ element, allowedRoles, isAuthenticated, isLoading }) => {
    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to="/" />;

    const role = localStorage.getItem("role");
    if (!allowedRoles.includes(role)) return <Navigate to="/" />;

    return element;
};
