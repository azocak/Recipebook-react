import type { Page } from "@playwright/test";

export type E2ETestUser = {
  id: number;
  username: string;
  email: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function isApiPath(url: string, path: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.pathname === path || parsedUrl.pathname === `${path}/`;
}

export function isRecipeDetailApiPath(url: string, recipeId: number) {
  const parsedUrl = new URL(url);

  return (
    parsedUrl.pathname === `/api/recipes/${recipeId}` ||
    parsedUrl.pathname === `/api/recipes/${recipeId}/`
  );
}

export function paginatedRecipeListResponse<T>(
  results: T[] = [],
): PaginatedResponse<T> {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

export function paginatedEmptyRecipesResponse(): PaginatedResponse<never> {
  return paginatedRecipeListResponse([]);
}

export async function mockGuestSession(page: Page) {
  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/me"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "null",
      });
    },
  );
}

export async function mockAuthenticatedUser(
  page: Page,
  user: E2ETestUser = {
    id: 1,
    username: "e2e_user",
    email: "e2e@example.com",
  },
) {
  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/me"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    },
  );

  return user;
}

export async function mockCsrfEndpoint(page: Page) {
  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/csrf"),
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "csrftoken=e2e-csrf-token; Path=/; SameSite=Lax",
        },
        body: JSON.stringify({ detail: "CSRF cookie set." }),
      });
    },
  );
}

export async function mockRecipeList<T>(page: Page, recipes: T[] = []) {
  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginatedRecipeListResponse(recipes)),
      });
    },
  );
}

export async function mockEmptyRecipeList(page: Page) {
  await mockRecipeList(page, []);
}
