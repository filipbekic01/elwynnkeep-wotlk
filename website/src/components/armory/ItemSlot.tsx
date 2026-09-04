import type { EquippedItem } from "@/lib/armory";
import { iconUrl, itemUrl } from "@/lib/wotlkdb";
import Tooltip from "@/components/Tooltip";

const QUALITY_COLORS: Record<number, string> = {
  0: "#9d9d9d", // poor
  1: "#ffffff", // common
  2: "#1eff00", // uncommon
  3: "#0070dd", // rare
  4: "#a335ee", // epic
  5: "#ff8000", // legendary
  6: "#e6cc80", // artifact
  7: "#e6cc80", // heirloom
};

/** wotlkdb inventoryslot_* empty-slot textures, keyed by equipment slot. */
const EMPTY_ICONS: Record<number, string> = {
  0: "inventoryslot_head",
  1: "inventoryslot_neck",
  2: "inventoryslot_shoulder",
  3: "inventoryslot_shirt",
  4: "inventoryslot_chest",
  5: "inventoryslot_waist",
  6: "inventoryslot_legs",
  7: "inventoryslot_feet",
  8: "inventoryslot_wrists",
  9: "inventoryslot_hands",
  10: "inventoryslot_finger",
  11: "inventoryslot_finger",
  12: "inventoryslot_trinket",
  13: "inventoryslot_trinket",
  14: "inventoryslot_chest", // back — the client reuses the chest slot texture
  15: "inventoryslot_mainhand",
  16: "inventoryslot_offhand",
  17: "inventoryslot_ranged",
  18: "inventoryslot_tabard",
};

export default function ItemSlot({ label, slot, item }: { label: string; slot?: number; item?: EquippedItem }) {
  if (!item?.power) {
    const empty = slot != null ? EMPTY_ICONS[slot] : undefined;
    return (
      <div className="item-icon empty" title={label}>
        {empty && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconUrl(empty)} alt={`Empty ${label} slot`} width={48} height={48} className="opacity-50" />
        )}
      </div>
    );
  }
  return (
    <Tooltip html={item.power.tooltip}>
      <a
        href={itemUrl(item.entry)}
        target="_blank"
        rel="noopener noreferrer"
        className="item-icon"
        style={item.power.quality != null ? { borderColor: QUALITY_COLORS[item.power.quality] } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl(item.power.icon)} alt={item.power.name} width={48} height={48} />
      </a>
    </Tooltip>
  );
}
