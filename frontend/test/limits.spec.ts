import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Start with one entity")).toBeVisible();
  await page.getByText("Analysis options", { exact: true }).click();
});

test("depth warnings precede counts and a deeper fresh analysis finds more targets", async ({
  page,
}) => {
  await page.getByLabel("Traversal depth").selectOption("1");
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  const notice = page.getByRole("status", { name: "Analysis limits reached" });
  await expect(notice).toContainText("reached depth 1");
  expect(
    await notice.evaluate(
      (element) =>
        !!(
          element.compareDocumentPosition(
            element.getRootNode().querySelector(".impact-summary"),
          ) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
    ),
  ).toBe(true);
  await page
    .getByRole("tab", { name: "Relationship map", exact: true })
    .click();
  await expect(page.locator('[data-source="script.music_toggle"]')).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Inspect to depth 2" }).click();
  await expect(notice).toContainText("reached depth 2");
  await expect(page.getByLabel("Traversal depth")).toHaveValue("2");
  await expect(
    page.locator('[data-source="script.music_toggle"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inspect to depth 3" }).click();
  await expect(notice).toHaveCount(0);
  await expect(
    page.locator('[data-source="media_player.tablet"]'),
  ).toBeVisible();
});

for (const limit of ["nodes", "edges", "max-depth"]) {
  test(`${limit} warns without offering an ineffective deeper search`, async ({
    page,
  }) => {
    await page
      .getByRole("combobox", { name: "Entity", exact: true })
      .fill("binary_sensor.wall_button");
    await page.getByRole("button", { name: "Analyze", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Export JSON" }),
    ).toBeVisible();
    await page
      .locator("blast-radius-panel")
      .evaluate((panel: any, currentLimit) => {
        panel.report = {
          ...panel.report,
          graph: {
            ...panel.report.graph,
            truncated: true,
            max_depth: currentLimit === "max-depth" ? 12 : 6,
            limits_reached:
              currentLimit === "max-depth"
                ? ["depth"]
                : ["depth", currentLimit],
          },
        };
      }, limit);
    const notice = page.getByRole("status", {
      name: "Analysis limits reached",
    });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(
      limit === "max-depth"
        ? "reached depth 12"
        : "Increasing depth will not remove this cap",
    );
    await expect(
      page.getByRole("button", { name: /Inspect to depth/ }),
    ).toHaveCount(0);
  });
}

test("coverage gaps remain visible with zero references, open details and survive export", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const callWS = panel.hass.callWS.bind(panel.hass);
    panel.hass = {
      ...panel.hass,
      callWS: async (message: Record<string, unknown>) => {
        const report = await callWS(message);
        const warning =
          "dashboard.broken: configuration unavailable or generated automatically.";
        return {
          ...report,
          coverage: { ...report.coverage, warnings: [warning] },
          warnings: [...report.warnings, warning],
        };
      },
    };
  });
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("sensor.unused");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Static coverage partial" }),
  ).toHaveCount(0);
  await expect(page.locator("#coverage")).not.toHaveAttribute("open", "");
  await expect(page.locator("#coverage > summary")).toContainText(
    "Coverage & diagnostics",
  );
  await expect(page.locator("#coverage > summary")).toContainText("partial");
  await expect(
    page.getByRole("button", { name: /Inspect to depth/ }),
  ).toHaveCount(0);
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((panel) => panel.scrollWidth <= panel.clientWidth),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/ha-blast-radius-incomplete-mobile.png" });
  await page.setViewportSize({ width: 1360, height: 1000 });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.screenshot({
    path: "/tmp/ha-blast-radius-incomplete-desktop.png",
  });
  await page.locator("#coverage > summary").click();
  await expect(page.locator("#coverage")).toHaveAttribute("open", "");
  await expect(page.locator("#coverage > summary")).toBeFocused();
  await expect(page.locator("#coverage")).toContainText("dashboard.broken");
  await expect(
    page.getByText("No direct references found", { exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const stream = await (await downloadPromise).createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const report = JSON.parse(Buffer.concat(chunks).toString());
  expect(report.graph.truncated).toBe(false);
  expect(report.coverage.warnings).toEqual([
    "dashboard.broken: configuration unavailable or generated automatically.",
  ]);
});

test("older reports with only a truncation flag still show a warning", async ({
  page,
}) => {
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.report = {
      ...panel.report,
      graph: {
        ...panel.report.graph,
        truncated: true,
        limits_reached: undefined,
      },
    };
  });
  await expect(
    page.getByRole("status", { name: "Analysis limits reached" }),
  ).toContainText("depth or size limit");
  await expect(
    page.getByRole("button", { name: /Inspect to depth/ }),
  ).toHaveCount(0);
});
