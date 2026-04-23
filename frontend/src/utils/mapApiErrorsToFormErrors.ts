import { ApiError } from "../api/errors";

type FormErrors = Record<string, string>;

function getFirstErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const firstString = value.find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );

    if (firstString) {
      return firstString;
    }
  }

  return null;
}

export function mapApiErrorsToFormErrors(
  error: unknown,
  allowedFields: readonly string[],
  fallbackMessage: string,
): FormErrors {
  const result: FormErrors = {
    general: fallbackMessage,
  };

  if (!(error instanceof ApiError)) {
    return result;
  }

  if (!error.data || typeof error.data !== "object") {
    return result;
  }

  const data = error.data as Record<string, unknown>;

  for (const field of allowedFields) {
    const fieldMessage = getFirstErrorMessage(data[field]);

    if (fieldMessage) {
      result[field] = fieldMessage;
    }
  }

  const generalMessage =
    getFirstErrorMessage(data.non_field_errors) ||
    getFirstErrorMessage(data.detail) ||
    getFirstErrorMessage(data.error) ||
    getFirstErrorMessage(data.message);

  if (generalMessage) {
    result.general = generalMessage;
  }

  return result;
}
