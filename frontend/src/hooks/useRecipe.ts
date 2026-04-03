import { useEffect, useState } from "react";
import type { Recipe } from "../api/types";
import { recipesApi } from "../api/recipes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { ApiError } from "../api/errors";

export type UseRecipeStatus =
  | "loading"
  | "success"
  | "invalid-id"
  | "not-found"
  | "forbidden"
  | "error";

type UseRecipeState = {
  recipe: Recipe | null;
  status: UseRecipeStatus;
  errorMessage: string;
};

const initialState: UseRecipeState = {
  recipe: null,
  status: "loading",
  errorMessage: "",
};

export function useRecipe(id: string | undefined) {
  const [state, setState] = useState<UseRecipeState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecipe() {
      setState(initialState);

      const parsedId = Number(id);
      const invalidId =
        !id ||
        !/^\d+$/.test(id) ||
        !Number.isInteger(parsedId) ||
        parsedId <= 0;

      if (invalidId) {
        setState({
          recipe: null,
          status: "invalid-id",
          errorMessage: "Érvénytelen azonosító",
        });
        return;
      }

      try {
        const data = await recipesApi.getById(parsedId);

        if (cancelled) {
          return;
        }

        setState({
          recipe: data,
          status: "success",
          errorMessage: "",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          if (error.status === 404) {
            setState({
              recipe: null,
              status: "not-found",
              errorMessage: "",
            });

            return;
          }

          if (error.status === 403) {
            setState({
              recipe: null,
              status: "forbidden",
              errorMessage: "Nincs jogosultságod a recept megtekintéséhez",
            });

            return;
          }
        }

        setState({
          recipe: null,
          status: "error",
          errorMessage: getApiErrorMessage(
            error,
            "Nem sikerült betölteni a receptet.",
          ),
        });
      }
    }
    void fetchRecipe();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = state.status === "loading";
  const notFound = state.status === "not-found";
  const forbidden = state.status === "forbidden";
  const invalidId = state.status === "invalid-id";
  const genericError = state.status === "error";

  const error =
    loading || notFound || state.status === "success" ? "" : state.errorMessage;

  return {
    recipe: state.recipe,
    status: state.status,
    errorMessage: state.errorMessage,
    loading,
    error,
    notFound,
    forbidden,
    invalidId,
    genericError,
  };
}
