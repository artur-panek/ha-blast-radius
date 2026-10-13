import { test, expect, type Page } from "@playwright/test";

const input = (page: Page) =>
  page.getByRole("combobox", { name: "Entity", exact: true });
const filters = (page: Page) => page.locator("details.result-filters");
const chip = (page: Page, name: string) =>
  filters(page).getByRole("button", { name, exact: true });
async function openFilters(page: Page) {
  await openAdvanced(page);
  const resultFilters = filters(page);
  if ((await resultFilters.getAttribute("open")) === null)
    await resultFilters.locator(":scope > summary").click();
}
async function openAdvanced(page: Page) {
  const advanced = page.locator(".advanced-analysis");
  await expect(advanced).toBeVisible();
  if ((await advanced.getAttribute("open")) === null)
    await advanced.locator(":scope > summary").click();
}
async function analyze(page: Page, id = "media_player.speaker") {
  await input(page).fill(id);
  await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await openAdvanced(page);
  await openFilters(page);
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Start with one entity")).toBeVisible();
});

test("source chips filter impact, graph and raw without changing totals or exports", async ({
  page,
}) => {
  await analyze(page);
  const before = await page.locator(".impact-summary").innerText();
  const full = await page
    .locator("blast-radius-panel")
    .evaluate((p: any) => JSON.stringify(p.report));
  await chip(page, "Script").click();
  const scriptRows = page.locator(".impact-lane .source-grid .source-row");
  expect(await scriptRows.count()).toBeGreaterThanOrEqual(1);
  expect(
    new Set(
      await scriptRows.evaluateAll((rows) =>
        rows.map((row) => row.getAttribute("data-source")),
      ),
    ),
  ).toEqual(new Set(["script.music_toggle"]));
  await page
    .getByRole("tab", { name: "Relationship map", exact: true })
    .click();
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
  expect(await page.locator(".impact-summary").innerText()).toBe(before);
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
    const visibleSourceIds = new Set(
      await page
        .locator(".impact-lane .source-grid .source-row")
        .evaluateAll((rows) =>
          rows.map((row) => row.getAttribute("data-source")).filter(Boolean),
        ),
    );
    expect(visibleSourceIds.size).toBe(expected);
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
  await page
    .getByRole("tab", { name: "Relationship map", exact: true })
    .click();
  const scene = chip(page, "Scene");
  await scene.focus();
  await scene.press("Space");
  await expect(scene).toBeFocused();
  await expect(scene).toHaveAttribute("aria-pressed", "true");
  await chip(page, "Automation").press("Enter");
  await expect(scene).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("tab", { name: "Relationship map", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Refresh snapshot" }).click();
  await expect(scene).toHaveAttribute("aria-pressed", "true");
  await analyze(page, "light.desk");
  await expect(chip(page, "All sources")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("tab", { name: "Relationship map", exact: true }),
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
  await openFilters(page);
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
  await page.locator(".change-preview > summary").click();
  await page.getByLabel("New entity ID").fill("binary_sensor.new_button");
  await page
    .getByRole("button", { name: "Preview rename", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rename preview" }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "Relationship map", exact: true })
    .click();
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
    page.getByRole("tab", { name: "Relationship map", exact: true }),
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
  await page
    .getByRole("tab", { name: "Relationship map", exact: true })
    .click();
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
    await page
      .getByRole("tab", { name: "Relationship map", exact: true })
      .click();
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
        "No matching dependency paths. Clear filters to restore the full map.",
      ),
    ).toBeVisible();
  });
}
test("overview separates incoming controllers from reaction paths and downstream effects", async ({
  page,
}) => {
  await analyze(page, "binary_sensor.wall_button");
  const summary = page.locator(".impact-summary");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "sources can change / invoke" }),
  ).toContainText("0");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "sources read / react" }),
  ).toContainText("2");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "downstream nodes identified" }),
  ).toContainText("3");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "display sources" }),
  ).toContainText("1");
  await expect(
    page.getByRole("heading", { name: "What reads or reacts to this entity" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What may be affected downstream" }),
  ).toBeVisible();
  await expect(page.locator(".shared-context")).toHaveCount(0);
});

