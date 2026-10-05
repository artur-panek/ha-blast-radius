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

  private referenceRoleSummary(references: Reference[]) {
    const names: Record<string, [string, string]> = {
      read: ["read", "reads"],
      write: ["write", "writes"],
      display: ["display", "displays"],
      call: ["call", "calls"],
      member: ["membership", "memberships"],
    };
    const counts = new Map<string, number>();
    for (const ref of references)
      counts.set(ref.role, (counts.get(ref.role) || 0) + 1);
    return [...counts]
      .map(([role, count]) => {
        const [single, plural] = names[role] || [role, `${role}s`];
        return `${count} ${count === 1 ? single : plural}`;
      })
      .join(" · ");
  }

  private impactScope(report: Report) {
    const sources = report.summary.sources;
    if (!sources) return { label: "No direct usage", tone: "none" };
    if (sources <= 2) return { label: "Narrow impact", tone: "low" };
    if (sources <= 4) return { label: "Moderate impact", tone: "medium" };
    return { label: "Broad impact", tone: "high" };
  }

  private confidenceSummary(report: Report) {
    const needsReview = report.references.some(
      (ref) => ref.confidence === "dynamic" || ref.confidence === "unknown",
    );
    if (needsReview) return { label: "Needs review", tone: "review" };
    if (report.references.some((ref) => ref.confidence === "template_literal"))
      return { label: "Mixed confidence", tone: "mixed" };
    return { label: "High confidence", tone: "good" };
  }
  private references(refs: Reference[], unresolved = false) {
    const groups = new Map<string, Reference[]>();
    refs
      .filter(this.matchesFilter)
      .forEach((ref) =>
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
              : html`<p class="purpose">${referencePurpose(references)}</p>
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
    const elsewhere = (report.other_dashboard_references || []).filter(
      this.matchesFilter,
    );
    const dynamicLocal = local.filter(
      (ref) => reviewResolution(ref) !== "device",
    );
    const deviceLocal = local.filter(
      (ref) => reviewResolution(ref) === "device",
    );
    if (!dynamicLocal.length && !deviceLocal.length && !elsewhere.length)
      return nothing;
    return html`<section class="uncertainty" aria-label="Potential blind spots">
      <div class="section-heading">
        <div>
          <h2>Potential blind spots</h2>
          <p>
            These are scanner limits around configurations already linked to
            this result. They are not additional direct references to the
            selected entity.
          </p>
        </div>
      </div>
      ${
        dynamicLocal.length
          ? html`<details class="uncertainty-scope">
              <summary>
                Dynamic or unexpanded in linked configurations
                <span class="count">${reviewCounts(dynamicLocal)}</span>
              </summary>
              <p>
                Expressions or selectors inside linked configurations could not
                be resolved to a fixed entity target.
              </p>
              ${this.references(dynamicLocal, true)}
            </details>`
          : nothing
      }
      ${
        deviceLocal.length
          ? html`<details class="uncertainty-scope device-context">
              <summary>
                Device references in linked configurations
                <span class="count">${reviewCounts(deviceLocal)}</span>
              </summary>
              <p>
                Device IDs are shown for context. A device identity alone does
                not establish a dependency on this entity.
              </p>
              ${this.references(deviceLocal, true)}
            </details>`
          : nothing
      }
      ${
        elsewhere.length
          ? html`<details class="uncertainty-scope dashboard-context">
              <summary>
                Elsewhere in linked dashboards
                <span class="count">${reviewCounts(elsewhere)}</span>
              </summary>
              <p>
                Dynamic dashboard expressions outside cards with known links.
                They are scanner diagnostics, not impact attributed to this
                entity.
              </p>
              ${this.references(elsewhere, true)}
            </details>`
          : nothing
      }
    </section>`;
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
      aria-label="Result filters"
      .open=${this.filtersActive}
    >
      <summary>
        Filters
        <span class="count">${count}/${report.references.length} direct refs</span>
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
        <p class="filter-note" role="status">
          Filters affect visible cards and graph connections only. Full totals,
          coverage and exports stay unchanged.
        </p>
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

  private impact(report: Report) {
    const refs = report.references.filter(this.matchesFilter);
    const sourceCount = new Set(refs.map((ref) => ref.source_id)).size;
    return html`<div class="section-heading">
        <div>
          <h2>Direct impact</h2>
          <p>Configurations with a known reference to this entity.</p>
        </div>
        <span class="badge"
          >${sourceCount} visible ${sourceCount === 1 ? "source" : "sources"}</span
        >
      </div>
      ${
        refs.length
          ? html`<div class="source-grid">${this.references(refs)}</div>`
          : html`<div class="empty compact-empty">
              <div class="symbol">${brandMark()}</div>
              <h3>
                ${this.filtersActive ? "No matching direct references" : "No direct references found"}
              </h3>
              <p class="muted">
                ${this.filtersActive ? "Try All sources or All confidence to show more results. Full totals and exports are unchanged." : "Nothing in the inspected sources points to this entity. Check coverage and blind spots before changing it."}
              </p>
            </div>`
      }
      ${
        report.summary.downstream
          ? html`<section class="indirect-callout">
              <div>
                <strong>${report.summary.downstream} related downstream ${report.summary.downstream === 1 ? "node" : "nodes"}</strong>
                <p>
                  These are connected through the configurations above. They
                  provide topology context and are not guaranteed to break if
                  this entity changes.
                </p>
              </div>
              <button @click=${() => (this.tab = "graph")}>View graph →</button>
            </section>`
          : nothing
      }
      ${this.uncertainty(report)}
      <details class="confidence-help">
        <summary>How to read confidence</summary>
        <ul>
          <li>
            <strong>Explicit:</strong> an entity ID in a recognized
            configuration field.
          </li>
          <li>
            <strong>Template literal:</strong> visible in Jinja, but execution
            is not guaranteed.
          </li>
          <li>
            <strong>Dynamic:</strong> a target that cannot be resolved
            statically.
          </li>
          <li>
            <strong>Unclassified:</strong> a candidate in a field with unknown
            semantics, or HA-native metadata without a verified location and
            role.
          </li>
        </ul>
      </details>`;
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
    if (!report.graph.truncated) return nothing;
    const sizeLimited = limits.includes("nodes") || limits.includes("edges");
    const nextDepth = [1, 2, 3, 4, 6, 8, 12].find(
      (depth) => depth > report.graph.max_depth,
    );
    return html`<section
      class="notice incomplete"
      role="status"
      aria-label="Dependency map limited"
    >
      <h3>Dependency map limited</h3>
      ${limits.includes("depth") ? html`<p>The dependency map reached depth ${report.graph.max_depth}. More related nodes may exist beyond this depth.</p>` : nothing}
      ${sizeLimited ? html`<p>The dependency map reached its ${limits.includes("nodes") ? "node" : "edge"} limit. Increasing depth will not remove this cap.</p>` : nothing}
      ${report.graph.truncated && !limits.length ? html`<p>The dependency map reached a traversal limit. More related nodes may exist.</p>` : nothing}
      <p>
        Direct-reference counts remain the references that were found. This
        warning applies to graph traversal beyond them.
      </p>
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
      </div>
    </section>`;
  }

  private coverageStatus(report: Report) {
    const warnings = report.coverage.warnings || [];
    if (!warnings.length) return nothing;
    return html`<div class="coverage-inline" role="note">
      <span>
        <strong>Static coverage is partial.</strong>
        ${warnings.length}
        ${warnings.length === 1 ? "source warning" : "source warnings"} reported.
      </span>
      <button class="link-button" @click=${this.showCoverage}>
        Coverage details
      </button>
    </div>`;
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
    const downstream = nodes.filter(
      (node) => node.relationship === "downstream",
    );
    return html`<h2>Dependency map</h2>
      <p class="muted">
        Read from the selected entity to its linked configurations and their
        targets. Conditions are not evaluated; these links do not prove an
        action will run.
      </p>
      ${this.filtersActive ? html`<p class="filter-note">Showing ${nodes.length - 1} of ${report.graph.nodes.length - 1} linked nodes. Paths may pass through hidden configurations; filtering does not recalculate the graph.</p>` : nothing}
      <div class="tree dependency-map">
        <div class="map-selected">
          <span class="map-label">Selected entity</span
          >${this.graphNode(selected)}
        </div>
        <div class="map-columns">
          <section class="map-group">
            <h3>Used by <span class="count">${dependents.length}</span></h3>
            <p class="muted">
              Configurations that reference the selected entity, directly or
              through another configuration.
            </p>
            ${dependents.length ? dependents.map((node) => this.graphNode(node)) : html`<p>${this.filtersActive ? "No matching linked configurations. Try All sources or All confidence." : "No linked configurations found."}</p>`}
          </section>
          <section class="map-group">
            <h3>
              Possible targets <span class="count">${downstream.length}</span>
            </h3>
            <p class="muted">
              Action and membership targets reached through those
              configurations.
            </p>
            ${downstream.length ? downstream.map((node) => this.graphNode(node)) : html`<p>${this.filtersActive ? "No matching possible targets. Try All sources or All confidence." : "No downstream targets found."}</p>`}
          </section>
        </div>
      </div>
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
      ${node.via ? html`<p class="via">${node.relationship === "dependent" ? "References" : "Target of"} ${this.sourceControl(node.via)}</p>` : nothing}
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
    const scope = report
      ? this.impactScope(report)
      : { label: "", tone: "none" };
    const confidence = report
      ? this.confidenceSummary(report)
      : { label: "", tone: "good" };
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
        <h1>Entity dependencies</h1>
        <p class="muted intro">
          Inspect references before renaming or removing an entity.
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
        <details class="analysis-options">
          <summary>
            Analysis options <span>Depth ${this.depth}</span>
          </summary>
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
              Controls how far the dependency graph follows linked
              configurations. Direct-reference scanning is unchanged.
            </p>
          </div>
        </details>
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
                  <div class="result-identity">
                    <span class="eyebrow">Selected entity</span>
                    <h2 tabindex="-1">${this.sourceName(report.entity_id)}</h2>
                    <code>${report.entity_id}</code>
                  </div>
                  <div class="result-badges">
                    <span class="summary-chip impact-${scope.tone}"
                      >${scope.label}</span
                    >
                    <span class="summary-chip confidence-${confidence.tone}"
                      >${confidence.label}</span
                    >
                  </div>
                </div>
                ${!report.exists ? html`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>` : nothing}
                ${this.completeness(report)}
                <section class="impact-summary" aria-label="Impact summary">
                  <div class="impact-primary">
                    <strong>${report.summary.sources}</strong>
                    <div>
                      <b>
                        ${report.summary.sources === 1 ? "configuration uses" : "configurations use"}
                        this entity
                      </b>
                      <span>
                        Known references in the inspected Home Assistant
                        configuration.
                      </span>
                    </div>
                  </div>
                  <div class="impact-metrics">
                    <div>
                      <strong>${report.summary.references}</strong>
                      <span>direct references</span>
                    </div>
                    <div>
                      <strong>${report.summary.downstream}</strong>
                      <span>related downstream nodes</span>
                    </div>
                  </div>
                </section>
                ${this.coverageStatus(report)}
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${(["impact", "graph", "raw"] as const).map((tab) => html`<button role="tab" id=${`tab-${tab}`} aria-controls="analysis-view" aria-selected=${this.tab === tab} tabindex=${this.tab === tab ? 0 : -1} @keydown=${this.tabKeydown} @click=${() => (this.tab = tab)}>${tab === "impact" ? "Impact" : tab === "graph" ? "Graph" : "Raw references"}</button>`)}
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
                    Coverage and limitations · ${report.coverage.sources}
                    sources inspected
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
