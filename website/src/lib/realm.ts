import { connect } from "net";
import type { RowDataPacket } from "mysql2";
import { authDb, charDb } from "./db";

export type RealmStatus = {
  name: string;
  address: string;
  port: number;
  type: string;
  online: boolean;
  players: number;
  uptime: number | null; // seconds
};

const REALM_TYPES: Record<number, string> = { 0: "Normal", 1: "PvP", 6: "RP", 8: "RP-PvP" };

function checkPort(host: string, port: number, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = connect({ host, port });
    const done = (ok: boolean) => { sock.destroy(); resolve(ok); };
    sock.setTimeout(timeoutMs);
    sock.once("connect", () => done(true));
    sock.once("timeout", () => done(false));
    sock.once("error", () => done(false));
  });
}

let cache: { at: number; data: RealmStatus | null } = { at: 0, data: null };
const TTL_MS = 30_000;

export async function getRealmStatus(): Promise<RealmStatus | null> {
  if (Date.now() - cache.at < TTL_MS) return cache.data;

  try {
    const [realms] = await authDb.query<RowDataPacket[]>(
      "SELECT id, name, address, localAddress, port, icon FROM realmlist ORDER BY id LIMIT 1",
    );
    const r = realms[0];
    if (!r) return null;

    const host = process.env.WORLDSERVER_HOST || r.localAddress || r.address;
    const [online, [players], [uptime]] = await Promise.all([
      checkPort(host, r.port),
      charDb.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM characters WHERE online = 1"),
      authDb.query<RowDataPacket[]>("SELECT starttime, uptime FROM uptime WHERE realmid = ? ORDER BY starttime DESC LIMIT 1", [r.id]),
    ]);

    const up = uptime[0] ? Math.floor(Date.now() / 1000) - Number(uptime[0].starttime) : null;

    cache = {
      at: Date.now(),
      data: {
        name: r.name,
        address: r.address,
        port: r.port,
        type: REALM_TYPES[r.icon] ?? "Normal",
        online,
        players: Number(players[0]?.n ?? 0),
        uptime: online ? up : null,
      },
    };
  } catch {
    cache = { at: Date.now(), data: null };
  }
  return cache.data;
}

export function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}
