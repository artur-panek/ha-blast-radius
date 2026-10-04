import { test, expect } from "@playwright/test";

function luminance(rgb: number[]) {
  const values = rgb.slice(0, 3).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

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

for (const related of [0, 1]) {
  test(`summary shows ${related} affected-source unknowns while coverage retains the global count`, async ({
    page,
  }) => {
    await page
      .getByRole("combobox", { name: "Entity", exact: true })
      .fill("binary_sensor.wall_button");
    await page.getByRole("button", { name: "Analyze", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Export JSON" }),
    ).toBeVisible();
    await page.locator("blast-radius-panel").evaluate((panel: any, count) => {
      panel.report = {
        ...panel.report,
        uncertain_references: panel.report.uncertain_references.slice(0, count),
        unresolved_total: 170,
      };
    }, related);
    const stat = page
      .locator(".stat")
      .filter({ hasText: "Unresolved in affected sources" });
    await expect(stat.locator("strong")).toHaveText(String(related));
    await expect(page.locator(".stats")).not.toContainText("170");
    await page.getByText("Coverage and limitations", { exact: false }).click();
    await expect(
      page.getByText("170 unresolved references across the full snapshot", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("they cannot be attributed to this entity", {
        exact: false,
      }),
    ).toBeVisible();
  });
}

for (const theme of ["light", "dark", "custom-dark"]) {
  test(`confidence labels remain readable in ${theme} with low-contrast semantic colors`, async ({
    page,
  }) => {
    if (theme !== "light")
      await page.getByRole("button", { name: "Toggle theme" }).click();
    await page
      .locator("blast-radius-panel")
      .evaluate((panel: HTMLElement, currentTheme) => {
        panel.style.setProperty(
          "--success-color",
          currentTheme === "light" ? "#00e676" : "#008000",
        );
        panel.style.setProperty("--warning-color", "#ffc107");
        if (currentTheme === "custom-dark") {
          panel.style.setProperty("--card-background-color", "#24252e");
          panel.style.setProperty("--primary-text-color", "#e8e8ed");
        }
      }, theme);
    await page
      .getByRole("combobox", { name: "Entity", exact: true })
      .fill("binary_sensor.wall_button");
    await page.getByRole("button", { name: "Analyze", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Export JSON" }),
    ).toBeVisible();
    await page.locator("blast-radius-panel").evaluate((panel: any) => {
      panel.report = {
        ...panel.report,
        references: [
          ...panel.report.references,
          { ...panel.report.references[0], confidence: "unknown" },
        ],
      };
    });
    for (const confidence of [
      "explicit",
      "template_literal",
      "dynamic",
      "unknown",
    ]) {
      const badge = page.locator(`.badge.${confidence}`).first();
      await expect(badge).toBeVisible();
      const colors = await badge.evaluate((element) => {
        const context = document.createElement("canvas").getContext("2d")!;
        const rgb = (color: string) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return Array.from(context.getImageData(0, 0, 1, 1).data);
        };
        const style = getComputedStyle(element);
        return {
          text: rgb(style.color),
          background: rgb(style.backgroundColor),
        };
      });
      expect(colors.background[3]).toBe(255);
      const values = [
        luminance(colors.text),
        luminance(colors.background),
      ].sort((a, b) => b - a);
      expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
}