test("write-only flows expose co-targets as context rather than downstream effects", async ({
  page,
}) => {
  await analyze(page, "light.desk");
  const summary = page.locator(".impact-summary");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "sources can change / invoke" }),
  ).toContainText("1");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "downstream nodes identified" }),
  ).toContainText("0");
  await expect(page.locator(".summary-context-note")).toContainText(
    "1 additional node is shared-flow context only",
  );
  const context = page.locator(".shared-context");
  await expect(context).toContainText("Shared-flow context");
  await expect(context).not.toHaveAttribute("open", "");
  await expect(
    page.getByRole("heading", { name: "What may be affected downstream" }),
  ).toHaveCount(0);
});

test("selected scripts show their own direct outputs as downstream impact", async ({
  page,
}) => {
  await analyze(page, "script.music_toggle");
  const summary = page.locator(".impact-summary");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "sources can change / invoke" }),
  ).toContainText("1");
  await expect(
    summary
      .locator(".impact-metrics > div")
      .filter({ hasText: "downstream nodes identified" }),
  ).toContainText("2");
  const downstream = page
    .locator(".downstream-lane")
    .filter({ hasText: "Direct outputs of this configuration" });
  await expect(downstream).toBeVisible();
  await expect(
    downstream.locator('.flow-target[data-source="media_player.speaker"]'),
  ).toBeVisible();
  await expect(
    downstream.locator('.flow-target[data-source="media_player.tablet"]'),
  ).toBeVisible();
});

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
  await page
    .getByRole("tab", { name: "Relationship map", exact: true })
    .click();
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
      resolution: "selector",
      selector: { kind: "area_id", value: "office", exists: true },
    };
    p.report = { ...p.report, uncertain_references: [ref] };
  });
  await chip(page, "Needs review").click();
  await page.getByRole("button", { name: "View coverage" }).click();
  const selectorScope = page
    .locator("#coverage .uncertainty-scope")
    .filter({ hasText: "Device and selector context" });
  await selectorScope.locator(":scope > summary").click();
  await selectorScope.locator(".reason-group > summary").click();
  await expect(selectorScope.locator(".selector-detail")).toContainText(
    "Identity found in HA registry.",
  );
  await expect(selectorScope.locator(".selector-detail")).toContainText(
    "Entity membership and runtime eligibility are not expanded.",
  );
});

test("structural-only and own-output summaries", async ({ page }) => {
  await analyze(page, "sensor.unused");
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const ref = {
      source_id: "group.synthetic",
      source_type: "group",
      target: "sensor.unused",
      path: "entities[0]",
      confidence: "explicit",
      role: "member",
      reason: "",
    };
    panel.report = {
      ...panel.report,
      references: [ref],
      summary: { ...panel.report.summary, sources: 1, references: 1 },
    };
  });
  await expect(page.locator(".impact-verdict p")).toHaveText(
    "Direct references are structural or unclassified.",
  );
  await expect(
    page.getByRole("heading", { name: "Includes it structurally" }),
  ).toBeVisible();

  await analyze(page, "script.music_toggle");
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.report = {
      ...panel.report,
      references: [],
      summary: { ...panel.report.summary, sources: 0, references: 0 },
    };
  });
  await expect(page.locator(".impact-verdict p")).toContainText(
    "possible downstream",
  );
  await expect(page.locator(".impact-verdict p")).not.toContainText(
    "No direct references",
  );
});

