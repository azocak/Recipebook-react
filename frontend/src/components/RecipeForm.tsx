import { useState } from "react";
import type { RecipeFormData } from "../api/types";
import { RecipeFormField } from "./recipe/RecipeFormField";

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
  const [error, setError] = useState("");
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
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      setError("Nem sikerült menteni a receptet.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RecipeFormField
        id="title"
        label="Recept neve"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
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
        />

        <RecipeFormField
          id="servings"
          label="Adagok száma"
          type="number"
          name="servings"
          min={1}
          value={formData.servings}
          onChange={handleChange}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
