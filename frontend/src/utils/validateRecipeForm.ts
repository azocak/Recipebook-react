import type { RecipeFormData } from "../api/types";

export type RecipeFormErrors = Partial<
  Record<keyof RecipeFormData | "general", string>
>;

export function validateRecipeForm(data: RecipeFormData): RecipeFormErrors {
  const errors: RecipeFormErrors = {};

  const title = data.title.trim();
  const ingredients = data.ingredients.trim();
  const instructions = data.instructions.trim();

  if (!title) {
    errors.title = "A recept neve kötelező.";
  } else if (title.length < 3) {
    errors.title = "A recept neve legalább 3 karakter legyen.";
  } else if (title.length > 120) {
    errors.title = "A recept neve legfeljebb 120 karakter lehet.";
  }

  if (!ingredients) {
    errors.ingredients = "A hozzávalók mező kötelező.";
  } else if (ingredients.length < 10) {
    errors.ingredients = "A hozzávalók mező legalább 10 karakter legyen.";
  }

  if (!instructions) {
    errors.instructions = "Az elkészítés mező kötelező.";
  } else if (instructions.length < 10) {
    errors.instructions = "Az elkészítés mező legalább 10 karakter legyen.";
  }

  if (!Number.isInteger(data.cooking_time) || data.cooking_time < 1) {
    errors.cooking_time = "A főzési idő legalább 1 perc legyen.";
  } else if (data.cooking_time > 1440) {
    errors.cooking_time = "A főzési idő legfeljebb 1440 perc lehet.";
  }

  if (!Number.isInteger(data.servings) || data.servings < 1) {
    errors.servings = "Az adagok száma legalább 1 legyen.";
  } else if (data.servings > 20) {
    errors.servings = "Az adagok száma legfeljebb 50 lehet.";
  }

  if (
    ingredients &&
    instructions &&
    ingredients.toLowerCase() === instructions.toLowerCase()
  ) {
    errors.instructions = "Az elkészítés nem lehet ugyanaz, mint a hozzávalók.";
  }

  return errors;
}
