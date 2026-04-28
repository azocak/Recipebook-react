import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { recipesApi } from "../../api/recipes";
import { queryKeys } from "../../lib/queryKeys";
import { showRecipeMutationErrorToast } from "./recipeMutationToasts";

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

      toast.success("Recept sikeresen törölve.");
    },

    onError: (error) => {
      showRecipeMutationErrorToast(error, "Nem sikerült törölni a receptet.");
    },
  });
}
