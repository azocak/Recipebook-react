import { useNavigate } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";
import type { RecipeFormData } from "../api/types";
import { recipesApi } from "../api/recipes";

const defaultValues: RecipeFormData = {
  title: "",
  ingredients: "",
  instructions: "",
  cooking_time: 0,
  servings: 1,
};

export default function NewRecipePage() {
  const navigate = useNavigate();

  async function handleSubmit(data: RecipeFormData) {
    const createdRecipe = await recipesApi.create(data);
    navigate(`/recipes/${createdRecipe.id}`);
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Új recept</h1>
      <RecipeForm
        initialValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Recept mentése"
      />
    </section>
  );
}
