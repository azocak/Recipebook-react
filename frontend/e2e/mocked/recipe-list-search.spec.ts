import { expect, test } from "@playwright/test";

import {
  isApiPath,
  mockGuestSession,
  paginatedRecipeListResponse,
} from "../helpers/apiMocks";
import { createRecipe } from "../helpers/testData";

test("filters the recipe list by search query and keeps the search param in the URL", async ({
  page,
}) => {
  const searchTerm = "palacsinta";
  const matchingRecipe = createRecipe();

  const observedSearchParams: string[] = [];

  await mockGuestSession(page);

  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      const request = route.request();

      if (request.method() !== "GET") {
        await route.fallback();
        return;
      }

      const requestUrl = new URL(request.url());
      const search = requestUrl.searchParams.get("search") ?? "";

      observedSearchParams.push(search);

      const recipes = search === searchTerm ? [matchingRecipe] : [];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginatedRecipeListResponse(recipes)),
      });
    },
  );

  await page.goto("/recipes");

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Még nincs egyetlen recept sem" }),
  ).toBeVisible();

  await page.getByRole("searchbox", { name: "Keresés" }).fill(searchTerm);

  await expect(page).toHaveURL(new RegExp(`[?&]search=${searchTerm}`));

  await expect.poll(() => observedSearchParams.includes(searchTerm)).toBe(true);

  await expect(page.getByText(matchingRecipe.title)).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Még nincs egyetlen recept sem" }),
  ).not.toBeVisible();
});

test("shows the no-results state and resets filters after an empty search result", async ({
  page,
}) => {
  const initialRecipe = createRecipe({
    id: 902,
    title: "Túrós palacsinta",
    ingredients: "20 dkg liszt\n2 db tojás\n25 dkg túró\n3 dl tej",
    instructions: "Keverd össze a tésztát, süsd ki, majd töltsd meg túróval.",
  });

  const noResultsSearchTerm = "nincsilyen";

  const observedSearchParams: string[] = [];

  await mockGuestSession(page);

  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      const request = route.request();

      if (request.method() !== "GET") {
        await route.fallback();
        return;
      }

      const requestUrl = new URL(request.url());
      const search = requestUrl.searchParams.get("search") ?? "";

      observedSearchParams.push(search);

      const recipes = search === noResultsSearchTerm ? [] : [initialRecipe];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginatedRecipeListResponse(recipes)),
      });
    },
  );

  await page.goto("/recipes");

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(page.getByText(initialRecipe.title)).toBeVisible();

  const searchInput = page.getByRole("searchbox", { name: "Keresés" });

  await searchInput.fill(noResultsSearchTerm);

  await expect(page).toHaveURL(new RegExp(`[?&]search=${noResultsSearchTerm}`));

  await expect
    .poll(() => observedSearchParams.includes(noResultsSearchTerm))
    .toBe(true);

  const noResultsState = page.getByRole("status").filter({
    has: page.getByRole("heading", { name: "Nincs találat" }),
  });

  await expect(noResultsState).toBeVisible();

  await expect(page.getByText(initialRecipe.title)).not.toBeVisible();

  await noResultsState.getByRole("button", { name: "Szűrők törlése" }).click();

  await expect(page).toHaveURL(/\/recipes$/);
  await expect(searchInput).toHaveValue("");

  await expect.poll(() => observedSearchParams.includes("")).toBe(true);

  await expect(page.getByText(initialRecipe.title)).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Nincs találat" }),
  ).not.toBeVisible();
});
