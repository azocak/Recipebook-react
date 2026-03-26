import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PageStatus } from "../components/PageStatus";
import { useDeleteRecipe } from "../hooks/useDeleteRecipe";
import { useRecipe } from "../hooks/useRecipe";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { recipe, error, loading } = useRecipe(id);
  const { deleting, deleteError, deleteRecipe } = useDeleteRecipe();

  if (loading) {
    return (
      <PageStatus
        title="Recept betöltése..."
        description="Betöltjük a recept részleteit."
      />
    );
  }

  if (error) {
    return (
      <PageStatus
        title="Nem sikerült betölteni a receptet."
        description={error}
        variant="error"
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  if (!recipe) {
    return (
      <PageStatus
        title="Nincs ilyen recept."
        description="A keresett recept nem található."
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  const recipeId = recipe.id;
  const isOwner = !!user && user.id === recipe.owner;

  async function handleDelete() {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd ezt a receptet?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecipe(recipeId);
      navigate("/recipes");
    } catch (error) {
      console.error(error);
    }
  }

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

      {deleteError ? (
        <PageStatus
          title="A törlés nem sikerült."
          description={deleteError}
          variant="error"
        />
      ) : null}

      <div className="flex gap-3">
        <Link
          to="/recipes"
          className="rounded bg-gray-200 px-4 py-2 text-gray-800"
        >
          Vissza
        </Link>

        {isOwner && (
          <>
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
              disabled={deleting}
            >
              Szerkesztés
            </button>

            <button
              type="button"
              className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Törlés..." : "Törlés"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
