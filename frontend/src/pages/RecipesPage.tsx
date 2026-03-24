import { useEffect, useState } from "react";
import type { Recipe } from "../api/types";
import { recipesApi } from "../api/recipes";
import RecipeCard from "../components/RecipeCard";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function RecipesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const data = await recipesApi.getAll();
        setRecipes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  function handleClick() {
    navigate("/recipes/new");
  }

  function handleRecipeDeleted(deletedRecipeId: number) {
    setRecipes((prev) =>
      prev.filter((recipe) => recipe.id !== deletedRecipeId),
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Receptkönyv</h1>
      {isAuthenticated && <button onClick={handleClick}>Új recept</button>}
      <div className="grid md:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onDeleteSuccess={handleRecipeDeleted}
          />
        ))}
      </div>
    </div>
  );
}

export default RecipesPage;
