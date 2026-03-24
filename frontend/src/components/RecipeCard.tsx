import { useNavigate } from "react-router-dom";
import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import type { MouseEvent } from "react";
import { useDeleteRecipe } from "../hooks/useDeleteRecipe";

interface RecipeCardProps {
  recipe: Recipe;
  onDeleteSuccess?: (deletedRecipeId: number) => void;
}

function RecipeCard({ recipe, onDeleteSuccess }: RecipeCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deleteRecipe } = useDeleteRecipe();
  const isOwner = !!user && recipe.owner === user.id;

  function handleCardClick() {
    navigate(`/recipes/${recipe.id}`);
  }

  const handleEditButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/recipes/${recipe.id}/edit`);
  };

  async function handleDeleteButton(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd ezt a receptet?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecipe(recipe.id);
      if (onDeleteSuccess) {
        onDeleteSuccess(recipe.id);
      } else {
        navigate("/recipes");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
    >
      <h2 className="text-xl font-bold text-orange-600">{recipe.title}</h2>
      <div className="mt-4 flex gap-4 text-sm text-gray-500">
        <span>⏱ {recipe.cooking_time} perc</span>
        <span>🍽 {recipe.servings} adag</span>
      </div>

      <p className="mt-4 text-sm text-gray-700">{recipe.owner_username}</p>

      {isOwner && (
        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={handleEditButton}
            className="cursor-pointer rounded bg-blue-600 px-3 py-2 text-white"
          >
            Szerkesztés
          </button>
          <button
            type="button"
            onClick={handleDeleteButton}
            className="cursor-pointer rounded bg-red-600 px-3 py-2 text-white"
          >
            Törlés
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
