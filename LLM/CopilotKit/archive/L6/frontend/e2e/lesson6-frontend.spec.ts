import { expect, test } from "@playwright/test";

test("frontend renders chat and todo suggestions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Type a message..." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open app mode" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add todos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wrap up" })).toBeVisible();
});
