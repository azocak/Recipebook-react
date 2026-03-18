import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const { user } = useAuth();
  const isOwner = !!user && recipe.owner === user.id;

  return (
    <div className="rounded-xl bg-white shadow p-6 hover:shadow-lg transition">
      <h2 className="text-xl font-bold text-orange-600">{recipe.title}</h2>
      <div className="flex gap-4 mt-4 text-sm text-gray-500">
        <span>⏱ {recipe.cooking_time}</span>
        <span>🍽 {recipe.servings}</span>
      </div>
      {isOwner && (
        <div>
          <button>Szerkesztés</button>
          <button>Törlés</button>
        </div>
      )}
      <p>Készítette: {recipe.owner_username}</p>
    </div>
  );
}

export default RecipeCard;
