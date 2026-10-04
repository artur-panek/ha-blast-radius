import { html } from "lit";

export function sourceIcon(kind: string) {
  const paths: Record<string, string> = {
    automation: "M6 8v8m0-4h12M18 8v8M3 5h6v4H3zm12 10h6v4h-6zM15 5h6v4h-6z",
    script: "M7 3h7l4 4v14H7zM14 3v5h4M10 12h5m-5 4h5",
    scene: "M4 17l5-6 4 4 3-3 4 5M3 4h18v16H3zM15 8h.01",
    dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
    group: "M4 4h6v6H4zm10 0h6v6h-6zM9 15h6v6H9zM7 10v3h10v-3m-5 3v2",
  };
  return html`<svg class="source-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d=${paths[kind] || "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M8 12h8m-4-4v8"}
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;
}
