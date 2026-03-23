import { ApiError } from "../api/errors";

type FormErrors = Record<string, string | undefined>;

export function mapApiErrorsToFormErrors(
  error: unknown,
  allowedFields: string[],
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
    if (Array.isArray(data[field]) && typeof data[field][0] === "string") {
      result[field] = data[field][0] as string;
    }
  }

  if (typeof data.detail === "string") {
    result.general = data.detail;
  }

  return result;
}
