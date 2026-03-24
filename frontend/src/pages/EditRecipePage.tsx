import type { RecipeFormData } from "../api/types";
import RecipeForm from "../components/RecipeForm";
import { recipesApi } from "../api/recipes";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useRecipe } from "../hooks/useRecipe";
import { Loading } from "../components/Loading";
import { PageState } from "../components/PageState";

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { recipe, error, loading } = useRecipe(id);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <PageState message={error} tone="error" />;
  }
  if (!recipe) {
    return <PageState message="Nincs ilyen recept." />;
  }

  const recipeId = recipe.id;
  const isOwner = !!user && user.id === recipe.owner;

  if (!isOwner) {
    return (
      <PageState
        message="Nincs jogosultságod a recept szerkesztéséhez."
        tone="error"
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

  async function handleSubmit(data: RecipeFormData) {
    const updatedRecipe = await recipesApi.update(recipeId, data);
    navigate(`/recipes/${updatedRecipe.id}`);
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Recept szerkesztése</h1>
      <RecipeForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Módosítás mentése"
      />
    </section>
  );
}
