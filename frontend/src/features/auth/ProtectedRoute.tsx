import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "../../types/auth.types";

export default function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, token, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
