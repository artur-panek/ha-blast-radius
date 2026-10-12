import { LitElement, html, nothing, type PropertyValues } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { styles } from "./styles";
import { brandMark } from "./brand";
import {
  readablePath,
  explainReason,
  referencePurpose,
  sourceLabels,
  safeNavigationPath,
} from "./presentation";
import { sourceIcon } from "./icons";
import {
  readSession,
  writeSession,
  sessionKey,
  rememberSearch,
  type AnalysisTab,
  type RecentSearch,
  type SavedView,
} from "./session";
import {
  sourceTypes,
  matchesReference,
  visibleNodes,
  type SourceType,
  type ReviewFilter,
} from "./filters";
import { version } from "../package.json";
import {
  groupReviewReferences,
  reviewCounts,
  reviewLabel,
  reviewResolution,
  reviewRole,
} from "./review";
import type {
  Confidence,
  Entity,
  GraphNode,
  Hass,
  NavigationTarget,
  Reference,
  Report,
} from "./types";

const labels: Record<Confidence, string> = {
  explicit: "Explicit",
  template_literal: "Template literal",
  dynamic: "Dynamic",
  unknown: "Unclassified",
};

export class BlastRadiusPanel extends LitElement {
  static styles = styles;
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    entities: { state: true },
    query: { state: true },
    report: { state: true },
    loading: { state: true },
    error: { state: true },
    tab: { state: true },
    replacement: { state: true },
    depth: { state: true },
    status: { state: true },
    copyFallback: { state: true },
    recentSearches: { state: true },
    sourceFilters: { state: true },
    reviewFilters: { state: true },
  };
  declare hass: Hass;
  narrow = false;
  entities: Entity[] = [];
  query = "";
  report?: Report;
  loading = false;
  error = "";
  tab: AnalysisTab = "impact";
  recentSearches: RecentSearch[] = [];
  replacement = "";
  depth = 6;
  status = "";
  copyFallback = false;
  sourceFilters: SourceType[] = [];
  reviewFilters: ReviewFilter[] = [];
  private analyzedRoot = "";
  private initialized = false;
  private requestId = 0;
  private storageKey?: string;
  private lastView?: SavedView;
  private scrollTimer?: ReturnType<typeof setTimeout>;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("scroll", this.onScroll);
    window.addEventListener("pagehide", this.saveSession);
    this.requestUpdate();
  }

  disconnectedCallback() {
    clearTimeout(this.scrollTimer);
    this.saveSession();
    this.requestId++;
    this.initialized = false;
    this.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("pagehide", this.saveSession);
    super.disconnectedCallback();
  }

  private saveSession = () => {
    writeSession(this.storageKey, {
      recent: this.recentSearches,
      last: this.lastView,
    });
  };

  private rememberView(scrollTop = this.scrollTop) {
    if (!this.report) return;
    this.lastView = {
      entityId: this.report.entity_id,
      depth: this.report.graph.max_depth,
      tab: this.tab,
      scrollTop,
    };
    this.saveSession();
  }

  private onScroll = () => {
    if (!this.report || !this.lastView) return;
    this.lastView = { ...this.lastView, scrollTop: this.scrollTop };
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(this.saveSession, 150);
  };

  private reopenSearch(search: RecentSearch) {
    this.query = search.entityId;
    this.depth = search.depth;
    this.replacement = "";
    void this.run();
  }

  private async analyzeNode(entityId: string) {
    this.query = entityId;
    this.replacement = "";
    await this.run(undefined, 0);
    if (this.report?.entity_id !== entityId || !this.isConnected) return;
    await this.updateComplete;
    this.renderRoot
      .querySelector<HTMLElement>(".result-heading h2")
      ?.focus({ preventScroll: true });
  }

  private clearRecentSearches() {
    this.recentSearches = [];
    this.lastView = undefined;
    clearTimeout(this.scrollTimer);
    this.saveSession();
  }

  protected updated(changed: PropertyValues) {
    const key = sessionKey(this.hass?.user?.id);
    if (this.hass && (!this.initialized || key !== this.storageKey)) {
      this.initialized = true;
      this.storageKey = key;
      const saved = readSession(key);
      this.recentSearches = saved.recent;
      this.lastView = saved.last;
      this.query = saved.last?.entityId || "";
      this.depth = saved.last?.depth || 6;
      this.tab = saved.last?.tab || "impact";
      this.report = undefined;
      this.sourceFilters = [];
      this.reviewFilters = [];
      this.analyzedRoot = "";
      this.entities = [];
      this.replacement = "";
      this.status = "";
      this.copyFallback = false;
      void this.loadEntities();
    } else if (changed.has("tab") && this.lastView) {
      this.rememberView();
    }
  }

  private async loadEntities() {
    const id = ++this.requestId;
    this.loading = true;
    this.error = "";
    try {
      const result = await this.hass.callWS<{ entities: Entity[] }>({
        type: "blast_radius/entities",
      });
      if (id !== this.requestId) return;
      this.entities = result.entities;
      if (this.lastView && this.query === this.lastView.entityId) {
        await this.run(undefined, this.lastView.scrollTop);
      }
    } catch (error) {
      if (id === this.requestId) this.error = this.message(error);
    } finally {
      if (id === this.requestId) this.loading = false;
    }
  }

  private message(error: unknown): string {
    return error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "Connection failed. Try again.";
  }

  private changeQuery(event: Event) {
    this.query = (event.target as HTMLInputElement).value;
    this.requestId++;
    this.loading = false;
    this.report = undefined;
    this.error = "";
    this.status = "";
    this.copyFallback = false;
  }

  private async run(operation?: "rename" | "delete", restoreScroll?: number) {
    const entityId = this.query.trim();
    if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(entityId)) {
      this.error = "Enter an entity ID such as light.office.";
      return;
    }
    if (entityId !== this.analyzedRoot) {
      this.sourceFilters = [];
      this.reviewFilters = [];
      this.replacement = "";
    }
    this.analyzedRoot = entityId;
    const id = ++this.requestId;
    this.loading = true;
    this.error = "";
    this.status = "";
    this.copyFallback = false;
    try {
      this.report = undefined;
      const message: Record<string, unknown> = {
        type: operation ? "blast_radius/preview" : "blast_radius/analyze",
        entity_id: entityId,
        max_depth: this.depth,
      };
      if (operation) message.operation = operation;
      if (operation === "rename")
        message.new_entity_id = this.replacement.trim();
      const report = await this.hass.callWS<Report>(message);
      if (id === this.requestId) {
        this.report = report;
        this.recentSearches = rememberSearch(this.recentSearches, {
          entityId: report.entity_id,
          depth: report.graph.max_depth,
        });
        this.rememberView(restoreScroll ?? this.scrollTop);
      }
    } catch (error) {
      if (id === this.requestId) this.error = this.message(error);
    } finally {
      if (id === this.requestId) this.loading = false;
    }
    if (restoreScroll !== undefined && id === this.requestId && this.report) {
      await this.updateComplete;
      requestAnimationFrame(() => {
        if (id === this.requestId && this.isConnected)
          this.scrollTop = restoreScroll;
      });
    }
  }

  private async copy() {
    if (!this.report) return;
    try {
      await navigator.clipboard.writeText(this.report.markdown);
      this.status = "Markdown report copied.";
    } catch {
      this.copyFallback = true;
      this.status = "Clipboard unavailable. Select and copy the report below.";
    }
  }

  private download() {
    if (!this.report) return;
    const { markdown: _markdown, ...report } = this.report;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `blast-radius-${report.entity_id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.status = "JSON report downloaded.";
  }

  private badge(confidence: Confidence) {
    return html`<span class="badge ${confidence}">${labels[confidence]}</span>`;
  }

  private tabKeydown(event: KeyboardEvent) {
    const tabs = ["impact", "graph", "raw"] as const;
    let index = tabs.indexOf(this.tab);
    if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      index = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = tabs.length - 1;
    else return;
    event.preventDefault();
    this.tab = tabs[index];
    this.renderRoot
      .querySelector<HTMLButtonElement>(`#tab-${this.tab}`)
      ?.focus();
  }

  private sourceName(id: string) {
    return (
      this.report?.source_names?.[id] ||
      this.entities.find((entity) => entity.entity_id === id)?.name ||
      id
    );
  }

  private navigationTarget(id: string): NavigationTarget | undefined {
    if (this.report?.navigation) return this.report.navigation[id];
    return this.entities.some(
      (entity) => entity.entity_id === id && entity.exists,
    )
      ? { kind: "entity", entity_id: id }
      : undefined;
  }

  private openEntity(id: string) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private navigate(event: MouseEvent, path: string) {
    this.rememberView();
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    history.pushState(
      { from: location.pathname + location.search + location.hash },
      "",
      path,
    );
    window.dispatchEvent(
      new CustomEvent("location-changed", {
        detail: { replace: false },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private sourceControl(id: string, compact = false) {
    const target = this.navigationTarget(id);
    const text = compact ? "Open →" : this.sourceName(id);
    const className = compact ? "open-source" : "source-name";
    if (!target)
      return compact ? nothing : html`<span class=${className}>${text}</span>`;
    if (target.kind === "entity")
      return html`<button
        class=${className}
        aria-label=${`Open entity details: ${this.sourceName(id)}`}
        @click=${() => this.openEntity(id)}
      >
        ${text}
      </button>`;
    const path = safeNavigationPath(target);
    if (!path)
      return compact ? nothing : html`<span class=${className}>${text}</span>`;
    return html`<a
      class=${className}
      href=${path}
      aria-label=${`Open ${target.kind}: ${this.sourceName(id)}`}
      @click=${(event: MouseEvent) => this.navigate(event, path)}
      >${text}</a
    >`;
  }

  private references(
    refs: Reference[],
    unresolved = false,
    applyFilters = true,
  ) {
    const groups = new Map<string, Reference[]>();
    (applyFilters ? refs.filter(this.matchesFilter) : refs).forEach((ref) =>
      groups.set(ref.source_id, [...(groups.get(ref.source_id) || []), ref]),
    );
    return [...groups].map(
      ([source, references]) =>
        html`<article class="reference source-row" data-source=${source}>
          <div class="reference-title">
            <div class="source-heading">
              ${sourceIcon(references[0].source_type)}
              <div>
                <h3>${this.sourceControl(source)}</h3>
                <span class="source-meta"
                  >${sourceLabels[references[0].source_type] || references[0].source_type}
                  ·
                  ${unresolved ? reviewCounts(references) : this.referenceRoleSummary(references)}</span
                >
              </div>
            </div>
            ${this.sourceControl(source, true)}
          </div>
          ${
            unresolved
              ? this.unresolvedGroups(references)
              : html`${this.shouldShowPurpose(references) ? html`<p class="purpose">${referencePurpose(references)}</p>` : nothing}
                  ${references.some((ref) => ref.confidence !== "explicit") ? html`<span class="review-hint">Includes references to review</span>` : nothing}
                  <details class="technical">
                    <summary>Reference details (${references.length})</summary>
                    <code class="source-id">${source}</code>
                    ${references.map(
                      (ref) =>
                        html`<div class="technical-row">
                          <div class="path">
                            <span>${readablePath(ref.path)}</span
                            >${this.badge(ref.confidence)}
                          </div>
                          <code>${ref.path}</code>
                          ${ref.reason ? html`<p>${explainReason(ref.reason)}</p>` : nothing}
                        </div>`,
                    )}
                  </details>`
          }
        </article>`,
    );
  }

  private referenceRoleSummary(refs: Reference[]) {
    const roles = [...new Set(refs.map((ref) => ref.role))];
    if (roles.length !== 1)
      return `${refs.length} ${refs.length === 1 ? "reference" : "references"}`;
    const role = roles[0];
    return `${refs.length} ${role}${refs.length === 1 ? "" : "s"}`;
  }

  private shouldShowPurpose(refs: Reference[]) {
    const roles = [...new Set(refs.map((ref) => ref.role))];
    return (
      roles.length !== 1 || !["write", "call", "display"].includes(roles[0])
    );
  }

  private directConfidence(report: Report) {
    if (!report.references.length) return "No direct matches";
    const nonExplicit = report.references.filter(
      (ref) => ref.confidence !== "explicit",
    ).length;
    if (!nonExplicit) return "All direct refs explicit";
    return `${nonExplicit} of ${report.references.length} direct refs non-explicit`;
  }

  private referenceCategory(ref: Reference) {
    if (ref.role === "write") return "change";
    if (ref.role === "call") return "invoke";
    if (ref.role === "display" || ref.source_type === "dashboard")
      return "display";
    if (ref.role === "member") return "structural";
    if (
      ref.role === "read" ||
      /^(triggers?|wait_for_trigger)(\[|\.)/.test(ref.path)
    )
      return "read";
    return "other";
  }

  private directCategoryMeta(category: string) {
    const meta: Record<
      string,
      { title: string; description: string; badge: string }
    > = {
      change: {
        title: "Can change this entity",
        description:
          "Actions in these configurations target the selected entity.",
        badge: "changes",
      },
      invoke: {
        title: "Can invoke this entity",
        description:
          "These configurations call the selected script or actionable entity.",
        badge: "calls",
      },
      read: {
        title: "Reacts to or reads this entity",
        description:
          "Triggers, conditions or reads use this entity as input without directly changing it.",
        badge: "reads",
      },
      structural: {
        title: "Includes it structurally",
        description:
          "Groups or structural configuration include this entity without treating it as an action target.",
        badge: "memberships",
      },
      display: {
        title: "Displays it",
        description:
          "Dashboards or presentation config show the selected entity.",
        badge: "displays",
      },
      other: {
        title: "Other direct references",
        description:
          "Direct references that do not fit a known action, read or display role.",
        badge: "references",
      },
    };
    return meta[category] || meta.other;
  }

  private directCategories(report: Report) {
    const order = [
      "change",
      "invoke",
      "read",
      "display",
      "structural",
      "other",
    ];
    return order
      .map((category) => ({
        category,
        refs: report.references
          .filter(this.matchesFilter)
          .filter((ref) => this.referenceCategory(ref) === category),
      }))
      .filter(({ refs }) => refs.length);
  }

  private uniqueSources(refs: Reference[]) {
    return new Set(refs.map((ref) => ref.source_id)).size;
  }

  private directStats(report: Report) {
    const refs = report.references;
    const by = (...categories: string[]) =>
      refs.filter((ref) => categories.includes(this.referenceCategory(ref)));
    return {
      action: this.uniqueSources(by("change", "invoke")),
      change: this.uniqueSources(by("change")),
      invoke: this.uniqueSources(by("invoke")),
      observe: this.uniqueSources(by("read", "display")),
      read: this.uniqueSources(by("read")),
      display: this.uniqueSources(by("display")),
    };
  }

  private downstreamGroups(report: Report, applyFilters = true) {
    const nodes =
      applyFilters && this.filtersActive
        ? visibleNodes(report, this.matchesFilter)
        : report.graph.nodes;
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const directRefsBySource = new Map<string, Reference[]>();
    for (const ref of report.references) {
      directRefsBySource.set(ref.source_id, [
        ...(directRefsBySource.get(ref.source_id) || []),
        ref,
      ]);
    }

    const classifySource = (source: string) => {
      const refs = directRefsBySource.get(source) || [];
      const categories = new Set(
        refs.map((ref) => this.referenceCategory(ref)),
      );
      const reads = categories.has("read");
      const acts = categories.has("change") || categories.has("invoke");
      if (reads && acts) return "mixed";
      if (reads) return "reaction";
      if (acts) return "context";
      return "context";
    };

    const trace = (
      node: GraphNode,
    ):
      | { origin: string; kind: "output" | "reaction" | "mixed" | "context" }
      | undefined => {
      let current: GraphNode | undefined = node;
      const seen = new Set<string>();
      while (current?.via && !seen.has(current.id)) {
        seen.add(current.id);
        const parent = byId.get(current.via);
        if (!parent) return undefined;
        if (parent.id === report.entity_id)
          return { origin: report.entity_id, kind: "output" };
        if (
          parent.relationship === "dependent" &&
          parent.via === report.entity_id
        )
          return {
            origin: parent.id,
            kind: classifySource(parent.id),
          };
        current = parent;
      }
      return undefined;
    };

    const groups = new Map<
      string,
      {
        origin: string;
        kind: "output" | "reaction" | "mixed" | "context";
        items: GraphNode[];
      }
    >();
    for (const node of nodes.filter(
      (item) => item.relationship === "downstream",
    )) {
      const traced = trace(node);
      if (!traced) continue;
      const key = `${traced.kind}:${traced.origin}`;
      const current = groups.get(key) || { ...traced, items: [] };
      current.items.push(node);
      groups.set(key, current);
    }
    return [...groups.values()].sort((left, right) => {
      const order = { output: 0, reaction: 1, mixed: 2, context: 3 };
      return (
        order[left.kind] - order[right.kind] ||
        right.items.length - left.items.length
      );
    });
  }

  private downstreamStats(report: Report) {
    const groups = this.downstreamGroups(report, false);
    const count = (
      ...kinds: Array<"output" | "reaction" | "mixed" | "context">
    ) =>
      new Set(
        groups
          .filter((group) => kinds.includes(group.kind))
          .flatMap((group) => group.items.map((node) => node.id)),
      ).size;
    return {
      possible: count("output", "reaction", "mixed"),
      context: count("context"),
      mixed: count("mixed"),
    };
  }

  private impactNarrative(report: Report) {
    const stats = this.directStats(report);
    const downstream = this.downstreamStats(report);
    if (!report.references.length)
      return "No direct references were found in the inspected configuration.";

    const parts: string[] = [];
    if (stats.action)
      parts.push(
        `${stats.action} ${stats.action === 1 ? "source can" : "sources can"} change or invoke it`,
      );
    if (stats.read)
      parts.push(
        `${stats.read} ${stats.read === 1 ? "source reads or reacts to it" : "sources read or react to it"}`,
      );
    if (stats.display)
      parts.push(
        `${stats.display} ${stats.display === 1 ? "source displays it" : "sources display it"}`,
      );
    if (downstream.possible)
      parts.push(
        `${downstream.possible} possible downstream ${downstream.possible === 1 ? "node is" : "nodes are"} reachable`,
      );
    return `${parts.join("; ")}.`;
  }

  private unresolvedGroups(refs: Reference[]) {
    return groupReviewReferences(refs).map(
      ({ reference: ref, paths }) =>
        html` <details
          class="reason-group"
          data-resolution=${reviewResolution(ref)}
        >
          <summary>
            ${reviewLabel(ref)} · ${reviewRole(ref)}
            <span class="count"
              >${paths.length}
              ${paths.length === 1 ? "location" : "locations"}</span
            >
            ${ref.selector ? html`<span class="registry-status">${ref.selector.exists === true ? "Identity found" : ref.selector.exists === false ? "Identity not found" : "Identity not checked"}</span>` : nothing}
          </summary>
          <p>${explainReason(ref.reason)}</p>
          ${this.selectorDetail(ref)}
          ${
            !ref.selector
              ? html`<p>
                    Locations share a reason, not necessarily the same
                    expression or target.
                  </p>
                  ${this.badge(ref.confidence)}`
              : nothing
          }
          ${paths.map((path) => html`<div class="unresolved-row"><span>${readablePath(path)}</span><code>${path}</code></div>`)}
        </details>`,
    );
  }

  private uncertainty(report: Report) {
    const local = report.uncertain_references.filter(this.matchesFilter);
    const unresolvedLocal = local.filter(
      (ref) => reviewResolution(ref) === "unresolved",
    );
    const relatedContext = report.uncertain_references.filter(
      (ref) => reviewResolution(ref) !== "unresolved",
    );
    const elsewhere = report.other_dashboard_references || [];
    if (!unresolvedLocal.length && !relatedContext.length && !elsewhere.length)
      return nothing;
    return html`<section class="uncertainty" aria-label="Potential blind spots">
      ${
        unresolvedLocal.length
          ? html`<div class="section-heading">
                <div>
                  <h2>Potential blind spots</h2>
                  <p>
                    These unresolved expressions are inside configurations that
                    also reference this entity. They are not confirmed
                    dependencies.
                  </p>
                </div>
              </div>
              <details class="uncertainty-scope">
                <summary>
                  Unresolved in related configurations
                  <span class="count">${reviewCounts(unresolvedLocal)}</span>
                </summary>
                ${this.references(unresolvedLocal, true)}
              </details>`
          : nothing
      }
      ${
        relatedContext.length || elsewhere.length
          ? html`<div class="diagnostics-link">
              <span>
                Additional scanner diagnostics are available in Coverage.
              </span>
              <button @click=${this.showCoverage}>View coverage</button>
            </div>`
          : nothing
      }
    </section>`;
  }

  private coverageDiagnostics(report: Report) {
    const relatedContext = report.uncertain_references.filter(
      (ref) => reviewResolution(ref) !== "unresolved",
    );
    const elsewhere = report.other_dashboard_references || [];
    if (!relatedContext.length && !elsewhere.length) return nothing;
    return html`<div class="coverage-diagnostics">
      ${
        relatedContext.length
          ? html`<details class="uncertainty-scope secondary-context">
              <summary>
                Device and selector context
                <span class="count">${reviewCounts(relatedContext)}</span>
              </summary>
              <p>
                Device identities and unexpanded selectors from configurations
                linked to the selected entity. They do not establish an entity
                dependency.
              </p>
              ${this.references(relatedContext, true, false)}
            </details>`
          : nothing
      }
      ${
        elsewhere.length
          ? html`<details class="uncertainty-scope dashboard-context">
              <summary>
                System-wide dashboard diagnostics
                <span class="count">${reviewCounts(elsewhere)}</span>
              </summary>
              <p>
                Unresolved dashboard expressions elsewhere in Home Assistant.
                They are scanner context and are not attributed to the selected
                entity.
              </p>
              ${this.references(elsewhere, true, false)}
            </details>`
          : nothing
      }
    </div>`;
  }

  private get filtersActive() {
    return !!(this.sourceFilters.length || this.reviewFilters.length);
  }

  private matchesFilter = (ref: Reference) =>
    matchesReference(ref, this.sourceFilters, this.reviewFilters);

  private filters(report: Report) {
    const reviewLabels: Record<ReviewFilter, string> = {
      explicit: "Explicit",
      template_literal: "Template literal",
      review: "Needs review",
    };
    const count = report.references.filter(this.matchesFilter).length;
    return html`<details
      class="result-filters"
      role="region"
      aria-label="Result filters"
      .open=${this.filtersActive || this.tab !== "impact"}
    >
      <summary>
        Filter results
        ${this.filtersActive ? html`<span class="count">${count} visible</span>` : nothing}
      </summary>
      <div class="filter-body">
        <div role="group" aria-label="Source types" class="filter-row">
          <span class="filter-label">Sources</span>
          <button
            aria-pressed=${!this.sourceFilters.length}
            @click=${() => (this.sourceFilters = [])}
          >
            All sources
          </button>
          ${sourceTypes.map((kind) => html`<button aria-pressed=${this.sourceFilters.includes(kind)} @click=${() => (this.sourceFilters = this.sourceFilters.includes(kind) ? this.sourceFilters.filter((item) => item !== kind) : [...this.sourceFilters, kind])}>${sourceLabels[kind]}</button>`)}
        </div>
        <div role="group" aria-label="Reference confidence" class="filter-row">
          <span class="filter-label">Confidence</span>
          <button
            aria-pressed=${!this.reviewFilters.length}
            @click=${() => (this.reviewFilters = [])}
          >
            All confidence
          </button>
          ${(Object.keys(reviewLabels) as ReviewFilter[]).map((kind) => html`<button aria-pressed=${this.reviewFilters.includes(kind)} @click=${() => (this.reviewFilters = this.reviewFilters.includes(kind) ? this.reviewFilters.filter((item) => item !== kind) : [...this.reviewFilters, kind])}>${reviewLabels[kind]}</button>`)}
        </div>
        ${this.filtersActive ? html`<p class="filter-note" role="status">${count} of ${report.references.length} direct references visible. Exported reports still include the full analysis.</p>` : nothing}
      </div>
    </details>`;
  }

  private selectorDetail(ref: Reference) {
    if (!ref.selector) return nothing;
    const selector = ref.selector;
    return html`<p class="selector-detail">
      <strong
        >${selector.kind.replace("_id", "")}
        ${reviewResolution(ref) === "device" ? "reference" : "selector"}</strong
      >
      <code>${selector.value}</code>
      ${selector.exists === true ? "Identity found in HA registry." : selector.exists === false ? "Identity not found in HA registry; this does not establish a broken target." : "Registry identity not checked."}
      ${reviewResolution(ref) === "device" ? "Device identity does not establish an entity dependency or prove an action will run." : "Entity membership and runtime eligibility are not expanded."}
    </p>`;
  }

  private renderDirectRoleGroup(category: string, refs: Reference[]) {
    if (!refs.length) return nothing;
    const meta = this.directCategoryMeta(category);
    const sourceCount = this.uniqueSources(refs);
    return html`<section
      class="role-group role-${category}"
      aria-label=${meta.title}
    >
      <div class="role-heading">
        <div>
          <h3>${meta.title}</h3>
          <p>${meta.description}</p>
        </div>
        <span class="role-count"
          >${sourceCount} ${sourceCount === 1 ? "source" : "sources"} ·
          ${refs.length} ${meta.badge}</span
        >
      </div>
      <div class="source-grid">${this.references(refs)}</div>
    </section>`;
  }

  private downstreamGroupTitle(
    group: ReturnType<BlastRadiusPanel["downstreamGroups"]>[number],
  ) {
    if (group.kind === "output")
      return {
        title: "Direct outputs of this configuration",
        description:
          "Targets reached directly from the selected script, automation or scene.",
      };
    if (group.kind === "reaction")
      return {
        title: `${this.sourceName(group.origin)} can react downstream`,
        description:
          "This configuration reads the selected entity and can reach these nodes when its flow runs.",
      };
    if (group.kind === "mixed")
      return {
        title: `${this.sourceName(group.origin)} is a mixed read/write flow`,
        description:
          "This configuration both reads and changes the selected entity. Downstream nodes may depend on branch conditions; inspect the connection before assuming causality.",
      };
    return {
      title: `Co-targets in ${this.sourceName(group.origin)}`,
      description:
        "These nodes share a controller or flow with the selected entity. They are not downstream effects of the selected entity.",
    };
  }

  private renderDownstreamGroup(
    group: ReturnType<BlastRadiusPanel["downstreamGroups"]>[number],
    open = false,
  ) {
    const copy = this.downstreamGroupTitle(group);
    return html`<details class="flow-group flow-${group.kind}" .open=${open}>
      <summary>
        <span>
          <strong class="flow-source">${copy.title}</strong>
          <small>${copy.description}</small>
        </span>
        <span class="flow-count"
          >${group.items.length}
          ${group.items.length === 1 ? "node" : "nodes"}</span
        >
      </summary>
      <div class="flow-targets">
        ${group.items.map(
          (node) =>
            html`<div class="flow-target" data-source=${node.id}>
              <span>${this.sourceControl(node.id)}</span>
              <small
                >${node.depth} ${node.depth === 1 ? "step" : "steps"} away · via
                ${node.via ? this.sourceName(node.via) : "selected entity"}</small
              >
            </div>`,
        )}
      </div>
    </details>`;
  }

  private impact(report: Report) {
    const categories = new Map(
      this.directCategories(report).map(({ category, refs }) => [
        category,
        refs,
      ]),
    );
    const actionRefs = [
      ...(categories.get("change") || []),
      ...(categories.get("invoke") || []),
    ];
    const readRefs = categories.get("read") || [];
    const passive = ["display", "structural", "other"]
      .map((category) => ({
        category,
        refs: categories.get(category) || [],
      }))
      .filter(({ refs }) => refs.length);
    const downstreamGroups = this.downstreamGroups(report);
    const effectGroups = downstreamGroups.filter(
      (group) => group.kind !== "context",
    );
    const contextGroups = downstreamGroups.filter(
      (group) => group.kind === "context",
    );
    const downstream = this.downstreamStats(report);

    return html`${
      actionRefs.length
        ? html`<section class="impact-lane incoming-lane">
            <div class="section-heading">
              <div>
                <h2>What can change or invoke this entity</h2>
                <p>
                  These are incoming control paths. Start here before renaming,
                  removing or changing the entity.
                </p>
              </div>
              <span class="lane-badge incoming-badge">Incoming</span>
            </div>
            ${this.renderDirectRoleGroup("change", categories.get("change") || [])}
            ${this.renderDirectRoleGroup("invoke", categories.get("invoke") || [])}
          </section>`
        : nothing
    }
    ${
      readRefs.length
        ? html`<section class="impact-lane reaction-lane">
            <div class="section-heading">
              <div>
                <h2>What reads or reacts to this entity</h2>
                <p>
                  These configurations use the selected entity as input. Their
                  actions may run when triggers and conditions allow it.
                </p>
              </div>
              <span class="lane-badge reaction-badge">Reaction path</span>
            </div>
            ${this.renderDirectRoleGroup("read", readRefs)}
          </section>`
        : nothing
    }
    ${
      effectGroups.length
        ? html`<section class="impact-lane downstream-lane">
            <div class="section-heading">
              <div>
                <h2>What may be affected downstream</h2>
                <p>
                  Targets reached from the selected configuration itself or from
                  configurations that read it. This is the closest thing to an
                  outgoing blast radius, but conditions are not executed.
                </p>
              </div>
              <span class="lane-badge downstream-badge"
                >${downstream.possible} possible</span
              >
            </div>
            <div class="same-flow-list">
              ${effectGroups.map((group) =>
                this.renderDownstreamGroup(group, effectGroups.length === 1),
              )}
            </div>
          </section>`
        : nothing
    }
    ${
      passive.length
        ? html`<section class="impact-lane passive-lane">
            <div class="section-heading">
              <div>
                <h2>Other direct uses</h2>
                <p>
                  Display and structural references matter for rename/removal,
                  but do not represent control flow.
                </p>
              </div>
            </div>
            ${passive.map(({ category, refs }) =>
              this.renderDirectRoleGroup(category, refs),
            )}
          </section>`
        : nothing
    }
    ${
      contextGroups.length
        ? html`<details class="shared-context">
            <summary>
              Shared-flow context
              <span class="count"
                >${downstream.context}
                ${downstream.context === 1 ? "node" : "nodes"}</span
              >
            </summary>
            <p class="muted">
              These are co-targets in configurations that control the selected
              entity. They help explain the surrounding flow, but they are not
              things this entity causes to change.
            </p>
            <div class="same-flow-list">
              ${contextGroups.map((group) => this.renderDownstreamGroup(group))}
            </div>
          </details>`
        : nothing
    }
    ${
      !actionRefs.length &&
      !readRefs.length &&
      !passive.length &&
      !effectGroups.length
        ? html`<div class="empty">
            <div class="symbol">${brandMark()}</div>
            <h3>
              ${
                this.filtersActive
                  ? "No matching direct references"
                  : "No direct references found"
              }
            </h3>
            <p class="muted">
              ${
                this.filtersActive
                  ? "Clear the filters to show the complete dependency view."
                  : "Nothing in the inspected sources points directly to this entity. Check Coverage & diagnostics before changing it."
              }
            </p>
          </div>`
        : nothing
    }
    ${this.uncertainty(report)}`;
  }

  private showCoverage() {
    const details =
      this.renderRoot.querySelector<HTMLDetailsElement>("#coverage");
    if (!details) return;
    details.open = true;
    details.querySelector("summary")?.focus();
    details.scrollIntoView({ block: "start" });
  }

  private completeness(report: Report) {
    const limits = report.graph.limits_reached || [];
    const coverageWarnings = report.coverage.warnings || [];
    const sizeLimited = limits.includes("nodes") || limits.includes("edges");
    const nextDepth = [1, 2, 3, 4, 6, 8, 12].find(
      (depth) => depth > report.graph.max_depth,
    );

    if (report.graph.truncated) {
      return html`<section
        class="notice incomplete"
        role="status"
        aria-label="Analysis limits reached"
      >
        <h3>Analysis limits reached</h3>
        ${limits.includes("depth") ? html`<p>The dependency map reached depth ${report.graph.max_depth}. More related nodes may exist beyond this depth.</p>` : nothing}
        ${sizeLimited ? html`<p>The dependency map reached its ${limits.includes("nodes") ? "node" : "edge"} limit. Increasing depth will not remove this cap.</p>` : nothing}
        ${!limits.length ? html`<p>The dependency map reached a depth or size limit. More related nodes may exist.</p>` : nothing}
        <div class="controls">
          ${
            limits.includes("depth") && !sizeLimited && nextDepth
              ? html`<button
                  ?disabled=${this.loading}
                  @click=${() => {
                    this.depth = nextDepth;
                    void this.run();
                  }}
                >
                  Inspect to depth ${nextDepth}
                </button>`
              : nothing
          }
          <button @click=${this.showCoverage}>Coverage details</button>
        </div>
      </section>`;
    }

    if (!coverageWarnings.length) return nothing;

    return html`<section
      class="coverage-status"
      role="status"
      aria-label="Static coverage partial"
    >
      <div>
        <strong>Static coverage: partial</strong>
        <p>
          ${
            this.directConfidence(report) === "High confidence"
              ? "Direct matches are high confidence. "
              : ""
          }
          Some Home Assistant configuration cannot be fully inspected
          statically.
        </p>
      </div>
      <button @click=${this.showCoverage}>Coverage details</button>
    </section>`;
  }

  private graph(report: Report) {
    const nodes = this.filtersActive
      ? visibleNodes(report, this.matchesFilter)
      : report.graph.nodes;
    const edges = report.graph.edges.filter(this.matchesFilter);
    const selected = nodes.find((node) => node.relationship === "selected")!;
    const dependents = nodes.filter(
      (node) => node.relationship === "dependent",
    );
    const downstreamGroups = this.downstreamGroups(report);
    const effectIds = new Set(
      downstreamGroups
        .filter((group) => group.kind !== "context")
        .flatMap((group) => group.items.map((node) => node.id)),
    );
    const contextIds = new Set(
      downstreamGroups
        .filter((group) => group.kind === "context")
        .flatMap((group) => group.items.map((node) => node.id)),
    );
    const effects = nodes.filter(
      (node) => node.relationship === "downstream" && effectIds.has(node.id),
    );
    const context = nodes.filter(
      (node) => node.relationship === "downstream" && contextIds.has(node.id),
    );

    return html`<div class="section-heading">
        <div>
          <h2>Relationship map</h2>
          <p>
            Separate dependency paths from real or possible downstream paths.
            Shared-flow co-targets are kept apart so they cannot be mistaken for
            effects of the selected entity.
          </p>
        </div>
      </div>
      ${this.filtersActive ? html`<p class="filter-note">Showing ${nodes.length - 1} of ${report.graph.nodes.length - 1} linked nodes. Paths may pass through hidden configurations; filtering does not recalculate the graph.</p>` : nothing}
      <div class="graph-direction">
        <span
          ><strong>Incoming / dependent:</strong> configurations that directly
          reference this entity or lead to one that does</span
        >
        <span
          ><strong>Possible downstream:</strong> outputs of the selected
          configuration or targets reached through readers/reactors</span
        >
      </div>
      <div class="tree dependency-map">
        <div class="map-selected">
          <span class="map-label">Selected entity</span
          >${this.graphNode(selected)}
        </div>
        <div class="map-columns">
          <section class="map-group incoming-group">
            <h3>
              Dependency paths
              <span class="count">${dependents.length}</span>
            </h3>
            <p class="muted">
              Direct references plus chained callers or dependents that can lead
              to them.
            </p>
            ${
              dependents.length
                ? dependents.map((node) => this.graphNode(node))
                : html`<p>
                    ${this.filtersActive ? "No matching dependency paths. Clear filters to restore the full map." : "No dependency paths found."}
                  </p>`
            }
          </section>
          <section class="map-group effect-group">
            <h3>
              Possible downstream
              <span class="count">${effects.length}</span>
            </h3>
            <p class="muted">
              Nodes reachable from the selected configuration itself or through
              configurations that read it. Conditions are not executed.
            </p>
            ${
              effects.length
                ? effects.map((node) => this.graphNode(node))
                : html`<p>No downstream reaction or output path found.</p>`
            }
          </section>
        </div>
      </div>
      ${
        context.length
          ? html`<details class="graph-context">
              <summary>
                Shared-flow context
                <span class="count">${context.length}</span>
              </summary>
              <p class="muted">
                These nodes are co-targets in configurations that control the
                selected entity. They are shown for context and are not outputs
                of the selected entity.
              </p>
              <div class="graph-context-grid">
                ${context.map((node) => this.graphNode(node))}
              </div>
            </details>`
          : nothing
      }
      ${report.graph.cycles.length ? html`<div class="notice">Cycles detected. Nodes are shown once.${report.graph.cycles.map((cycle) => html`<p><code>${cycle.join(" → ")}</code></p>`)}</div>` : nothing}
      <details>
        <summary>
          ${edges.length} visible graph edges / ${report.graph.edges.length}
          total
        </summary>
        ${edges.map((edge) => html`<div class="edge"><strong>${this.sourceName(edge.source_id)} → ${this.sourceName(edge.target!)}</strong><code>${edge.source_id} → ${edge.target}</code><code>${edge.path}</code><span class="badge">${edge.role}</span> ${this.badge(edge.confidence)}</div>`)}
      </details>`;
  }

  private graphNode(node: GraphNode) {
    const kind = node.id.split(".")[0];
    return html`<article
      class="graph-node ${node.relationship}"
      data-source=${node.id}
    >
      <div class="reference-title">
        <div class="source-heading">
          ${sourceIcon(kind)}
          <div>
            <h3>${this.sourceControl(node.id)}</h3>
            <span class="source-meta"
              >${sourceLabels[kind] || kind.replaceAll("_", " ")}${node.depth ? ` · ${node.depth} ${node.depth === 1 ? "step" : "steps"} away` : ""}</span
            >
          </div>
        </div>
        <div class="node-actions">
          ${this.sourceControl(node.id, true)}
          ${/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(node.id) ? html`<button class="analyze-node" aria-label=${`Analyze this: ${node.id}`} @click=${() => this.analyzeNode(node.id)}>Analyze this</button>` : nothing}
        </div>
      </div>
      ${node.via ? html`<p class="via">${node.relationship === "dependent" ? "Dependency path through" : "Reached through"} ${this.sourceControl(node.via)}</p>` : nothing}
      <details class="technical">
        <summary>${node.path ? "Connection details" : "Entity ID"}</summary>
        <code class="source-id">${node.id}</code>
        ${
          node.path
            ? html`<div class="technical-row">
                <div class="path">
                  <span>${readablePath(node.path)}</span
                  >${node.confidence ? this.badge(node.confidence) : nothing}
                </div>
                <code>${node.path}</code>
              </div>`
            : nothing
        }
      </details>
    </article>`;
  }

  private raw(report: Report) {
    const refs = [
      ...report.references,
      ...report.uncertain_references,
      ...(report.other_dashboard_references || []),
    ].filter(this.matchesFilter);
    return html`<h2>Raw references</h2>
      ${!refs.length ? html`<p>No matching references. Try All sources or All confidence.</p>` : nothing}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Source / path</th>
              <th>Role</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${refs.map(
              (ref) =>
                html`<tr>
                  <td>
                    ${this.sourceControl(ref.source_id)}<code
                      >${ref.source_id}<br />${ref.path}</code
                    >
                  </td>
                  <td>${ref.role}</td>
                  <td>
                    ${ref.selector ? html`<span class="badge">${reviewLabel(ref)}</span>` : this.badge(ref.confidence)}${ref.reason ? html`<p>${explainReason(ref.reason)}</p>` : nothing}${this.selectorDetail(ref)}
                  </td>
                </tr>`,
            )}
          </tbody>
        </table>
      </div>`;
  }

  protected render() {
    const report = this.report;
    const suggestions = this.entities
      .filter((e) =>
        `${e.entity_id} ${e.name}`
          .toLowerCase()
          .includes(this.query.toLowerCase()),
      )
      .slice(0, 80);
    return html`<header>
        <button
          class="menu"
          aria-label="Open sidebar"
          @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }))}
        >
          ☰
        </button>
        <div class="brand-lockup">
          ${brandMark()}<strong>HA Blast Radius</strong>
        </div>
        <span class="badge"
          >READ ONLY<span class="release-label"> · α ${version}</span></span
        >
      </header>
      <main>
        <h1>Dependency impact</h1>
        <p class="muted intro">
          See what references an entity before you rename or remove it.
        </p>
        <form
          class="search"
          @submit=${(event: Event) => {
            event.preventDefault();
            void this.run();
          }}
        >
          <label
            >Entity<input
              aria-label="Entity"
              placeholder="Search or enter an entity ID…"
              list="entities"
              .value=${this.query}
              @input=${this.changeQuery}
              autocomplete="off"
              spellcheck="false"
          /></label>
          <datalist id="entities">
            ${suggestions.map((e) => html`<option value=${e.entity_id}>${e.name}${e.exists ? "" : " · missing"}</option>`)}
          </datalist>
          <button
            class="primary"
            ?disabled=${this.loading || !this.query.trim()}
          >
            ${this.loading ? "Inspecting…" : "Analyze"}
          </button>
        </form>
        <details class="analysis-options">
          <summary>Analysis options</summary>
          <div class="analysis-options-body">
            <label class="depth"
              >Traversal depth<select
                aria-label="Traversal depth"
                .value=${String(this.depth)}
                @change=${(e: Event) => {
                  this.depth = Number((e.target as HTMLSelectElement).value);
                  if (this.report) void this.run();
                }}
              >
                ${[1, 2, 3, 4, 6, 8, 12].map((n) => html`<option value=${n} ?selected=${n === this.depth}>${n}</option>`)}
              </select></label
            >
            <p class="muted">
              Higher depth expands the surrounding dependency graph. Direct
              references do not depend on traversal depth.
            </p>
          </div>
        </details>
        ${
          this.recentSearches.length
            ? html`<section
                class="recent-searches"
                aria-label="Recent searches"
              >
                <span class="recent-label">Recent</span>
                <div class="recent-list">
                  ${repeat(
                    this.recentSearches,
                    (search) => search.entityId,
                    (search) =>
                      html`<button
                        class="recent-search"
                        title=${`${search.entityId} · depth ${search.depth}`}
                        aria-label=${`Analyze again: ${search.entityId}`}
                        aria-pressed=${this.report?.entity_id === search.entityId}
                        @click=${() => this.reopenSearch(search)}
                      >
                        ${this.sourceName(search.entityId)}
                      </button>`,
                  )}
                </div>
                <button
                  class="clear-recent"
                  aria-label="Clear recent searches"
                  @click=${this.clearRecentSearches}
                >
                  Clear
                </button>
              </section>`
            : nothing
        }
        ${this.loading ? html`<progress aria-label="Inspecting configuration"></progress>` : nothing}
        ${
          this.error
            ? html`<div role="alert" class="notice error">
                ${this.error}
                <div class="controls">
                  <button
                    @click=${() => (this.query ? this.run() : this.loadEntities())}
                  >
                    Retry
                  </button>
                </div>
              </div>`
            : nothing
        }
        ${
          report
            ? html`
                <div class="result-heading">
                  <div>
                    <h2 tabindex="-1">${this.sourceName(report.entity_id)}</h2>
                    <code>${report.entity_id}</code>
                  </div>
                  <div class="result-badges" aria-label="Analysis summary">
                    <span class="summary-pill"
                      >${this.directConfidence(report)}</span
                    >
                  </div>
                </div>
                ${!report.exists ? html`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>` : nothing}
                ${report.graph.truncated ? this.completeness(report) : nothing}
                <section class="impact-summary" aria-label="Impact summary">
                  <div class="impact-verdict">
                    <span class="eyebrow">At a glance</span>
                    <strong>
                      ${
                        report.summary.sources
                          ? `${report.summary.sources} direct ${report.summary.sources === 1 ? "source" : "sources"}`
                          : "No direct usage found"
                      }
                    </strong>
                    <p>${this.impactNarrative(report)}</p>
                  </div>
                  <div class="impact-metrics semantic-metrics">
                    <div>
                      <strong>${this.directStats(report).action}</strong>
                      <span>sources can change / invoke</span>
                    </div>
                    <div>
                      <strong>${this.directStats(report).read}</strong>
                      <span>sources read / react</span>
                    </div>
                    <div>
                      <strong>${this.downstreamStats(report).possible}</strong>
                      <span>possible downstream nodes</span>
                    </div>
                    <div>
                      <strong>${this.directStats(report).display}</strong>
                      <span>display sources</span>
                    </div>
                  </div>
                </section>
                ${
                  this.downstreamStats(report).context
                    ? html`<div class="summary-context-note">
                        <strong>${this.downstreamStats(report).context}</strong>
                        ${
                          this.downstreamStats(report).context === 1
                            ? "additional node is"
                            : "additional nodes are"
                        }
                        shared-flow context only — useful for understanding the
                        surrounding controller, not an outgoing effect of the
                        selected entity.
                      </div>`
                    : nothing
                }
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${(["impact", "graph", "raw"] as const).map((tab) => html`<button role="tab" id=${`tab-${tab}`} aria-controls="analysis-view" aria-selected=${this.tab === tab} tabindex=${this.tab === tab ? 0 : -1} @keydown=${this.tabKeydown} @click=${() => (this.tab = tab)}>${tab === "impact" ? "Overview" : tab === "graph" ? "Relationship map" : "Raw references"}</button>`)}
                    </nav>
                    ${this.filters(report)}
                    <div
                      role="tabpanel"
                      id="analysis-view"
                      aria-labelledby=${`tab-${this.tab}`}
                    >
                      ${this.tab === "impact" ? this.impact(report) : this.tab === "graph" ? this.graph(report) : this.raw(report)}
                    </div>
                    <div class="controls">
                      <button @click=${this.copy}>Copy Markdown</button
                      ><button @click=${this.download}>Export JSON</button
                      ><button
                        ?disabled=${this.loading}
                        @click=${() => this.run()}
                      >
                        Refresh snapshot
                      </button>
                    </div>
                    <a
                      class="issue-link"
                      href="https://github.com/artur-panek/ha-blast-radius/issues/new?template=bug.yml"
                      target="_blank"
                      rel="noopener noreferrer"
                      >Report issue ↗</a
                    >
                    <p class="status" role="status">${this.status}</p>
                    ${this.copyFallback ? html`<textarea aria-label="Markdown report" readonly .value=${report.markdown}></textarea>` : nothing}
                  </section>
                  <details
                    class="card change-preview"
                    .open=${!!report.preview}
                  >
                    <summary>Preview a change</summary>
                    <div class="preview-form">
                      <h2>Change preview</h2>
                      <p class="muted">
                        See which references need attention before making a
                        change.
                      </p>
                      <label
                        >New entity ID<input
                          aria-label="New entity ID"
                          .value=${this.replacement}
                          placeholder=${report.entity_id}
                          @input=${(e: Event) => (this.replacement = (e.target as HTMLInputElement).value)}
                          spellcheck="false"
                      /></label>
                      <button
                        ?disabled=${this.loading || !this.replacement.trim()}
                        @click=${() => this.run("rename")}
                      >
                        Preview rename</button
                      ><button
                        ?disabled=${this.loading}
                        @click=${() => this.run("delete")}
                      >
                        Preview removal
                      </button>
                      ${
                        report.preview
                          ? html`<div class="preview" role="status">
                              <h3>
                                ${report.preview.operation === "rename" ? "Rename preview" : "Removal preview"}
                              </h3>
                              <code>${report.entity_id}</code
                              >${report.preview.new_entity_id ? html`<code>→ ${report.preview.new_entity_id}</code>` : nothing}
                              <ul>
                                ${Object.entries(report.preview.affected_sources).map(([kind, count]) => html`<li>${count} ${kind} source${count === 1 ? "" : "s"}</li>`)}
                              </ul>
                              <p>${report.preview.note}</p>
                              <strong>No changes have been made.</strong>
                            </div>`
                          : nothing
                      }
                      <p class="muted">
                        Analysis only. No configuration is written.
                      </p>
                    </div>
                  </details>
                </div>
                <details class="card" id="coverage">
                  <summary>
                    Coverage & diagnostics · ${report.coverage.sources} sources
                    inspected${report.coverage.warnings?.length ? " · partial" : ""}
                  </summary>
                  <p class="muted">
                    ${Object.entries(report.coverage.source_types)
                      .map(([kind, count]) => `${count} ${kind}`)
                      .join(" · ")}
                  </p>
                  <ul>
                    ${report.warnings.map((warning) => html`<li>${warning}</li>`)}
                    <li>
                      ${report.unresolved_total} locations without an entity
                      target across the full snapshot. These include device IDs,
                      selectors and expressions; they cannot be attributed to
                      this entity.
                    </li>
                    <li>
                      ${reviewCounts(report.uncertain_references)} in linked
                      configurations or cards;
                      ${reviewCounts(report.other_dashboard_references || [])}
                      elsewhere in linked dashboards. Groups summarize repeated
                      reasons and selector identities, not a count of affected
                      entities.
                    </li>
                    ${report.review_summary?.snapshot.locations === report.unresolved_total ? html`<li>Full snapshot: ${report.review_summary.snapshot.device_locations} device-reference locations · ${report.review_summary.snapshot.selector_locations} unexpanded-selector locations · ${report.review_summary.snapshot.unresolved_locations} dynamic or unrecognized locations.</li>` : nothing}
                    <li>
                      Conditional branches are not evaluated. A reference does
                      not prove an action will run.
                    </li>
                  </ul>
                  ${this.coverageDiagnostics(report)}
                  <details class="confidence-help">
                    <summary>Reference confidence</summary>
                    <ul>
                      <li>
                        <strong>Explicit:</strong> an entity ID in a recognized
                        configuration field.
                      </li>
                      <li>
                        <strong>Template literal:</strong> visible in Jinja, but
                        execution is not guaranteed.
                      </li>
                      <li>
                        <strong>Dynamic:</strong> a target that cannot be
                        resolved statically.
                      </li>
                      <li>
                        <strong>Unclassified:</strong> a candidate in a field
                        with unknown semantics, or HA-native metadata without a
                        verified location and role.
                      </li>
                    </ul>
                  </details>
                </details>
                <div class="foot">
                  <span
                    >Fresh snapshot:
                    ${new Date(report.snapshot_at).toLocaleString()}</span
                  ><span
                    >Static configuration analysis · No changes applied</span
                  >
                </div>
              `
            : !this.loading && !this.error
              ? html`<section class="card empty">
                  <div class="symbol">${brandMark()}</div>
                  <h2>Start with one entity</h2>
                  <p class="muted">
                    A button, a helper, an old light.<br />Find out what points
                    to it and what sits downstream.
                  </p>
                  <p class="muted">
                    ${this.entities.length} entity IDs available · Missing IDs
                    can be entered manually
                  </p>
                </section>`
              : nothing
        }
      </main>`;
  }
}

if (!customElements.get("blast-radius-panel"))
  customElements.define("blast-radius-panel", BlastRadiusPanel);
