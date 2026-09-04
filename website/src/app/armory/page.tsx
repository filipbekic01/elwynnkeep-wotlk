import type { Metadata } from "next";
import Link from "next/link";
import SearchForm from "@/components/armory/SearchForm";
import { searchCharacters } from "@/lib/armory";
import { RACES, CLASSES, CLASS_COLORS, faction } from "@/lib/wow";

export const metadata: Metadata = {
  title: "Armory",
  description: "Search and inspect any character on Elwynnkeep — gear, stats and achievements on the 3.3.5a realm.",
  alternates: { canonical: "/armory" },
};

export default async function ArmoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query.length >= 2 ? await searchCharacters(query) : [];

  return (
    <div className="site py-12"><div className="mx-auto max-w-[720px] space-y-6">
      <div className="panel">
        <div className="panel-title">Armory</div>
        <p className="mb-4" style={{ color: "var(--muted)" }}>Look up any character on Elwynnkeep.</p>
        <SearchForm q={query} />
      </div>

      {query.length >= 2 && (
        <div className="panel">
          <div className="panel-title">Results for &quot;{query}&quot;</div>
          {results.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No characters found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm uppercase" style={{ color: "var(--muted)" }}>
                  <th className="pb-2 pr-3">Name</th><th className="pb-2 pr-3">Level</th><th className="pb-2 pr-3">Race</th><th className="pb-2 pr-3">Class</th><th className="pb-2">Faction</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => (
                  <tr key={c.guid} style={{ borderTop: "1px solid #2a2116" }}>
                    <td className="py-2 pr-3 font-bold"><Link href={`/armory/${encodeURIComponent(c.name)}`} style={{ color: CLASS_COLORS[c.class] }}>{c.name}</Link></td>
                    <td className="py-2 pr-3">{c.level}</td>
                    <td className="py-2 pr-3">{RACES[c.race]}</td>
                    <td className="py-2 pr-3">{CLASSES[c.class]}</td>
                    <td className="py-2" style={{ color: faction(c.race) === "Alliance" ? "#4a90e2" : "#c41f3b" }}>{faction(c.race)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div></div>
  );
}
