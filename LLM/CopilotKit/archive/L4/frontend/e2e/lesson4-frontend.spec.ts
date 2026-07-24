import { expect, test } from "@playwright/test";

test.describe.configure({ retries: 1, timeout: 120_000 });

test("lesson 4 frontend renders declarative A2UI chat", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Type a message..." })).toBeVisible();
});

test("renders flight results in declarative UI", async ({ page }) => {
  await page.goto("/");

  const input = page.getByRole("textbox", { name: "Type a message..." });
  await input.fill("Design a compact declarative UI for flight options from Austin to Denver.");
  await input.press("Enter");
  if ((await input.inputValue()).trim().length > 0) {
    await input.press("Enter");
  }

  const surface = page.locator('[data-surface-id="lesson4-flights"]');
  await expect(surface.getByText(/Austin|Denver|flight/i).first()).toBeVisible({
    timeout: 90_000,
  });
  await expect(surface.getByText(/Select|Choose|Book/i).first()).toBeVisible({
    timeout: 90_000,
  });
});