test("one divider below filters and one heading for a single relationship type", async ({
  page,
}) => {
  await analyze(page, "light.desk");
  const filters = page.locator(".result-filters");
  const incoming = page.locator("#analysis-view > .incoming-lane");
  await expect(
    page.getByRole("heading", {
      name: "What can change this entity",
      exact: true,
    }),
  ).toBeVisible();
  await expect(incoming.locator(".role-heading")).toHaveCount(0);
  await expect(incoming.locator(".lane-metadata .role-count")).toContainText(
    "1 source · 1 change",
  );
  expect(
    await filters.evaluate((el) => getComputedStyle(el).borderBottomWidth),
  ).toBe("1px");
  expect(
    await incoming.evaluate((el) => getComputedStyle(el).borderTopWidth),
  ).toBe("0px");

  await analyze(page, "binary_sensor.wall_button");
  const reaction = page.locator("#analysis-view > .reaction-lane");
  const display = page.locator("#analysis-view > .passive-lane");
  await expect(reaction.locator(".role-heading")).toHaveCount(0);
  await expect(display.locator(".role-heading")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Where this entity is displayed",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await reaction.evaluate((el) => getComputedStyle(el).borderTopWidth),
  ).toBe("0px");
  expect(
    await display.evaluate((el) => getComputedStyle(el).borderTopWidth),
  ).toBe("1px");

  await analyze(page, "script.music_toggle");
  await expect(
    page.getByRole("heading", {
      name: "What can invoke this entity",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".incoming-lane .role-heading")).toHaveCount(0);

  // A mixed action lane still requires distinct role headings and source counts.
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const ref = panel.report.references[0];
    panel.report = {
      ...panel.report,
      references: [
        ref,
        {
          ...ref,
          source_id: "automation.indicator",
          source_type: "automation",
          role: "write",
          path: "actions[0].target.entity_id",
        },
      ],
    };
  });
  await expect(
    page.getByRole("heading", {
      name: "What can change or invoke this entity",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".incoming-lane .role-heading")).toHaveCount(2);
});

