import { useEffect, useState } from "react";
import type { Recipe } from "../api/types";
import { recipesApi } from "../api/recipes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useRecipe(id: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      if (!id || Number.isNaN(Number(id))) {
        setError("Érvénytelen azonosító");
        setLoading(false);
        return;
      }

      try {
        setError("");
        const data = await recipesApi.getById(Number(id));
        setRecipe(data);
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err, "Nem sikerült betölteni a receptet."));
      } finally {
        setLoading(false);
      }
    }
    void fetchRecipe();
  }, [id]);

  return { recipe, error, loading };
}
