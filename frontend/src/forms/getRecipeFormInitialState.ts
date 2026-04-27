import type { RecipeFormData } from "../api/types";

export type RecipeFormState = {
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time: string;
  servings: string;
};

export const EMPTY_RECIPE_FORM_STATE: RecipeFormState = {
  title: "",
  ingredients: "",
  instructions: "",
  cooking_time: "",
  servings: "1",
};

export function getRecipeFormInitialState(
  initialValues: RecipeFormData,
): RecipeFormState {
  return {
    ...EMPTY_RECIPE_FORM_STATE,
    title: initialValues.title,
    ingredients: initialValues.ingredients,
    instructions: initialValues.instructions,
    cooking_time: String(initialValues.cooking_time),
    servings: String(initialValues.servings),
  };
}
