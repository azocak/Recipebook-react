import { Link, useNavigate, useParams } from "react-router-dom";

import { recipesApi } from "../api/recipes";
import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { PageStatus } from "../components/PageStatus";
import RecipeForm from "../components/RecipeForm";
import { useRecipeQuery } from "../hooks/queries/useRecipeQuery";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { recipe, status, errorMessage } = useRecipeQuery(id);

  if (status === "loading") {
    return (
      <PageStatus
        title="Recept szerkesztő betöltése..."
        description="Előkészítjük a szerkesztő űrlapot."
      />
    );
  }

  if (status === "invalid-id") {
    return (
      <PageStatus
        title="Érvénytelen receptazonosító."
        description={errorMessage}
        variant="error"
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  if (status === "not-found") {
    return (
      <PageStatus
        title="Nincs ilyen recept."
        description="A keresett recept nem található."
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  if (status === "forbidden") {
    return (
      <PageStatus
        title="Nem módosíthatod ezt a receptet."
        description={errorMessage}
        variant="error"
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  if (status === "error") {
    return (
      <PageStatus
        title="Nem sikerült betölteni a receptet."
        description={errorMessage}
        variant="error"
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  if (!recipe) {
    return null;
  }

  const recipeId = recipe.id;
  const isOwner = !!user && user.id === recipe.owner;

  if (!isOwner) {
    return (
      <PageStatus
        title="Nincs jogosultságod ehhez az oldalhoz."
        description="Csak a recept készítője szerkesztheti ezt a receptet."
        variant="error"
        backTo={`/recipes/${recipeId}`}
        backLabel="Vissza a recepthez"
      />
    );
  }

  const initialValues: RecipeFormData = {
    title: recipe.title,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    cooking_time: recipe.cooking_time,
    servings: recipe.servings,
  };

  async function handleSubmit(data: RecipeImageFormData) {
    const updatedRecipe = await recipesApi.update(recipeId, data);

    queryClient.setQueryData(
      queryKeys.recipes.detail(updatedRecipe.id),
      updatedRecipe,
    );

    if (updatedRecipe.id !== recipeId) {
      queryClient.setQueryData(
        queryKeys.recipes.detail(recipeId),
        updatedRecipe,
      );
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.recipes.lists(),
    });

    navigate(`/recipes/${updatedRecipe.id}`);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Link
          to={`/recipes/${recipeId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Vissza a recepthez
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-orange-50/70 px-6 py-6 sm:px-8">
            <div className="space-y-4">
              <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-orange-700">
                Recept szerkesztése
              </p>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <RecipeForm
              initialValues={initialValues}
              initialImageUrl={recipe.image_url}
              onSubmit={handleSubmit}
              submitLabel="Módosítás mentése"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
