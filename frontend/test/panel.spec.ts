import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Start with one entity")).toBeVisible();
});

test("inspect, traverse, preview rename and removal, export JSON", async ({
  page,
}) => {
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(
    page.getByText("triggers[0].entity_id", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Unresolved references in affected configurations", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await expect(
    page.locator(".tree").getByText("media_player.tablet", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "New entity ID" })
    .fill("binary_sensor.music_button");
  await page.getByRole("button", { name: "Preview rename" }).click();
  await expect(page.getByText("→ binary_sensor.music_button")).toBeVisible();
  await expect(page.getByText("No changes have been made.")).toBeVisible();
  await page.getByRole("button", { name: "Preview removal" }).click();
  await expect(
    page.getByRole("heading", { name: "Removal preview" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "blast-radius-binary_sensor.wall_button.json",
  );
});

test("empty, missing, error and retry states", async ({ page }) => {
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("sensor.unused");
  await search.press("Enter");
  await expect(
    page.getByText("No direct references found", { exact: true }),
  ).toBeVisible();
  await search.fill("light.removed");
  await search.press("Enter");
  await expect(
    page.getByText("This entity is missing.", { exact: false }),
  ).toBeVisible();
  await search.fill("sensor.unknown");
  await search.press("Enter");
  await expect(page.getByRole("alert")).toContainText("demo includes only");
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("dark mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("binary_sensor.wall_button");
  await search.press("Enter");
  await expect(
    page.getByText("triggers[0].entity_id", { exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  expect(
    await page
      .locator(".card")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(28, 28, 28)");
  await page.screenshot({
    path: "../docs/panel-mobile-dark.png",
    fullPage: true,
  });
});

test("desktop screenshots and depth change", async ({ page }) => {
  await page.setViewportSize({ width: 1360, height: 1000 });
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("binary_sensor.wall_button");
  await search.press("Enter");
  await expect(
    page.getByText("triggers[0].entity_id", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "../docs/panel-light.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await page.screenshot({ path: "../docs/panel-dark.png", fullPage: true });
  await page.getByLabel("Traversal depth").selectOption("1");
  await expect(
    page.locator(".tree").getByText("media_player.tablet", { exact: true }),
  ).not.toBeVisible();
});

test("configuration labels are rendered as text", async ({ page }) => {
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass = {
      callWS: async () => {
        throw new Error('<img src=x onerror="alert(1)">');
      },
    };
  });
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("sensor.test");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("<img src=x");
  await expect(page.locator("blast-radius-panel img")).toHaveCount(0);
});

test("a failed refresh does not leave a stale report available to export", async ({
  page,
}) => {
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass = {
      callWS: async () => {
        throw new Error("Snapshot unavailable");
      },
    };
  });
  await page.getByRole("button", { name: "Refresh snapshot" }).click();
  await expect(page.getByRole("alert")).toContainText("Snapshot unavailable");
  await expect(page.getByRole("button", { name: "Export JSON" })).toHaveCount(
    0,
  );
  await expect(
    page.getByText("triggers[0].entity_id", { exact: true }),
  ).toHaveCount(0);
});
