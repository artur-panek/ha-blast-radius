import { test, expect, type Page } from "@playwright/test";

async function screenshotPanel(page: Page, path: string) {
  // The HA panel has its own scroll container. Expand it only for documentation
  // capture so a full-page screenshot includes the report below the viewport.
  await page.locator("blast-radius-panel").evaluate((panel: HTMLElement) => {
    panel.scrollTop = 0;
    panel.style.height = "auto";
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path, fullPage: true });
  await page
    .locator("blast-radius-panel")
    .evaluate((panel: HTMLElement) => panel.style.removeProperty("height"));
}

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
    page.getByRole("heading", { name: "What uses this entity?", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Some linked logic still needs review", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await expect(
    page.locator('.tree .graph-node[data-source="media_player.tablet"]'),
  ).toBeVisible();
  await page.getByText("Preview a change", { exact: true }).click();
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
  await expect(page.locator(".impact-summary")).toContainText(
    "No direct users",
  );
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
    page.getByRole("heading", { name: "What uses this entity?", exact: true }),
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
  await screenshotPanel(page, "../docs/panel-mobile-dark.png");
});

test("desktop screenshots and depth change", async ({ page }) => {
  await page.setViewportSize({ width: 1360, height: 1000 });
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("binary_sensor.wall_button");
  await search.press("Enter");
  await expect(
    page.getByRole("heading", { name: "What uses this entity?", exact: true }),
  ).toBeVisible();
  await screenshotPanel(page, "../docs/panel-light.png");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await screenshotPanel(page, "../docs/panel-dark.png");
  await page.getByText("Analysis options", { exact: true }).click();
  await page.getByLabel("Traversal depth").selectOption("1");
  await expect(
    page.locator('.tree .graph-node[data-source="media_player.tablet"]'),
  ).toHaveCount(0);
});

