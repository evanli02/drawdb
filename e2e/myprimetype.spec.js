import { test, expect } from "@playwright/test";

test.describe("MYPRIMETYPE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
    await page.waitForLoadState("networkidle");
  });

  test("can add table and set field type to MYPRIMETYPE", async ({ page }) => {
    await page.getByTestId("add-table-btn").click();
    await expect(page.locator("#canvas")).toBeVisible({ timeout: 10000 });
    await page.getByRole("tab", { name: /Tables/ }).click();
    const typeDropdown = page
      .locator('[placeholder="type"], [data-placeholder="type"]')
      .or(page.getByRole("combobox").first());
    await typeDropdown.first().click({ timeout: 5000 });
    await page.getByText("MYPRIMETYPE", { exact: true }).click();
    await expect(page.getByText("MYPRIMETYPE")).toBeVisible();
  });

  test("MYPRIMETYPE default dropdown shows prime options when field details opened", async ({
    page,
  }) => {
    await page.getByTestId("add-table-btn").click();
    await page.getByRole("tab", { name: /Tables/ }).click();
    await page.getByRole("combobox").first().click();
    await page.getByText("MYPRIMETYPE", { exact: true }).click();
    await page.getByRole("button", { name: /more|\.\.\./i }).first().click();
    await expect(page.getByText("2").first()).toBeVisible({ timeout: 5000 });
  });
});
