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

  async function handleDelete() {
    if (!recipe) {
      return;
    }

    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd ezt a receptet?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecipeMutation.mutateAsync({
        recipeId: recipeId,
      });

      navigate("/recipes");
    } catch {
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

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <PageHeader
            className="rounded-none border-x-0 border-t-0 border-b border-slate-100 shadow-none"
            eyebrow="Recept részletei"
            title={recipe.title}
            meta={
              <>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Készítette
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {recipe.owner_username}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Adag
                  </p>
                  <p className="mt-1 text-center text-sm font-semibold text-slate-900">
                    {recipe.servings}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Főzési idő
                  </p>
                  <p className="mt-1 text-center text-sm font-semibold text-slate-900">
                    {recipe.cooking_time} perc
                  </p>
                </div>
              </>
            }
            actions={
              isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                    disabled={deleting}
                    className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Szerkesztés
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deleting ? "Törlés..." : "Törlés"}
                  </button>
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

            <div className="grid gap-4 border-t border-slate-100 pt-6 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Létrehozva
                </p>
                <p className="mt-1 font-medium text-slate-800">
                  {formatDateTime(recipe.created_at)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recept azonosító
                </p>
                <p className="mt-1 font-medium text-slate-800">#{recipe.id}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
