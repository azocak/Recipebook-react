import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { RecipeImageBlock } from "../components/recipe/RecipeImageBlock";
import { useRecipeQuery } from "../hooks/queries/useRecipeQuery";
import { useDeleteRecipeMutation } from "../hooks/mutations/useDeleteRecipeMutation";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { Spinner } from "../components/ui/Spinner";
import { Skeleton } from "../components/ui/Skeleton";
import { RecipeQueryErrorState } from "../components/recipe/RecipeQueryErrorState";
import { isRecipeQueryErrorStatus } from "../components/recipe/recipeQueryErrorStateUtils";
import { PageHeader } from "../components/ui/PageHeader";
import { RecipeMeta } from "../components/recipe/RecipeMeta";
import { useState } from "react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RecipeDetailPageSkeleton() {
  return (
    <section
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
      aria-label="Recept részleteinek betöltése"
    >
      <div className="space-y-6">
        <Skeleton className="h-5 w-40 rounded-full" />

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Skeleton className="h-72 w-full rounded-none sm:h-96" />

          <div className="space-y-8 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-10 w-72 rounded-2xl" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full max-w-xl rounded-full" />
                  <Skeleton className="h-4 w-5/6 max-w-lg rounded-full" />
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <Skeleton className="h-11 w-28 rounded-2xl" />
                <Skeleton className="h-11 w-24 rounded-2xl" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-11/12 rounded-full" />
                <Skeleton className="h-4 w-4/5 rounded-full" />
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-10/12 rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Spinner label="Recept betöltése..." size="sm" />
        </div>
      </div>
    </section>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { recipe, status, errorMessage } = useRecipeQuery(id);
  const deleteRecipeMutation = useDeleteRecipeMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleting = deleteRecipeMutation.isPending;

  const deleteError = deleteRecipeMutation.isError
    ? getApiErrorMessage(
        deleteRecipeMutation.error,
        "Nem sikerült törölni a receptet.",
      )
    : null;

  if (status === "loading") {
    return <RecipeDetailPageSkeleton />;
  }

  if (isRecipeQueryErrorStatus(status)) {
    return (
      <RecipeQueryErrorState
        status={status}
        errorMessage={errorMessage}
        mode="detail"
        onBackToRecipes={() => navigate("/recipes")}
      />
    );
  }

  if (!recipe) {
    return null;
  }

  const recipeId = recipe.id;
  const isOwner = !!user && user.id === recipe.owner;

  function handleOpenDeleteDialog() {
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
        recipeId,
      });

      setIsDeleteDialogOpen(false);
      navigate("/recipes");
    } catch {
      setIsDeleteDialogOpen(false);
      // A hibát a mutation állapota kezeli, és deleteError alapján jelenítjük meg.
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Vissza a receptekhez
        </Link>

        <Card as="article" className="overflow-hidden">
          <PageHeader
            className="rounded-none border-x-0 border-t-0 border-b border-slate-100 shadow-none"
            eyebrow="Recept részletei"
            title={recipe.title}
            meta={
              <>
                <RecipeMeta label="Készítette" value={recipe.owner_username} />

                <RecipeMeta
                  label="Adag"
                  value={recipe.servings}
                  align="center"
                />

                <RecipeMeta
                  label="Főzési idő"
                  value={`${recipe.cooking_time} perc`}
                  align="center"
                />
              </>
            }
            actions={
              isOwner ? (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                    disabled={deleting}
                    className="cursor-pointer"
                  >
                    Szerkesztés
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    isLoading={deleting}
                    onClick={handleOpenDeleteDialog}
                    className="cursor-pointer"
                  >
                    {deleting ? "Törlés..." : "Törlés"}
                  </Button>
                </>
              ) : null
            }
          />

          <div className="space-y-8 px-6 py-6 sm:px-8">
            {deleteError ? (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {deleteError}
              </div>
            ) : null}

            <section className="space-y-3" aria-label="Receptkép">
              <RecipeImageBlock
                imageUrl={recipe.image_url}
                alt={`${recipe.title} recept képe`}
                variant="detail"
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Hozzávalók
              </h2>
              <div className="rounded-2xl bg-slate-50 py-4 px-4 text-sm leading-7 text-slate-700 sm:text-base">
                <p className="whitespace-pre-line">{recipe.ingredients}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Elkészítés
              </h2>
              <div className="rounded-2xl bg-slate-50 py-4 px-4 text-sm leading-7 text-slate-700 sm:text-base">
                <p className="whitespace-pre-line">{recipe.instructions}</p>
              </div>
            </section>

            <div className="grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <RecipeMeta
                label="Létrehozva"
                value={formatDateTime(recipe.created_at)}
              />

              <RecipeMeta label="Recept azonosító" value={`#${recipe.id}`} />
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Recept törlése"
        description={
          <>
            Biztosan törölni szeretnéd a(z) <strong>{recipe.title}</strong>{" "}
            receptet?
          </>
        }
        confirmLabel="Törlés"
        cancelLabel="Mégse"
        intent="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  );
}
