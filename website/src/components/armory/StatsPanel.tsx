import type { CharStats } from "@/lib/armory";

const POWER_LABEL: Record<number, string> = { 1: "Mana", 2: "Rage", 4: "Energy", 6: "Runic Power" };
const CLASS_POWER: Record<number, number> = { 1: 2, 2: 1, 3: 1, 4: 4, 5: 1, 6: 6, 7: 1, 8: 1, 9: 1, 11: 1 };
const POWER_COLUMN: Record<number, string> = { 1: "maxpower1", 2: "maxpower2", 4: "maxpower4", 6: "maxpower7" };

const pct = (v: number | null | undefined) => (v != null ? `${Number(v).toFixed(1)}%` : null);

function Stat({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="stat-cell">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default function StatsPanel({ stats, charClass }: { stats: CharStats; charClass: number }) {
  const powerType = CLASS_POWER[charClass] ?? 1;
  return (
    <div className="panel">
      <div className="panel-title">Stats</div>
      {!stats ? (
        <p style={{ color: "var(--muted)" }}>No stats recorded yet.</p>
      ) : (
        <div className="stats-rows">
          <div className="stat-grid">
            <Stat label="Health" value={stats.maxhealth} />
            <Stat label={POWER_LABEL[powerType]} value={stats[POWER_COLUMN[powerType]]} />
            <Stat label="Armor" value={stats.armor} />
            <Stat label="Strength" value={stats.strength} />
            <Stat label="Agility" value={stats.agility} />
            <Stat label="Stamina" value={stats.stamina} />
            <Stat label="Intellect" value={stats.intellect} />
            <Stat label="Spirit" value={stats.spirit} />
            <Stat label="Resilience" value={stats.resilience} />
            <Stat label="Melee AP" value={stats.attackPower} />
            <Stat label="Ranged AP" value={stats.rangedAttackPower} />
            <Stat label="Spell Power" value={stats.spellPower} />
            <Stat label="Melee Crit" value={pct(stats.critPct)} />
            <Stat label="Ranged Crit" value={pct(stats.rangedCritPct)} />
            <Stat label="Spell Crit" value={pct(stats.spellCritPct)} />
            <Stat label="Dodge" value={pct(stats.dodgePct)} />
            <Stat label="Parry" value={pct(stats.parryPct)} />
            <Stat label="Block" value={pct(stats.blockPct)} />
          </div>
        </div>
      )}
    </div>
  );
}
