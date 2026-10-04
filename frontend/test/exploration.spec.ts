import { test, expect, type Page } from "@playwright/test";

const input = (page: Page) =>
  page.getByRole("combobox", { name: "Entity", exact: true });
const filters = (page: Page) =>
  page.getByRole("region", { name: "Result filters" });
const chip = (page: Page, name: string) =>
  filters(page).getByRole("button", { name, exact: true });
async function analyze(page: Page, id = "media_player.speaker") {
  await input(page).fill(id);
  await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Start with one entity")).toBeVisible();
});

test("source chips filter impact, graph and raw without changing totals or exports", async ({
  page,
}) => {
  await analyze(page);
  const before = await page.locator(".stats").innerText();
  const full = await page
    .locator("blast-radius-panel")
    .evaluate((p: any) => JSON.stringify(p.report));
  await chip(page, "Script").click();
  await expect(page.locator(".source-grid .source-row")).toHaveCount(1);
  await expect(page.locator(".source-grid .source-row")).toHaveAttribute(
    "data-source",
    "script.music_toggle",
  );
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await expect(page.locator(".graph-node.selected")).toHaveCount(1);
  await expect(
    page.locator('.graph-node.dependent[data-source="dashboard.home"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('.graph-node.dependent[data-source="script.music_toggle"]'),
  ).toHaveCount(1);
  await page.getByRole("tab", { name: "Raw references", exact: true }).click();
  expect(await page.locator("tbody tr").count()).toBeGreaterThan(0);
  for (const text of await page
    .locator("tbody tr td:first-child")
    .allTextContents())
    expect(text).toContain("script.music_toggle");
  expect(await page.locator(".stats").innerText()).toBe(before);
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((p: any) => JSON.stringify(p.report)),
  ).toBe(full);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const stream = await (await downloadEvent).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.references).toEqual(JSON.parse(full).references);
  expect(exported.graph).toEqual(JSON.parse(full).graph);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => ((window as any).copied = value),
      },
    });
  });
  await page.getByRole("button", { name: "Copy Markdown" }).click();
  expect(await page.evaluate(() => (window as any).copied)).toBe(
    JSON.parse(full).markdown,
  );
});
for (const kind of ["Automation", "Script", "Dashboard", "Scene", "Group"]) {
  test(`source filter ${kind} uses source type, including zero matches`, async ({
    page,
  }) => {
    await analyze(page);
    await chip(page, kind).click();
    const expected = await page
      .locator("blast-radius-panel")
      .evaluate(
        (p: any, type) =>
          new Set(
            p.report.references
              .filter((r: any) => r.source_type === type)
              .map((r: any) => r.source_id),
          ).size,
        kind.toLowerCase(),
      );
    await expect(page.locator(".source-grid .source-row")).toHaveCount(
      expected,
    );
    if (!expected)
      await expect(
        page.getByText("No matching direct references", { exact: true }),
      ).toBeVisible();
    await expect(chip(page, kind)).toHaveAttribute("aria-pressed", "true");
  });
}
test("confidence filters distinguish explicit, literal, and review including dynamic expressions", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  await page.getByRole("tab", { name: "Raw references", exact: true }).click();
  for (const [label, allowed] of [
    ["Explicit", ["explicit"]],
    ["Template literal", ["template_literal"]],
    ["Needs review", ["unknown", "dynamic"]],
  ] as const) {
    await chip(page, "All confidence").click();
    await chip(page, label).click();
    const expected = await page
      .locator("blast-radius-panel")
      .evaluate(
        (p: any, confidence) =>
          [
            ...p.report.references,
            ...p.report.uncertain_references,
            ...p.report.other_dashboard_references,
          ].filter((r: any) => confidence.includes(r.confidence)).length,
        [...allowed],
      );
    await expect(page.locator("tbody tr")).toHaveCount(expected);
    for (const badge of await page.locator("tbody .badge").allTextContents())
      expect(
        label === "Needs review" ? ["Dynamic", "Unclassified"] : [label],
      ).toContain(badge);
  }
  await expect(page.locator("tbody tr")).not.toHaveCount(0);
});
test("keyboard multi-select preserves tab and resets when root changes", async ({
  page,
}) => {
  await analyze(page);
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  const scene = chip(page, "Scene");
  await scene.focus();
  await scene.press("Space");
  await expect(scene).toBeFocused();
  await expect(scene).toHaveAttribute("aria-pressed", "true");
  await chip(page, "Automation").press("Enter");
  await expect(scene).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("tab", { name: "Graph", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Refresh snapshot" }).click();
  await expect(scene).toHaveAttribute("aria-pressed", "true");
  await analyze(page, "light.desk");
  await expect(chip(page, "All sources")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("tab", { name: "Graph", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});
test("filters do not persist across remounts or HA account changes", async ({
  page,
}) => {
  await analyze(page);
  await chip(page, "Script").click();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("blast-radius:session:v1:demo-admin"),
    ),
  ).not.toContain("Filters");
  await page.evaluate(() => {
    const old = document.querySelector("blast-radius-panel") as any;
    const hass = old.hass;
    old.remove();
    const fresh = document.createElement("blast-radius-panel") as any;
    fresh.hass = hass;
    document.body.append(fresh);
  });
  await expect(chip(page, "All sources")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await chip(page, "Script").click();
  await page
    .locator("blast-radius-panel")
    .evaluate(
      (p: any) => (p.hass = { ...p.hass, user: { id: "different-user" } }),
    );
  await expect(page.getByText("Start with one entity")).toBeVisible();
  await analyze(page);
  await expect(chip(page, "All sources")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
test("Analyze this from Used by and Possible targets resets preview and enters Recent", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  await page.getByText("Preview a change", { exact: true }).click();
  await page.getByLabel("New entity ID").fill("binary_sensor.new_button");
  await page
    .getByRole("button", { name: "Preview rename", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rename preview" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  const node = page.locator(
    '.graph-node[data-source="automation.wall_button"]',
  );
  await expect(node.locator(".open-source")).toHaveAttribute(
    "href",
    "/config/automation/show/automation.wall_button",
  );
  await node
    .getByRole("button", {
      name: "Analyze this: automation.wall_button",
      exact: true,
    })
    .click();
  await expect(input(page)).toHaveValue("automation.wall_button");
  await expect(page.locator(".result-heading h2")).toBeFocused();
  await expect(page.locator(".result-heading code")).toHaveText(
    "automation.wall_button",
  );
  await expect(
    page.getByRole("heading", { name: "Rename preview" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("New entity ID")).toHaveValue("");
  await expect(
    page.getByRole("button", {
      name: "Analyze again: automation.wall_button",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Graph", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  const target = page.locator(
    '.graph-node.downstream[data-source="media_player.speaker"]',
  );
  await target
    .getByRole("button", {
      name: "Analyze this: media_player.speaker",
      exact: true,
    })
    .click();
  await expect(page.locator(".result-heading code")).toHaveText(
    "media_player.speaker",
  );
  await expect(page).toHaveURL(/\/$/);
  await page
    .getByRole("button", {
      name: "Analyze again: binary_sensor.wall_button",
      exact: true,
    })
    .click();
  await expect(page.locator(".result-heading code")).toHaveText(
    "binary_sensor.wall_button",
  );
});
test("graph navigation removes stale exports and ignores superseded response", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await page.locator("blast-radius-panel").evaluate((p: any) => {
    const original = p.hass.callWS.bind(p.hass);
    p.hass = {
      ...p.hass,
      callWS: (message: any) =>
        message.entity_id === "automation.wall_button"
          ? new Promise(
              (resolve) =>
                ((window as any).finishAnalysis = async () =>
                  resolve(await original(message))),
            )
          : original(message),
    };
  });
  await page
    .getByRole("button", {
      name: "Analyze this: automation.wall_button",
      exact: true,
    })
    .click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Copy Markdown" })).toHaveCount(
    0,
  );
  await analyze(page, "light.desk");
  await page.evaluate(() => (window as any).finishAnalysis());
  await expect(page.locator(".result-heading code")).toHaveText("light.desk");
  await expect(
    page.getByRole("button", {
      name: "Analyze again: automation.wall_button",
      exact: true,
    }),
  ).toHaveCount(0);
});
for (const theme of ["light", "dark"]) {
  test(`filters and graph actions wrap on mobile in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    if (theme === "dark") await page.locator("#theme").click();
    await analyze(page, "binary_sensor.wall_button");
    await page.getByRole("tab", { name: "Graph", exact: true }).click();
    await chip(page, "Automation").click();
    const dimensions = await page
      .locator("blast-radius-panel")
      .evaluate((p: any) => ({ width: p.clientWidth, scroll: p.scrollWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
    await expect(
      page.getByRole("button", {
        name: "Analyze this: automation.wall_button",
        exact: true,
      }),
    ).toBeVisible();
    await chip(page, "All sources").click();
    await chip(page, "Group").click();
    await expect(page.locator(".graph-node.selected")).toHaveCount(1);
    await expect(
      page.getByText(
        "No matching linked configurations. Try All sources or All confidence.",
      ),
    ).toBeVisible();
  });
}
test("Report issue URL contains no entity or report data", async ({ page }) => {
  await analyze(page);
  await expect(
    page.getByRole("link", { name: "Report issue ↗" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/artur-panek/ha-blast-radius/issues/new?template=bug.yml",
  );
});

test("graph confidence filters keep valid via paths and never substitute unrelated action edges", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  await page.locator("blast-radius-panel").evaluate((p: any) => {
    const root = p.report.entity_id;
    const explicit = {
      source_id: "group.synthetic",
      source_type: "group",
      target: root,
      path: "entity_id[0]",
      confidence: "explicit",
      role: "member",
      reason: "",
    };
    const unrelated = {
      ...explicit,
      target: "light.other",
      path: "variables.other",
      confidence: "template_literal",
      role: "read",
    };
    p.report = {
      ...p.report,
      references: [...p.report.references, explicit],
      graph: {
        ...p.report.graph,
        nodes: [
          { id: root, depth: 0, relationship: "selected" },
          {
            id: "group.synthetic",
            depth: 1,
            relationship: "dependent",
            via: root,
            path: explicit.path,
            confidence: "explicit",
          },
          {
            id: "light.other",
            depth: 2,
            relationship: "downstream",
            via: "group.synthetic",
            path: "target",
            confidence: "explicit",
          },
        ],
        edges: [explicit, unrelated],
      },
    };
  });
  await chip(page, "Group").click();
  await expect(
    page.locator('.source-grid .source-row[data-source="group.synthetic"]'),
  ).toHaveCount(1);
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await chip(page, "Template literal").click();
  await expect(page.locator(".graph-node.dependent")).toHaveCount(0);
  await page.locator("blast-radius-panel").evaluate((p: any) => {
    const edge = {
      ...p.report.graph.edges[0],
      path: "variables.root",
      confidence: "template_literal",
      role: "read",
    };
    p.report = {
      ...p.report,
      graph: { ...p.report.graph, edges: [...p.report.graph.edges, edge] },
    };
  });
  const node = page.locator(".graph-node.dependent");
  await expect(node).toHaveCount(1);
  await expect(node.locator(".via")).toContainText("Music button");
  await node.locator("summary").click();
  await expect(node.locator("code").last()).toHaveText("variables.root");
  await expect(node.locator(".badge.template_literal")).toBeVisible();
});

test("selector presentation separates known identity from unexpanded entity membership", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  await page.locator("blast-radius-panel").evaluate((p: any) => {
    const ref = {
      ...p.report.uncertain_references[0],
      path: "actions[0].target.area_id",
      reason: "Unexpanded area_id target",
      selector: { kind: "area_id", value: "office", exists: true },
    };
    p.report = { ...p.report, uncertain_references: [ref] };
  });
  await chip(page, "Needs review").click();
  await page.locator(".uncertainty-scope > summary").click();
  await page.locator(".reason-group > summary").click();
  await expect(page.locator(".selector-detail")).toContainText(
    "Identity found in HA registry.",
  );
  await expect(page.locator(".selector-detail")).toContainText(
    "Entity membership and runtime eligibility are not expanded.",
  );
});
