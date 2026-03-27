import { useEffect, useState } from "react";
import type { Recipe } from "../api/types";
import { recipesApi } from "../api/recipes";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useRecipe(id: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecipe() {
      setLoading(true);
      setError("");
      setRecipe(null);

      if (!id || Number.isNaN(Number(id))) {
        setError("Érvénytelen azonosító");
        setLoading(false);
        return;
      }

      try {
        const data = await recipesApi.getById(Number(id));

        if (cancelled) {
          return;
        }

        setRecipe(data);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(getApiErrorMessage(err, "Nem sikerült betölteni a receptet."));
      }

      if (!cancelled) {
        setLoading(false);
      }
    }
    void fetchRecipe();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { recipe, error, loading };
}
