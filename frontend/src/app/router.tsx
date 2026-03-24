import { Navigate, Route, Routes } from "react-router-dom";
import RecipesPage from "../pages/RecipesPage.tsx";

import { RegisterPage } from "../pages/RegisterPage.tsx";
import { LoginPage } from "../pages/LoginPage.tsx";
import { AppLayout } from "../components/AppLayout.tsx";
import { GuestOnlyRoute } from "../auth/GuestOnlyRoute.tsx";
import { ProtectedRoute } from "../auth/ProtectedRoute.tsx";
import NewRecipePage from "../pages/NewRecipePage.tsx";
import RecipeDetailPage from "../pages/RecipeDetailPage.tsx";
import EditRecipePage from "../pages/EditRecipePage.tsx";

export function AppRouter() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />

        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <NewRecipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <EditRecipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="*"
          element={<div className="py-12 text-slate-300">404</div>}
        />
      </Routes>
    </AppLayout>
  );
}
