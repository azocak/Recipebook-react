import { expect, test } from "@playwright/test";

function isApiPath(url: string, path: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.pathname === path || parsedUrl.pathname === `${path}/`;
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
