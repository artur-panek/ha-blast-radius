import { LitElement, html, nothing, type PropertyValues } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { styles } from "./styles";
import { brandMark } from "./brand";
import {
  readablePath,
  explainReason,
  sourceLabels,
  safeNavigationPath,
} from "./presentation";
import { sourceIcon } from "./icons";
import {
  effectGroups,
  effectNodeCount,
  effectRoleLabel,
  referenceSummary,
  referenceUseLabel,
  usageBuckets,
  usageStats,
  type EffectGroup,
  type EffectItem,
  type UsageBucket,
} from "./semantics";
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
  tab: AnalysisTab = "overview";
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
      this.tab = saved.last?.tab || "overview";
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
    const tabs: AnalysisTab[] = [
      "overview",
      "usage",
      "effects",
      "graph",
      "raw",
    ];
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

  private selectTab(tab: AnalysisTab) {
    this.tab = tab;
    this.rememberView();
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
              : html`${this.referenceUseTags(references)}
                  ${references.some((ref) => ref.confidence !== "explicit") ? html`<span class="review-hint">Includes references to review</span>` : nothing}
                  <details class="technical">
                    <summary>Where found (${references.length})</summary>
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
    return referenceSummary(refs);
  }

  private referenceUseTags(refs: Reference[]) {
    const grouped = new Map<string, number>();
    for (const ref of refs) {
      const label = referenceUseLabel(ref);
      grouped.set(label, (grouped.get(label) || 0) + 1);
    }
    return html`<div class="reference-use-tags">
      ${[...grouped].map(
        ([label, count]) =>
          html`<span class="use-tag"
            >${label}${count > 1 ? ` ×${count}` : ""}</span
          >`,
      )}
    </div>`;
  }

  private directConfidence(report: Report) {
    if (report.references.some((ref) => ref.confidence === "unknown"))
      return "Needs review";
    if (report.references.some((ref) => ref.confidence !== "explicit"))
      return "Mixed confidence";
    return report.references.length ? "High confidence" : "No direct matches";
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
    return html`<section class="result-filters" aria-label="Result filters">
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
      ${
        this.filtersActive
          ? html`<p class="filter-note" role="status">
              ${count} of ${report.references.length} direct references visible.
              Exported reports still include the full analysis.
            </p>`
          : nothing
      }
    </section>`;
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

  private quickRead(report: Report) {
    const stats = usageStats(report.references);
    const effects = effectNodeCount(report);
    if (!stats.totalSources) {
      return effects
        ? `No other configuration directly uses this entity. The selected configuration still reaches ${effects} ${effects === 1 ? "effect node" : "effect nodes"}.`
        : "No direct users were found in the inspected sources.";
    }
    const parts = [
      `${stats.actionSources} act on it`,
      `${stats.observeSources} read or react to it`,
      `${stats.contextSources} display or contain it`,
    ];
    return `${stats.totalSources} ${stats.totalSources === 1 ? "configuration directly uses" : "configurations directly use"} this entity: ${parts.join(", ")}. ${effects ? `The same related flows reach ${effects} other ${effects === 1 ? "node" : "nodes"}.` : "No other action targets were reached through those flows."}`;
  }

  private relationshipSummary(report: Report) {
    const stats = usageStats(report.references);
    const effects = effectNodeCount(report);
    const metrics = [
      {
        className: "action",
        direction: "configuration → entity",
        value: stats.actionSources,
        label: "acts on it",
        detail: `${stats.actionReferences} direct ${stats.actionReferences === 1 ? "reference" : "references"}`,
      },
      {
        className: "observe",
        direction: "entity → configuration",
        value: stats.observeSources,
        label: "reads / reacts",
        detail: `${stats.observeReferences} direct ${stats.observeReferences === 1 ? "reference" : "references"}`,
      },
      {
        className: "context",
        direction: "entity → UI / group",
        value: stats.contextSources,
        label: "displays / contains",
        detail: `${stats.contextReferences} direct ${stats.contextReferences === 1 ? "reference" : "references"}`,
      },
      {
        className: "effects",
        direction: "same flow → other nodes",
        value: effects,
        label: "related effects",
        detail: "not necessarily caused by this entity",
      },
    ];
    return html`<section
      class="impact-summary relationship-summary"
      aria-label="Relationship summary"
    >
      <div class="impact-verdict">
        <span class="eyebrow">Quick read</span>
        <strong>
          ${
            stats.totalSources
              ? `${stats.totalSources} direct ${stats.totalSources === 1 ? "user" : "users"}`
              : "No direct users"
          }
        </strong>
        <p>${this.quickRead(report)}</p>
      </div>
      <div class="direction-metrics">
        ${metrics.map(
          (metric) =>
            html`<div class="direction-metric ${metric.className}">
              <span class="metric-direction">${metric.direction}</span>
              <strong>${metric.value}</strong>
              <span class="metric-label">${metric.label}</span>
              <small>${metric.detail}</small>
            </div>`,
        )}
      </div>
    </section>`;
  }

  private sourcePreview(refs: Reference[]) {
    const ids = [...new Set(refs.map((ref) => ref.source_id))];
    if (!ids.length) return "None found";
    const shown = ids.slice(0, 3).map((id) => this.sourceName(id));
    return `${shown.join(", ")}${ids.length > shown.length ? ` +${ids.length - shown.length} more` : ""}`;
  }

  private bucketDirection(bucket: UsageBucket) {
    if (bucket.category === "action") return "Configuration → selected entity";
    if (bucket.category === "observe")
      return "Selected entity → configuration logic";
    return "Selected entity → dashboard / group";
  }

  private usageBucketSection(bucket: UsageBucket) {
    return html`<section class="usage-section usage-${bucket.category}">
      <div class="usage-section-heading">
        <div>
          <span class="direction-label">${this.bucketDirection(bucket)}</span>
          <h3>${bucket.title}</h3>
          <p>${bucket.description}</p>
        </div>
        <span class="count"
          >${bucket.sources} ${bucket.sources === 1 ? "source" : "sources"} ·
          ${bucket.refs.length}
          ${bucket.refs.length === 1 ? "reference" : "references"}</span
        >
      </div>
      ${
        bucket.refs.length
          ? html`<div class="source-grid">
              ${this.references(bucket.refs, false, false)}
            </div>`
          : html`<div class="semantic-empty">
              No direct references in this category.
            </div>`
      }
    </section>`;
  }

  private overviewReviewNotice(report: Report) {
    const unresolved = report.uncertain_references.filter(
      (ref) => reviewResolution(ref) === "unresolved",
    );
    if (!unresolved.length) return nothing;
    return html`<div class="review-strip">
      <div>
        <strong>Some linked logic still needs review</strong>
        <span
          >${reviewCounts(unresolved)} could not be resolved statically inside
          configurations that use this entity.</span
        >
      </div>
      <button @click=${() => this.selectTab("usage")}>
        Review blind spots
      </button>
    </div>`;
  }

  private overview(report: Report) {
    const buckets = usageBuckets(report.references);
    const groups = effectGroups(report);
    const effects = effectNodeCount(report);
    return html`<div class="overview-grid">
        <section class="overview-panel">
          <div class="section-heading">
            <div>
              <span class="direction-label">Incoming relationships</span>
              <h2>What uses this entity?</h2>
              <p>
                Direct references grouped by what the source actually does with
                the selected entity.
              </p>
            </div>
          </div>
          <div class="relationship-list">
            ${buckets.map(
              (bucket) =>
                html`<div class="relationship-row ${bucket.category}">
                  <div class="relationship-row-main">
                    <strong>${bucket.shortLabel}</strong>
                    <span>${this.sourcePreview(bucket.refs)}</span>
                  </div>
                  <div class="relationship-row-count">
                    <strong>${bucket.sources}</strong>
                    <span>${bucket.sources === 1 ? "source" : "sources"}</span>
                  </div>
                </div>`,
            )}
          </div>
          <button
            class="section-action"
            @click=${() => this.selectTab("usage")}
          >
            Inspect direct usage →
          </button>
        </section>

        <section class="overview-panel">
          <div class="section-heading">
            <div>
              <span class="direction-label">Related flow effects</span>
              <h2>What else can those flows affect?</h2>
              <p>
                Other action targets, calls or memberships reachable from the
                same configurations.
              </p>
            </div>
          </div>
          ${
            effects
              ? html`<div class="effects-overview">
                  <strong
                    >${effects} other ${effects === 1 ? "node" : "nodes"} across
                    ${groups.length}
                    ${groups.length === 1 ? "flow" : "flows"}</strong
                  >
                  <div class="flow-summary-list">
                    ${groups.slice(0, 4).map(
                      (group) =>
                        html`<div class="flow-summary-row">
                          <span>${this.sourceName(group.sourceId)}</span>
                          <strong>${group.items.length}</strong>
                        </div>`,
                    )}
                    ${
                      groups.length > 4
                        ? html`<div class="flow-summary-row muted">
                            <span>More related flows</span>
                            <strong>+${groups.length - 4}</strong>
                          </div>`
                        : nothing
                    }
                  </div>
                  <p class="causality-note">
                    These are <strong>co-effects of the same flows</strong>. For
                    a normal entity, they are not effects caused by the selected
                    entity.
                  </p>
                </div>`
              : html`<div class="semantic-empty">
                  No other action targets or calls were reached through the
                  related flows.
                </div>`
          }
          <button
            class="section-action"
            @click=${() => this.selectTab("effects")}
          >
            Explore related effects →
          </button>
        </section>
      </div>
      ${this.overviewReviewNotice(report)}`;
  }

  private directUsage(report: Report) {
    const refs = report.references.filter(this.matchesFilter);
    const buckets = usageBuckets(refs);
    return html`<div class="section-heading">
        <div>
          <span class="direction-label">Source → selected entity</span>
          <h2>Direct usage</h2>
          <p>
            Every confirmed reference to the selected entity, separated by
            direction and intent.
          </p>
        </div>
        <span class="count"
          >${new Set(refs.map((ref) => ref.source_id)).size} visible
          ${
            new Set(refs.map((ref) => ref.source_id)).size === 1
              ? "source"
              : "sources"
          }</span
        >
      </div>
      <div class="usage-sections">
        ${
          refs.length
            ? buckets.map((bucket) => this.usageBucketSection(bucket))
            : html`<div class="semantic-empty">
                ${
                  this.filtersActive
                    ? "No direct references match the current filters. Try All sources or All confidence."
                    : "No direct users were found in the inspected sources."
                }
              </div>`
        }
      </div>
      ${this.uncertainty(report)}`;
  }

  private effectGroupSummary(group: EffectGroup) {
    const roles = new Map<string, number>();
    for (const item of group.items) {
      const role = effectRoleLabel(item.edge?.role);
      roles.set(role, (roles.get(role) || 0) + 1);
    }
    return [...roles].map(([role, count]) => `${count} ${role}`).join(" · ");
  }

  private effectItem(item: EffectItem) {
    const node = item.node;
    const kind = node.id.split(".")[0];
    return html`<div class="effect-row" data-source=${node.id}>
      <div class="effect-row-main">
        ${sourceIcon(kind)}
        <div>
          <h3>${this.sourceControl(node.id)}</h3>
          <span class="source-meta">
            ${sourceLabels[kind] || kind.replaceAll("_", " ")} ·
            ${effectRoleLabel(item.edge?.role)}
            ${
              item.chained && node.via
                ? html` · via ${this.sourceName(node.via)}`
                : nothing
            }
          </span>
        </div>
      </div>
      <div class="node-actions">
        ${this.sourceControl(node.id, true)}
        ${
          /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(node.id)
            ? html`<button
                class="analyze-node"
                aria-label=${`Analyze this: ${node.id}`}
                @click=${() => this.analyzeNode(node.id)}
              >
                Analyze
              </button>`
            : nothing
        }
      </div>
      ${
        node.path
          ? html`<details class="technical effect-details">
              <summary>Connection</summary>
              <div class="technical-row">
                <div class="path">
                  <span>${readablePath(node.path)}</span>
                  ${node.confidence ? this.badge(node.confidence) : nothing}
                </div>
                <code>${node.path}</code>
              </div>
            </details>`
          : nothing
      }
    </div>`;
  }

  private effectFlow(group: EffectGroup, report: Report) {
    const ownFlow = group.sourceId === report.entity_id;
    return html`<article class="effect-flow" data-flow=${group.sourceId}>
      <div class="effect-flow-heading">
        <div class="source-heading">
          ${sourceIcon(group.sourceType)}
          <div>
            <span class="direction-label">
              ${ownFlow ? "Selected configuration → targets" : "Shared flow"}
            </span>
            <h3>${this.sourceControl(group.sourceId)}</h3>
            <span class="source-meta">
              ${
                ownFlow
                  ? "These are direct effects from the selected configuration."
                  : `${referenceSummary(group.directReferences)} to the selected entity.`
              }
            </span>
          </div>
        </div>
        <span class="count"
          >${group.items.length}
          ${group.items.length === 1 ? "effect" : "effects"}</span
        >
      </div>
      <div class="flow-relationship">
        ${
          ownFlow
            ? html`<span class="relation-chip outgoing">
                selected configuration → ${group.items.length} effect
                ${group.items.length === 1 ? "" : "nodes"}
              </span>`
            : html`<span class="relation-chip incoming">
                  this flow → selected entity
                </span>
                <span class="flow-arrow">and</span>
                <span class="relation-chip outgoing">
                  this flow → ${group.items.length} other
                  ${group.items.length === 1 ? "node" : "nodes"}
                </span>`
        }
      </div>
      <p class="effect-flow-summary">${this.effectGroupSummary(group)}</p>
      ${
        group.directItems.length
          ? html`<div class="effect-list">
              ${group.directItems.map((item) => this.effectItem(item))}
            </div>`
          : nothing
      }
      ${
        group.chainedItems.length
          ? html`<details class="chained-effects">
              <summary>
                Chained effects through called / linked configurations
                <span class="count">${group.chainedItems.length}</span>
              </summary>
              <div class="effect-list">
                ${group.chainedItems.map((item) => this.effectItem(item))}
              </div>
            </details>`
          : nothing
      }
    </article>`;
  }

  private relatedEffects(report: Report) {
    const groups = effectGroups(report);
    const effects = effectNodeCount(report);
    return html`<div class="section-heading">
        <div>
          <span class="direction-label"
            >Related configuration → other target</span
          >
          <h2>Related effects</h2>
          <p>
            Action targets, script calls and memberships reached from the same
            flows that use the selected entity.
          </p>
        </div>
        <span class="count"
          >${effects} ${effects === 1 ? "node" : "nodes"}</span
        >
      </div>
      <div class="causality-banner">
        <strong>Do not read this as entity → target causality.</strong>
        For ordinary entities, these are other effects of the same automation or
        script. When the selected entity is itself a configuration, its own
        direct targets are identified separately.
      </div>
      ${
        groups.length
          ? html`<div class="effect-flows">
              ${groups.map((group) => this.effectFlow(group, report))}
            </div>`
          : html`<div class="empty">
              <div class="symbol">${brandMark()}</div>
              <h3>No related effects found</h3>
              <p class="muted">
                The inspected flows do not expose additional action targets,
                calls or memberships at this traversal depth.
              </p>
            </div>`
      }`;
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

    return nothing;
  }

  private graphConnection(node: GraphNode) {
    const report = this.report;
    if (!report || !node.via) return "";
    const edge =
      node.relationship === "dependent"
        ? report.graph.edges.find(
            (candidate) =>
              candidate.source_id === node.id && candidate.target === node.via,
          )
        : report.graph.edges.find(
            (candidate) =>
              candidate.source_id === node.via && candidate.target === node.id,
          );
    if (!edge)
      return node.relationship === "dependent"
        ? "Uses the upstream node"
        : "Related effect";
    return node.relationship === "dependent"
      ? referenceUseLabel(edge)
      : `${effectRoleLabel(edge.role)} from ${this.sourceName(node.via)}`;
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
    return html`<h2>Relationship map</h2>
      <p class="muted">
        Left: configurations that use the selected entity. Right: other effects
        reached from those same flows. This is a structural map, not proof that
        changing the selected entity causes the right-hand targets.
      </p>
      <div class="direction-legend" aria-label="Relationship directions">
        <span
          ><strong>Incoming use</strong> configuration → selected entity</span
        >
        <span
          ><strong>Related effect</strong> configuration → other target</span
        >
      </div>
      ${this.filtersActive ? html`<p class="filter-note">Showing ${nodes.length - 1} of ${report.graph.nodes.length - 1} linked nodes. Paths may pass through hidden configurations; filtering does not recalculate the graph.</p>` : nothing}
      <div class="tree dependency-map">
        <div class="map-selected">
          <span class="map-label">Selected entity</span
          >${this.graphNode(selected)}
        </div>
        <div class="map-columns">
          <section class="map-group">
            <h3>
              Configurations using this entity
              <span class="count">${dependents.length}</span>
            </h3>
            <p class="muted">
              These configurations depend on, target, display or contain the
              selected entity.
            </p>
            ${dependents.length ? dependents.map((node) => this.graphNode(node)) : html`<p>${this.filtersActive ? "No matching linked configurations. Try All sources or All confidence." : "No linked configurations found."}</p>`}
          </section>
          <section class="map-group">
            <h3>
              Other effects in the same flows
              <span class="count">${downstream.length}</span>
            </h3>
            <p class="muted">
              Action targets, calls and memberships from the related
              configurations. They are not necessarily caused by the selected
              entity.
            </p>
            ${downstream.length ? downstream.map((node) => this.graphNode(node)) : html`<p>${this.filtersActive ? "No matching related effects. Try All sources or All confidence." : "No related effect nodes found."}</p>`}
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
      ${
        node.via
          ? html`<p class="via">
              <strong>${this.graphConnection(node)}</strong>
              ${
                node.relationship === "dependent"
                  ? html` · via ${this.sourceControl(node.via)}`
                  : nothing
              }
            </p>`
          : nothing
      }
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
          See who uses an entity, how they use it, and what else those flows can
          affect before you rename or remove it.
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
                    ${
                      (report.coverage.warnings || []).length
                        ? html`<button
                            class="summary-pill summary-action"
                            @click=${this.showCoverage}
                          >
                            Coverage partial
                          </button>`
                        : nothing
                    }
                  </div>
                </div>
                ${!report.exists ? html`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>` : nothing}
                ${report.graph.truncated ? this.completeness(report) : nothing}
                ${this.relationshipSummary(report)}
                ${!report.graph.truncated ? this.completeness(report) : nothing}
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${(
                        [
                          ["overview", "Overview"],
                          ["usage", "Uses this entity"],
                          ["effects", "Related effects"],
                          ["graph", "Graph"],
                          ["raw", "Technical"],
                        ] as const
                      ).map(
                        ([tab, label]) =>
                          html`<button
                            role="tab"
                            id=${`tab-${tab}`}
                            aria-controls="analysis-view"
                            aria-selected=${this.tab === tab}
                            tabindex=${this.tab === tab ? 0 : -1}
                            @keydown=${this.tabKeydown}
                            @click=${() => this.selectTab(tab)}
                          >
                            ${label}
                          </button>`,
                      )}
                    </nav>
                    ${
                      this.tab === "usage" ||
                      this.tab === "graph" ||
                      this.tab === "raw"
                        ? this.filters(report)
                        : nothing
                    }
                    <div
                      role="tabpanel"
                      id="analysis-view"
                      aria-labelledby=${`tab-${this.tab}`}
                    >
                      ${
                        this.tab === "overview"
                          ? this.overview(report)
                          : this.tab === "usage"
                            ? this.directUsage(report)
                            : this.tab === "effects"
                              ? this.relatedEffects(report)
                              : this.tab === "graph"
                                ? this.graph(report)
                                : this.raw(report)
                      }
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
                    inspected
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
                    A button, a helper, an old light.<br />See what acts on it,
                    what reads it, and what else those same flows can affect.
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
