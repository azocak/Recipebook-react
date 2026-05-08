import { expect, test } from "@playwright/test";

import {
  isApiPath,
  mockGuestSession,
  paginatedRecipeListResponse,
} from "./helpers/apiMocks";
import { createRecipe, type E2ERecipe } from "./helpers/testData";

test("navigates to the second recipe list page and keeps the page param in the URL", async ({
  page,
}) => {
  const firstPageRecipe = createRecipe({
    id: 1101,
    title: "Első oldali palacsinta",
  });

  const secondPageRecipe = createRecipe({
    id: 1102,
    title: "Második oldali túrós palacsinta",
    ingredients: "20 dkg liszt\n2 db tojás\n25 dkg túró\n3 dl tej",
    instructions: "Keverd össze a tésztát, süsd ki, majd töltsd meg túróval.",
    cooking_time: 30,
    servings: 2,
  });

  const observedPageParams: string[] = [];

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
      const pageParam = requestUrl.searchParams.get("page") ?? "1";

      observedPageParams.push(pageParam);

      const responseByPage: Record<
        string,
        ReturnType<typeof paginatedRecipeListResponse<E2ERecipe>>
      > = {
        "1": paginatedRecipeListResponse([firstPageRecipe], {
          count: 7,
          next: "http://127.0.0.1:5173/api/recipes/?page=2",
          previous: null,
        }),
        "2": paginatedRecipeListResponse([secondPageRecipe], {
          count: 7,
          next: null,
          previous: "http://127.0.0.1:5173/api/recipes/?page=1",
        }),
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responseByPage[pageParam] ?? responseByPage["1"]),
      });
    },
  );

  await page.goto("/recipes");

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(page.getByText(firstPageRecipe.title)).toBeVisible();
  await expect(page.getByText(secondPageRecipe.title)).not.toBeVisible();

  await expect(page.getByText("1. oldal")).toBeVisible();

  await page.getByRole("button", { name: "Következő oldal" }).click();

  await expect(page).toHaveURL(/[?&]page=2/);

  await expect.poll(() => observedPageParams.includes("2")).toBe(true);

  await expect(page.getByText(secondPageRecipe.title)).toBeVisible();
  await expect(page.getByText(firstPageRecipe.title)).not.toBeVisible();

  await expect(page.getByText("2. oldal")).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Előző oldal" }),
  ).not.toBeDisabled();

  await expect(
    page.getByRole("button", { name: "Következő oldal" }),
  ).toBeDisabled();
});
