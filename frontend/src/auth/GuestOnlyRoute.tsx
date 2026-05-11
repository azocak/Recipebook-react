import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { AuthRouteStatus } from "./AuthRouteStatus";
import { useAuth } from "./AuthContext";

type GuestOnlyRouteProps = {
  children: ReactNode;
};

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <AuthRouteStatus
        title="Ellenőrzés folyamatban..."
        description="Megnézzük, hogy szükséges-e még a bejelentkezés."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/recipes" replace />;
  }

  return <>{children}</>;
}
