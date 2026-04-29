import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import RecipeCard from "../components/RecipeCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { useRecipesQuery } from "../hooks/queries/useRecipesQuery";
import { queryKeys } from "../lib/queryKeys";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { Skeleton } from "../components/ui/Skeleton";
import { Spinner } from "../components/ui/Spinner";
import { PageHeader } from "../components/ui/PageHeader";

function RecipesPageSkeleton() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      aria-label="Receptek betöltése"
    >
      <div className="space-y-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 bg-orange-50/70 px-6 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-2xl space-y-4">
              <Skeleton className="h-4 w-48 rounded-full" />
              <Skeleton className="h-10 w-64 rounded-2xl" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full max-w-xl rounded-full" />
                <Skeleton className="h-4 w-4/5 max-w-lg rounded-full" />
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Skeleton className="h-16 w-36 rounded-2xl" />
                <Skeleton className="h-16 w-32 rounded-2xl" />
              </div>
            </div>

            <Skeleton className="h-12 w-44 rounded-2xl" />
          </div>
        </div>

        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Spinner label="Receptek betöltése..." size="sm" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              aria-hidden="true"
            >
              <Skeleton className="h-52 w-full rounded-none" />

              <div className="space-y-5 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </div>

                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-full" />
                    <Skeleton className="h-9 w-16 rounded-full" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-7 w-4/5 rounded-2xl" />

                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-24 rounded-2xl" />
                    <Skeleton className="h-10 w-24 rounded-2xl" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

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

  function handleRegisterClick() {
    navigate("/register");
  }

  function handleRecipeDeleted(deletedRecipeId: number) {
    queryClient.setQueryData<Recipe[]>(
      queryKeys.recipes.list(),
      (currentRecipes = []) =>
        currentRecipes.filter((recipe) => recipe.id !== deletedRecipeId),
    );
  }

  if (isPending) {
    return <RecipesPageSkeleton />;
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          eyebrow="Betöltési hiba"
          visual="⚠️"
          title="Nem sikerült betölteni a recepteket."
          description={getApiErrorMessage(
            error,
            "Nem sikerült betölteni a recepteket.",
          )}
          actionLabel="Újrapróbálás"
          onAction={() => void refetch()}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Publikus receptgyűjtemény"
          title="Receptkönyv"
          description="Böngészd a közösség receptjeit, nézd meg a részleteket, és oszd meg a kedvenceidet."
          meta={
            <>
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
            </>
          }
          actions={
            isAuthenticated ? (
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
            )
          }
        />

        {recipes.length === 0 ? (
          <EmptyState
            eyebrow="Receptkönyv"
            visual="🍲"
            title="Még nincs egyetlen recept sem"
            description="Ez lesz az a hely, ahol a közösség receptjei megjelennek. Légy te az első, aki megoszt egy új fogást."
            actionLabel={
              isAuthenticated
                ? "Első recept létrehozása"
                : "Regisztráció a receptfeltöltéshez"
            }
            onAction={isAuthenticated ? handleCreateClick : handleRegisterClick}
          />
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
