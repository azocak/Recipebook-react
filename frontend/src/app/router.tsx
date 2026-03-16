import { Navigate, Route, Routes } from "react-router-dom";
import RecipesPage from "../pages/RecipesPage.tsx";

import { RegisterPage } from "../pages/RegisterPage.tsx";
import { LoginPage } from "../pages/LoginPage.tsx";
import { AppLayout } from "../components/AppLayout.tsx";

export function AppRouter() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="*"
          element={<div className="py-12 text-slate-300">404</div>}
        />
      </Routes>
    </AppLayout>
  );
}
