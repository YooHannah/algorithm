import { expect, test } from "@playwright/test";

test("frontend renders chat and MCP suggestions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Type a message..." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Whiteboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Design" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Project plan" })).toBeVisible();
});
