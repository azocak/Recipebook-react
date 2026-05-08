import { useEffect, useMemo } from "react";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";

import {
  RECIPE_ACCEPTED_IMAGE_EXTENSIONS,
  RECIPE_ACCEPTED_IMAGE_TYPES,
  RECIPE_ALLOWED_ERROR_FIELDS,
  RECIPE_IMAGE_MAX_SIZE,
  RECIPE_VALIDATION_ERRORS,
} from "../constants/recipe";
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
import { RecipeFormImageSection } from "./recipe/RecipeFormImageSection";
import { RecipeFormContentSection } from "./recipe/RecipeFormContentSection";
import { RecipeFormBasicsSection } from "./recipe/RecipeFormBasicsSection";
import { RecipeFormActions } from "./recipe/RecipeFormActions";

type RecipeFormProps = {
  initialValues: RecipeFormData;
  initialImageUrl?: string | null;
  onSubmit: (data: RecipeImageFormData) => Promise<void>;
  submitLabel: string;
  onDirtyChange?: (isDirty: boolean) => void;
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
  onDirtyChange,
}: RecipeFormProps) {
  const {
    register,
    reset,
    control,
    handleSubmit: formHandleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RecipeSchemaInputValues, undefined, RecipeSchemaValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ...getRecipeFormInitialState(initialValues),
      image: undefined,
      remove_image: false,
    },
    mode: "onSubmit",
  });

  const {
    title: initialTitle,
    ingredients: initialIngredients,
    instructions: initialInstructions,
    cooking_time: initialCookingTime,
    servings: initialServings,
  } = initialValues;

  useEffect(() => {
    register("image");
    register("remove_image");
  }, [register]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    reset({
      ...getRecipeFormInitialState({
        title: initialTitle,
        ingredients: initialIngredients,
        instructions: initialInstructions,
        cooking_time: initialCookingTime,
        servings: initialServings,
      }),
      image: undefined,
      remove_image: false,
    });
  }, [
    initialTitle,
    initialIngredients,
    initialInstructions,
    initialCookingTime,
    initialServings,
    initialImageUrl,
    reset,
  ]);

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
          <RecipeFormBasicsSection
            titleField={titleField}
            cookingTimeField={cookingTimeField}
            servingsField={servingsField}
            titleError={errors.title?.message}
            cookingTimeError={errors.cooking_time?.message}
            servingsError={errors.servings?.message}
            onTitleChange={(event) => {
              clearFieldError("title");
              titleField.onChange(event);
            }}
            onCookingTimeChange={(event) => {
              clearFieldError("cooking_time");
              cookingTimeField.onChange(event);
            }}
            onServingsChange={(event) => {
              clearFieldError("servings");
              servingsField.onChange(event);
            }}
          />

          <RecipeFormContentSection
            ingredientsField={ingredientsField}
            instructionsField={instructionsField}
            ingredientsError={errors.ingredients?.message}
            instructionsError={errors.instructions?.message}
            onIngredientsChange={(event) => {
              clearFieldError("ingredients");
              ingredientsField.onChange(event);
            }}
            onInstructionsChange={(event) => {
              clearFieldError("instructions");
              instructionsField.onChange(event);
            }}
          />

          <RecipeFormImageSection
            displayedImageUrl={displayedImageUrl}
            imageError={errors.image?.message}
            removeImageError={errors.remove_image?.message}
            removeImage={removeImage}
            hasSelectedImage={hasSelectedImage}
            hasExistingImage={hasExistingImage}
            onImageChange={handleImageChange}
            onRemoveSelectedImage={handleRemoveSelectedImage}
            onToggleRemoveExistingImage={handleToggleRemoveExistingImage}
          />
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

      <RecipeFormActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
