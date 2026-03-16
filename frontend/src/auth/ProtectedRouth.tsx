import type { ReactElement } from "react";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactElement;
}

interface AuthRedirectState {
  from?: string;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const state = location.state as unknown as AuthRedirectState | null;
  const from = state?.from ?? location.pathname + location.search;

  if (loading) {
    return <div>Elenőrzés, hogy be vagy-e jelentkezve...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}
