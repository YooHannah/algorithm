import { expect, test } from "@playwright/test";

test("lesson 2 frontend renders chat + app mode interactions", async ({ page }) => {
  await page.goto("/");

  const infoResponse = await page.request.get("/api/copilotkit/info");
  expect(infoResponse.ok()).toBeTruthy();
  const info = await infoResponse.json();
  expect(info?.agents?.default).toBeTruthy();

  await expect(page.getByRole("button", { name: "Chat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "App Mode" })).toBeVisible();

  await expect(
    page.getByText("Pie chart ( Controlled Generative UI )")
  ).toBeVisible();

  await page.getByRole("button", { name: "App Mode" }).click();
  await expect(
    page.getByRole("button", { name: "Add your first todo" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Add your first todo" }).click();
  await expect(page.getByText("New Todo")).toBeVisible();

  await page.getByRole("button", { name: "Chat" }).click();
  await expect(page.getByRole("textbox", { name: "Type a message..." })).toBeVisible();
});
