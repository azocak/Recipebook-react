import { Link, useNavigate } from "react-router-dom";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import RecipeForm from "../components/RecipeForm";
import { useCreateRecipeMutation } from "../hooks/mutations/useCreateRecipeMutation";

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
          <div className="border-b border-slate-100 bg-orange-50/70 px-6 py-6 sm:px-8">
            <div className="space-y-4">
              <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-orange-700">
                Új recept
              </p>
            </div>
          </div>

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
