import { expect, test } from "@playwright/test";
import {
  isRecipeDetailApiPath,
  mockAuthenticatedUser,
  mockCsrfEndpoint,
} from "./helpers/apiMocks";

test("edits an existing recipe and redirects to the updated recipe detail page", async ({
  page,
}) => {
  const user = await mockAuthenticatedUser(page, {
    id: 401,
    username: "e2e_recipe_owner",
    email: "e2e-owner@example.com",
  });
  await mockCsrfEndpoint(page);

  const recipeId = 601;

  const originalRecipe = {
    id: recipeId,
    owner: user.id,
    owner_username: user.username,
    title: "E2E régi palacsinta",
    ingredients: "20 dkg liszt\n2 db tojás\n3 dl tej",
    instructions: "Keverd össze a hozzávalókat, majd süsd ki a palacsintákat.",
    cooking_time: 20,
    servings: 3,
    image: null,
    image_url: null,
    created_at: "2026-05-07T12:00:00Z",
  };

  const updatedRecipe = {
    ...originalRecipe,
    title: "E2E frissített almás palacsinta",
    ingredients: "25 dkg liszt\n2 db tojás\n3 dl tej\n1 reszelt alma",
    instructions:
      "Keverd össze a hozzávalókat, add hozzá az almát, majd süsd aranybarnára.",
    cooking_time: 30,
    servings: 4,
  };

  let currentRecipe = originalRecipe;
  let updateWasCalled = false;
  let updateRequestBody = "";

  await page.route(
    (url) => isRecipeDetailApiPath(url.toString(), recipeId),
    async (route) => {
      const request = route.request();

      if (request.method() === "PATCH") {
        updateWasCalled = true;
        updateRequestBody = request.postData() ?? "";
        currentRecipe = updatedRecipe;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(updatedRecipe),
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentRecipe),
      });
    },
  );

  await page.goto(`/recipes/${recipeId}/edit`);

  await expect(
    page.getByRole("heading", { name: "Recept szerkesztése" }),
  ).toBeVisible();

  await expect(page.getByLabel(/^Recept neve\s*\*?$/i)).toHaveValue(
    originalRecipe.title,
  );

  await page.getByLabel(/^Recept neve\s*\*?$/i).fill(updatedRecipe.title);
  await page
    .getByLabel(/^Főzési idő \(perc\)\s*\*?$/i)
    .fill(String(updatedRecipe.cooking_time));
  await page
    .getByLabel(/^Adagok száma\s*\*?$/i)
    .fill(String(updatedRecipe.servings));
  await page.getByLabel(/^Hozzávalók\s*\*?$/i).fill(updatedRecipe.ingredients);
  await page.getByLabel(/^Elkészítés\s*\*?$/i).fill(updatedRecipe.instructions);

  await page.getByRole("button", { name: "Módosítás mentése" }).click();

  await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}$`));

  await expect(
    page.getByRole("heading", { name: updatedRecipe.title }),
  ).toBeVisible();

  await expect(page.getByText(updatedRecipe.ingredients)).toBeVisible();
  await expect(page.getByText(updatedRecipe.instructions)).toBeVisible();
  await expect(page.getByText(`#${recipeId}`)).toBeVisible();

  expect(updateWasCalled).toBe(true);
  expect(updateRequestBody).toContain(`name="title"`);
  expect(updateRequestBody).toContain(updatedRecipe.title);
  expect(updateRequestBody).toContain(`name="ingredients"`);
  expect(updateRequestBody).toContain("1 reszelt alma");
  expect(updateRequestBody).toContain(`name="instructions"`);
  expect(updateRequestBody).toContain("süsd aranybarnára");
  expect(updateRequestBody).toContain(`name="cooking_time"`);
  expect(updateRequestBody).toContain(String(updatedRecipe.cooking_time));
  expect(updateRequestBody).toContain(`name="servings"`);
  expect(updateRequestBody).toContain(String(updatedRecipe.servings));
});
