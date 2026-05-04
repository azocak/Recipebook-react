import { useQuery } from "@tanstack/react-query";

import type { RecipeListParams } from "../../api/types";
import { recipesApi } from "../../api/recipes";
import { queryKeys } from "../../lib/queryKeys";

export function useRecipesQuery(params: RecipeListParams = {}) {
  return useQuery({
    queryKey: queryKeys.recipes.list(params),
    queryFn: () => recipesApi.getAll(params),
  });
}
