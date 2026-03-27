import { useEffect, useState } from "react";

import type { RecipeFormData } from "../api/types";

import { RecipeFormField } from "./recipe/RecipeFormField";

import {
  validateRecipeForm,
  type RecipeFormErrors,
} from "../utils/validateRecipeForm";
import { mapApiErrorsToFormErrors } from "../utils/mapApiErrorsToFormErrors";

type RecipeFormProps = {
  initialValues: RecipeFormData;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel: string;
};

type RecipeFormState = {
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time: string;
  servings: string;
};

function toFormState(values: RecipeFormData): RecipeFormState {
  return {
    title: values.title,
    ingredients: values.ingredients,
    instructions: values.instructions,
    cooking_time: String(values.cooking_time),
    servings: String(values.servings),
  };
}

function normalizeRecipeFormData(data: RecipeFormState): RecipeFormData {
  return {
    title: data.title.trim(),
    ingredients: data.ingredients.trim(),
    instructions: data.instructions.trim(),
    cooking_time: Number(data.cooking_time),
    servings: Number(data.servings),
  };
}

export default function RecipeForm({
  initialValues,
  onSubmit,
  submitLabel,
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormState>(
    toFormState(initialValues),
  );
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(toFormState(initialValues));
    setErrors({});
  }, [initialValues]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedData = normalizeRecipeFormData(formData);
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
        mapApiErrorsToFormErrors(
          error,
          ["title", "ingredients", "instructions", "cooking_time", "servings"],
          "Nem sikerült menteni a receptet.",
        ) as RecipeFormErrors,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          <RecipeFormField
            id="title"
            label="Recept neve"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={120}
            placeholder="pl. Házi palacsinta"
            error={errors.title}
            hint="Adj rövid, jól érthető címet a receptnek."
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
            placeholder="Írd le a hozzávalókat, lehetőleg soronként."
            error={errors.ingredients}
            hint="Például: 20 dkg liszt, 2 db tojás, 3 dl tej..."
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
            placeholder="Írd le lépésről lépésre az elkészítést."
            error={errors.instructions}
          />

          <div className="grid gap-5 sm:grid-cols-2">
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
              placeholder="pl. 30"
              error={errors.cooking_time}
            />

            <RecipeFormField
              id="servings"
              label="Adagok száma"
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              required
              min={1}
              max={20}
              placeholder="pl. 4"
              error={errors.servings}
            />
          </div>
        </div>
      </div>

      {errors.general ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errors.general}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          A <span className="text-red-600">*</span> jelölt mezők kitöltése
          kötelező.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Mentés..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
