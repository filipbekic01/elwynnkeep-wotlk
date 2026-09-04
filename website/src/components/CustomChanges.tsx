"use client";

import { useState, type ReactNode } from "react";

type Entry = { title: string; body: ReactNode };

const ENTRIES: Entry[] = [
  {
    title: "Random level loot",
    body: (
      <>
        <p>
          Every creature that normally has loot now has a chance to drop one extra piece of equipment on top of
          its regular loot table. The item is picked from the entire 3.3.5a item pool, but only from gear that
          makes sense for you: a weapon or armor piece your class and race can wear, with a required level within
          five levels of yours. Armor type is not checked, so a mage can loot plate, and that is part of the fun.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <span className="font-bold" style={{ color: "#1eff00" }}>15%</span> chance of an uncommon or lower
            quality item, <span className="font-bold" style={{ color: "#0070dd" }}>7%</span> chance of a rare,
            and <span className="font-bold" style={{ color: "#a335ee" }}>2%</span> chance of an epic. Each chance
            rolls on its own and the best result wins, so at most one piece of gear drops per kill.
          </li>
          <li>
            A separate <span className="font-bold">20%</span> chance drops a potion suited to your level, from
            healing and mana potions to the protection and utility ones you would otherwise never see.
          </li>
          <li>
            The item level is capped by the creature you killed and by the lowest level player in your group. A
            level 60 farming level 15 mobs gets level 15 gear, and a level 20 being carried through a level 60
            zone gets level 20 gear.
          </li>
          <li>
            Set pieces, legendary and artifact items, and top end raid gear never drop this way. Raids stay the
            place for the best gear. Critters, pets and totems drop nothing extra.
          </li>
        </ul>
      </>
    ),
  },
];

export default function CustomChanges() {
  // The newest change sits on top and is always expanded; older ones fold away.
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="panel">
      <div className="panel-title">Welcome</div>
      <p>
        Most of us have played this expansion many times over, so on top of the original game we apply our own
        custom changes. Every one of them is built on the content Blizzard made, never instead of it, and exists
        only to make the old-fashioned way of playing feel fresh again. Everything we change is listed below, with
        the newest change always shown in full and older ones folded beneath it.
      </p>
      <p className="mt-3">
        None of it needs extra downloads or patches. Elwynnkeep relies fully on the original 3.3.5a client, which
        you can get anywhere, and every custom change lives on the server side.
      </p>

      {ENTRIES.map((entry, i) => {
        const pinned = i === 0;
        const expanded = pinned || open === i;
        const number = ENTRIES.length - i;
        return (
          <div key={entry.title}>
            <button
              type="button"
              onClick={() => !pinned && setOpen(expanded ? null : i)}
              aria-expanded={expanded}
              disabled={pinned}
              className="mt-5 flex w-full items-center gap-3 py-2 text-left text-base font-bold disabled:cursor-default"
              style={{
                color: "var(--gold-dim)",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span className="w-5 text-center font-mono" style={{ color: "var(--gold-dim)" }}>
                {pinned ? "»" : expanded ? "–" : "+"}
              </span>
              <span className="flex-1">
                {number}. {entry.title}
              </span>
              {pinned && (
                <span className="text-sm font-normal uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Latest
                </span>
              )}
            </button>
            {expanded && <div className="mt-4">{entry.body}</div>}
          </div>
        );
      })}
    </section>
  );
}
