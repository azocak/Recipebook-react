import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type GuestOnlyRouteProps = {
  children: ReactNode;
};

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Betöltés...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/recipes" replace />;
  }

  return <>{children}</>;
}
