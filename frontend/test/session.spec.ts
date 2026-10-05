import { test, expect, type Page } from "@playwright/test";

const storageKey = "blast-radius:session:v1:demo-admin";
const search = (page: Page) =>
  page.getByRole("combobox", { name: "Entity", exact: true });

async function analyze(page: Page, id: string) {
  await search(page).fill(id);
  await search(page).press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
}

async function setDepth(page: Page, value: string) {
  const options = page.locator(".analysis-options");
  await options.evaluate((element: HTMLDetailsElement) => {
    element.open = true;
  });
  await page.getByLabel("Traversal depth").selectOption(value);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Start with one entity")).toBeVisible();
});

test("Back recreates the panel with its search, depth, tab and scroll and requests a fresh report", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  await setDepth(page, "12");
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await page.evaluate(() => {
    const panel = document.querySelector("blast-radius-panel") as any;
    const original = panel.hass.callWS.bind(panel.hass);
    (window as any).restoredRequests = [];
    const hass = {
      ...panel.hass,
      callWS: async (message: any) => {
        (window as any).restoredRequests.push(message);
        return original(message);
      },
    };
    window.addEventListener("location-changed", () => panel.remove(), {
      once: true,
    });
    window.addEventListener(
      "popstate",
      () => {
        const replacement = document.createElement("blast-radius-panel") as any;
        replacement.hass = hass;
        document.body.append(replacement);
      },
      { once: true },
    );
  });
  const link = page.locator(
    '.graph-node[data-source="automation.wall_button"] .open-source',
  );
  await link.scrollIntoViewIfNeeded();
  const before = await page
    .locator("blast-radius-panel")
    .evaluate((el) => el.scrollTop);
  expect(before).toBeGreaterThan(100);
  await link.click();
  await expect(page).toHaveURL(
    /\/config\/automation\/show\/automation\.wall_button$/,
  );
  await expect(page.locator("blast-radius-panel")).toHaveCount(0);
  await page.goBack();
  await expect(search(page)).toHaveValue("binary_sensor.wall_button");
  await expect(page.getByLabel("Traversal depth")).toHaveValue("12");
  await expect(
    page.getByRole("tab", { name: "Graph", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "Dependency map" }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      Math.abs(
        (await page
          .locator("blast-radius-panel")
          .evaluate((el) => el.scrollTop)) - before,
      ),
    )
    .toBeLessThan(3);
  expect(await page.evaluate(() => (window as any).restoredRequests)).toEqual([
    { type: "blast_radius/entities" },
    {
      type: "blast_radius/analyze",
      entity_id: "binary_sensor.wall_button",
      max_depth: 12,
    },
  ]);
});

test("recent searches are bounded, deduplicated, reopen at their depth and can be cleared", async ({
  page,
}) => {
  await setDepth(page, "2");
  await analyze(page, "binary_sensor.wall_button");
  await setDepth(page, "6");
  for (const id of [
    "light.desk",
    "sensor.unused",
    "media_player.speaker",
    "script.music_toggle",
    "automation.indicator",
    "scene.evening",
  ])
    await analyze(page, id);
  await expect(page.locator(".recent-search")).toHaveCount(6);
  await expect(
    page.getByRole("button", {
      name: "Analyze again: binary_sensor.wall_button",
      exact: true,
    }),
  ).toHaveCount(0);
  await setDepth(page, "2");
  await analyze(page, "light.desk");
  await analyze(page, "sensor.unused");
  await setDepth(page, "6");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page
    .getByRole("button", { name: "Analyze again: light.desk", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await expect(search(page)).toHaveValue("light.desk");
  await expect(page.getByLabel("Traversal depth")).toHaveValue("2");
  await expect(page.locator(".recent-search")).toHaveCount(6);
  await expect(page.locator(".recent-search").first()).toHaveAttribute(
    "aria-label",
    "Analyze again: light.desk",
  );
  await expect(
    page.getByRole("button", {
      name: "Analyze again: light.desk",
      exact: true,
    }),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  const saved = await page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key)!),
    storageKey,
  );
  expect(Object.keys(saved).sort()).toEqual(["last", "recent"]);
  expect(Object.keys(saved.last).sort()).toEqual([
    "depth",
    "entityId",
    "scrollTop",
    "tab",
  ]);
  expect(
    saved.recent.every(
      (item: any) => Object.keys(item).sort().join(",") === "depth,entityId",
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Clear recent searches" }).click();
  await expect(
    page.getByRole("region", { name: "Recent searches" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Start with one entity")).toBeVisible();
  await expect(search(page)).toHaveValue("");
});

test("reload and reconnect restore a successful search; failed searches do not enter recents", async ({
  page,
}) => {
  await analyze(page, "media_player.speaker");
  await page.getByRole("tab", { name: "Raw references", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Raw references", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(search(page)).toHaveValue("media_player.speaker");
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.remove();
    document.body.append(panel);
  });
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await expect(search(page)).toHaveValue("media_player.speaker");
  await search(page).fill("sensor.not_in_demo");
  await search(page).press("Enter");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export JSON" })).toHaveCount(
    0,
  );
  await expect(page.locator(".recent-search")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Analyze again: media_player.speaker",
      exact: true,
    })
    .click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
});

test("HA users have separate search sessions", async ({ page }) => {
  await analyze(page, "binary_sensor.wall_button");
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass = { ...panel.hass, user: { id: "another-admin" } };
  });
  await expect(page.getByText("Start with one entity")).toBeVisible();
  await expect(page.locator(".recent-search")).toHaveCount(0);
  await analyze(page, "sensor.unused");
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.hass = { ...panel.hass, user: { id: "demo-admin" } };
  });
  await expect(search(page)).toHaveValue("binary_sensor.wall_button");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await expect(page.locator(".recent-search")).toHaveCount(1);
  await expect(
    page.getByRole("button", {
      name: "Analyze again: sensor.unused",
      exact: true,
    }),
  ).toHaveCount(0);
});

for (const value of [
  "not-json",
  JSON.stringify({
    recent: [{ entityId: "javascript:alert(1)", depth: 6 }],
    last: { entityId: "sensor.bad", depth: 999, tab: "graph", scrollTop: -1 },
  }),
]) {
  test(`invalid saved state is ignored: ${value.slice(0, 20)}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, value }) => sessionStorage.setItem(key, value),
      { key: storageKey, value },
    );
    await page.reload();
    await expect(page.getByText("Start with one entity")).toBeVisible();
    await expect(page.locator(".recent-search")).toHaveCount(0);
    await analyze(page, "sensor.unused");
  });
}

test("blocked browser storage does not break analysis or return navigation", async ({
  page,
}) => {
  await page.evaluate(() => {
    for (const method of ["getItem", "setItem", "removeItem"])
      Object.defineProperty(Storage.prototype, method, {
        value: () => {
          throw new DOMException("Blocked", "SecurityError");
        },
        configurable: true,
      });
  });
  await analyze(page, "binary_sensor.wall_button");
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const replacement = document.createElement("blast-radius-panel") as any;
    replacement.hass = panel.hass;
    panel.replaceWith(replacement);
  });
  await expect(search(page)).toHaveValue("binary_sensor.wall_button");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page.getByRole("button", { name: "Clear recent searches" }).click();
  await expect(page.locator(".recent-search")).toHaveCount(0);
});
