import { expect, type Page } from "@playwright/test";

import {
  createUniqueFullStackRecipe,
  createUniqueFullStackUser,
} from "./fullstackData";

export type FullStackUser = ReturnType<typeof createUniqueFullStackUser>;
export type FullStackRecipeFormData = ReturnType<
  typeof createUniqueFullStackRecipe
>;

export async function registerFullStackUser(page: Page) {
  const user = createUniqueFullStackUser();

  await page.goto("/register");

  await expect(
    page.getByRole("heading", { name: "Regisztráció" }),
  ).toBeVisible();

  await page.getByLabel(/^Felhasználónév\s*\*?$/i).fill(user.username);
  await page.getByLabel(/^Email cím\s*\*?$/i).fill(user.email);
  await page.getByLabel(/^Jelszó\s*\*?$/i).fill(user.password);
  await page.getByLabel(/^Jelszó megerősítése\s*\*?$/i).fill(user.password);

  await page.getByRole("button", { name: "Fiók létrehozása" }).click();

  await expect(page).toHaveURL(/\/recipes$/);
  await expect(page.getByText(`Szia, ${user.username}!`)).toBeVisible();

  return user;
}

export async function fillFullStackRecipeForm(
  page: Page,
  recipe: FullStackRecipeFormData,
) {
  await page.getByLabel("Recept neve").fill(recipe.title);
  await page.getByLabel("Hozzávalók").fill(recipe.ingredients);
  await page.getByLabel("Elkészítés").fill(recipe.instructions);
  await page.getByLabel("Főzési idő (perc)").fill(recipe.cookingTime);
  await page.getByLabel("Adagok száma").fill(recipe.servings);
}

export async function expectFullStackRecipeDetail(
  page: Page,
  recipe: FullStackRecipeFormData,
) {
  await expect(page.getByRole("heading", { name: recipe.title })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Hozzávalók" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Elkészítés" })).toBeVisible();

  await expect(page.getByText(recipe.ingredients)).toBeVisible();
  await expect(page.getByText(recipe.instructions)).toBeVisible();
  await expect(page.getByText(`${recipe.cookingTime} perc`)).toBeVisible();
}

export async function deleteRecipeFromDetailPage(
  page: Page,
  recipeTitle: string,
) {
  await page.getByRole("button", { name: "Törlés" }).click();

  const dialog = page.getByRole("dialog", { name: "Recept törlése" });

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(recipeTitle);

  await dialog.getByRole("button", { name: "Törlés" }).click();

  await expect(page).toHaveURL(/\/recipes$/);

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(page.getByText(recipeTitle)).not.toBeVisible();
}
