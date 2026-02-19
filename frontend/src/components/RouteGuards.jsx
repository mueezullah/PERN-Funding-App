import { Navigate } from "react-router-dom";

/**
   Redirects unauthenticated users to /login.
   Used for any route that requires a logged-in user.
 */
export const PrivateRoute = ({ element, isAuthenticated, isLoading }) => {
    if (isLoading) return null;
    return isAuthenticated ? element : <Navigate to="/login" />;
};

/**
   Redirects authenticated users away from public pages (login/signup)
   to their role-appropriate dashboard.
 */
export const PublicRoute = ({ element, isAuthenticated, isLoading }) => {
    if (isLoading) return null;
    if (!isAuthenticated) return element;

    const role = localStorage.getItem("role");
    const target = role === "admin" ? "/adminDashboard" : "/home";
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
    if (!isAuthenticated) return <Navigate to="/login" />;

    const role = localStorage.getItem("role");
    if (!allowedRoles.includes(role)) return <Navigate to="/home" />;

    return element;
};
