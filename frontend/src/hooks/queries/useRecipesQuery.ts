import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { recipesApi } from "../../api/recipes";

export function useRecipesQuery() {
  return useQuery({
    queryKey: queryKeys.recipes.list(),
    queryFn: () => recipesApi.getAll(),
  });
}
