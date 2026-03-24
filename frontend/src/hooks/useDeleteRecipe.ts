import { useState } from "react";
import { recipesApi } from "../api/recipes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useDeleteRecipe() {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function deleteRecipe(recipeId: number) {
    try {
      setDeleting(true);
      setDeleteError("");
      await recipesApi.remove(recipeId);
    } catch (err) {
      console.error(err);
      setDeleteError(
        getApiErrorMessage(err, "Nem sikerült törölni a receptet"),
      );
    } finally {
      setDeleting(false);
    }
  }

  return { deleting, deleteError, deleteRecipe };
}
