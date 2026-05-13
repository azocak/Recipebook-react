import { expect, test } from "@playwright/test";

import { mockEmptyRecipeList, mockGuestSession } from "../helpers/apiMocks";

test("renders the recipe list page with mocked API data", async ({ page }) => {
  await mockGuestSession(page);
  await mockEmptyRecipeList(page);

  await page.goto("/recipes");

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(page.getByRole("searchbox", { name: "Keresés" })).toBeVisible();

  await expect(page.getByRole("combobox", { name: "Rendezés" })).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Szűrők törlése" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Még nincs egyetlen recept sem" }),
  ).toBeVisible();
});
