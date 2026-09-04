import type { RowDataPacket } from "mysql2";
import { charDb, worldDb } from "./db";
import { getItemPower, getAchievementPower, type PowerData } from "./wotlkdb";

export type CharacterRow = {
  guid: number; name: string; race: number; class: number; gender: number; level: number;
  money: number; totaltime: number; online: number; zone: number; map: number;
  guild?: string | null;
  skin: number; face: number; hairStyle: number; hairColor: number; facialStyle: number;
};

export type EquippedItem = {
  slot: number; entry: number; name: string; quality: number; itemLevel: number;
  enchant: number; randomProp: number; displayId: number;
  power: PowerData | null;
};

export type CharStats = Record<string, number> | null;

export async function searchCharacters(q: string, limit = 20): Promise<CharacterRow[]> {
  const [rows] = await charDb.query<RowDataPacket[]>(
    "SELECT guid, name, race, class, gender, level, online FROM characters WHERE LOWER(name) LIKE ? ORDER BY level DESC, name ASC LIMIT ?",
    [`%${q.toLowerCase()}%`, limit],
  );
  return rows as CharacterRow[];
}

export async function getCharacterByName(name: string): Promise<CharacterRow | null> {
  const [rows] = await charDb.query<RowDataPacket[]>(
    `SELECT c.guid, c.name, c.race, c.class, c.gender, c.level, c.money, c.totaltime, c.online, c.zone, c.map, g.name AS guild,
            c.skin, c.face, c.hairStyle, c.hairColor, c.facialStyle
     FROM characters c
     LEFT JOIN guild_member gm ON gm.guid = c.guid
     LEFT JOIN guild g ON g.guildid = gm.guildid
     WHERE LOWER(c.name) = ? LIMIT 1`,
    [name.toLowerCase()],
  );
  return (rows[0] as CharacterRow) ?? null;
}

export async function getEquipment(guid: number): Promise<EquippedItem[]> {
  const [inv] = await charDb.query<RowDataPacket[]>(
    `SELECT ci.slot, ii.itemEntry, ii.enchantments, ii.randomPropertyId
     FROM character_inventory ci
     JOIN item_instance ii ON ii.guid = ci.item
     WHERE ci.guid = ? AND ci.bag = 0 AND ci.slot <= 18`,
    [guid],
  );
  if (!inv.length) return [];

  const entries = [...new Set(inv.map((r) => r.itemEntry as number))];
  const [tpl] = await worldDb.query<RowDataPacket[]>(
    "SELECT entry, name, Quality, ItemLevel, displayid FROM item_template WHERE entry IN (?)",
    [entries],
  );
  const byEntry = new Map(tpl.map((t) => [t.entry as number, t]));

  return Promise.all(inv.map(async (r) => {
    const t = byEntry.get(r.itemEntry);
    // enchantments column: space-separated ints, permanent enchant id is first
    const enchant = Number(String(r.enchantments ?? "").trim().split(/\s+/)[0] ?? 0) || 0;
    return {
      slot: r.slot,
      entry: r.itemEntry,
      name: t?.name ?? `Item #${r.itemEntry}`,
      quality: t?.Quality ?? 1,
      itemLevel: t?.ItemLevel ?? 0,
      enchant,
      randomProp: r.randomPropertyId ?? 0,
      displayId: t?.displayid ?? 0,
      power: await getItemPower(r.itemEntry, enchant, r.randomPropertyId ?? 0),
    };
  }));
}

export async function getStats(guid: number): Promise<CharStats> {
  try {
    const [rows] = await charDb.query<RowDataPacket[]>(
      "SELECT * FROM character_stats WHERE guid = ? LIMIT 1",
      [guid],
    );
    return (rows[0] as Record<string, number>) ?? null;
  } catch {
    return null;
  }
}

export type AchievementRow = { achievement: number; date: number; power: PowerData | null };

export async function getRecentAchievements(guid: number, limit = 20): Promise<AchievementRow[]> {
  const [rows] = await charDb.query<RowDataPacket[]>(
    "SELECT achievement, date FROM character_achievement WHERE guid = ? ORDER BY date DESC LIMIT ?",
    [guid, limit],
  );
  return Promise.all(rows.map(async (r) => ({ achievement: r.achievement, date: r.date, power: await getAchievementPower(r.achievement) })));
}
