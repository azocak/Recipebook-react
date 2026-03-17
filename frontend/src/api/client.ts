import { getCsrfToken } from "./csrf";
import { ApiError } from "./errors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiRequestOptions = RequestInit & {
  skipJsonHeader?: boolean;
};

async function parseErrorResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function parseSuccessResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { skipJsonHeader = false, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);

  if (!skipJsonHeader) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const csrfToken = getCsrfToken();

  if (csrfToken) {
    finalHeaders.set("X-CSRFToken", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: finalHeaders,
    ...rest,
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);

    let message = `API error ${response.status}`;
    if (typeof errorData === "string") {
      message = errorData;
    } else if (
      errorData &&
      typeof errorData === "object" &&
      "detail" in errorData &&
      typeof (errorData as { detail: unknown }).detail === "string"
    ) {
      message = (errorData as { detail: string }).detail;
    }
    throw new ApiError(message, response.status, errorData);
  }

  return parseSuccessResponse<T>(response);
}
