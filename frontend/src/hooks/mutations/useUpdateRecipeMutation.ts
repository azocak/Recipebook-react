import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recipesApi } from "../../api/recipes";
import type { RecipeImageFormData } from "../../api/types";
import { queryKeys } from "../../lib/queryKeys";
import { toast } from "sonner";
import { showRecipeMutationErrorToast } from "./recipeMutationToasts";

type UpdateRecipeMutationProps = {
  recipeId: number;
  data: RecipeImageFormData;
};

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId, data }: UpdateRecipeMutationProps) =>
      recipesApi.update(recipeId, data),

    onSuccess: (updatedRecipe, { recipeId }) => {
      queryClient.setQueryData(
        queryKeys.recipes.detail(recipeId),
        updatedRecipe,
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.lists(),
      });

      toast.success("Recept sikeresen módosítva.");
    },

    onError: (error) => {
      showRecipeMutationErrorToast(
        error,
        "Nem sikerült módosítani a receptet.",
        {
          suppressFormValidationErrors: true,
        },
      );
    },
  });
}
