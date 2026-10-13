import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
    overflow: auto;
    color: var(--primary-text-color, #212121);
    background: var(--primary-background-color, #fafafa);
    font-family:
      var(--ha-font-family-body, Roboto),
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Arial,
      sans-serif;
    font-size: 16px;
    line-height: 1.55;
    --br-card: var(--card-background-color, #fff);
    --br-border: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 22%,
      var(--br-card)
    );
    --br-muted: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 82%,
      var(--br-card)
    );
    --br-accent: var(--primary-color, #03a9f4);
  }
  * {
    box-sizing: border-box;
  }
  header {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 24px;
    border-bottom: 1px solid var(--br-border);
    background: var(--br-card);
    position: sticky;
    top: 0;
    z-index: 2;
  }
  header strong {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.4px;
    white-space: nowrap;
  }
  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-mark {
    display: block;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    color: var(--primary-text-color, #25313b);
  }
  .brand-mark .radius {
    fill: var(--br-accent);
  }
  header .badge {
    margin-left: auto;
  }
  .menu {
    border: 0;
    padding: 8px;
    font-size: 22px;
    background: transparent;
  }
  main {
    max-width: 1380px;
    margin: auto;
    padding: 30px 32px 50px;
  }
  h1 {
    font-size: 28px;
    font-weight: 500;
    margin: 10px 0;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  h2 {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 16px;
  }
  h3 {
    font-size: 16px;
    margin: 0 0 8px;
  }
  p {
    line-height: 1.55;
  }
  .muted {
    color: var(--br-muted);
  }
  .intro {
    margin: 0 0 25px;
  }
  .search {
    display: flex;
    align-items: end;
    gap: 12px;
    margin: 20px 0 8px;
  }
  .search label {
    flex: 1;
  }
  .analysis-options {
    width: fit-content;
    margin: 0 0 18px;
    color: var(--br-muted);
  }
  .analysis-options > summary {
    padding: 7px 0;
    font-size: 13px;
  }
  .analysis-options-body {
    display: flex;
    align-items: end;
    gap: 14px;
    padding: 8px 0 4px;
  }
  .analysis-options-body p {
    margin: 0 0 9px;
    max-width: 540px;
    font-size: 13px;
  }
  .analysis-options-body .clear-history-option {
    align-self: center;
    flex-shrink: 0;
    border: 0;
    background: transparent;
    padding: 8px;
    min-height: 36px;
    font-size: 12px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .recent-searches {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: -6px 0 22px;
    min-width: 0;
  }
  .recent-label {
    color: var(--br-muted);
    font-size: 13px;
  }
  .recent-list {
    display: flex;
    gap: 8px;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    padding: 4px;
  }
  .recent-search {
    font-size: 13px;
    padding: 8px 12px;
    white-space: nowrap;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .recent-search[aria-pressed="true"] {
    border-color: var(--br-accent);
  }
  .clear-recent {
    font-size: 13px;
    border-color: transparent;
    padding: 8px;
    background: transparent;
  }
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
  }
  input,
  select,
  textarea {
    display: block;
    width: 100%;
    font: inherit;
    color: inherit;
    background: var(--br-card);
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 12px;
    margin-top: 7px;
    min-height: 46px;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 12px 16px;
    background: var(--br-card);
    min-height: 44px;
    font-weight: 500;
  }
  button.primary {
    background: color-mix(in srgb, var(--br-card) 85%, var(--br-accent));
    color: var(--primary-text-color, #212121);
    border-color: var(--br-accent);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button:hover:not(:disabled) {
    filter: brightness(0.94);
  }
  :focus-visible {
    outline: 3px solid var(--br-accent);
    outline-offset: 3px;
  }
  code {
    font:
      13px/1.65 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    overflow-wrap: anywhere;
  }
  .badge {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.25px;
    border: 1px solid var(--br-border);
    border-radius: 5px;
    padding: 4px 7px;
    white-space: nowrap;
    color: var(--br-muted);
  }
  .explicit {
    --br-confidence-accent: var(--success-color, #288048);
  }
  .template_literal,
  .dynamic,
  .unknown {
    --br-confidence-accent: var(--warning-color, #9b6600);
  }
  .badge.explicit,
  .badge.template_literal,
  .badge.dynamic,
  .badge.unknown {
    color: var(--primary-text-color, #212121);
    background: color-mix(
      in srgb,
      var(--br-card) 92%,
      var(--br-confidence-accent)
    );
    border-color: color-mix(
      in srgb,
      var(--br-border) 65%,
      var(--br-confidence-accent)
    );
    font-size: 12px;
    font-weight: 500;
  }
  .badge.explicit::before,
  .badge.template_literal::before,
  .badge.dynamic::before,
  .badge.unknown::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: 1px;
    background: var(--br-confidence-accent);
  }
  .impact-summary {
    display: grid;
    grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.28fr);
    gap: 0;
    margin: 18px 0 22px;
    border: 1px solid var(--br-border);
    border-radius: 12px;
    background: var(--br-card);
    overflow: hidden;
  }
  .impact-verdict {
    padding: 18px 20px;
    border-right: 1px solid var(--br-border);
  }
  .impact-verdict .eyebrow {
    display: block;
    margin-bottom: 4px;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .impact-verdict > strong {
    display: block;
    font-size: 25px;
    font-weight: 600;
  }
  .impact-verdict p {
    margin: 7px 0 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .impact-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .impact-metrics > div {
    padding: 18px 16px;
    border-right: 1px solid var(--br-border);
  }
  .impact-metrics > div:last-child {
    border-right: 0;
  }
  .impact-metrics strong {
    display: block;
    margin-bottom: 4px;
    font-size: 23px;
    font-weight: 500;
  }
  .impact-metrics span {
    color: var(--br-muted);
    font-size: 13px;
  }
  .summary-context-note {
    margin: -10px 2px 18px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .summary-context-note strong {
    color: var(--primary-text-color, #212121);
    font-size: 13px;
    margin-right: 3px;
  }
  .impact-lane {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--br-border);
  }
  /* The filter toolbar already separates the first section from the tabs. */
  #analysis-view > .impact-lane:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
  .impact-lane .section-heading {
    margin-bottom: 10px;
  }
  .lane-metadata {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }
  .lane-badge {
    flex: 0 0 auto;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
  .incoming-badge {
    border-color: color-mix(in srgb, var(--br-accent) 55%, var(--br-border));
  }
  .reaction-badge,
  .downstream-badge {
    border-color: color-mix(
      in srgb,
      var(--success-color, #288048) 55%,
      var(--br-border)
    );
  }
  .role-group {
    margin-top: 12px;
  }
  .role-group-compact {
    margin-top: 10px;
  }
  .role-group + .role-group {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--br-border);
  }
  .role-heading {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  .role-heading h3 {
    margin: 0;
    font-size: 15px;
  }
  .role-heading p {
    margin: 3px 0 0;
    color: var(--br-muted);
    font-size: 12px;
  }
  .role-count {
    flex: 0 0 auto;
    border: 1px solid var(--br-border);
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
  .role-change .role-count,
  .role-invoke .role-count {
    border-color: color-mix(in srgb, var(--br-accent) 55%, var(--br-border));
  }
  .same-flow-list {
    display: grid;
    gap: 8px;
  }
  .flow-group {
    margin: 0;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 2px 12px;
  }
  .flow-output,
  .flow-reaction {
    border-left: 3px solid var(--success-color, #288048);
  }
  .flow-mixed {
    border-left: 3px solid var(--warning-color, #9b6600);
  }
  .flow-context {
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .flow-group > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .flow-group > summary > span:first-child {
    min-width: 0;
  }
  .flow-source {
    display: block;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .flow-group summary small {
    display: block;
    margin-top: 2px;
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 400;
  }
  .flow-count {
    flex: 0 0 auto;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 500;
  }
  .flow-targets {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 4px 0 10px;
  }
  .flow-target {
    min-width: 0;
    border: 1px solid var(--br-border);
    border-radius: 7px;
    padding: 9px 10px;
  }
  .flow-target .source-name {
    font-size: 13px;
  }
  .flow-target small {
    display: block;
    margin-top: 2px;
    color: var(--br-muted);
    font-size: 11px;
  }
  .shared-context {
    margin-top: 22px;
    border: 1px solid var(--br-border);
    border-radius: 9px;
    padding: 3px 12px;
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .shared-context > summary {
    font-weight: 600;
  }
  .shared-context > p {
    margin: 0 0 12px;
    font-size: 12px;
  }
  .graph-direction {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 12px 0 18px;
  }
  .graph-direction span {
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .graph-direction strong {
    color: var(--primary-text-color, #212121);
  }
  .effect-group {
    border-top-color: color-mix(
      in srgb,
      var(--success-color, #288048) 60%,
      var(--br-border)
    );
  }
  .graph-context {
    margin-top: 22px;
    border-top: 1px solid var(--br-border);
    padding-top: 8px;
  }
  .graph-context > summary {
    font-weight: 600;
  }
  .graph-context-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  /* One clear result list; graph and scanner internals stay optional. */
  .plain-impact {
    background: var(--br-card);
    border: 1px solid var(--br-border);
    border-radius: 12px;
    padding: 20px 22px;
    margin: 16px 0 0;
  }
  .plain-lead {
    padding-bottom: 8px;
  }
  .plain-lead h3 {
    font-size: 21px;
    font-weight: 600;
    line-height: 1.3;
    margin: 0 0 4px;
  }
  .plain-lead p {
    font-size: 14px;
    color: var(--br-muted);
    margin: 0;
  }
  .plain-use-group {
    padding-top: 14px;
  }
  .plain-use-group + .plain-use-group {
    border-top: 1px solid var(--br-border);
    margin-top: 10px;
  }
  .plain-use-group h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 3px;
  }
  .plain-use-list {
    display: grid;
    gap: 0;
  }
  .plain-source {
    padding: 10px 0 7px;
    border-bottom: 1px solid var(--br-border);
    min-width: 0;
  }
  .plain-source:last-child {
    border-bottom: 0;
  }
  .plain-source-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    min-width: 0;
  }
  .plain-source .source-heading {
    align-items: center;
  }
  .plain-source h5 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
  .plain-source h5 .source-name:focus-visible {
    outline: 2px solid var(--br-accent);
    outline-offset: 3px;
  }
  .plain-source .source-heading p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--br-muted);
  }
  .plain-source .review-hint {
    display: inline;
    font-size: inherit;
    white-space: nowrap;
  }
  .plain-source-details {
    margin: 2px 0 0 32px;
    color: var(--br-muted);
  }
  .plain-source-details > summary {
    display: list-item;
    width: fit-content;
    min-height: 30px;
    padding: 5px 0;
    font-size: 12px;
    text-underline-offset: 3px;
  }
  .plain-source-details > summary:hover {
    text-decoration: underline;
  }
  .plain-source-paths {
    margin: 6px 0 8px;
    padding-left: 12px;
    border-left: 1px solid var(--br-border);
  }
  .plain-source-path {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 9px;
    padding: 7px 0;
    font-size: 12px;
  }
  .plain-source-path + .plain-source-path {
    border-top: 1px solid var(--br-border);
  }
  .plain-source-path code {
    display: block;
    flex-basis: 100%;
    color: var(--br-muted);
    overflow-wrap: anywhere;
  }
  .plain-source-path p {
    margin: 0;
  }
  .plain-scan-note {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px 12px;
    margin-top: 10px;
    padding-top: 12px;
    border-top: 1px solid var(--br-border);
    font-size: 12px;
    color: var(--br-muted);
  }
  .plain-scan-note button {
    padding: 5px 8px;
    min-height: 34px;
    font-size: 12px;
    border: 0;
    background: transparent;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .report-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    margin: 14px 0 0;
  }
  .report-actions button {
    font-size: 13px;
  }
  .report-actions .quiet-action {
    border: 0;
    background: transparent;
    color: var(--primary-text-color, #212121);
    text-decoration: underline;
    text-underline-offset: 3px;
    min-height: 40px;
    padding: 8px 10px;
    font-weight: 500;
  }
  .report-actions .quiet-action:hover {
    color: var(--br-accent);
  }
  .change-preview[hidden],
  .advanced-analysis[hidden],
  .scan-details[hidden] {
    display: none;
  }
  .columns {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  .columns > .change-preview {
    order: 0;
  }
  .columns > .advanced-analysis {
    order: 1;
  }
  .advanced-analysis {
    width: 100%;
    margin-top: 0;
    border: 1px solid var(--br-border);
    border-radius: 12px;
    padding: 5px 20px;
    background: var(--br-card);
  }
  .advanced-analysis > summary {
    font-weight: 600;
    padding: 13px 0;
  }
  .advanced-analysis > summary small {
    display: block;
    margin-left: 19px;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 400;
  }
  .advanced-content {
    margin-top: 8px;
  }
  .advanced-content .impact-summary {
    margin-top: 12px;
  }
  .advanced-analysis > .card {
    margin-top: 12px;
    padding: 18px;
  }
  .advanced-tools-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
  }
  .advanced-tools-row button {
    font-size: 13px;
  }
  @media (max-width: 600px) {
    .plain-impact {
      padding: 16px;
    }
    .plain-lead h3 {
      font-size: 19px;
    }
    .plain-source-header {
      gap: 8px;
    }
    .plain-source-details {
      margin-left: 0;
    }
    .plain-source .open-source {
      padding: 6px 9px;
      min-height: 44px;
    }
    .advanced-analysis {
      padding: 5px 14px;
    }
    .advanced-analysis > .card {
      padding: 8px;
    }
    .report-actions > .primary {
      flex: 1 1 100%;
      min-height: 44px;
    }
    .report-actions > .quiet-action {
      flex: 0 0 auto;
      min-height: 44px;
    }
  }

  .card {
    border: 1px solid var(--br-border);
    border-radius: 12px;
    background: var(--br-card);
    padding: 22px;
    min-width: 0;
  }
  nav {
    display: flex;
    gap: 6px;
    border-bottom: 1px solid var(--br-border);
    margin: -8px -8px 12px;
  }
  nav button {
    border: 0;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    background: transparent;
    font-size: 15px;
    padding: 14px;
  }
  nav button[aria-selected="true"] {
    color: var(--primary-text-color, #212121);
    border-bottom-color: var(--br-accent);
  }
  .reference {
    padding: 10px 12px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    min-width: 0;
  }
  .source-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    align-items: start;
  }
  .reference-title {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
  }
  .reference-title code {
    font-size: 13px;
    color: var(--br-muted);
  }
  .reference-title h3 {
    margin: 0;
    font-size: 16px;
  }
  .path {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 0 0;
  }
  .path > span:first-child {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .notice {
    border-left: 3px solid var(--warning-color, #9b6600);
    padding: 10px 14px;
    margin: 16px 0;
    font-size: 13px;
    background: var(--secondary-background-color, #f5f5f5);
    line-height: 1.6;
  }
  .error {
    border-color: var(--error-color, #db4437);
  }
  .incomplete {
    font-size: 14px;
    background: var(--br-card);
    border: 1px solid var(--br-border);
    border-left: 3px solid var(--warning-color, #9b6600);
    border-radius: 8px;
    padding: 14px 16px;
  }
  .incomplete p {
    margin: 6px 0;
  }
  .incomplete .controls {
    margin-top: 10px;
  }
  .coverage-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 14px 0;
    padding: 12px 14px;
    border: 1px solid var(--br-border);
    border-radius: 9px;
    background: color-mix(
      in srgb,
      var(--br-card) 96%,
      var(--warning-color, #9b6600)
    );
  }
  .coverage-status strong {
    font-size: 14px;
  }
  .coverage-status p {
    margin: 3px 0 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .coverage-status button {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 8px 11px;
    font-size: 13px;
  }
  #coverage {
    scroll-margin-top: 80px;
  }
  .empty {
    padding: 36px 12px;
    text-align: center;
  }
  .empty .symbol {
    font-size: 36px;
    color: var(--br-accent);
  }
  .empty .brand-mark {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
  }
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
  }
  .controls button {
    font-size: 13px;
  }
  .preview-form label {
    margin: 18px 0;
  }
  .preview-form > button {
    margin: 0 8px 8px 0;
  }
  .preview-form p {
    font-size: 14px;
  }
  .preview-form .preview-hint {
    margin: -10px 0 12px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .preview-form .preview-error {
    margin: 8px 0 14px;
    font-size: 13px;
  }
  .preview {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--br-border);
  }
  .preview code {
    display: block;
    margin: 8px 0;
  }
  .preview ul {
    padding-left: 18px;
    line-height: 1.7;
    font-size: 13px;
  }
  details {
    margin: 16px 0 0;
    font-size: 14px;
  }
  summary {
    cursor: pointer;
    line-height: 1.5;
    padding: 10px 0;
  }
  details ul {
    padding-left: 20px;
    line-height: 1.6;
    color: var(--br-muted);
  }
  .edge code {
    display: block;
    margin: 8px 0;
  }
  .foot {
    display: flex;
    gap: 14px;
    justify-content: space-between;
    font-size: 12px;
    color: var(--br-muted);
    margin-top: 20px;
    line-height: 1.6;
  }
  .status {
    font-size: 12px;
    color: var(--br-muted);
  }
  .status[hidden] {
    display: none;
  }
  progress {
    width: 100%;
    accent-color: var(--br-accent);
  }
  .depth {
    width: 82px;
    flex: 0 0 82px !important;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
  }
  th,
  td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid var(--br-border);
  }
  .table-wrap {
    overflow: auto;
  }
  textarea {
    height: 200px;
    font-size: 12px;
  }
  .result-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin: 24px 0 12px;
  }
  .result-heading h2 {
    margin-bottom: 3px;
    font-size: 22px;
  }
  .result-heading code {
    color: var(--br-muted);
  }
  .result-badges {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .summary-pill {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 4px 9px;
    border: 1px solid var(--br-border);
    border-radius: 999px;
    background: var(--br-card);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .coverage-pill {
    color: var(--primary-text-color, #212121);
    background: color-mix(
      in srgb,
      var(--br-card) 94%,
      var(--warning-color, #9b6600)
    );
    border-color: color-mix(
      in srgb,
      var(--br-border) 65%,
      var(--warning-color, #9b6600)
    );
    cursor: pointer;
  }
  .preview-shortcut {
    min-height: 32px;
    padding: 5px 9px;
    border-color: transparent;
    background: transparent;
    font-size: 12px;
  }
  .preview-shortcut:hover {
    border-color: var(--br-border);
  }
  .technical {
    margin-top: 6px;
    color: var(--br-muted);
  }
  .technical > summary {
    font-size: 13px;
  }
  .technical-row {
    display: grid;
    gap: 8px;
    padding: 10px 0;
    border-top: 1px solid var(--br-border);
  }
  .technical-row code {
    min-width: 0;
  }
  .technical-row .path {
    padding-top: 0;
    color: var(--primary-text-color, #212121);
  }
  .source-id {
    display: block;
    margin: 8px 0 12px;
  }
  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin: 0 0 12px;
  }
  .section-heading h2 {
    margin: 0;
  }
  .section-heading p {
    margin: 4px 0 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .impact-heading {
    margin-bottom: 14px;
  }
  .impact-heading .count {
    flex: 0 0 auto;
    margin-top: 1px;
  }
  .uncertainty {
    border-top: 1px solid var(--br-border);
    margin-top: 20px;
    padding-top: 18px;
  }
  /* Bordered disclosures provide their own boundary; never stack another rule. */
  .shared-context + .uncertainty {
    border-top: 0;
    padding-top: 0;
    margin-top: 22px;
  }
  #analysis-view > .uncertainty:first-child {
    border-top: 0;
    padding-top: 0;
    margin-top: 0;
  }
  .uncertainty.diagnostics-only {
    margin-top: 12px;
    padding-top: 0;
    border-top: 0;
  }
  .uncertainty.diagnostics-only .diagnostics-link {
    margin-top: 0;
    padding: 4px 0;
    border: 0;
    background: transparent;
  }
  .uncertainty h2 {
    margin-bottom: 4px;
  }
  .uncertainty p {
    font-size: 13px;
    color: var(--br-muted);
    margin: 5px 0 12px;
  }
  .secondary-context,
  .dashboard-context {
    background: color-mix(
      in srgb,
      var(--br-card) 97%,
      var(--primary-text-color, #212121)
    );
  }
  .diagnostics-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
    padding: 10px 12px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    color: var(--br-muted);
    font-size: 13px;
  }
  .diagnostics-link button {
    flex: 0 0 auto;
    min-height: 36px;
    padding: 6px 10px;
    font-size: 12px;
  }
  .scan-details > summary {
    font-weight: 600;
  }
  .scan-overview {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px 16px;
    margin: 12px 0 16px;
  }
  .scan-overview strong {
    color: var(--primary-text-color, #212121);
    font-size: 15px;
  }
  .scan-overview p {
    color: var(--br-muted);
    margin: 5px 0 0;
    font-size: 13px;
    line-height: 1.5;
  }
  .scan-state {
    color: var(--br-muted);
    font-size: 12px;
    white-space: nowrap;
  }
  .scan-gaps {
    margin: 0 0 14px;
  }
  .scan-gaps h3 {
    font-size: 14px;
    margin: 0 0 6px;
  }
  .scan-gaps ul {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.55;
  }
  .scan-gaps p,
  .scan-guidance,
  .scan-context {
    font-size: 12px;
    line-height: 1.6;
    color: var(--br-muted);
  }
  .scan-gaps p {
    margin: 8px 0 0;
  }
  .scan-guidance {
    margin: 10px 0 16px;
  }
  .coverage-breakdown {
    border-top: 1px solid var(--br-border);
    padding-top: 8px;
  }
  .coverage-breakdown > summary {
    font-size: 13px;
    font-weight: 500;
    color: var(--br-muted);
    padding: 6px 0;
  }
  .scan-context {
    margin: 10px 0 12px;
  }
  .scan-context code {
    overflow-wrap: anywhere;
  }
  .scan-stat-list {
    display: grid;
    gap: 0;
    margin: 0;
  }
  .scan-stat-list > div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--br-border);
    font-size: 12px;
  }
  .scan-stat-list dt {
    color: var(--br-muted);
  }
  .scan-stat-list dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  .scan-extra-notes > summary {
    padding: 8px 0;
    font-size: 13px;
  }
  .scan-extra-notes ul {
    font-size: 12px;
    line-height: 1.55;
  }
  .coverage-diagnostics {
    margin-top: 12px;
    padding-top: 4px;
  }
  .confidence-help {
    margin-top: 12px;
  }
  .uncertainty-scope {
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 4px 14px;
    margin-top: 12px;
  }
  .uncertainty-scope > summary {
    font-weight: 600;
  }
  .count {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    font-size: 13px;
    border-radius: 5px;
    padding: 1px 7px;
    margin-left: 6px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 9%,
      var(--br-card)
    );
  }
  .reason-group {
    margin: 8px 0;
  }
  .reason-group > summary {
    overflow-wrap: anywhere;
    line-height: 1.7;
  }
  .registry-status {
    display: inline-block;
    margin-left: 8px;
    font-size: 12px;
    color: var(--br-muted);
  }
  .unresolved-row {
    display: grid;
    gap: 8px;
    justify-items: start;
    padding: 14px 0;
    border-top: 1px solid var(--br-border);
    overflow-wrap: anywhere;
  }
  .unresolved-row code {
    color: var(--br-muted);
  }
  .edge {
    padding: 16px 0;
    border-top: 1px solid var(--br-border);
    overflow-wrap: anywhere;
  }
  .source-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .source-heading > div {
    min-width: 0;
  }
  .source-icon {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    color: var(--br-muted);
  }
  .source-meta {
    font-size: 12px;
    color: var(--br-muted);
  }
  .source-name {
    color: inherit;
    font: inherit;
    font-weight: 600;
    overflow-wrap: anywhere;
    text-decoration: none;
  }
  button.source-name {
    border: 0;
    border-radius: 3px;
    padding: 0;
    min-height: 0;
    background: none;
    text-align: left;
  }
  a.source-name:hover,
  button.source-name:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  a.open-source,
  button.open-source {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    border: 1px solid var(--br-border);
    border-radius: 7px;
    padding: 6px 11px;
    background: var(--br-card);
    color: var(--primary-text-color, #212121);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
  a.open-source:hover,
  button.open-source:hover {
    border-color: var(--br-accent);
  }
  .purpose {
    margin: 7px 0 0;
    font-size: 14px;
  }
  .review-hint {
    display: block;
    color: var(--br-muted);
    font-size: 13px;
    margin-top: 4px;
  }
  .dependency-map {
    margin: 20px 0;
  }
  .map-selected {
    max-width: 600px;
    margin: 0 auto 24px;
    padding: 12px 16px 0;
    border: 1px solid var(--br-accent);
    border-radius: 10px;
  }
  .map-selected .graph-node {
    border: 0;
    margin-bottom: 0;
    padding: 10px 0 0;
  }
  .map-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--br-muted);
  }
  .map-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .map-group {
    min-width: 0;
    border-top: 2px solid var(--br-border);
    padding-top: 18px;
  }
  .map-group > h3 {
    font-size: 18px;
  }
  .map-group > p {
    font-size: 14px;
    margin: 8px 0 18px;
  }
  .graph-node {
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 14px 16px 4px;
    margin-bottom: 12px;
  }
  .via {
    font-size: 14px;
    margin: 10px 0 0;
    color: var(--br-muted);
  }
  .via .source-name {
    font-weight: 500;
  }
  .change-preview {
    margin-top: 0;
    padding: 6px 22px;
  }
  .change-preview > summary {
    font-weight: 600;
    padding: 14px 0;
  }
  .preview-form {
    max-width: 680px;
    padding: 12px 0;
  }
  .preview-form h2 {
    display: none;
  }
  td code {
    display: block;
    margin-top: 6px;
  }
  .uncertainty .reference {
    margin: 12px 0;
  }
  .result-filters {
    margin: 0 0 16px;
    border-bottom: 1px solid var(--br-border);
    padding-bottom: 6px;
  }
  .result-filters > summary {
    width: fit-content;
    padding: 10px 0;
    color: var(--br-muted);
    font-size: 13px;
    font-weight: 500;
  }
  .filter-body {
    padding-top: 6px;
  }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }
  .filter-label {
    font-size: 12px;
    font-weight: 600;
    margin-right: 4px;
  }
  .filter-row button {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 16px;
  }
  .filter-row button[aria-pressed="true"] {
    background: var(--primary-text-color, #212121);
    color: var(--br-card);
    border-color: var(--primary-text-color, #212121);
  }
  .filter-note,
  .totals-label {
    font-size: 12px;
    line-height: 1.5;
  }
  .node-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }
  .analyze-node {
    padding: 6px 8px;
    font-size: 12px;
  }
  .graph-node .reference-title {
    flex-wrap: wrap;
  }
  .selector-detail {
    font-size: 12px;
    line-height: 1.5;
  }
  .issue-link {
    color: var(--br-muted);
    display: inline-block;
    margin-top: 12px;
    font-size: 12px;
  }
  @media (max-width: 850px) {
    main {
      padding: 22px 18px;
    }
  }
  @media (max-width: 1000px) {
    .source-grid,
    .map-columns,
    .flow-targets,
    .graph-context-grid {
      grid-template-columns: 1fr;
    }
    .reference {
      padding: 12px 13px;
    }
    .impact-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .impact-metrics > div:nth-child(2) {
      border-right: 0;
    }
    .impact-metrics > div:nth-child(-n + 2) {
      border-bottom: 1px solid var(--br-border);
    }
  }
  @media (max-width: 760px) {
    .impact-summary,
    .graph-direction {
      grid-template-columns: 1fr;
    }
    .impact-verdict {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
    }
    .role-heading,
    .flow-group > summary {
      align-items: flex-start;
      flex-direction: column;
    }
    .role-count,
    .flow-count {
      white-space: normal;
    }
  }
  @media (max-width: 500px) {
    header {
      padding: 0 12px;
      gap: 8px;
    }
    header .brand-mark {
      width: 28px;
      height: 28px;
    }
    header .release-label {
      display: none;
    }
    header strong {
      font-size: 17px;
    }
    h1 {
      font-size: 23px;
    }
    .impact-summary {
      grid-template-columns: 1fr;
    }
    .impact-verdict {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
    }
    .impact-metrics {
      grid-template-columns: 1fr;
    }
    .impact-metrics > div {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
      padding: 12px 16px;
    }
    .impact-metrics > div:last-child {
      border-bottom: 0;
    }
    .result-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }
    .result-badges {
      justify-content: flex-start;
    }
    .coverage-status {
      align-items: flex-start;
      flex-direction: column;
    }
    .coverage-status button {
      width: 100%;
    }
    .section-heading,
    .diagnostics-link {
      align-items: stretch;
      flex-direction: column;
    }
    .lane-metadata {
      justify-content: flex-start;
    }
    .diagnostics-link button {
      width: 100%;
    }
    .analysis-options {
      width: 100%;
    }
    .analysis-options-body {
      align-items: stretch;
      flex-direction: column;
      gap: 4px;
    }
    .search {
      flex-wrap: wrap;
    }
    .search label {
      flex-basis: 70%;
    }
    .search button {
      width: 100%;
    }
    .card {
      padding: 16px;
    }
    nav button {
      padding: 12px 9px;
    }
    .path {
      align-items: start;
      flex-direction: column;
    }
    .reference-title {
      gap: 8px;
    }
    .technical-row {
      gap: 6px;
    }
    .source-heading {
      gap: 8px;
    }
    .source-icon {
      width: 22px;
      height: 22px;
      flex-basis: 22px;
    }
    .reference-title h3 {
      font-size: 16px;
    }
    .reference,
    .graph-node {
      padding-left: 12px;
      padding-right: 12px;
    }
    a.open-source,
    button.open-source {
      min-height: 44px;
      padding: 6px 8px;
    }
    .coverage-pill,
    .preview-shortcut {
      min-height: 40px;
    }
    .foot {
      flex-direction: column;
    }
  }
`;
