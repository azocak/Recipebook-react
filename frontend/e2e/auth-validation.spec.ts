import { expect, test } from "@playwright/test";

function isApiPath(url: string, path: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.pathname === path || parsedUrl.pathname === `${path}/`;
}

function paginatedEmptyRecipesResponse() {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

test("shows a validation error when the register password confirmation does not match", async ({
  page,
}) => {
  let registerWasCalled = false;

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

  await page.getByLabel("Felhasználónév").fill("e2e_user");
  await page.getByLabel("Email cím").fill("e2e@example.com");
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
    (url) => isApiPath(url.toString(), "/api/auth/csrf"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "csrftoken=e2e-csrf-token; Path=/; SameSite=Lax",
        },
        body: JSON.stringify({ detail: "CSRF cookie set." }),
      });
    },
  );

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

  await page.route(
    (url) => isApiPath(url.toString(), "/api/recipes"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginatedEmptyRecipesResponse()),
      });
    },
  );

  await page.goto("/register");

  await expect(
    page.getByRole("heading", { name: "Regisztráció" }),
  ).toBeVisible();

  await page.getByLabel("Felhasználónév").fill(registeredUser.username);
  await page.getByLabel("Email cím").fill(registeredUser.email);
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
