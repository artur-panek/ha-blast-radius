import { LitElement, html, nothing } from "lit";
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
import { version } from "../package.json";
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
  };
  declare hass: Hass;
  narrow = false;
  entities: Entity[] = [];
  query = "";
  report?: Report;
  loading = false;
  error = "";
  tab: "impact" | "graph" | "raw" = "impact";
  replacement = "";
  depth = 6;
  status = "";
  copyFallback = false;
  private initialized = false;
  private requestId = 0;

  protected updated() {
    if (this.hass && !this.initialized) {
      this.initialized = true;
      void this.loadEntities();
    }
  }

  private async loadEntities() {
    this.loading = true;
    this.error = "";
    try {
      const result = await this.hass.callWS<{ entities: Entity[] }>({
        type: "blast_radius/entities",
      });
      this.entities = result.entities;
    } catch (error) {
      this.error = this.message(error);
    } finally {
      this.loading = false;
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

  private async run(operation?: "rename" | "delete") {
    const entityId = this.query.trim();
    if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(entityId)) {
      this.error = "Enter an entity ID such as light.office.";
      return;
    }
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
      if (id === this.requestId) this.report = report;
    } catch (error) {
      if (id === this.requestId) this.error = this.message(error);
    } finally {
      if (id === this.requestId) this.loading = false;
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

  private references(refs: Reference[], unresolved = false) {
    const groups = new Map<string, Reference[]>();
    refs.forEach((ref) =>
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
                  · ${references.length}
                  ${references.length === 1 ? "reference" : "references"}</span
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
                        </div>`,
                    )}
                  </details>`
          }
        </article>`,
    );
  }

  private unresolvedGroups(refs: Reference[]) {
    const groups = new Map<string, Reference[]>();
    for (const ref of refs) {
      const reason = ref.reason || "Runtime expression";
      groups.set(reason, [...(groups.get(reason) || []), ref]);
    }
    return [...groups].map(
      ([reason, references]) =>
        html` <details class="reason-group">
          <summary>
            ${reason} <span class="count">${references.length}</span>
          </summary>
          <p>${explainReason(reason)}</p>
          ${references.map((ref) => html`<div class="unresolved-row"><span>${readablePath(ref.path)}</span><code>${ref.path}</code>${this.badge(ref.confidence)}</div>`)}
        </details>`,
    );
  }

  private uncertainty(report: Report) {
    const local = report.uncertain_references;
    const elsewhere = report.other_dashboard_references || [];
    if (!local.length && !elsewhere.length) return nothing;
    return html`<section
      class="uncertainty"
      aria-label="Unresolved expressions"
    >
      <h2>Unresolved expressions</h2>
      <p>
        These are limits of static analysis, not a count of broken entities.
        Dynamic targets may still be relevant to this entity.
      </p>
      ${
        local.length
          ? html`<details class="uncertainty-scope">
              <summary>
                In linked configurations
                <span class="count">${local.length}</span>
              </summary>
              <p>
                Expressions in linked automation/script configurations or
                dashboard cards. Their targets are unknown; a shared
                configuration does not prove a dependency.
              </p>
              ${this.references(local, true)}
            </details>`
          : html`<p class="muted">
              No unresolved expressions in the linked configurations or cards.
            </p>`
      }
      ${
        elsewhere.length
          ? html`<details class="uncertainty-scope dashboard-context">
              <summary>
                Elsewhere in linked dashboards
                <span class="count">${elsewhere.length}</span>
              </summary>
              <p>
                Outside cards with known links, or at dashboard level. Kept for
                context; these expressions are not attributed to the selected
                entity.
              </p>
              ${this.references(elsewhere, true)}
            </details>`
          : nothing
      }
    </section>`;
  }

  private impact(report: Report) {
    return html`<h2>
        Where this entity is used
        <span class="badge">${report.summary.sources} sources</span>
      </h2>
      ${
        report.references.length
          ? html`<div class="source-grid">
              ${this.references(report.references)}
            </div>`
          : html`<div class="empty">
              <div class="symbol">${brandMark()}</div>
              <h3>No direct references found</h3>
              <p class="muted">
                Nothing in the inspected sources points to this entity. Check
                coverage and unresolved references before changing it.
              </p>
            </div>`
      }
      ${this.uncertainty(report)}
      <details>
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
            <strong>Unclassified:</strong> a known entity ID in a field with
            unknown semantics.
          </li>
        </ul>
      </details>`;
  }

  private graph(report: Report) {
    const selected = report.graph.nodes.find(
      (node) => node.relationship === "selected",
    )!;
    const dependents = report.graph.nodes.filter(
      (node) => node.relationship === "dependent",
    );
    const downstream = report.graph.nodes.filter(
      (node) => node.relationship === "downstream",
    );
    return html`<h2>Dependency map</h2>
      <p class="muted">
        Read from the selected entity to its linked configurations and their
        targets. Conditions are not evaluated; these links do not prove an
        action will run.
      </p>
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
            ${dependents.length ? dependents.map((node) => this.graphNode(node)) : html`<p>No linked configurations found.</p>`}
          </section>
          <section class="map-group">
            <h3>
              Possible targets <span class="count">${downstream.length}</span>
            </h3>
            <p class="muted">
              Action and membership targets reached through those
              configurations.
            </p>
            ${downstream.length ? downstream.map((node) => this.graphNode(node)) : html`<p>No downstream targets found.</p>`}
          </section>
        </div>
      </div>
      ${report.graph.cycles.length ? html`<div class="notice">Cycles detected. Nodes are shown once.${report.graph.cycles.map((cycle) => html`<p><code>${cycle.join(" → ")}</code></p>`)}</div>` : nothing}
      <details>
        <summary>All ${report.graph.edges.length} graph edges</summary>
        ${report.graph.edges.map((edge) => html`<div class="edge"><strong>${this.sourceName(edge.source_id)} → ${this.sourceName(edge.target!)}</strong><code>${edge.source_id} → ${edge.target}</code><code>${edge.path}</code><span class="badge">${edge.role}</span> ${this.badge(edge.confidence)}</div>`)}
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
        ${this.sourceControl(node.id, true)}
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
    return html`<h2>Raw references</h2>
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
            ${report.references.map(
              (ref) =>
                html`<tr>
                  <td>
                    ${this.sourceControl(ref.source_id)}<code
                      >${ref.source_id}<br />${ref.path}</code
                    >
                  </td>
                  <td>${ref.role}</td>
                  <td>${this.badge(ref.confidence)}</td>
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
          <label class="depth"
            >Depth<select
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
          <button
            class="primary"
            ?disabled=${this.loading || !this.query.trim()}
          >
            ${this.loading ? "Inspecting…" : "Analyze"}
          </button>
        </form>
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
                  <h2>${this.sourceName(report.entity_id)}</h2>
                  <code>${report.entity_id}</code>
                </div>
                ${!report.exists ? html`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>` : nothing}
                <div class="stats">
                  <div class="stat">
                    <strong>${report.summary.references}</strong
                    ><span>Direct references</span>
                  </div>
                  <div class="stat">
                    <strong>${report.summary.sources}</strong
                    ><span>Linked configurations</span>
                  </div>
                  <div class="stat">
                    <strong>${report.summary.downstream}</strong
                    ><span>Downstream targets</span>
                  </div>
                  <div class="stat">
                    <strong
                      >${report.summary.template_literal + report.summary.unknown}</strong
                    ><span>References to review</span>
                  </div>
                </div>
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${(["impact", "graph", "raw"] as const).map((tab) => html`<button role="tab" id=${`tab-${tab}`} aria-controls="analysis-view" aria-selected=${this.tab === tab} tabindex=${this.tab === tab ? 0 : -1} @keydown=${this.tabKeydown} @click=${() => (this.tab = tab)}>${tab === "impact" ? "Impact" : tab === "graph" ? "Graph" : "Raw references"}</button>`)}
                    </nav>
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
                <details class="card">
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
                      ${report.unresolved_total} unresolved references across
                      the full snapshot. Their targets are unknown; they cannot
                      be attributed to this entity.
                    </li>
                    <li>
                      ${report.uncertain_references.length} unresolved
                      expressions in linked configurations or cards;
                      ${report.other_dashboard_references?.length || 0}
                      elsewhere in linked dashboards. Counts refer to expression
                      locations, not missing or broken entities.
                    </li>
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
