# Elwynnkeep website

Next.js (App Router, TS, Tailwind v4) site for an AzerothCore 3.3.5a realm.

## Style rules
- Minimum text size is `text-sm` (Tailwind) / `0.875rem` (CSS). Never use `text-xs`, `text-[10px]`, or any font-size below 0.875rem.
- 2005-era WoW look: gold `#ffd100`, dark brown/black panels, Verdana/Tahoma body, `.panel` / `.panel-title` / `.btn` / `.input` classes from `globals.css`.
- Fixed site width via `.site` (`--site-width: 1200px`), fluid below.

## Data
- `acore_auth` (accounts, realmlist, uptime), `acore_characters` (characters, inventory, achievements), `acore_world` (item_template) via pools in `src/lib/db.ts`.
- Auth is SRP6 (`src/lib/srp6.ts`) — compatible with in-game accounts.
- Item/achievement icons, names and tooltips come from wotlkdb.com (`src/lib/wotlkdb.ts`), never Wowhead (region-locked).
- Use Tailwind text-size utilities only (`text-sm`, `text-base`, `text-lg`, …). No custom `font-size` values in CSS or inline styles; in `globals.css` use `@apply text-*`. The single exception is `html { font-size: 13px }`, the root scale that makes the whole site render at the 2005-era size — never change it and never add other root/px sizes.
