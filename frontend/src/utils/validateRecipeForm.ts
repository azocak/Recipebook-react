import type { RecipeFormData } from "../api/types";
import {
  RECIPE_COOKING_TIME_MAX,
  RECIPE_COOKING_TIME_MIN,
  RECIPE_FIELD_LABELS,
  RECIPE_SERVINGS_MAX,
  RECIPE_SERVINGS_MIN,
  RECIPE_TEXTAREA_MIN,
  RECIPE_TITLE_MAX,
  RECIPE_TITLE_MIN,
  RECIPE_VALIDATION_ERRORS,
} from "../constants/recipe";

export type RecipeFormErrors = Partial<
  Record<keyof RecipeFormData | "general", string>
>;

export function validateRecipeForm(data: RecipeFormData): RecipeFormErrors {
  const errors: RecipeFormErrors = {};

  const title = data.title.trim();
  const ingredients = data.ingredients.trim();
  const instructions = data.instructions.trim();

  function validateTextarea(
    key: keyof Pick<RecipeFormData, "ingredients" | "instructions">,
    value: string,
    fieldLabel: string,
  ) {
    if (!value) {
      errors[key] = `A(z) ${fieldLabel} mező kötelező.`;
    } else if (value.length < RECIPE_TEXTAREA_MIN) {
      errors[key] =
        `A(z) ${fieldLabel} mező legalább ${RECIPE_TEXTAREA_MIN} karakter legyen.`;
    }
  }

  function validateNumberInput(
    key: keyof Pick<RecipeFormData, "cooking_time" | "servings">,
    value: number,
    fieldLabel: string,
    min: number,
    max: number,
    unit = "",
  ) {
    const suffix = unit ? ` ${unit}` : "";

    if (!Number.isInteger(value)) {
      errors[key] = `A(z) ${fieldLabel} mezőbe egész számot adj meg.`;
      return;
    }

    if (value < min) {
      errors[key] = `A(z) ${fieldLabel} legalább ${min}${suffix} legyen.`;
      return;
    }

    if (value > max) {
      errors[key] = `A(z) ${fieldLabel} legfeljebb ${max}${suffix} lehet.`;
    }
  }

  if (!title) {
    errors.title = "A recept neve kötelező.";
  } else if (title.length < RECIPE_TITLE_MIN) {
    errors.title = `A recept neve legalább ${RECIPE_TITLE_MIN} karakter legyen.`;
  } else if (title.length > RECIPE_TITLE_MAX) {
    errors.title = `A recept neve legfeljebb ${RECIPE_TITLE_MAX} karakter lehet.`;
  }

  validateTextarea("ingredients", ingredients, RECIPE_FIELD_LABELS.ingredients);
  validateTextarea(
    "instructions",
    instructions,
    RECIPE_FIELD_LABELS.instructions,
  );

  validateNumberInput(
    "cooking_time",
    data.cooking_time,
    RECIPE_FIELD_LABELS.cooking_time,
    RECIPE_COOKING_TIME_MIN,
    RECIPE_COOKING_TIME_MAX,
    "perc",
  );

  validateNumberInput(
    "servings",
    data.servings,
    RECIPE_FIELD_LABELS.servings,
    RECIPE_SERVINGS_MIN,
    RECIPE_SERVINGS_MAX,
  );

  if (
    ingredients &&
    instructions &&
    ingredients.toLowerCase() === instructions.toLowerCase()
  ) {
    errors.instructions = RECIPE_VALIDATION_ERRORS.duplicateInstructions;
  }

  return errors;
}
