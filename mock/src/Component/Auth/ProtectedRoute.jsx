import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * ──────────────────────────────────────────
 * Props:
 *   children  — page/component to render if authorised
 *   role      — (optional) required role string e.g. "ADMIN" or "USER"
 *   redirect  — (optional) where to send on failure (default: "/login")
 *
 * Logic:
 *   1. No token  → redirect to login
 *   2. Wrong role → redirect to login (or a 403 page if you add one)
 *   3. OK        → render children
 */
const ProtectedRoute = ({ children, role, redirect = "/login" }) => {
  const token    = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token)                      return <Navigate to={redirect} replace />;
  if (role && role !== userRole)   return <Navigate to={redirect} replace />;

  return children;
};

export default ProtectedRoute;