import { LitElement, html, nothing } from "lit";
import { styles } from "./styles";
import { brandMark } from "./brand";
import { version } from "../package.json";
import type { Confidence, Entity, Hass, Reference, Report } from "./types";

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

  private references(refs: Reference[]) {
    const groups = new Map<string, Reference[]>();
    refs.forEach((ref) =>
      groups.set(ref.source_id, [...(groups.get(ref.source_id) || []), ref]),
    );
    return [...groups].map(
      ([source, references]) =>
        html`<div class="reference">
          <div class="reference-title">
            <code>${source}</code
            ><span class="badge">${references[0].source_type}</span>
          </div>
          ${references.map((ref) => html`<div class="path"><code>${ref.path}</code>${this.badge(ref.confidence)}</div>`)}
        </div>`,
    );
  }

  private impact(report: Report) {
    return html`<h2>
        Direct references
        <span class="badge">${report.summary.sources} sources</span>
      </h2>
      ${
        report.references.length
          ? this.references(report.references)
          : html`<div class="empty">
              <div class="symbol">${brandMark()}</div>
              <h3>No direct references found</h3>
              <p class="muted">
                Nothing in the inspected sources points to this entity. Check
                coverage and unresolved references before changing it.
              </p>
            </div>`
      }
      ${
        report.uncertain_references.length
          ? html`<div class="notice">
              <strong>Unresolved references in affected configurations</strong>
              <p>
                These expressions occur in affected configurations. Their
                targets are unknown; some may be unrelated to this entity.
              </p>
              ${this.references(report.uncertain_references)}
            </div>`
          : nothing
      }
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
    return html`<h2>Structural impact</h2>
      <p class="muted">
        Affected configurations, followed by their action targets. This shows
        possible dependencies, not an execution trace.
      </p>
      <ol class="tree">
        ${report.graph.nodes.map(
          (node) =>
            html`<li
              class=${node.relationship}
              style=${`margin-left:${Math.min(node.depth, 4) * 14}px`}
            >
              <code>${node.id}</code
              ><small
                >${node.relationship === "selected" ? "Selected entity" : node.relationship === "dependent" ? `References ${node.via}` : `Action or membership target of ${node.via}`}
                · depth ${node.depth}</small
              >
              ${node.path ? html`<small>${node.path}</small>` : nothing}${node.confidence ? this.badge(node.confidence) : nothing}
            </li>`,
        )}
      </ol>
      ${report.graph.cycles.length ? html`<div class="notice">Cycles detected. Nodes are shown once.${report.graph.cycles.map((cycle) => html`<p><code>${cycle.join(" → ")}</code></p>`)}</div>` : nothing}
      <details>
        <summary>All ${report.graph.edges.length} graph edges</summary>
        ${report.graph.edges.map((edge) => html`<code>${edge.source_id} → ${edge.target} (${edge.role}, ${labels[edge.confidence]})<br />${edge.path}</code>`)}
      </details>`;
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
                    <code>${ref.source_id}<br />${ref.path}</code>
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
        <div class="eyebrow">Configuration impact analysis</div>
        <h1>Check dependencies before you make a change.</h1>
        <p class="muted intro">
          Inspect references. Follow dependencies. Preview the change.
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
                <h2><code>${report.entity_id}</code></h2>
                ${!report.exists ? html`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>` : nothing}
                <div class="stats">
                  <div class="stat">
                    <strong>${report.summary.references}</strong
                    ><span>Direct references</span>
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
                  <div class="stat">
                    <strong>${report.uncertain_references.length}</strong
                    ><span>Unresolved in affected sources</span>
                  </div>
                </div>
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${(["impact", "graph", "raw"] as const).map((tab) => html`<button role="tab" aria-selected=${this.tab === tab} @click=${() => (this.tab = tab)}>${tab === "impact" ? "Impact" : tab === "graph" ? "Graph" : "Raw references"}</button>`)}
                    </nav>
                    <div role="tabpanel">
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
                  <aside class="card">
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
                  </aside>
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
