import { useEffect, useMemo } from "react";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";

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
import {
  getRecipeFormInitialState,
  type RecipeFormState,
} from "../forms/getRecipeFormInitialState";
import { useForm, useWatch } from "react-hook-form";
import {
  recipeSchema,
  type RecipeSchemaInputValues,
  type RecipeSchemaValues,
} from "../schemas/recipe";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyApiErrorsToForm } from "../forms/apiErrorAdapter";

type RecipeFormProps = {
  initialValues: RecipeFormData;
  initialImageUrl?: string | null;
  onSubmit: (data: RecipeImageFormData) => Promise<void>;
  submitLabel: string;
};

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
  const {
    register,
    reset,
    control,
    handleSubmit: formHandleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RecipeSchemaInputValues, undefined, RecipeSchemaValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ...getRecipeFormInitialState(initialValues),
      image: undefined,
      remove_image: false,
    },
    mode: "onSubmit",
  });

  const selectedImage =
    useWatch({
      control,
      name: "image",
    }) ?? null;

  const removeImage =
    useWatch({
      control,
      name: "remove_image",
    }) ?? false;

  useEffect(() => {
    register("image");
    register("remove_image");
  }, [register]);

  useEffect(() => {
    reset({
      ...getRecipeFormInitialState(initialValues),
      image: undefined,
      remove_image: false,
    });
  }, [initialValues, initialImageUrl, reset]);

  const previewUrl = useMemo(() => {
    if (!selectedImage) {
      return null;
    }

    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayedImageUrl = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }

    if (!removeImage && initialImageUrl) {
      return initialImageUrl;
    }

    return null;
  }, [previewUrl, removeImage, initialImageUrl]);

  function clearFieldError(name: keyof RecipeFormState) {
    clearErrors(name);
    if (errors.root?.server) {
      clearErrors();
    }
  }

  function clearImageErrors() {
    clearErrors("image");
    clearErrors("remove_image");
    if (errors.root?.server) {
      clearErrors();
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    clearImageErrors();

    if (!file) {
      setValue("image", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const imageError = getImageValidationError(file);

    if (imageError) {
      setValue("image", undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      setError("image", {
        type: "manual",
        message: imageError,
      });
      event.target.value = "";
      return;
    }

    setValue("image", file, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("remove_image", false, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleRemoveSelectedImage() {
    clearImageErrors();
    setValue("image", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleToggleRemoveExistingImage() {
    const nextValue = !removeImage;

    clearImageErrors();

    setValue("remove_image", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const submitForm = formHandleSubmit(async (values) => {
    const payload: RecipeImageFormData = {
      ...values,
      image: selectedImage,
      remove_image: removeImage,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      applyApiErrorsToForm<RecipeSchemaInputValues>(error, setError, {
        allowedFields: RECIPE_ALLOWED_ERROR_FIELDS,
        fallbackMessage: RECIPE_VALIDATION_ERRORS.saveFailed,
      });
    }
  });

  const titleField = register("title");
  const ingredientsField = register("ingredients");
  const instructionsField = register("instructions");
  const cookingTimeField = register("cooking_time");
  const servingsField = register("servings");

  const hasExistingImage = Boolean(initialImageUrl);
  const hasSelectedImage = Boolean(selectedImage);

  return (
    <form onSubmit={submitForm} className="space-y-6" noValidate>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          <Input
            id="title"
            label="Recept neve"
            type="text"
            required
            maxLength={RECIPE_TITLE_MAX}
            placeholder="pl. Házi palacsinta"
            error={errors.title?.message}
            hint="Adj rövid, jól érthető címet a receptnek."
            {...titleField}
            onChange={(event) => {
              clearFieldError("title");
              titleField.onChange(event);
            }}
          />

          <Textarea
            id="ingredients"
            label="Hozzávalók"
            required
            rows={6}
            placeholder="Írd le a hozzávalókat, lehetőleg soronként."
            error={errors.ingredients?.message}
            hint="Például: 20 dkg liszt, 2 db tojás, 3 dl tej..."
            {...ingredientsField}
            onChange={(event) => {
              clearFieldError("ingredients");
              ingredientsField.onChange(event);
            }}
          />

          <Textarea
            id="instructions"
            label="Elkészítés"
            required
            rows={8}
            placeholder="Írd le lépésről lépésre az elkészítést."
            error={errors.instructions?.message}
            {...instructionsField}
            onChange={(event) => {
              clearFieldError("instructions");
              instructionsField.onChange(event);
            }}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="cooking_time"
              label="Főzési idő (perc)"
              type="number"
              required
              min={RECIPE_COOKING_TIME_MIN}
              max={RECIPE_COOKING_TIME_MAX}
              placeholder="pl. 30"
              error={errors.cooking_time?.message}
              {...cookingTimeField}
              onChange={(event) => {
                clearFieldError("cooking_time");
                cookingTimeField.onChange(event);
              }}
            />

            <Input
              id="servings"
              label="Adagok száma"
              type="number"
              required
              min={RECIPE_SERVINGS_MIN}
              max={RECIPE_SERVINGS_MAX}
              placeholder="pl. 4"
              error={errors.servings?.message}
              {...servingsField}
              onChange={(event) => {
                clearFieldError("servings");
                servingsField.onChange(event);
              }}
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

            <RecipeImageBlock
              imageUrl={displayedImageUrl}
              alt="Receptkép előnézet"
              variant="editor"
            />

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

              {errors.image?.message ? (
                <p
                  id="image-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.image.message}
                </p>
              ) : null}

              {errors.remove_image ? (
                <p className="text-sm text-red-600" role="alert">
                  {errors.remove_image.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {errors.root?.server?.message ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errors.root.server.message}
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
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Mentés..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
