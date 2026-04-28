import { toast } from "sonner";

import { ApiError } from "../../api/errors";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

const RECIPE_FORM_ERROR_KEYS = [
  "title",
  "ingredients",
  "instructions",
  "cooking_time",
  "servings",
  "image",
  "remove_image",
  "non_field_errors",
  "detail",
  "message",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isRecipeFormValidationError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (error.status !== 400) {
    return false;
  }

  const errorData = error.data;

  if (!isRecord(errorData)) {
    return false;
  }

  return RECIPE_FORM_ERROR_KEYS.some((key) => key in errorData);
}

type ShowRecipeMutationErrorToastOptions = {
  suppressFormValidationErrors?: boolean;
};

export function showRecipeMutationErrorToast(
  error: unknown,
  fallbackMessage: string,
  options: ShowRecipeMutationErrorToastOptions = {},
) {
  if (
    options.suppressFormValidationErrors &&
    isRecipeFormValidationError(error)
  ) {
    return;
  }

  toast.error(getApiErrorMessage(error, fallbackMessage));
}
