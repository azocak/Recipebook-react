import { useState } from "react";
import type { RecipeFormData } from "../api/types";
import { RecipeFormField } from "./recipe/RecipeFormField";
import { mapApiErrors } from "../utils/mapApiErrors";
import {
  validateRecipeForm,
  type RecipeFormErrors,
} from "../utils/validateRecipeForm";

type RecipeFormProps = {
  initialValues: RecipeFormData;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel: string;
};

export default function RecipeForm({
  initialValues,
  onSubmit,
  submitLabel,
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>(initialValues);
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cooking_time" || name === "servings" ? Number(value) : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined,
    }));
  }

  function normalizedRecipeFormData(data: RecipeFormData): RecipeFormData {
    return {
      title: data.title.trim(),
      ingredients: data.ingredients.trim(),
      instructions: data.instructions.trim(),
      cooking_time: data.cooking_time,
      servings: data.servings,
    };
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedData = normalizedRecipeFormData(formData);
    const clientErrors = validateRecipeForm(normalizedData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await onSubmit(normalizedData);
    } catch (error) {
      setErrors(
        mapApiErrors(
          error,
          ["title", "ingredients", "instructions", "cooking_time", "servings"],
          "Nem sikerült menteni a receptet",
        ) as RecipeFormErrors,
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <RecipeFormField
        id="title"
        label="Recept neve"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        maxLength={120}
        error={errors.title}
      />

      <RecipeFormField
        type="textarea"
        id="ingredients"
        label="Hozzávalók"
        name="ingredients"
        value={formData.ingredients}
        onChange={handleChange}
        required
        rows={6}
        error={errors.ingredients}
      />

      <RecipeFormField
        type="textarea"
        id="instructions"
        label="Elkészítés"
        name="instructions"
        value={formData.instructions}
        onChange={handleChange}
        required
        rows={8}
        error={errors.instructions}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <RecipeFormField
          id="cooking_time"
          label="Főzési idő (perc)"
          type="number"
          name="cooking_time"
          value={formData.cooking_time}
          onChange={handleChange}
          required
          min={1}
          max={1440}
          error={errors.cooking_time}
        />

        <RecipeFormField
          id="servings"
          label="Adagok száma"
          type="number"
          name="servings"
          min={1}
          max={20}
          value={formData.servings}
          onChange={handleChange}
          required
          error={errors.servings}
        />
      </div>

      {errors.general && (
        <p className="mt-1 text-sm text-red-600">{errors.general}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "Mentés..." : submitLabel}
      </button>
    </form>
  );
}
