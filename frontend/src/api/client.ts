import { ensureCsrfCookie, getCsrfToken } from "./csrf";
import { ApiError } from "./errors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Hiányzik a VITE_API_BASE_URL környezeti változó.");
}

type ApiRequestOptions = RequestInit & {
  skipJsonHeader?: boolean;
};

function isSafeMethod(method: string): boolean {
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

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
  const {
    skipJsonHeader = false,
    headers,
    method = "GET",
    body,
    ...rest
  } = options;

  const normalizedMethod = method.toUpperCase();
  const finalHeaders = new Headers(headers);

  if (!isSafeMethod(normalizedMethod)) {
    await ensureCsrfCookie();

    const csrfToken = getCsrfToken();

    if (!csrfToken) {
      throw new Error("Nem található CSRF token a kérés elküldéséhez.");
    }

    finalHeaders.set("X-CSRFToken", csrfToken);
  }

  if (!skipJsonHeader && body && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    method: normalizedMethod,
    headers: finalHeaders,
    body,
    ...rest,
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);

    let message = `API error ${response.status}`;

    if (typeof errorData === "string" && errorData.trim()) {
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
