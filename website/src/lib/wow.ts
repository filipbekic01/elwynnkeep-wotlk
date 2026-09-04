export const RACES: Record<number, string> = {
  1: "Human", 2: "Orc", 3: "Dwarf", 4: "Night Elf", 5: "Undead", 6: "Tauren",
  7: "Gnome", 8: "Troll", 10: "Blood Elf", 11: "Draenei",
};

export const CLASSES: Record<number, string> = {
  1: "Warrior", 2: "Paladin", 3: "Hunter", 4: "Rogue", 5: "Priest", 6: "Death Knight",
  7: "Shaman", 8: "Mage", 9: "Warlock", 11: "Druid",
};

export const CLASS_COLORS: Record<number, string> = {
  1: "#C79C6E", 2: "#F58CBA", 3: "#ABD473", 4: "#FFF569", 5: "#FFFFFF", 6: "#C41F3B",
  7: "#0070DE", 8: "#69CCF0", 9: "#9482C9", 11: "#FF7D0A",
};

export const ALLIANCE_RACES = new Set([1, 3, 4, 7, 11]);
export function faction(race: number) {
  return ALLIANCE_RACES.has(race) ? "Alliance" : "Horde";
}

export function formatMoney(copper: number) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return `${g}g ${s}s ${c}c`;
}

export function formatPlaytime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

export const GENDERS: Record<number, string> = { 0: "Male", 1: "Female" };

export const QUALITY_COLORS: Record<number, string> = {
  0: "#9d9d9d", 1: "#ffffff", 2: "#1eff00", 3: "#0070dd", 4: "#a335ee", 5: "#ff8000", 6: "#e6cc80", 7: "#e6cc80",
};

// Equipment slot indices in character_inventory (bag = 0)
export const EQUIP_SLOTS = [
  { slot: 0, name: "Head" }, { slot: 1, name: "Neck" }, { slot: 2, name: "Shoulder" }, { slot: 14, name: "Back" },
  { slot: 4, name: "Chest" }, { slot: 3, name: "Shirt" }, { slot: 18, name: "Tabard" }, { slot: 8, name: "Wrist" },
  { slot: 9, name: "Hands" }, { slot: 5, name: "Waist" }, { slot: 6, name: "Legs" }, { slot: 7, name: "Feet" },
  { slot: 10, name: "Ring 1" }, { slot: 11, name: "Ring 2" }, { slot: 12, name: "Trinket 1" }, { slot: 13, name: "Trinket 2" },
  { slot: 15, name: "Main Hand" }, { slot: 16, name: "Off Hand" }, { slot: 17, name: "Ranged" },
] as const;

export const LEFT_SLOTS = [0, 1, 2, 14, 4, 3, 18, 8];
export const RIGHT_SLOTS = [9, 5, 6, 7, 10, 11, 12, 13];
export const WEAPON_SLOTS = [15, 16, 17];

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** 30th August, 2026 */
export function formatDate(input: Date | string | number) {
  const d = new Date(input);
  return `${ordinal(d.getDate())} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

/** 30th August, 2026 at 14:05 */
export function formatDateTime(input: Date | string | number) {
  const d = new Date(input);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} at ${hh}:${mm}`;
}

/** "3 hours ago", "2 days ago" */
export function timeAgo(input: Date | string | number) {
  const diff = Math.max(0, Date.now() - new Date(input).getTime()) / 1000;
  const units: [string, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, secs] of units) {
    const n = Math.floor(diff / secs);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
