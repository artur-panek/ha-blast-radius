import { test, expect, type Page } from "@playwright/test";

async function openAdvanced(page: Page) {
  const advanced = page.locator(".advanced-analysis");
  if (await advanced.isHidden()) {
    await page.getByRole("button", { name: "Explore relationships" }).click();
    await page
      .getByRole("tab", { name: "Detailed impact", exact: true })
      .click();
  } else if ((await advanced.getAttribute("open")) === null) {
    await advanced.locator(":scope > summary").click();
  }
  await expect(advanced).toBeVisible();
}

import {
  groupReviewReferences,
  reviewCounts,
  scopeUnresolvedReferences,
} from "../src/review";
import type { Reference } from "../src/types";

function keypadReferences(): Reference[] {
  const base: Reference = {
    source_id: "automation.wall_button",
    source_type: "automation",
    target: null,
    path: "",
    confidence: "dynamic",
    role: "read",
    reason: "Device identity reference",
    resolution: "device",
    selector: { kind: "device_id", value: "keypad", exists: true },
  };
  return [
    ...Array.from({ length: 16 }, (_, i) => ({
      ...base,
      path: `triggers[${i}].event_data.device_id`,
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      ...base,
      role: "write",
      path: `actions[0].choose[${i}].sequence[0].device_id`,
      selector: { ...base.selector!, value: "actuator" },
    })),
    ...Array.from({ length: 9 }, (_, i): Reference => ({
      ...base,
      role: "write",
      path: `actions[0].choose[${i}].sequence[0].entity_id`,
      selector: undefined,
      resolution: "unresolved",
      reason: "Entity registry ID not found",
    })),
  ];
}

test("review grouping retains all locations and distinguishes role, identity, and presence", () => {
  const refs = keypadReferences();
  expect(reviewCounts(refs)).toBe("3 groups · 34 locations");
  expect(groupReviewReferences(refs).map((g) => g.paths.length)).toEqual([
    16, 9, 9,
  ]);
  const first = refs[0];
  const different = [
    { ...first, source_id: "automation.other" },
    { ...first, role: "write" },
    { ...first, selector: { ...first.selector!, value: "other" } },
    { ...first, selector: { ...first.selector!, exists: false } },
    { ...first, selector: { ...first.selector!, exists: null } },
  ];
  expect(groupReviewReferences([first, ...different])).toHaveLength(6);
  expect(reviewCounts([])).toBe("0 groups · 0 locations");
});

