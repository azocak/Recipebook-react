import { useState } from "react";
import { recipesApi } from "../api/recipes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useDeleteRecipe() {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deleteRecipe(recipeId: number) {
    setDeleting(true);
    setDeleteError(null);

    try {
      await recipesApi.remove(recipeId);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Nem sikerült törölni a receptet.",
      );

      setDeleteError(message);
      throw error;
    } finally {
      setDeleting(false);
    }
  }

  return {
    deleting,
    deleteError,
    deleteRecipe,
  };
}
