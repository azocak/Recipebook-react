import { expect, test } from "@playwright/test";

function isApiPath(url: string, path: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.pathname === path || parsedUrl.pathname === `${path}/`;
}

test("renders the recipe list page with mocked API data", async ({ page }) => {
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

  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 0,
          next: null,
          previous: null,
          results: [],
        }),
      });
    },
  );

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
