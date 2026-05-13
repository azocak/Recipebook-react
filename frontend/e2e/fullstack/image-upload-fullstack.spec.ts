import { expect, test } from "@playwright/test";

import { createUniqueFullStackRecipe } from "../helpers/fullstackData";
import {
  deleteRecipeFromDetailPage,
  fillFullStackRecipeForm,
  registerFullStackUser,
} from "../helpers/fullstackActions";

const RECIPE_TEST_IMAGE_PATH = "e2e/fixtures/recipe-test-image.png";

test("uploads an image when creating a recipe with the real backend", async ({
  page,
}) => {
  await registerFullStackUser(page);

  const recipe = createUniqueFullStackRecipe();

  await page.goto("/recipes/new");

  await expect(
    page.getByRole("heading", { name: "Recept létrehozása" }),
  ).toBeVisible();

  await fillFullStackRecipeForm(page, recipe);

  await page.getByLabel("Receptkép").setInputFiles(RECIPE_TEST_IMAGE_PATH);

  await expect(
    page.getByRole("img", { name: "Receptkép előnézet" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Recept mentése" }).click();

  await expect(page).toHaveURL(/\/recipes\/\d+$/);

  await expect(page.getByRole("heading", { name: recipe.title })).toBeVisible();

  await expect(
    page.getByRole("img", { name: `${recipe.title} recept képe` }),
  ).toBeVisible();

  await deleteRecipeFromDetailPage(page, recipe.title);
});
