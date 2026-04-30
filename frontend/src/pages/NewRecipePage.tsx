import { Link, useNavigate } from "react-router-dom";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import RecipeForm from "../components/RecipeForm";
import { useCreateRecipeMutation } from "../hooks/mutations/useCreateRecipeMutation";
import { PageHeader } from "../components/ui/PageHeader";
import { RecipeMeta } from "../components/recipe/RecipeMeta";

const defaultValues: RecipeFormData = {
  title: "",
  ingredients: "",
  instructions: "",
  cooking_time: 0,
  servings: 1,
};

export default function NewRecipePage() {
  const navigate = useNavigate();
  const createRecipeMutation = useCreateRecipeMutation();

  async function handleSubmit(data: RecipeImageFormData) {
    const createdRecipe = await createRecipeMutation.mutateAsync(data);

    navigate(`/recipes/${createdRecipe.id}`);
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

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <PageHeader
            className="rounded-none border-x-0 border-t-0 border-b border-slate-100 shadow-none"
            eyebrow="Új recept"
            title="Recept létrehozása"
            description="Adj meg minden fontos részletet, tölts fel képet, és oszd meg az új kedvenc receptedet."
            meta={
              <>
                <RecipeMeta label="Űrlap típusa" value="Új recept" />

                <RecipeMeta
                  label="Következő lépés"
                  value="Mentés után részletoldal"
                />
              </>
            }
          />

          <div className="px-6 py-6 sm:px-8">
            <RecipeForm
              initialValues={defaultValues}
              initialImageUrl={null}
              onSubmit={handleSubmit}
              submitLabel="Recept mentése"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
