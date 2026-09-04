import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterByName, getEquipment, getRecentAchievements, getStats } from "@/lib/armory";
import CharacterSheet from "@/components/armory/CharacterSheet";
import SearchForm from "@/components/armory/SearchForm";
import type { Metadata } from "next";
import { RACES, CLASSES } from "@/lib/wow";
import Achievements from "@/components/armory/Achievements";
import StatsPanel from "@/components/armory/StatsPanel";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const char = await getCharacterByName(decodeURIComponent(name));
  if (!char) return { title: "Character not found", robots: { index: false } };
  const who = `level ${char.level} ${RACES[char.race]} ${CLASSES[char.class]}`;
  return {
    title: `${char.name} — ${who[0].toUpperCase() + who.slice(1)}`,
    description: `Armory profile for ${char.name}, a ${who} on Elwynnkeep. Equipped gear, stats and recent achievements.`,
    alternates: { canonical: `/armory/${encodeURIComponent(char.name)}` },
  };
}

export default async function CharacterPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const char = await getCharacterByName(decodeURIComponent(name));
  if (!char) notFound();

  const [items, achievements, stats] = await Promise.all([getEquipment(char.guid), getRecentAchievements(char.guid, 10), getStats(char.guid)]);

  return (
    <div className="site py-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/armory">« Armory search</Link>
        <div className="w-full max-w-[360px]"><SearchForm /></div>
      </div>

      <div className="armory-row">
        <CharacterSheet char={char} items={items} stats={stats} />
        <StatsPanel stats={stats} charClass={char.class} />
      </div>
      <Achievements achievements={achievements} />

      <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
        Item icons, tooltips and achievement data are loaded from{" "}
        <a href="https://wotlkdb.com/" target="_blank" rel="noopener noreferrer">wotlkdb.com</a>.
      </p>
    </div>
  );
}
