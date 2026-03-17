import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type GuestOnlyRouteProps = {
  children: ReactNode;
};

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Betöltés...</p>;
  }

  if (user) {
    return <Navigate to="/recipes" replace />;
  }

  return <>{children}</>;
}
