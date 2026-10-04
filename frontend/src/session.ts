export type AnalysisTab = "impact" | "graph" | "raw";
export interface RecentSearch {
  entityId: string;
  depth: number;
}
export interface SavedView extends RecentSearch {
  tab: AnalysisTab;
  scrollTop: number;
}
export interface PanelSession {
  recent: RecentSearch[];
  last?: SavedView;
}

const memory = new Map<string, PanelSession>();
const depths = [1, 2, 3, 4, 6, 8, 12];
const isSearch = (value: unknown): value is RecentSearch => {
  if (!value || typeof value !== "object") return false;
  const search = value as RecentSearch;
  return (
    typeof search.entityId === "string" &&
    search.entityId.length <= 512 &&
    /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(search.entityId) &&
    depths.includes(search.depth)
  );
};

export function sessionKey(userId?: string): string | undefined {
  return userId ? `blast-radius:session:v1:${userId}` : undefined;
}

export function rememberSearch(
  recent: RecentSearch[],
  search: RecentSearch,
): RecentSearch[] {
  return [
    search,
    ...recent.filter((item) => item.entityId !== search.entityId),
  ].slice(0, 6);
}

export function readSession(key?: string): PanelSession {
  if (!key) return { recent: [] };
  if (memory.has(key)) return memory.get(key)!;
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(key);
  } catch {
    return memory.get(key) || { recent: [] };
  }
  try {
    if (!raw || raw.length > 16_384) return { recent: [] };
    const parsed = JSON.parse(raw);
    const recent: RecentSearch[] = [];
    if (Array.isArray(parsed?.recent)) {
      for (const item of parsed.recent) {
        if (
          isSearch(item) &&
          !recent.some((entry) => entry.entityId === item.entityId)
        ) {
          recent.push({ entityId: item.entityId, depth: item.depth });
          if (recent.length === 6) break;
        }
      }
    }
    const last = parsed?.last as SavedView | undefined;
    return {
      recent,
      ...(isSearch(last) &&
      ["impact", "graph", "raw"].includes(last.tab) &&
      Number.isFinite(last.scrollTop) &&
      last.scrollTop >= 0 &&
      last.scrollTop <= 10_000_000
        ? {
            last: {
              entityId: last.entityId,
              depth: last.depth,
              tab: last.tab,
              scrollTop: last.scrollTop,
            },
          }
        : {}),
    };
  } catch {
    return { recent: [] };
  }
}

export function writeSession(key: string | undefined, value: PanelSession) {
  if (!key) return;
  memory.set(key, value);
  try {
    if (!value.last && !value.recent.length) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full. Retain metadata in this page's memory;
    // analysis and native source navigation must still work.
  }
}
