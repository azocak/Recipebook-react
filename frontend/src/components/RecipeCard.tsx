import type { Recipe } from "../api/types";

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="rounded-xl bg-white shadow p-6 hover:shadow-lg transition">
      <h2 className="text-xl font-bold text-orange-600">{recipe.title}</h2>
      <p className="text-gray-600 mt-2">{recipe.description}</p>
      <div className="flex gap-4 mt-4 text-sm text-gray-500">
        <span>⏱ {recipe.cooking_time}</span>
        <span>🍽 {recipe.servings}</span>
      </div>
    </div>
  );
}

export default RecipeCard;
