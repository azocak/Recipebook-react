import { expect, test } from "@playwright/test";

import { createUniqueFullStackRecipe } from "../helpers/fullstackData";
import {
  deleteRecipeFromDetailPage,
  expectFullStackRecipeDetail,
  fillFullStackRecipeForm,
  registerFullStackUser,
} from "../helpers/fullstackActions";

test("creates, edits and deletes a recipe with the real backend", async ({
  page,
}) => {
  await registerFullStackUser(page);

  const recipe = createUniqueFullStackRecipe();
  const updatedRecipe = createUniqueFullStackRecipe();

  await page.goto("/recipes/new");

  await expect(
    page.getByRole("heading", { name: "Recept létrehozása" }),
  ).toBeVisible();

  await fillFullStackRecipeForm(page, recipe);

  await page.getByRole("button", { name: "Recept mentése" }).click();

  await expect(page).toHaveURL(/\/recipes\/\d+$/);
  await expectFullStackRecipeDetail(page, recipe);

  const detailUrl = page.url();

  await page.getByRole("button", { name: "Szerkesztés" }).click();

  await expect(
    page.getByRole("heading", { name: "Recept szerkesztése" }),
  ).toBeVisible();

  await fillFullStackRecipeForm(page, updatedRecipe);

  await page.getByRole("button", { name: "Módosítás mentése" }).click();

  await expect(page).toHaveURL(/\/recipes\/\d+$/);
  await expectFullStackRecipeDetail(page, updatedRecipe);

  await expect(page.getByText(recipe.title)).not.toBeVisible();

  await deleteRecipeFromDetailPage(page, updatedRecipe.title);

  await page.goto(detailUrl);

  await expect(
    page.getByRole("heading", { name: updatedRecipe.title }),
  ).not.toBeVisible();
});
