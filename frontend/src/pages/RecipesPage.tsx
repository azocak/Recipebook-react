import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recipesApi } from "../api/recipes";
import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { PageStatus } from "../components/PageStatus";
import RecipeCard from "../components/RecipeCard";

function RecipesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await recipesApi.getAll();
      setRecipes(data);
    } catch (err) {
      console.error("Nem sikerült betölteni a recepteket:", err);
      setError("Nem sikerült betölteni a recepteket.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  function handleClick() {
    navigate("/recipes/new");
  }

  function handleRecipeDeleted(deletedRecipeId: number) {
    setRecipes((prev) =>
      prev.filter((recipe) => recipe.id !== deletedRecipeId),
    );
  }

  if (loading) {
    return (
      <PageStatus
        title="Receptek betöltése..."
        description="Betöltjük a publikus recepteket."
      />
    );
  }

  if (error) {
    return (
      <PageStatus
        title="Hiba történt"
        description={error}
        variant="error"
        actionLabel="Újrapróbálás"
        onAction={() => void fetchRecipes()}
      />
    );
  }

  if (recipes.length === 0) {
    return (
      <PageStatus
        title="Még nincs egyetlen recept sem."
        description="Légy te az első, aki megoszt egy receptet."
      />
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Receptkönyv</h1>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleClick}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Új recept
          </button>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onDeleteSuccess={handleRecipeDeleted}
          />
        ))}
      </div>
    </section>
  );
}

export default RecipesPage;
