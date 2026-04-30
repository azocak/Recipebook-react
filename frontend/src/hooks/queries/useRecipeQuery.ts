import { useQuery } from "@tanstack/react-query";

import { ApiError } from "../../api/errors";
import { recipesApi } from "../../api/recipes";
import type { Recipe } from "../../api/types";
import { queryKeys } from "../../lib/queryKeys";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export type UseRecipeQueryStatus =
  | "loading"
  | "success"
  | "invalid-id"
  | "not-found"
  | "forbidden"
  | "error";

export function parseRecipeIdParam(id: string | undefined): number | null {
  if (!id || !/^\d+$/.test(id)) {
    return null;
  }

  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function getRecipeQueryStatus(
  recipeId: number | null,
  recipe: Recipe | undefined,
  error: Error | null,
  isPending: boolean,
): UseRecipeQueryStatus {
  if (recipeId === null) {
    return "invalid-id";
  }

  if (recipe) {
    return "success";
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "not-found";
    }

    if (error.status === 403) {
      return "forbidden";
    }
  }

  if (error) {
    return "error";
  }

  if (isPending) {
    return "loading";
  }

  return "loading";
}

function getRecipeQueryErrorMessage(
  status: UseRecipeQueryStatus,
  error: Error | null,
): string {
  if (status === "invalid-id") {
    return "Érvénytelen azonosító.";
  }

  if (status === "forbidden") {
    return "Nincs jogosultságod a recept megtekintéséhez.";
  }

  if (status === "error") {
    return getApiErrorMessage(error, "Nem sikerült betölteni a receptet.");
  }

  return "";
}

export function useRecipeQuery(id: string | undefined) {
  const recipeId = parseRecipeIdParam(id);

  const query = useQuery<Recipe, Error>({
    queryKey:
      recipeId === null
        ? [...queryKeys.recipes.details(), "invalid", id ?? "missing"]
        : queryKeys.recipes.detail(recipeId),
    queryFn: () => {
      if (recipeId === null) {
        throw new Error("Invalid recipe id");
      }

      return recipesApi.getById(recipeId);
    },
    enabled: recipeId !== null,
  });

  const status = getRecipeQueryStatus(
    recipeId,
    query.data,
    query.error,
    query.isPending,
  );

  const errorMessage = getRecipeQueryErrorMessage(status, query.error);

  const loading = status === "loading";
  const notFound = status === "not-found";
  const forbidden = status === "forbidden";
  const invalidId = status === "invalid-id";
  const genericError = status === "error";

  const error = loading || notFound || status === "success" ? "" : errorMessage;

  return {
    recipe: query.data ?? null,
    status,
    errorMessage,
    loading,
    error,
    notFound,
    forbidden,
    invalidId,
    genericError,
    refetch: query.refetch,
    query,
  };
}
