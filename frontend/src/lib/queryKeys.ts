import type { RecipeListParams } from "../api/types";

export type RecipeListFilters = RecipeListParams;

export const queryKeys = {
  recipes: {
    all: ["recipes"] as const,

    lists: () => ["recipes", "list"] as const,

    list: (filters: RecipeListFilters = {}) =>
      ["recipes", "list", filters] as const,

    details: () => ["recipes", "detail"] as const,

    detail: (id: number) => ["recipes", "detail", id] as const,
  },
};
