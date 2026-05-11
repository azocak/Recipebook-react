import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthRouteStatus } from "./AuthRouteStatus";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AuthRouteStatus
        title="Ellenőrzés folyamatban..."
        description="Megnézzük, hogy be vagy-e jelentkezve."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
