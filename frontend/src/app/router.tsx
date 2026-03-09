import { BrowserRouter, Route, Routes } from "react-router-dom";
import RecipesPage from "../pages/RecipesPage.tsx";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecipesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
