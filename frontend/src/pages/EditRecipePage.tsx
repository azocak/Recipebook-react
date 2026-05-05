import { Link, useNavigate, useParams } from "react-router-dom";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import RecipeForm from "../components/RecipeForm";
import { useRecipeQuery } from "../hooks/queries/useRecipeQuery";

import { useUpdateRecipeMutation } from "../hooks/mutations/useUpdateRecipeMutation";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import { Spinner } from "../components/ui/Spinner";
import { RecipeQueryErrorState } from "../components/recipe/RecipeQueryErrorState";
import { isRecipeQueryErrorStatus } from "../components/recipe/recipeQueryErrorStateUtils";
import { PageHeader } from "../components/ui/PageHeader";
import { RecipeMeta } from "../components/recipe/RecipeMeta";
import { useState } from "react";
import { useBeforeUnloadWarning } from "../hooks/useBeforeUnloadWarning";

function EditRecipePageSkeleton() {
  return (
    <section
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
      aria-label="Recept szerkesztő betöltése"
    >
      <div className="space-y-6">
        <Skeleton className="h-5 w-40 rounded-full" />

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-orange-50/70 px-6 py-6 sm:px-8">
            <div className="mx-auto max-w-2xl space-y-4 text-center">
              <Skeleton className="mx-auto h-4 w-32 rounded-full" />
              <Skeleton className="mx-auto h-9 w-64 rounded-2xl" />
              <Skeleton className="mx-auto h-4 w-full max-w-md rounded-full" />
            </div>
          </div>

          <div className="space-y-8 px-6 py-6 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-11 w-full rounded-2xl" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-64 w-full rounded-3xl" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-11 w-full rounded-2xl" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-11 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Spinner label="Recept szerkesztő betöltése..." size="sm" />

              <div className="flex gap-3">
                <Skeleton className="h-11 w-28 rounded-2xl" />
                <Skeleton className="h-11 w-40 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { recipe, status, errorMessage } = useRecipeQuery(id);
  const updateRecipeMutation = useUpdateRecipeMutation();
  const [isRecipeFormDirty, setIsRecipeFormDirty] = useState(false);

  useBeforeUnloadWarning(isRecipeFormDirty);

  if (status === "loading") {
    return <EditRecipePageSkeleton />;
  }

  if (isRecipeQueryErrorStatus(status)) {
    return (
      <RecipeQueryErrorState
        status={status}
        errorMessage={errorMessage}
        mode="edit"
        onBackToRecipes={() => navigate("/recipes")}
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
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          eyebrow="Szerkesztés zárolva"
          visual="🔐"
          title="Nincs jogosultságod ehhez az oldalhoz."
          description="Csak a recept készítője szerkesztheti ezt a receptet."
          secondaryActionLabel="Vissza a recepthez"
          onSecondaryAction={() => navigate(`/recipes/${recipe.id}`)}
        />
      </section>
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
    if (!recipeId) {
      return;
    }

    const updatedRecipe = await updateRecipeMutation.mutateAsync({
      recipeId,
      data,
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
          <PageHeader
            className="rounded-none border-x-0 border-t-0 border-b border-slate-100 shadow-none"
            eyebrow="Szerkesztő mód"
            title="Recept szerkesztése"
            description="Frissítsd a recept adatait, képét, hozzávalóit és elkészítési leírását."
            meta={
              <>
                <RecipeMeta label="Szerkesztett recept" value={recipe.title} />

                <RecipeMeta label="Készítette" value={recipe.owner_username} />
              </>
            }
          />

          <div className="px-6 py-6 sm:px-8">
            <RecipeForm
              initialValues={initialValues}
              initialImageUrl={recipe.image_url}
              onSubmit={handleSubmit}
              submitLabel="Módosítás mentése"
              onDirtyChange={setIsRecipeFormDirty}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
