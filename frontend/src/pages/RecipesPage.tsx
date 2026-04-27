import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { PageStatus } from "../components/PageStatus";
import RecipeCard from "../components/RecipeCard";
import { useRecipesQuery } from "../hooks/queries/useRecipesQuery";
import { queryKeys } from "../lib/queryKeys";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function RecipesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: recipes = [],
    error,
    isError,
    isPending,
    refetch,
  } = useRecipesQuery();

  function handleCreateClick() {
    navigate("/recipes/new");
  }

  function handleRecipeDeleted(deletedRecipeId: number) {
    queryClient.setQueryData<Recipe[]>(
      queryKeys.recipes.list(),
      (currentRecipes = []) =>
        currentRecipes.filter((recipe) => recipe.id !== deletedRecipeId),
    );
  }

  if (isPending) {
    return (
      <PageStatus
        title="Receptek betöltése..."
        description="Betöltjük a publikus recepteket."
      />
    );
  }

  if (isError) {
    return (
      <PageStatus
        title="Nem sikerült betölteni a recepteket."
        description={getApiErrorMessage(
          error,
          "Nem sikerült betölteni a recepteket.",
        )}
        variant="error"
        actionLabel="Újrapróbálás"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 bg-orange-50/70 px-6 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-700">
                  Publikus receptgyűjtemény
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Receptkönyv
                </h1>

                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Böngészd a közösség receptjeit, nézd meg a részleteket, és
                  oszd meg a kedvenceidet.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Elérhető receptek
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {recipes.length} db
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Hozzáférés
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {isAuthenticated ? "Bejelentkezve" : "Vendég mód"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Új recept létrehozása
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Bejelentkezés a megosztáshoz
                </Link>
              )}
            </div>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm sm:px-8">
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Még nincs egyetlen recept sem
              </h2>

              <p className="text-sm leading-6 text-slate-600 sm:text-base">
                Ez lesz az a hely, ahol a közösség receptjei megjelennek. Légy
                te az első, aki megoszt egy új fogást.
              </p>

              <div className="pt-2">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleCreateClick}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Első recept létrehozása
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Regisztráció a receptfeltöltéshez
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDeleteSuccess={handleRecipeDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default RecipesPage;
