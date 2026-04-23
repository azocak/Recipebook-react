import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

const GENERAL_ERROR_KEYS = ["non_field_errors", "detail", "message"] as const;
const ROOT_SERVER_ERROR_PATH = "root.server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractPayload(error: unknown): unknown {
  if (
    isRecord(error) &&
    "response" in error &&
    isRecord(error.response) &&
    "data" in error.response
  ) {
    return error.response.data;
  }

  if (isRecord(error) && "data" in error) {
    return error.data;
  }

  return error;
}

function extractMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const firstString = value.find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );

    return firstString?.trim();
  }

  return undefined;
}

function setRootServerError<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  message: string,
) {
  setError(ROOT_SERVER_ERROR_PATH as Path<TFieldValues>, {
    type: "server",
    message,
  });
}

export type ApplyApiErrorsOptions<TFieldValues extends FieldValues> = {
  allowedFields: readonly Path<TFieldValues>[];
  fallbackMessage: string;
};

export function applyApiErrorsToForm<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  { allowedFields, fallbackMessage }: ApplyApiErrorsOptions<TFieldValues>,
) {
  const payload = extractPayload(error);

  if (typeof payload === "string") {
    setRootServerError(setError, payload);
    return;
  }

  if (!isRecord(payload)) {
    setRootServerError(setError, fallbackMessage);
    return;
  }

  let hasAppliedFieldError = false;

  for (const fieldName of allowedFields) {
    const fieldValue = payload[fieldName];
    const message = extractMessage(fieldValue);

    if (!message) {
      continue;
    }

    setError(fieldName, {
      type: "server",
      message,
    });

    hasAppliedFieldError = true;
  }

  for (const key of GENERAL_ERROR_KEYS) {
    const message = extractMessage(payload[key]);

    if (message) {
      setRootServerError(setError, message);
      return;
    }
  }

  if (!hasAppliedFieldError) {
    setRootServerError(setError, fallbackMessage);
  }
}
