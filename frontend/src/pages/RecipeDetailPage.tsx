import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Recipe } from "../api/types";
import { recipesApi } from "../api/recipes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      if (!id || Number.isNaN(Number(id))) {
        setError("Érvénytelen azonosító.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        const data = await recipesApi.getById(Number(id));
        setRecipe(data);
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err, "Nem sikerült betölteni a receptet."));
      } finally {
        setLoading(false);
      }
    }

    void fetchRecipe();
  }, [id]);

  if (loading) {
    return <p className="mt-10 text-center">Betöltés...</p>;
  }

  if (error || !recipe) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <p className={error ? "text-red-600" : ""}>
          {error || "Nincs ilyen recept."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/recipes")}
          className="cursor-pointer rounded bg-orange-600 px-4 py-2 text-white"
        >
          Vissza a receptekhez
        </button>
      </section>
    );
  }

  const isOwner = !!user && user.id === recipe?.owner;

  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-orange-600">{recipe.title}</h1>
        <p className="text-sm text-gray-500">
          Készítette: {recipe.owner_username}
        </p>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>⏱ {recipe.cooking_time} perc</span>
          <span>🍽 {recipe.servings} adag</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold">Hozzávalók</h2>
        <p className="whitespace-pre-line">{recipe.ingredients}</p>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold">Elkészítés</h2>
        <p className="whitespace-pre-line">{recipe.instructions}</p>
      </div>

      <div className="text-sm text-gray-500">
        Létrehozva: {new Date(recipe.created_at).toLocaleString("hu-HU")}
      </div>

      <div className="flex gap-3">
        <Link
          to="/recipes"
          className="rounded bg-gray-200 px-4 py-2 text-gray-800"
        >
          Vissza
        </Link>

        {isOwner && (
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
          >
            Szerkesztés
          </button>
        )}
      </div>
    </section>
  );
}
