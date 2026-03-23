import { ApiError } from "../api/errors";

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!(error instanceof ApiError)) {
    return fallbackMessage;
  }

  if (error.status === 404) {
    return "Nincs ilyen recept.";
  }

  if (error.status === 403) {
    return "Nincs jogosultságod a recept megtekintéséhez.";
  }

  if (
    error.data &&
    typeof error.data === "object" &&
    "detail" in error.data &&
    typeof (error.data as { detail: unknown }).detail === "string"
  ) {
    return (error.data as { detail: string }).detail;
  }

  return error.message || fallbackMessage;
}