test("configuration labels are rendered as text", async ({ page }) => {
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass = {
      ...panel.hass,
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
      ...panel.hass,
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
    const scope = page
      .locator(".uncertainty-scope")
      .filter({ hasText: "Unresolved in related configurations" });
    if (related) {
      await expect(scope.locator("summary .count").first()).toHaveText(
        `${related} group · ${related} location`,
      );
      await expect(scope).not.toHaveAttribute("open", "");
    } else await expect(scope).toHaveCount(0);
    await expect(page.locator(".impact-summary")).not.toContainText(
      "Unresolved",
    );
    await expect(page.locator(".impact-summary")).not.toContainText("170");
    await page.getByText("Coverage & diagnostics", { exact: false }).click();
    await expect(
      page.getByText(
        "170 locations without an entity target across the full snapshot",
        {
          exact: false,
        },
      ),
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
          panel.style.setProperty("--secondary-text-color", "#55565d");
          panel.style.setProperty("--primary-color", "#ee9800");
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
    await page
      .getByRole("tab", { name: "Uses this entity", exact: true })
      .click();
    await page.locator(".uncertainty-scope > summary").first().click();
    await page.locator(".reason-group > summary").first().click();
    for (const summary of await page
      .locator(".source-grid .technical > summary")
      .all())
      await summary.click();
    for (const selector of [
      ".badge.explicit",
      ".badge.template_literal",
      ".badge.dynamic",
      ".badge.unknown",
      ".source-meta",
      ".direction-metric .metric-label",
      "button.primary",
      '.filter-row button[aria-pressed="true"]',
    ]) {
      const badge = page.locator(selector).first();
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
        const background =
          style.backgroundColor === "rgba(0, 0, 0, 0)"
            ? getComputedStyle(element.closest(".card, .impact-summary")!)
                .backgroundColor
            : style.backgroundColor;
        return {
          text: rgb(style.color),
          background: rgb(background),
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

test("a large dashboard stays compact, explains unknowns and retains exact paths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 1000 });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.style.setProperty("--card-background-color", "#24252e");
    panel.style.setProperty("--primary-text-color", "#e8e8ed");
    panel.style.setProperty("--secondary-text-color", "#55565d");
    panel.style.setProperty("--primary-color", "#ee9800");
    panel.report = {
      ...panel.report,
      other_dashboard_references: Array.from({ length: 51 }, (_, index) => ({
        source_id: "dashboard.home",
        source_type: "dashboard",
        target: null,
        path: `views[1].sections[0].cards[${index}].secondary`,
        confidence: "dynamic",
        role: "display",
        reason: "External template variable",
      })),
      unresolved_total: 170,
    };
  });
  await expect(page.locator(".impact-summary")).not.toContainText("51");
  await page.getByText("Coverage & diagnostics", { exact: false }).click();
  const elsewhere = page.locator("#coverage .dashboard-context");
  await expect(elsewhere.locator("summary .count").first()).toHaveText(
    "1 group · 51 locations",
  );
  await expect(elsewhere).not.toHaveAttribute("open", "");
  expect((await elsewhere.boundingBox())!.height).toBeLessThan(80);
  await expect(page.getByText("Wall button", { exact: true })).toBeVisible();
  await expect(
    page.getByText("triggers[0].entity_id", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("tab", { name: "Uses this entity", exact: true })
    .click();
  await page.locator(".source-grid .technical > summary").first().click();
  await expect(
    page.getByText("triggers[0].entity_id", { exact: true }),
  ).toBeVisible();
  await page.locator(".technical > summary").first().click();
  await screenshotPanel(page, "/tmp/blast-radius-review-desktop.png");
  await elsewhere.locator(":scope > summary").click();
  await elsewhere.locator(".reason-group > summary").click();
  await expect(elsewhere.locator(".unresolved-row")).toHaveCount(51);
  await expect(
    elsewhere.getByText("views[1].sections[0].cards[50].secondary", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    elsewhere.getByText("A variable comes from runtime context", {
      exact: false,
    }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await elsewhere.locator(":scope > summary").click();
  await screenshotPanel(page, "/tmp/blast-radius-review-mobile.png");
});

test("analysis tabs support keyboard navigation and readable configuration locations", async ({
  page,
}) => {
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  const overview = page.getByRole("tab", {
    name: "Overview",
    exact: true,
  });
  await overview.focus();
  await overview.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Uses this entity", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAttribute(
    "aria-labelledby",
    "tab-usage",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Technical", exact: true }),
  ).toBeFocused();
  await expect(
    page
      .getByRole("tabpanel")
      .getByText("triggers[0].entity_id", { exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
  await page
    .getByRole("tab", { name: "Uses this entity", exact: true })
    .click();
  await page.locator(".source-grid .technical > summary").first().click();
  await expect(
    page.getByText("Trigger 1 › Entity ID", { exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator(".path > span")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(14);
});

test("source links open loaded configurations and notify the Home Assistant router", async ({
  page,
}) => {
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("binary_sensor.wall_button");
  await search.press("Enter");
  await page
    .getByRole("tab", { name: "Uses this entity", exact: true })
    .click();
  const automation = page.locator(
    '.source-grid [data-source="automation.wall_button"]',
  );
  await expect(automation.locator("a.source-name")).toHaveAttribute(
    "href",
    "/config/automation/show/automation.wall_button",
  );
  await expect(automation.locator(".open-source")).toHaveAttribute(
    "href",
    "/config/automation/show/automation.wall_button",
  );
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await expect(
    page.locator('.graph-node[data-source="script.music_toggle"] .open-source'),
  ).toHaveAttribute("href", "/config/script/show/script.music_toggle");
  await expect(
    page.locator('.graph-node[data-source="dashboard.home"] .open-source'),
  ).toHaveAttribute("href", "/lovelace");
  await page.evaluate(() => {
    (window as any).navigationEvents = [];
    window.addEventListener("location-changed", (event) =>
      (window as any).navigationEvents.push((event as CustomEvent).detail),
    );
  });
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass.callApi = () => {
      throw new Error("Opening the inspector must not read editor files");
    };
    panel.hass.callWS = () => {
      throw new Error("Navigation must not issue commands");
    };
  });
  await page
    .locator('.graph-node[data-source="automation.wall_button"] .open-source')
    .click();
  await expect(page).toHaveURL(
    /\/config\/automation\/show\/automation\.wall_button$/,
  );
  expect(
    await page.evaluate(() => ({
      events: (window as any).navigationEvents,
      from: history.state.from,
    })),
  ).toEqual({ events: [{ replace: false }], from: "/" });
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("scenes open their editor and ordinary entities open the native more-info dialog", async ({
  page,
}) => {
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("media_player.speaker");
  await search.press("Enter");
  await page
    .getByRole("tab", { name: "Uses this entity", exact: true })
    .click();
  await expect(
    page.locator('.source-grid [data-source="scene.evening"] .open-source'),
  ).toHaveAttribute("href", "/config/scene/edit/evening_01");
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await page.evaluate(() => {
    (window as any).moreInfo = [];
    window.addEventListener("hass-more-info", (event) =>
      (window as any).moreInfo.push({
        detail: (event as CustomEvent).detail,
        bubbles: event.bubbles,
        composed: event.composed,
      }),
    );
  });
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass.callWS = () => {
      throw new Error("Opening details must not issue commands");
    };
  });
  await page
    .locator(
      '.graph-node[data-source="media_player.speaker"] > .reference-title .open-source',
    )
    .click();
  expect(await page.evaluate(() => (window as any).moreInfo)).toEqual([
    {
      detail: { entityId: "media_player.speaker" },
      bubbles: true,
      composed: true,
    },
  ]);
  await expect(page).toHaveURL(/\/$/);
});

test("missing entities and unsafe navigation destinations do not get open controls", async ({
  page,
}) => {
  const search = page.getByRole("combobox", { name: "Entity", exact: true });
  await search.fill("light.removed");
  await search.press("Enter");
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await expect(
    page.locator('.graph-node[data-source="light.removed"] .open-source'),
  ).toHaveCount(0);
  await search.fill("binary_sensor.wall_button");
  await search.press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  for (const path of [
    "https://example.com",
    "//example.com",
    "javascript:alert(1)",
    "/config/automation/edit/../new",
    "/config/automation/edit/new",
    "/config/automation/show/script.music_toggle",
    "/config/automation/show/automation.wall_button/extra",
    "/config/automation/show/automation.%2e%2e",
  ]) {
    await page
      .locator("blast-radius-panel")
      .evaluate((panel: any, destination) => {
        panel.report = {
          ...panel.report,
          navigation: {
            ...panel.report.navigation,
            "automation.wall_button": { kind: "automation", path: destination },
          },
        };
      }, path);
    await expect(
      page.locator('[data-source="automation.wall_button"] .open-source'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-source="automation.wall_button"] a.source-name'),
    ).toHaveCount(0);
  }
});

test("panel uses the current HA body font and hides technical details initially", async ({
  page,
}) => {
  await page.locator("blast-radius-panel").evaluate((panel: HTMLElement) => {
    panel.style.setProperty("--ha-font-family-body", "Arial");
    panel.style.setProperty(
      "--paper-font-body1_-_font-family",
      "Times New Roman",
    );
  });
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await page
    .getByRole("tab", { name: "Uses this entity", exact: true })
    .click();
  const purpose = page
    .getByText("Triggers from this entity", { exact: true })
    .first();
  await expect(purpose).toBeVisible();
  expect(
    await purpose.evaluate((element) => getComputedStyle(element).fontFamily),
  ).toMatch(/^Arial,/);
  await expect(page.locator(".source-grid .badge").first()).not.toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "New entity ID" }),
  ).not.toBeVisible();
});
