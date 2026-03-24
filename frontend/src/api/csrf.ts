const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getCsrfToken(): string | null {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const trimmed = cookie.trim();

    if (trimmed.startsWith("csrftoken=")) {
      return decodeURIComponent(trimmed.substring("csrftoken=".length));
    }
  }

  return null;
}

export async function ensureCsrfCookie(): Promise<void> {
  const existingToken = getCsrfToken();

  if (existingToken) {
    return;
  }

  if (!API_BASE_URL) {
    throw new Error("Hiányzik a VITE_API_BASE_URL környezeti változó.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a CSRF cookie-t.");
  }
}
