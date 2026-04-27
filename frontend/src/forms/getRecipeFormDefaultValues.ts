import type { RecipeSchemaValues } from "../schemas/recipe";

export const RECIPE_FORM_DEFAULT_VALUES: RecipeSchemaValues = {
  title: "",
  ingredients: "",
  instructions: "",
  cooking_time: 0,
  servings: 1,
  image: undefined,
  remove_image: false,
};

export function getRecipeFormDefaultValues(
  initialValues?: Partial<RecipeSchemaValues>,
): RecipeSchemaValues {
  return {
    ...RECIPE_FORM_DEFAULT_VALUES,
    ...initialValues,
    image: undefined,
    remove_image: false,
  };
}
