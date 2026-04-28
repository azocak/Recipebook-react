import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recipesApi } from "../../api/recipes";
import { queryKeys } from "../../lib/queryKeys";

type DeleteRecipeMutationProps = {
  recipeId: number;
};

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId }: DeleteRecipeMutationProps) =>
      recipesApi.remove(recipeId),

    onSuccess: (_data, { recipeId }) => {
      queryClient.removeQueries({
        queryKey: queryKeys.recipes.detail(recipeId),
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.lists(),
      });
    },
  });
}