for (const mobile of [false, true]) {
  test(`keypad review is compact, honest and fully exportable (${mobile ? "mobile" : "desktop"})`, async ({
    page,
  }) => {
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1360, height: 960 },
    );
    await page.goto("/");
    if (mobile)
      await page.getByRole("button", { name: "Toggle theme" }).click();
    await page
      .getByRole("combobox", { name: "Entity", exact: true })
      .fill("binary_sensor.wall_button");
    await page.getByRole("button", { name: "Analyze", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Export JSON" }),
    ).toBeVisible();
    await openAdvanced(page);
    const refs = keypadReferences();
    await page
      .locator("blast-radius-panel")
      .evaluate((panel: any, references) => {
        panel.report = {
          ...panel.report,
          uncertain_references: references,
          other_dashboard_references: [],
          unresolved_total: 34,
          review_summary: undefined,
        };
      }, refs);
    const uncertainty = page.locator(".uncertainty");
    const unresolvedScope = uncertainty
      .locator(".uncertainty-scope")
      .filter({ hasText: "Unresolved in direct sources" });
    await expect(unresolvedScope.locator(":scope > summary")).toContainText(
      "1 group · 9 locations",
    );
    await expect(unresolvedScope).not.toHaveAttribute("open", "");
    await expect(
      uncertainty.getByText(
        "Additional scanner diagnostics are available in Coverage.",
        { exact: true },
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "View coverage" }).click();
    const coverage = page.locator("#coverage");
    const deviceScope = coverage
      .locator(".uncertainty-scope")
      .filter({ hasText: "Device and selector context" });
    await expect(deviceScope.locator(":scope > summary")).toContainText(
      "2 groups · 25 locations",
    );
    await expect(deviceScope).not.toHaveAttribute("open", "");

    await unresolvedScope.locator(":scope > summary").click();
    await deviceScope.locator(":scope > summary").click();
    await expect(
      uncertainty.locator('[data-resolution="unresolved"]'),
    ).toHaveCount(1);
    await expect(coverage.locator('[data-resolution="device"]')).toHaveCount(2);
    await uncertainty.screenshot({
      path: `/tmp/blast-radius-compact-${mobile ? "mobile" : "desktop"}.png`,
    });
    for (const summary of await page.locator(".reason-group > summary").all())
      await summary.click();
    await expect(page.locator(".unresolved-row")).toHaveCount(34);
    await expect(coverage.locator(".selector-detail")).toHaveCount(2); // Identity once per group.
    await expect(
      coverage.locator('[data-resolution="device"] .badge.dynamic'),
    ).toHaveCount(0);
    await expect(
      coverage
        .getByText("Device identity does not establish an entity dependency", {
          exact: false,
        })
        .first(),
    ).toBeVisible();
    await expect(
      uncertainty.getByText("actions[0].choose[8].sequence[0].entity_id", {
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page
        .locator("blast-radius-panel")
        .evaluate((p) => p.scrollWidth <= p.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/blast-radius-grouped-${mobile ? "mobile" : "desktop"}.png`,
      fullPage: true,
    });
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export JSON" }).click();
    const stream = await (await downloadPromise).createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(chunk);
    const exported = JSON.parse(Buffer.concat(chunks).toString());
    expect(exported.uncertain_references).toEqual(
      JSON.parse(JSON.stringify(refs)),
    );
    await page
      .getByRole("tab", { name: "Raw references", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Needs review", exact: true })
      .click();
    await expect(page.locator("tbody tr")).toHaveCount(34);
    await expect(
      page.locator("tbody .badge").filter({ hasText: "Device reference" }),
    ).toHaveCount(25);
    await page.getByRole("button", { name: "Script", exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(0);
  });
}

test("missing and unchecked selectors remain visible with escaped identifiers", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await openAdvanced(page);
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const base = panel.report.uncertain_references[0];
    panel.report = {
      ...panel.report,
      uncertain_references: [false, null, true].map((exists, i) => ({
        ...base,
        path: `actions[${i}].target.area_id`,
        resolution: "selector",
        reason: "Unexpanded area_id target",
        selector: {
          kind: "area_id",
          value: "<img src=x onerror=alert(1)>",
          exists,
        },
      })),
    };
  });
  await page.getByRole("button", { name: "View coverage" }).click();
  const scope = page
    .locator("#coverage .uncertainty-scope")
    .filter({ hasText: "Device and selector context" });
  await scope.locator(":scope > summary").click();
  await expect(scope.locator(".reason-group")).toHaveCount(3);
  await expect(scope.locator(".registry-status")).toHaveText([
    "Identity not found",
    "Identity not checked",
    "Identity found",
  ]);
  for (const summary of await scope.locator(".reason-group > summary").all())
    await summary.click();
  await expect(scope.locator(".selector-detail img")).toHaveCount(0);
  await expect(scope.locator(".selector-detail").first()).toContainText(
    "this does not establish a broken target",
  );
});

test("unresolved locations are scoped to direct sources or wider graph context", () => {
  const reference: Reference = {
    source_id: "automation.wall_button",
    source_type: "automation",
    target: "binary_sensor.wall_button",
    path: "triggers[0].entity_id",
    confidence: "explicit",
    role: "read",
  };
  const unresolved: Reference = {
    ...reference,
    target: null,
    path: "actions[1].data.value",
    confidence: "dynamic",
    reason: "External template variable",
    resolution: "unresolved",
  };
  const report = {
    entity_id: "binary_sensor.wall_button",
    references: [reference],
    uncertain_references: [
      unresolved,
      { ...unresolved, source_id: "binary_sensor.wall_button" },
      { ...unresolved, source_id: "script.music_toggle" },
      {
        ...unresolved,
        source_id: "automation.wall_button",
        resolution: "device" as const,
      },
    ],
  };
  const { direct, related } = scopeUnresolvedReferences(report);
  expect(direct).toHaveLength(2);
  expect(related).toHaveLength(1);
  expect(related[0].source_id).toBe("script.music_toggle");
});

test("overview separates direct unknowns, wider context and scan coverage", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("binary_sensor.wall_button");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
  await openAdvanced(page);
  await page.locator("blast-radius-panel").evaluate((panel: any) => {
    const base = panel.report.uncertain_references[0];
    panel.report = {
      ...panel.report,
      uncertain_references: [
        {
          ...base,
          source_id: "automation.indicator",
          path: "actions[1].data.value",
        },
        {
          ...base,
          source_id: "script.music_toggle",
          path: "sequence[0].value_template",
        },
      ],
      other_dashboard_references: [],
      coverage: {
        ...panel.report.coverage,
        warnings: ["dashboard.home: configuration unavailable"],
      },
    };
  });
  const direct = page.locator(".uncertainty-scope.direct-context");
  const wider = page.locator(".uncertainty-scope.wider-context");
  await expect(direct.locator(":scope > summary")).toContainText(
    "1 group · 1 location",
  );
  await expect(wider.locator(":scope > summary")).toContainText(
    "1 group · 1 location",
  );
  await wider.locator(":scope > summary").click();
  await expect(wider).toContainText("not known to reference or react");
  await page.getByRole("button", { name: "Scan details →" }).click();
  await expect(page.locator("#coverage")).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Preview a change" }).click();
  await expect(page.locator(".change-preview")).toHaveAttribute("open", "");
  await expect(page.locator(".change-preview > summary")).toBeFocused();
});

test("selected configuration's own unknowns are direct even without incoming matches", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Entity", exact: true })
    .fill("automation.indicator");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await openAdvanced(page);
  await expect(page.locator(".uncertainty-scope.direct-context")).toContainText(
    "1 group · 1 location",
  );
  await expect(page.locator(".uncertainty-scope.wider-context")).toHaveCount(0);
});
