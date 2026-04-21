import { useEffect, useMemo, useState } from "react";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";

import {
  validateRecipeForm,
  type RecipeFormErrors,
} from "../utils/validateRecipeForm";
import { mapApiErrorsToFormErrors } from "../utils/mapApiErrorsToFormErrors";
import { RecipeImageBlock } from "./recipe/RecipeImageBlock";
import {
  RECIPE_ACCEPTED_IMAGE_EXTENSIONS,
  RECIPE_ACCEPTED_IMAGE_TYPES,
  RECIPE_ALLOWED_ERROR_FIELDS,
  RECIPE_COOKING_TIME_MAX,
  RECIPE_COOKING_TIME_MIN,
  RECIPE_IMAGE_ACCEPT_ATTR,
  RECIPE_IMAGE_HELPER_TEXT,
  RECIPE_IMAGE_MAX_SIZE,
  RECIPE_SERVINGS_MAX,
  RECIPE_SERVINGS_MIN,
  RECIPE_TITLE_MAX,
  RECIPE_VALIDATION_ERRORS,
} from "../constants/recipe";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";

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
  const hasSupportedExtension = RECIPE_ACCEPTED_IMAGE_EXTENSIONS.some(
    (extension) => fileName.endsWith(extension),
  );

  return (
    RECIPE_ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof RECIPE_ACCEPTED_IMAGE_TYPES)[number],
    ) || hasSupportedExtension
  );
}

function getImageValidationError(file: File | null) {
  if (!file) {
    return undefined;
  }

  if (file.size > RECIPE_IMAGE_MAX_SIZE) {
    return RECIPE_VALIDATION_ERRORS.imageTooLarge;
  }

  if (!isSupportedImageFile(file)) {
    return RECIPE_VALIDATION_ERRORS.invalidImageType;
  }

  return undefined;
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
          RECIPE_ALLOWED_ERROR_FIELDS,
          RECIPE_VALIDATION_ERRORS.saveFailed,
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
          <Input
            id="title"
            label="Recept neve"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={RECIPE_TITLE_MAX}
            placeholder="pl. Házi palacsinta"
            error={errors.title}
            hint="Adj rövid, jól érthető címet a receptnek."
          />

          <Textarea
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

          <Textarea
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
            <Input
              id="cooking_time"
              label="Főzési idő (perc)"
              type="number"
              name="cooking_time"
              value={formData.cooking_time}
              onChange={handleChange}
              required
              min={RECIPE_COOKING_TIME_MIN}
              max={RECIPE_COOKING_TIME_MAX}
              placeholder="pl. 30"
              error={errors.cooking_time}
            />

            <Input
              id="servings"
              label="Adagok száma"
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              required
              min={RECIPE_SERVINGS_MIN}
              max={RECIPE_SERVINGS_MAX}
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
                {RECIPE_IMAGE_HELPER_TEXT}
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
                <RecipeImageBlock
                  imageUrl={displayedImageUrl}
                  alt="Receptkép előnézet"
                  variant="editor"
                />
              )}
            </div>

            <div className="space-y-3">
              <input
                id="image"
                name="image"
                type="file"
                accept={RECIPE_IMAGE_ACCEPT_ATTR}
                onChange={handleImageChange}
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                aria-invalid={Boolean(errors.image)}
                aria-describedby={errors.image ? "image-error" : undefined}
              />

              <div className="flex flex-wrap gap-3">
                {hasSelectedImage ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRemoveSelectedImage}
                  >
                    Kiválasztott kép eltávolítása
                  </Button>
                ) : null}

                {hasExistingImage && !hasSelectedImage ? (
                  <Button
                    type="button"
                    variant={removeImage ? "danger" : "secondary"}
                    onClick={handleToggleRemoveExistingImage}
                  >
                    {removeImage
                      ? "Képtörlés visszavonása"
                      : "Jelenlegi kép törlése mentéskor"}
                  </Button>
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={submitting}
        >
          {submitting ? "Mentés..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
