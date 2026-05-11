import { expect, test } from "@playwright/test";

import {
  isApiPath,
  mockGuestSession,
  paginatedRecipeListResponse,
} from "../helpers/apiMocks";
import { createRecipe } from "../helpers/testData";

test("orders the recipe list by title and keeps the ordering param in the URL", async ({
  page,
}) => {
  const defaultRecipes = [
    createRecipe({
      id: 1002,
      title: "Zöldséges leves",
      cooking_time: 35,
      servings: 6,
    }),
    createRecipe({
      id: 1001,
      title: "Almás palacsinta",
      cooking_time: 25,
      servings: 4,
    }),
  ];

  const titleOrderedRecipes = [
    createRecipe({
      id: 1001,
      title: "Almás palacsinta",
      cooking_time: 25,
      servings: 4,
    }),
    createRecipe({
      id: 1002,
      title: "Zöldséges leves",
      cooking_time: 35,
      servings: 6,
    }),
  ];

  const observedOrderingParams: string[] = [];

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
      const ordering = requestUrl.searchParams.get("ordering") ?? "";

      observedOrderingParams.push(ordering);

      const recipes =
        ordering === "title" ? titleOrderedRecipes : defaultRecipes;

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

  await expect(page.getByText("Zöldséges leves")).toBeVisible();
  await expect(page.getByText("Almás palacsinta")).toBeVisible();

  await page.getByRole("combobox", { name: "Rendezés" }).selectOption("title");

  await expect(page).toHaveURL(/[?&]ordering=title/);

  await expect.poll(() => observedOrderingParams.includes("title")).toBe(true);

  await expect(page.getByText("Almás palacsinta")).toBeVisible();
  await expect(page.getByText("Zöldséges leves")).toBeVisible();

  await expect(page.getByRole("combobox", { name: "Rendezés" })).toHaveValue(
    "title",
  );
});
