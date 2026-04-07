import { useEffect, useMemo, useState } from "react";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";

import { RecipeFormField } from "./recipe/RecipeFormField";

import {
  validateRecipeForm,
  type RecipeFormErrors,
} from "../utils/validateRecipeForm";
import { mapApiErrorsToFormErrors } from "../utils/mapApiErrorsToFormErrors";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

type RecipeImageFormErrors = RecipeFormErrors & {
  image?: string;
  remove_image?: string;
};

type RecipeFormProps = {
  initialValues: RecipeFormData;
  initialImageUrl?: string | null;
  onSubmit: (data: RecipeImageFormData) => Promise<void>;
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

function isSupportedImageFile(file: File) {
  const fileName = file.name.toLowerCase();
  const hasSupportedExtension = ACCEPTED_IMAGE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension),
  );

  return ACCEPTED_IMAGE_TYPES.has(file.type) || hasSupportedExtension;
}

function getImageValidationError(file: File | null) {
  if (!file) {
    return undefined;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "A fájl mérete nem lehet nagyobb 5 MB-nál.";
  }

  if (!isSupportedImageFile(file)) {
    return "Csak JPG, JPEG, PNG vagy WEBP formátum tölthető fel.";
  }

  return undefined;
}

function ImagePlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M21 16l-5.5-5.5L7 19" />
        </svg>

        <p className="text-sm font-medium">Nincs feltöltött kép</p>
      </div>
    </div>
  );
}

export default function RecipeForm({
  initialValues,
  initialImageUrl = null,
  onSubmit,
  submitLabel,
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormState>(
    toFormState(initialValues),
  );
  const [errors, setErrors] = useState<RecipeImageFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    setFormData(toFormState(initialValues));
    setErrors({});
    setSelectedImage(null);
    setPreviewUrl(null);
    setRemoveImage(false);
  }, [initialValues, initialImageUrl]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  const displayedImageUrl = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }

    if (!removeImage && initialImageUrl) {
      return initialImageUrl;
    }

    return null;
  }, [previewUrl, removeImage, initialImageUrl]);

  function clearImageErrors() {
    setErrors((prev) => ({
      ...prev,
      image: undefined,
      remove_image: undefined,
      general: undefined,
    }));
  }

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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    clearImageErrors();

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const imageError = getImageValidationError(file);

    if (imageError) {
      setSelectedImage(null);
      setErrors((prev) => ({
        ...prev,
        image: imageError,
      }));
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setRemoveImage(false);
  }

  function handleRemoveSelectedImage() {
    setSelectedImage(null);
    clearImageErrors();
  }

  function handleToggleRemoveExistingImage() {
    setRemoveImage((prev) => !prev);
    clearImageErrors();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedData = normalizeRecipeFormData(formData);
    const clientErrors: RecipeImageFormErrors = {
      ...validateRecipeForm(normalizedData),
    };

    const imageError = getImageValidationError(selectedImage);

    if (imageError) {
      clientErrors.image = imageError;
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const payload: RecipeImageFormData = {
      ...normalizedData,
      image: selectedImage,
      remove_image: removeImage,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setErrors(
        mapApiErrorsToFormErrors(
          error,
          [
            "title",
            "ingredients",
            "instructions",
            "cooking_time",
            "servings",
            "image",
            "remove_image",
          ],
          "Nem sikerült menteni a receptet.",
        ) as RecipeImageFormErrors,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const hasExistingImage = Boolean(initialImageUrl);
  const hasSelectedImage = Boolean(selectedImage);

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

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="space-y-1">
              <label
                htmlFor="image"
                className="text-sm font-semibold text-slate-900"
              >
                Receptkép
              </label>
              <p className="text-sm text-slate-500">
                Opcionális. Támogatott formátumok: JPG, JPEG, PNG, WEBP. Maximum
                méret: 5 MB.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl">
              {displayedImageUrl ? (
                <img
                  src={displayedImageUrl}
                  alt="Receptkép előnézet"
                  className="aspect-video w-full rounded-2xl border border-slate-200 object-cover"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            <div className="space-y-3">
              <input
                id="image"
                name="image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                aria-invalid={Boolean(errors.image)}
                aria-describedby={errors.image ? "image-error" : undefined}
              />

              <div className="flex flex-wrap gap-3">
                {hasSelectedImage ? (
                  <button
                    type="button"
                    onClick={handleRemoveSelectedImage}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Kiválasztott kép eltávolítása
                  </button>
                ) : null}

                {hasExistingImage && !hasSelectedImage ? (
                  <button
                    type="button"
                    onClick={handleToggleRemoveExistingImage}
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      removeImage
                        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {removeImage
                      ? "Képtörlés visszavonása"
                      : "Jelenlegi kép törlése mentéskor"}
                  </button>
                ) : null}
              </div>

              {removeImage && !hasSelectedImage ? (
                <p className="text-sm text-amber-700">
                  A jelenlegi kép a mentés után törlődni fog.
                </p>
              ) : null}

              {errors.image ? (
                <p
                  id="image-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.image}
                </p>
              ) : null}

              {errors.remove_image ? (
                <p className="text-sm text-red-600" role="alert">
                  {errors.remove_image}
                </p>
              ) : null}
            </div>
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
