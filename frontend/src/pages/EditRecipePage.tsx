import type { RecipeFormData } from "../api/types";
import RecipeForm from "../components/RecipeForm";
import { recipesApi } from "../api/recipes";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useRecipe } from "../hooks/useRecipe";
import { PageStatus } from "../components/PageStatus";

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { recipe, error, loading } = useRecipe(id);

  if (loading) {
    return (
      <PageStatus
        title="Recept szerkesztő betöltése..."
        description="Előkészítjük a szerkesztő űrlapot."
      />
    );
  }

  if (error) {
    return (
      <PageStatus
        title="Nem sikerült betölteni a receptet."
        description={error}
        variant="error"
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
  }

  if (!recipe) {
    return (
      <PageStatus
        title="Nincs ilyen recept."
        description="A keresett recept nem található."
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />
    );
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
