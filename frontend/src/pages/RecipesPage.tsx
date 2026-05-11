import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import type {
  PaginatedResponse,
  Recipe,
  RecipeListParams,
  RecipeOrdering,
} from "../api/types";
import { useAuth } from "../auth/AuthContext";
import RecipeCard from "../components/recipe/RecipeCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { useRecipesQuery } from "../hooks/queries/useRecipesQuery";
import { queryKeys } from "../lib/queryKeys";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { Skeleton } from "../components/ui/Skeleton";
import { Spinner } from "../components/ui/Spinner";
import { PageHeader } from "../components/ui/PageHeader";
import { RecipeMeta } from "../components/recipe/RecipeMeta";
import { RECIPE_ORDERING_OPTIONS } from "../constants/recipe";
import { RecipeFilterBar } from "../components/recipe/RecipeFilterBar";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { PaginationControls } from "../components/ui/PaginationControls";

const RECIPE_SEARCH_DEBOUNCE_MS = 1000;

function getRecipeOrdering(value: string | null): RecipeOrdering | "" {
  return RECIPE_ORDERING_OPTIONS.some((option) => option.value === value)
    ? (value as RecipeOrdering)
    : "";
}

function getRecipePage(value: string | null): number | undefined {
  const page = Number(value);

  return Number.isInteger(page) && page > 1 ? page : undefined;
}

function buildRecipeListParams(
  searchParams: URLSearchParams,
): RecipeListParams {
  const search = searchParams.get("search")?.trim();
  const ordering = getRecipeOrdering(searchParams.get("ordering"));
  const page = getRecipePage(searchParams.get("page"));

  return {
    ...(search ? { search } : {}),
    ...(ordering ? { ordering } : {}),
    ...(page ? { page } : {}),
  };
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";
  const ordering = getRecipeOrdering(searchParams.get("ordering"));
  const currentPage = getRecipePage(searchParams.get("page")) ?? 1;
  const recipeListParams = buildRecipeListParams(searchParams);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(
    searchInput,
    RECIPE_SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const normalizedSearchInput = searchInput.trim();
    const normalizedDebouncedSearch = debouncedSearch.trim();
    const normalizedUrlSearch = urlSearch.trim();

    if (normalizedDebouncedSearch !== normalizedSearchInput) {
      return;
    }

    if (normalizedDebouncedSearch === normalizedUrlSearch) {
      return;
    }

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (normalizedDebouncedSearch) {
        nextParams.set("search", normalizedDebouncedSearch);
      } else {
        nextParams.delete("search");
      }

      nextParams.delete("page");

      return nextParams;
    });
  }, [debouncedSearch, searchInput, setSearchParams, urlSearch]);

  const {
    data: recipePage,
    error,
    isError,
    isPending,
    refetch,
  } = useRecipesQuery(recipeListParams);

  const recipes = recipePage?.results ?? [];
  const recipeCount = recipePage?.count ?? 0;
  const hasPreviousPage = Boolean(recipePage?.previous);
  const hasNextPage = Boolean(recipePage?.next);
  const shouldShowPagination = hasPreviousPage || hasNextPage;
  const hasActiveRecipeListFilters = Boolean(searchInput.trim() || ordering);
  const shouldShowNoResultsState =
    recipes.length === 0 && hasActiveRecipeListFilters;
  const isResetDisabled = !searchInput.trim() && !ordering && currentPage === 1;

  function handlePageChange(nextPage: number) {
    updateRecipeListSearchParams((nextParams) => {
      if (nextPage > 1) {
        nextParams.set("page", String(nextPage));
      } else {
        nextParams.delete("page");
      }
    });
  }

  function handlePreviousPage() {
    handlePageChange(Math.max(currentPage - 1, 1));
  }

  function handleNextPage() {
    handlePageChange(currentPage + 1);
  }

  function handleCreateClick() {
    navigate("/recipes/new");
  }

  function handleRegisterClick() {
    navigate("/register");
  }

  function updateRecipeListSearchParams(
    updateParams: (nextParams: URLSearchParams) => void,
  ) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      updateParams(nextParams);

      return nextParams;
    });
  }

  function handleSearchChange(nextSearch: string) {
    setSearchInput(nextSearch);
  }

  function handleOrderingChange(nextOrdering: RecipeOrdering | "") {
    updateRecipeListSearchParams((nextParams) => {
      if (nextOrdering) {
        nextParams.set("ordering", nextOrdering);
      } else {
        nextParams.delete("ordering");
      }

      nextParams.delete("page");
    });
  }

  function handleResetFilters() {
    setSearchInput("");

    updateRecipeListSearchParams((nextParams) => {
      nextParams.delete("search");
      nextParams.delete("ordering");
      nextParams.delete("page");
    });
  }

  function handleRecipeDeleted(deletedRecipeId: number) {
    queryClient.setQueryData<PaginatedResponse<Recipe>>(
      queryKeys.recipes.list(recipeListParams),
      (currentPage) => {
        if (!currentPage) {
          return currentPage;
        }

        const nextResults = currentPage.results.filter(
          (recipe) => recipe.id !== deletedRecipeId,
        );

        return {
          ...currentPage,
          count: Math.max(currentPage.count - 1, 0),
          results: nextResults,
        };
      },
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
              <RecipeMeta
                label="Elérhető receptek"
                value={`${recipeCount} db`}
              />

              <RecipeMeta
                label="Hozzáférés"
                value={isAuthenticated ? "Bejelentkezve" : "Vendég mód"}
              />
            </>
          }
        />

        <RecipeFilterBar
          search={searchInput}
          ordering={ordering}
          onSearchChange={handleSearchChange}
          onOrderingChange={handleOrderingChange}
          onReset={handleResetFilters}
          isResetDisabled={isResetDisabled}
        />

        {shouldShowNoResultsState ? (
          <EmptyState
            eyebrow="Nincs találat"
            visual="🔎"
            title="Nincs találat a keresésre"
            description="Próbálj meg másik keresőkifejezést vagy rendezést választani."
            actionLabel="Szűrők törlése"
            onAction={handleResetFilters}
          />
        ) : recipes.length === 0 ? (
          <EmptyState
            eyebrow="Receptkönyv"
            visual="🍲"
            title="Még nincs egyetlen recept sem"
            description="Ez lesz az a hely, ahol a közösség receptjei megjelennek. Jelentkezz be, és oszd meg az első receptet."
            actionLabel={
              isAuthenticated
                ? "Első recept létrehozása"
                : "Regisztráció a receptfeltöltéshez"
            }
            onAction={isAuthenticated ? handleCreateClick : handleRegisterClick}
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDeleteSuccess={handleRecipeDeleted}
                />
              ))}
            </div>

            {shouldShowPagination ? (
              <PaginationControls
                currentPage={currentPage}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

export default RecipesPage;
