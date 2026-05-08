import { expect, test, type Page } from "@playwright/test";

function isApiPath(url: string, path: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.pathname === path || parsedUrl.pathname === `${path}/`;
}

function isRecipeDetailApiPath(url: string, recipeId: number) {
  const parsedUrl = new URL(url);

  return (
    parsedUrl.pathname === `/api/recipes/${recipeId}` ||
    parsedUrl.pathname === `/api/recipes/${recipeId}/`
  );
}

function paginatedEmptyRecipesResponse() {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

async function mockAuthenticatedUser(page: Page) {
  const user = {
    id: 701,
    username: "e2e_delete_owner",
    email: "e2e-delete-owner@example.com",
  };

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

async function mockCsrfEndpoint(page: Page) {
  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/csrf"),
    async (route) => {
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

async function mockEmptyRecipeList(page: Page) {
  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginatedEmptyRecipesResponse()),
      });
    },
  );
}

test("deletes an existing recipe from the detail page and redirects to the recipe list", async ({
  page,
}) => {
  const user = await mockAuthenticatedUser(page);
  await mockCsrfEndpoint(page);
  await mockEmptyRecipeList(page);

  const recipeId = 801;

  const recipe = {
    id: recipeId,
    owner: user.id,
    owner_username: user.username,
    title: "E2E törlendő palacsinta",
    ingredients: "20 dkg liszt\n2 db tojás\n3 dl tej",
    instructions: "Keverd össze a hozzávalókat, majd süsd ki a palacsintákat.",
    cooking_time: 20,
    servings: 3,
    image: null,
    image_url: null,
    created_at: "2026-05-07T12:00:00Z",
  };

  let deleteWasCalled = false;

  await page.route(
    (url) => isRecipeDetailApiPath(url.toString(), recipeId),
    async (route) => {
      const request = route.request();

      if (request.method() === "DELETE") {
        deleteWasCalled = true;

        await route.fulfill({
          status: 204,
          body: "",
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(recipe),
      });
    },
  );

  await page.goto(`/recipes/${recipeId}`);

  await expect(page.getByRole("heading", { name: recipe.title })).toBeVisible();

  await expect(page.getByText(recipe.ingredients)).toBeVisible();
  await expect(page.getByText(recipe.instructions)).toBeVisible();
  await page.getByRole("button", { name: "Törlés" }).click();

  const dialog = page.getByRole("dialog", { name: "Recept törlése" });

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(recipe.title);

  await dialog.getByRole("button", { name: "Törlés" }).click();

  await expect(page).toHaveURL(/\/recipes$/);

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Még nincs egyetlen recept sem" }),
  ).toBeVisible();

  expect(deleteWasCalled).toBe(true);
});
