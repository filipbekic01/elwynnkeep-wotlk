import { RACES, CLASSES, CLASS_COLORS, faction, formatMoney, formatPlaytime, EQUIP_SLOTS, LEFT_SLOTS, RIGHT_SLOTS, WEAPON_SLOTS } from "@/lib/wow";
import type { CharacterRow, EquippedItem, CharStats } from "@/lib/armory";
import ItemSlot from "./ItemSlot";

const slotName = (slot: number) => EQUIP_SLOTS.find((s) => s.slot === slot)?.name ?? `Slot ${slot}`;

function Stat({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="stat-cell">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

type Props = { char: CharacterRow; items: EquippedItem[]; stats: CharStats };

export default function CharacterSheet({ char, items, stats }: Props) {
  const bySlot = new Map(items.map((i) => [i.slot, i]));
  const classColor = CLASS_COLORS[char.class] ?? "#fff";
  const fac = faction(char.race);
  const facColor = fac === "Alliance" ? "#4a90e2" : "#c41f3b";
  const gear = items.filter((i) => ![3, 18].includes(i.slot));
  const avgIlvl = gear.length ? Math.round(gear.reduce((a, i) => a + i.itemLevel, 0) / gear.length) : 0;

  return (
    <div className="panel flex flex-col">
      <div className="panel-title">Equipment</div>

      <div className="doll-wrap flex flex-1 items-center justify-center">
        <div className="doll w-full sm:w-[80%]">
          <div className="gear-col">
            {LEFT_SLOTS.map((s) => <ItemSlot key={s} label={slotName(s)} slot={s} item={bySlot.get(s)} />)}
          </div>
          <div className="portrait-frame">
            <div className="portrait-caption">
              <div className="text-2xl font-bold" style={{ color: classColor }}>{char.name}</div>
              <div className="text-sm uppercase tracking-widest" style={{ color: "var(--gold-dim)" }}>
                Level {char.level} {RACES[char.race]} {CLASSES[char.class]}
              </div>
              <div className="mt-1 text-sm">
                <span style={{ color: facColor }}>{fac}</span>
                <span style={{ color: "var(--muted)" }}> · </span>
                <span style={{ color: char.online ? "#5fd35f" : "var(--muted)" }}>{char.online ? "Online" : "Offline"}</span>
              </div>
              <div className="stat-grid">
                <Stat label="Avg. item level" value={avgIlvl || null} />
                <Stat label="Played" value={formatPlaytime(char.totaltime)} />
                <Stat label="Gold" value={formatMoney(char.money)} />
              </div>
            </div>
          </div>
          <div className="gear-col">
            {RIGHT_SLOTS.map((s) => <ItemSlot key={s} label={slotName(s)} slot={s} item={bySlot.get(s)} />)}
          </div>
          <div className="weapons">
            {WEAPON_SLOTS.map((s) => <ItemSlot key={s} label={slotName(s)} slot={s} item={bySlot.get(s)} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
