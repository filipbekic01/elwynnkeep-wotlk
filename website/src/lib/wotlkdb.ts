// Data from wotlkdb.com (AoWoW): item/achievement names, icons and tooltip HTML.
const BASE = "https://wotlkdb.com";
const REVALIDATE = 60 * 60 * 24 * 30;

export const iconUrl = (icon: string, size: "small" | "medium" | "large" = "large") =>
  `${BASE}/static/images/wow/icons/${size}/${icon.toLowerCase()}.jpg`;

export const itemUrl = (id: number) => `${BASE}/?item=${id}`;
export const achievementUrl = (id: number) => `${BASE}/?achievement=${id}`;

export type PowerData = { name: string; icon: string; quality?: number; tooltip: string };

function unescapeJs(s: string) {
  return s.replace(/\\(["'\/\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

function field(src: string, name: string): string | null {
  const m = src.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  return m ? unescapeJs(m[1]) : null;
}

async function fetchPower(query: string): Promise<PowerData | null> {
  try {
    const res = await fetch(`${BASE}/?${query}&power`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const src = await res.text();
    const name = field(src, "name_enus");
    const icon = field(src, "icon");
    const tooltip = field(src, "tooltip_enus");
    if (!name || !icon) return null;
    const q = src.match(/quality:\s*(\d+)/);
    const absTooltip = (tooltip ?? "").replace(/(src|href)="\/static/g, `$1="${BASE}/static`).replace(/href="\/?\?/g, `href="${BASE}/?`);
    return { name, icon, tooltip: absTooltip, quality: q ? Number(q[1]) : undefined };
  } catch {
    return null;
  }
}

export function getItemPower(id: number, enchant = 0, rand = 0) {
  const extra = `${enchant ? `&ench=${enchant}` : ""}${rand ? `&rand=${rand}` : ""}`;
  return fetchPower(`item=${id}${extra}`);
}

export const getAchievementPower = (id: number) => fetchPower(`achievement=${id}`);
