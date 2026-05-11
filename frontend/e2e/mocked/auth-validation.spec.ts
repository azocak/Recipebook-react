import { expect, test } from "@playwright/test";
import {
  isApiPath,
  mockCsrfEndpoint,
  mockEmptyRecipeList,
  mockGuestSession,
} from "../helpers/apiMocks";

test("shows a validation error when the register password confirmation does not match", async ({
  page,
}) => {
  let registerWasCalled = false;

  await mockGuestSession(page);

  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/register"),
    async (route) => {
      registerWasCalled = true;

      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          detail:
            "A register endpoint nem hívódhat kliensoldali validációs hiba esetén.",
        }),
      });
    },
  );

  await page.goto("/register");

  await expect(
    page.getByRole("heading", { name: "Regisztráció" }),
  ).toBeVisible();

  await page.getByLabel(/^Felhasználónév\s*\*?$/i).fill("e2e_user");
  await page.getByLabel(/^Email cím\s*\*?$/i).fill("e2e@example.com");
  await page.getByLabel(/^Jelszó\s*\*?$/i).fill("titkos123");
  await page.getByLabel(/^Jelszó megerősítése\s*\*?$/i).fill("masik123");

  await page.getByRole("button", { name: "Fiók létrehozása" }).click();

  await expect(page.getByText("A két jelszó nem egyezik.")).toBeVisible();

  expect(registerWasCalled).toBe(false);
});

test("registers a new user and redirects to the recipe list", async ({
  page,
}) => {
  const registeredUser = {
    id: 101,
    username: "e2e_user_success",
    email: "e2e-success@example.com",
  };

  let registerRequestBody: unknown;

  await mockGuestSession(page);
  await mockCsrfEndpoint(page);
  await mockEmptyRecipeList(page);

  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/register"),
    async (route) => {
      registerRequestBody = route.request().postDataJSON();

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(registeredUser),
      });
    },
  );

  await page.goto("/register");

  await expect(
    page.getByRole("heading", { name: "Regisztráció" }),
  ).toBeVisible();

  await page
    .getByLabel(/^Felhasználónév\s*\*?$/i)
    .fill(registeredUser.username);
  await page.getByLabel(/^Email cím\s*\*?$/i).fill(registeredUser.email);
  await page.getByLabel(/^Jelszó\s*\*?$/i).fill("titkos123");
  await page.getByLabel(/^Jelszó megerősítése\s*\*?$/i).fill("titkos123");

  await page.getByRole("button", { name: "Fiók létrehozása" }).click();

  await expect(page).toHaveURL(/\/recipes$/);

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Még nincs egyetlen recept sem" }),
  ).toBeVisible();

  expect(registerRequestBody).toEqual({
    username: registeredUser.username,
    email: registeredUser.email,
    password: "titkos123",
    confirmation: "titkos123",
  });
});

test("logs in an existing user and redirects to the recipe list", async ({
  page,
}) => {
  const loggedInUser = {
    id: 202,
    username: "e2e_login_user",
    email: "e2e-login@example.com",
  };

  let loginRequestBody: unknown;

  await mockGuestSession(page);
  await mockCsrfEndpoint(page);
  await mockEmptyRecipeList(page);

  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/login"),
    async (route) => {
      loginRequestBody = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(loggedInUser),
      });
    },
  );

  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Bejelentkezés" }),
  ).toBeVisible();

  await page.getByLabel(/^Felhasználónév\s*\*?$/i).fill(loggedInUser.username);
  await page.getByLabel(/^Jelszó\s*\*?$/i).fill("titkos123");

  await page.getByRole("button", { name: "Belépés" }).click();

  await expect(page).toHaveURL(/\/recipes$/);

  await expect(
    page.getByRole("heading", { name: "Receptkönyv" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Még nincs egyetlen recept sem" }),
  ).toBeVisible();

  expect(loginRequestBody).toEqual({
    username: loggedInUser.username,
    password: "titkos123",
  });
});

test("shows a backend error when login credentials are invalid", async ({
  page,
}) => {
  let loginRequestBody: unknown;

  await mockGuestSession(page);
  await mockCsrfEndpoint(page);

  await page.route(
    (url) => isApiPath(url.toString(), "/api/auth/login"),
    async (route) => {
      loginRequestBody = route.request().postDataJSON();

      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          non_field_errors: ["Hibás felhasználónév vagy jelszó."],
        }),
      });
    },
  );

  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Bejelentkezés" }),
  ).toBeVisible();

  await page.getByLabel(/^Felhasználónév\s*\*?$/i).fill("rossz_user");
  await page.getByLabel(/^Jelszó\s*\*?$/i).fill("rosszjelszo");

  await page.getByRole("button", { name: "Belépés" }).click();

  await expect(
    page.getByText("Hibás felhasználónév vagy jelszó."),
  ).toBeVisible();

  await expect(page).toHaveURL(/\/login$/);

  expect(loginRequestBody).toEqual({
    username: "rossz_user",
    password: "rosszjelszo",
  });
});
