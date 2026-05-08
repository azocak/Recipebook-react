import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import RecipeForm from "../components/RecipeForm";
import { RecipeMeta } from "../components/recipe/RecipeMeta";
import { PageHeader } from "../components/ui/PageHeader";
import { useCreateRecipeMutation } from "../hooks/mutations/useCreateRecipeMutation";
import { useBeforeUnloadWarning } from "../hooks/useBeforeUnloadWarning";
import { Card } from "../components/ui/Card";

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
  const [isRecipeFormDirty, setIsRecipeFormDirty] = useState(false);

  useBeforeUnloadWarning(isRecipeFormDirty);

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

        <Card className="overflow-hidden">
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
              onDirtyChange={setIsRecipeFormDirty}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
