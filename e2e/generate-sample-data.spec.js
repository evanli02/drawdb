import { test, expect } from "@playwright/test";

test.describe("Generate sample data", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
    await page.waitForLoadState("networkidle");
  });

  test("opens Generate sample data modal from File menu", async ({ page }) => {
    await page.getByText("File", { exact: true }).first().click();
    await page.getByText("Generate sample data", { exact: true }).click();
    await expect(page.getByTestId("generate-sample-data-modal")).toBeVisible();
  });

  test("shows message when no tables and Generate disabled", async ({ page }) => {
    await page.getByText("File", { exact: true }).first().click();
    await page.getByText("Generate sample data", { exact: true }).click();
    await expect(page.getByTestId("generate-sample-data-modal")).toBeVisible();
    await expect(
      page.getByText("Add at least one table to generate sample data."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Generate" }),
    ).toBeDisabled();
  });

  test("generates JSON and shows export preview after Generate", async ({
    page,
  }) => {
    await page.getByTestId("add-table-btn").click();
    await expect(page.locator("#canvas")).toBeVisible({ timeout: 10000 });
    await page.getByText("File", { exact: true }).first().click();
    await page.getByText("Generate sample data", { exact: true }).click();
    await expect(page.getByTestId("generate-sample-data-modal")).toBeVisible();
    await page.getByRole("button", { name: "Generate" }).click();
    await expect(
      page.getByRole("dialog").filter({ hasText: "Export" }),
    ).toBeVisible();
    const code = page.locator(".monaco-editor, [data-mode-id], pre");
    await expect(code.first()).toBeVisible({ timeout: 5000 });
  });
});
