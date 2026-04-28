import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recipesApi } from "../../api/recipes";
import type { RecipeImageFormData } from "../../api/types";
import { queryKeys } from "../../lib/queryKeys";
import { toast } from "sonner";
import { showRecipeMutationErrorToast } from "./recipeMutationToasts";

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecipeImageFormData) => recipesApi.create(data),

    onSuccess: (createdRecipe) => {
      queryClient.setQueryData(
        queryKeys.recipes.detail(createdRecipe.id),
        createdRecipe,
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.lists(),
      });

      toast.success("Recept sikeresen létrehozva.");
    },

    onError: (error) => {
      showRecipeMutationErrorToast(
        error,
        "Nem sikerült létrehozni a receptet.",
        {
          suppressFormValidationErrors: true,
        },
      );
    },
  });
}
