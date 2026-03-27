import type { RecipeFormData } from "../api/types";

export type RecipeFormErrors = Partial<
  Record<keyof RecipeFormData | "general", string>
>;

export function validateRecipeForm(data: RecipeFormData): RecipeFormErrors {
  const errors: RecipeFormErrors = {};

  const title = data.title.trim();
  const ingredients = data.ingredients.trim();
  const instructions = data.instructions.trim();

  function validateTextarea(
    key: keyof RecipeFormData,
    value: string,
    fieldLabel: string,
    min: number,
  ) {
    if (!value) {
      errors[key] = `A(z) ${fieldLabel} mező kötelező.`;
    } else if (value.length < min) {
      errors[key] = `A(z) ${fieldLabel} mező legalább ${min} karakter legyen.`;
    }
  }

  function validateNumberInput(
    key: keyof RecipeFormData,
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
  } else if (title.length < 3) {
    errors.title = "A recept neve legalább 3 karakter legyen.";
  } else if (title.length > 120) {
    errors.title = "A recept neve legfeljebb 120 karakter lehet.";
  }

  validateTextarea("ingredients", ingredients, "hozzávalók", 10);
  validateTextarea("instructions", instructions, "elkészítés", 10);
  validateNumberInput(
    "cooking_time",
    data.cooking_time,
    "főzési idő",
    1,
    1440,
    "perc",
  );
  validateNumberInput("servings", data.servings, "adagok száma", 1, 20);

  if (
    ingredients &&
    instructions &&
    ingredients.toLowerCase() === instructions.toLowerCase()
  ) {
    errors.instructions = "Az elkészítés nem lehet ugyanaz, mint a hozzávalók.";
  }

  return errors;
}
