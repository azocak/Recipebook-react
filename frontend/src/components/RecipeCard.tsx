import { useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { useDeleteRecipeMutation } from "../hooks/mutations/useDeleteRecipeMutation";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { RecipeImageBlock } from "./recipe/RecipeImageBlock";
import { ConfirmDialog } from "./ui/ConfirmDialog";

interface RecipeCardProps {
  recipe: Recipe;
  onDeleteSuccess?: (deletedRecipeId: number) => void;
}

function RecipeCard({ recipe, onDeleteSuccess }: RecipeCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteRecipeMutation = useDeleteRecipeMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwner = !!user && recipe.owner === user.id;
  const deleting = deleteRecipeMutation.isPending;

  const deleteError = deleteRecipeMutation.isError
    ? getApiErrorMessage(
        deleteRecipeMutation.error,
        "Nem sikerült törölni a receptet.",
      )
    : null;

  const handleEditButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/recipes/${recipe.id}/edit`);
  };

  function handleDeleteButton(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  }

  function handleCancelDelete() {
    if (deleting) {
      return;
    }

    setIsDeleteDialogOpen(false);
  }

  async function handleConfirmDelete() {
    try {
      await deleteRecipeMutation.mutateAsync({
        recipeId: recipe.id,
      });

      setIsDeleteDialogOpen(false);

      if (onDeleteSuccess) {
        onDeleteSuccess(recipe.id);
      } else {
        navigate("/recipes");
      }
    } catch {
      setIsDeleteDialogOpen(false);
      // A hibát a mutation állapota kezeli, és deleteError alapján jelenítjük meg.
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <Link
        to={`/recipes/${recipe.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        aria-label={`A(z) ${recipe.title} recept képének megnyitása`}
      >
        <RecipeImageBlock
          imageUrl={recipe.image_url}
          alt={`${recipe.title} recept képe`}
          variant="card"
        />
      </Link>

      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-700">
              Recept
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Készítette:{" "}
              <span className="font-medium text-slate-700">
                {recipe.owner_username}
              </span>
            </p>
          </div>

          {isOwner ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleEditButton}
                disabled={deleting}
                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={`A(z) ${recipe.title} recept szerkesztése`}
              >
                Szerkesztés
              </button>

              <button
                type="button"
                onClick={handleDeleteButton}
                disabled={deleting}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={`A(z) ${recipe.title} recept törlése`}
              >
                {deleting ? "Törlés..." : "Törlés"}
              </button>
            </div>
          ) : null}
        </div>

        <Link
          to={`/recipes/${recipe.id}`}
          className="flex flex-1 flex-col px-5 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label={`A(z) ${recipe.title} recept megnyitása`}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 transition hover:text-orange-700">
              {recipe.title}
            </h2>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-medium text-slate-900">⏱</span>{" "}
                {recipe.cooking_time} perc
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-medium text-slate-900">🍽</span>{" "}
                {recipe.servings} adag
              </div>
            </div>

            {deleteError ? (
              <div
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {deleteError}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Részletek megnyitása
            </span>

            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700 transition"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </Link>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Recept törlése"
        description={
          <>
            Biztosan törölni szeretnéd a(z) <strong>{recipe.title}</strong>{" "}
            receptet? Ez a művelet nem vonható vissza.
          </>
        }
        confirmLabel="Törlés"
        cancelLabel="Mégse"
        intent="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </article>
  );
}

export default RecipeCard;
