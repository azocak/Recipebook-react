import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { PageStatus } from "../components/PageStatus";

type GuestOnlyRouteProps = {
  children: ReactNode;
};

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <PageStatus
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
