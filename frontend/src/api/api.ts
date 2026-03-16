import { getCsrfToken } from "./csrf";
import type { Recipe, User } from "./types";

const API_BASE = "http://localhost:8000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function apiRequest<T, B = unknown>(
  path: string,
  method: HttpMethod = "GET",
  body?: B,
): Promise<T> {
  const headers: HeadersInit = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const csrf = getCsrfToken();
  if (csrf) {
    headers["X-CSRFToken"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  // ---- AUTH ---- //

  async register(data: {
    username: string;
    email: string;
    password: string;
    confirmation: string;
  }) {
    return apiRequest<User, typeof data>("/auth/register", "POST", data);
  },

  async login(data: { username: string; password: string }) {
    // backend: POST /api/auth/login/
    return apiRequest<User>("/auth/login", "POST", data);
  },

  async logout() {
    // backend: POST /api/auth/logout/
    return apiRequest<void>("/auth/logout", "POST", {});
  },

  async me() {
    // backend: GET /api/auth/me/
    return apiRequest<User | null>("/auth/me", "GET");
  },
};

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_BASE}/recipes`);

  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  return response.json();
}