for (const viewport of [
  { width: 1360, height: 940 },
  { width: 390, height: 844 },
]) {
  test(`shared context has no extra divider before blind spots (${viewport.width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    if (viewport.width < 500) await page.locator("#theme").click();
    await analyze(page, "light.desk");
    await page.locator("blast-radius-panel").evaluate((panel: any) => {
      panel.report = {
        ...panel.report,
        uncertain_references: [
          {
            source_id: "scene.evening",
            source_type: "scene",
            target: null,
            path: "entities.light.desk.template",
            role: "read",
            confidence: "dynamic",
            reason: "External template variable",
            resolution: "unresolved",
          },
        ],
      };
    });
    const disclosure = page.locator(".shared-context");
    const uncertainty = page.locator(".shared-context + .uncertainty");
    await expect(disclosure).toBeVisible();
    await expect(uncertainty).toBeVisible();
    expect(
      await uncertainty.evaluate((el) => getComputedStyle(el).borderTopWidth),
    ).toBe("0px");
    await expect(
      page.locator(".uncertainty-scope.direct-context"),
    ).toBeVisible();
    expect(
      await page
        .locator("blast-radius-panel")
        .evaluate((panel) => panel.scrollWidth <= panel.clientWidth),
    ).toBe(true);
  });
}

test("failed change preview keeps the analysis and shows an error in the form", async ({
  page,
}) => {
  await analyze(page, "light.desk");
  const selected = page.locator(".result-heading code");
  await page.getByRole("button", { name: "Preview a change" }).click();
  await expect(page.locator(".change-preview")).toHaveAttribute("open", "");
  await page
    .getByRole("textbox", { name: "New entity ID" })
    .fill("switch.other");
  await page.getByRole("button", { name: "Preview rename" }).click();
  const feedback = page.locator(".change-preview .preview-error");
  await expect(feedback).toContainText("same domain");
  await expect(selected).toHaveText("light.desk");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await expect(page.locator(".change-preview")).toHaveAttribute("open", "");
  await expect(page.locator(".preview-hint")).toContainText("light.");

  await page
    .getByRole("textbox", { name: "New entity ID" })
    .fill("light.renamed_desk");
  await page.getByRole("button", { name: "Preview rename" }).click();
  await expect(
    page.getByRole("heading", { name: "Rename preview" }),
  ).toBeVisible();
  await expect(feedback).toHaveCount(0);
  await expect(selected).toHaveText("light.desk");

  // A later failed attempt must not present the preceding preview as current.
  await page
    .getByRole("textbox", { name: "New entity ID" })
    .fill("switch.other");
  await page.getByRole("button", { name: "Preview rename" }).click();
  await expect(feedback).toContainText("same domain");
  await expect(
    page.getByRole("heading", { name: "Rename preview" }),
  ).toHaveCount(0);
  await expect(selected).toHaveText("light.desk");
});

test("preview errors remain readable on mobile without losing the result", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#theme").click();
  await analyze(page, "light.desk");
  await page.getByRole("button", { name: "Preview a change" }).click();
  await page.getByRole("textbox", { name: "New entity ID" }).fill("not-an-id");
  await page.getByRole("button", { name: "Preview rename" }).click();
  await expect(page.locator(".preview-error")).toBeVisible();
  await expect(page.locator(".result-heading code")).toHaveText("light.desk");
  expect(
    await page
      .locator("blast-radius-panel")
      .evaluate((panel) => panel.scrollWidth <= panel.clientWidth),
  ).toBe(true);
});

test("shared-flow note wraps as a sentence and idle export status is hidden", async ({
  page,
}) => {
  await analyze(page, "light.desk");
  const note = page.locator(".summary-context-note");
  await expect(note).toContainText("shared-flow context only");
  expect(await note.evaluate((el) => getComputedStyle(el).display)).toBe(
    "block",
  );
  const status = page.locator(".status").first();
  await expect(status).toBeHidden();
  await page.getByRole("button", { name: "Copy Markdown" }).click();
  await expect(status).toBeVisible();
});

test("the default result answers where the entity is used without exposing the graph", async ({
  page,
}) => {
  await input(page).fill("binary_sensor.wall_button");
  await input(page).press("Enter");
  await expect(
    page.getByRole("heading", { name: "3 configurations found" }),
  ).toBeVisible();
  const simple = page.locator(".plain-impact");
  await expect(simple.locator(".plain-source")).toHaveCount(3);
  await expect(
    simple.getByRole("heading", { name: "Reads or reacts to this entity" }),
  ).toBeVisible();
  await expect(
    simple.getByRole("heading", { name: "Displays this entity" }),
  ).toBeVisible();
  await expect(page.locator(".advanced-analysis")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".advanced-analysis .graph-node")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  const firstSource = simple.locator(".plain-source").first();
  await expect(firstSource.locator("code")).not.toBeVisible();
  await firstSource.locator(".plain-source-details > summary").click();
  await expect(firstSource.locator(".plain-source-path code")).toBeVisible();

  await page.getByRole("button", { name: "Explore relationships" }).click();
  await expect(page.locator(".advanced-analysis")).toHaveAttribute("open", "");
  await expect(
    page.getByRole("tab", { name: "Relationship map", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("each direct source appears once even when it has more than one role", async ({
  page,
}) => {
  await input(page).fill("binary_sensor.wall_button");
  await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const ref = panel.report.references[0];
    panel.report = {
      ...panel.report,
      references: [
        { ...ref, role: "write" },
        { ...ref, role: "read", path: "conditions[0].entity_id" },
        {
          ...ref,
          source_id: "dashboard.home",
          source_type: "dashboard",
          role: "display",
        },
      ],
    };
  });
  await expect(
    page.getByRole("heading", { name: "2 configurations found" }),
  ).toBeVisible();
  const list = page.locator(".plain-impact .plain-source");
  await expect(list).toHaveCount(2);
  await expect(list.first()).toContainText("2 references");
});

test("no incoming references does not conceal the selected configuration's possible outputs", async ({
  page,
}) => {
  await input(page).fill("scene.evening");
  await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await expect(page.locator(".plain-impact")).toContainText(
    "No incoming references found. This configuration has possible outputs",
  );
});

test("scan limitations appear as a short note with a link to full diagnostics", async ({
  page,
}) => {
  await input(page).fill("light.desk");
  await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    panel.report = {
      ...panel.report,
      coverage: {
        ...panel.report.coverage,
        warnings: ["dashboard.home: configuration unavailable"],
      },
    };
  });
  await expect(page.locator(".plain-impact .plain-scan-note")).toContainText(
    "Results may be incomplete",
  );
  await page.getByRole("button", { name: "Scan details →" }).click();
  await expect(page.locator("#coverage")).toHaveAttribute("open", "");
});
