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
    } catch {
      // A hibát a useDeleteRecipe hook kezeli
    }
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Vissza a receptekhez
        </Link>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-orange-50/70 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-700">
                    Recept részletei
                  </p>

                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {recipe.title}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Készítette
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {recipe.owner_username}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Adag
                    </p>
                    <p className="mt-1 text-sm text-center font-semibold text-slate-900">
                      {recipe.servings}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Főzési idő
                    </p>
                    <p className="mt-1 text-sm text-center font-semibold text-slate-900">
                      {recipe.cooking_time} perc
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                      disabled={deleting}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5  py-3 text-sm font-semibold text-white transition cursor-pointer hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 "
                    >
                      Szerkesztés
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center justify-center cursor-pointer rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {deleting ? "Törlés..." : "Törlés"}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-8 px-6 py-6 sm:px-8">
            {deleteError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Hozzávalók
              </h2>
              <div className="rounded-2xl bg-slate-50 py-4 px-4 text-sm leading-7 text-slate-700 sm:text-base">
                <p className="whitespace-pre-line">{recipe.ingredients}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Elkészítés
              </h2>
              <div className="rounded-2xl bg-slate-50 py-4 px-4 text-sm leading-7 text-slate-700 sm:text-base">
                <p className="whitespace-pre-line">{recipe.instructions}</p>
              </div>
            </section>

            <div className="grid gap-4 border-t border-slate-100 pt-6 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Létrehozva
                </p>
                <p className="mt-1 font-medium text-slate-800">
                  {formatDateTime(recipe.created_at)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recept azonosító
                </p>
                <p className="mt-1 font-medium text-slate-800">#{recipe.id}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
