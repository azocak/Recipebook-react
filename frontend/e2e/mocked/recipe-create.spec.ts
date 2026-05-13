import { expect, test } from "@playwright/test";
import {
  isApiPath,
  isRecipeDetailApiPath,
  mockAuthenticatedUser,
  mockCsrfEndpoint,
} from "../helpers/apiMocks";

test("creates a recipe and redirects to the created recipe detail page", async ({
  page,
}) => {
  const user = await mockAuthenticatedUser(page, {
    id: 301,
    username: "e2e_recipe_user",
    email: "e2e-recipe@example.com",
  });
  await mockCsrfEndpoint(page);

  const createdRecipe = {
    id: 501,
    owner: user.id,
    owner_username: user.username,
    title: "E2E almás palacsinta",
    ingredients: "20 dkg liszt\n2 db tojás\n3 dl tej\n1 db alma",
    instructions:
      "Keverd össze a hozzávalókat, pihentesd a tésztát, majd süsd ki a palacsintákat.",
    cooking_time: 25,
    servings: 4,
    image: null,
    image_url: null,
    created_at: "2026-05-07T12:00:00Z",
  };

  let createWasCalled = false;
  let createRequestBody = "";

  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      const request = route.request();

      if (request.method() !== "POST") {
        await route.fallback();
        return;
      }

      createWasCalled = true;
      createRequestBody = request.postData() ?? "";

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(createdRecipe),
      });
    },
  );

  await page.route(
    (url) => isRecipeDetailApiPath(url.toString(), createdRecipe.id),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createdRecipe),
      });
    },
  );

  await page.goto("/recipes/new");

  await expect(
    page.getByRole("heading", { name: "Recept létrehozása" }),
  ).toBeVisible();

  await page.getByLabel(/^Recept neve\s*\*?$/i).fill(createdRecipe.title);
  await page
    .getByLabel(/^Főzési idő \(perc\)\s*\*?$/i)
    .fill(String(createdRecipe.cooking_time));
  await page
    .getByLabel(/^Adagok száma\s*\*?$/i)
    .fill(String(createdRecipe.servings));
  await page.getByLabel(/^Hozzávalók\s*\*?$/i).fill(createdRecipe.ingredients);
  await page.getByLabel(/^Elkészítés\s*\*?$/i).fill(createdRecipe.instructions);

  await page.getByRole("button", { name: "Recept mentése" }).click();

  await expect(page).toHaveURL(new RegExp(`/recipes/${createdRecipe.id}$`));

  await expect(
    page.getByRole("heading", { name: createdRecipe.title }),
  ).toBeVisible();

  await expect(page.getByText(createdRecipe.ingredients)).toBeVisible();
  await expect(page.getByText(createdRecipe.instructions)).toBeVisible();
  await expect(page.getByText(`#${createdRecipe.id}`)).toBeVisible();

  expect(createWasCalled).toBe(true);
  expect(createRequestBody).toContain(`name="title"`);
  expect(createRequestBody).toContain(createdRecipe.title);
  expect(createRequestBody).toContain(`name="ingredients"`);
  expect(createRequestBody).toContain("20 dkg liszt");
  expect(createRequestBody).toContain(`name="instructions"`);
  expect(createRequestBody).toContain("Keverd össze a hozzávalókat");
  expect(createRequestBody).toContain(`name="cooking_time"`);
  expect(createRequestBody).toContain(String(createdRecipe.cooking_time));
  expect(createRequestBody).toContain(`name="servings"`);
  expect(createRequestBody).toContain(String(createdRecipe.servings));
});
