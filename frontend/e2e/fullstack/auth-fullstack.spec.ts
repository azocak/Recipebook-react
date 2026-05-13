import { expect, test } from "@playwright/test";

import { registerFullStackUser } from "../helpers/fullstackActions";

test("registers a user with the real backend, shows authenticated navbar, then logs out", async ({
  page,
}) => {
  const user = await registerFullStackUser(page);

  await expect(page.getByRole("link", { name: "Új recept" })).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Kijelentkezés" }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Bejelentkezés" }),
  ).not.toBeVisible();

  await expect(
    page.getByRole("link", { name: "Regisztráció" }),
  ).not.toBeVisible();

  await page.getByRole("button", { name: "Kijelentkezés" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await expect(
    page.getByRole("heading", { name: "Bejelentkezés" }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Regisztráció" })).toBeVisible();

  await expect(page.getByRole("link", { name: "Új recept" })).not.toBeVisible();

  await expect(page.getByText(`Szia, ${user.username}!`)).not.toBeVisible();
});
