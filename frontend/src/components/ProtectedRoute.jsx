import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { ROLES } from "../constants/roles";

/**
 * ProtectedRoute Component
 * - Ensures user is authenticated (token exists)
 * - Ensures user has one of the allowed roles
 * - Redirects safely without causing infinite loops
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  // 1. Retrieve authentication data from LocalStorage
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // 2. Normalize role for safe comparison
  const normalizedUserRole = userRole?.toUpperCase().trim();

  // 3. Normalize allowed roles
  const rolesToMatch = Array.isArray(allowedRoles)
    ? allowedRoles.map((role) => role.toString().toUpperCase().trim())
    : [];

  // 4. AUTHENTICATION CHECK
  if (!token) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 5. AUTHORIZATION CHECK
  // 5. AUTHORIZATION CHECK
  if (rolesToMatch.length > 0 && !rolesToMatch.includes(normalizedUserRole)) {
    // DEBUG MODE: Show why it failed instead of redirecting
    return (
      <div style={{ padding: 20, border: '2px solid red', margin: 20 }}>
        <h3>⛔ Access Denied (Debug Mode)</h3>
        <p><strong>Your Role:</strong> "{normalizedUserRole || 'Assuming NULL'}"</p>
        <p><strong>Required Role:</strong> "{rolesToMatch.join(', ')}"</p>
        <p><strong>Token Present:</strong> {token ? "Yes" : "No"}</p>
        <button onClick={() => window.location.href='/login'}>Go to Login</button>
      </div>
    );
     // return <Navigate to="/403" replace />;
  }

  // 6. AUTHORIZED: Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
