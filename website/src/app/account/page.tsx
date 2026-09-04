export const metadata = { title: "Account", robots: { index: false, follow: false } };
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getSession } from "@/lib/session";
import { authDb, charDb } from "@/lib/db";
import { RACES, CLASSES, CLASS_COLORS, faction, formatMoney, formatPlaytime, formatDate, formatDateTime } from "@/lib/wow";
import Link from "next/link";
import ChangePasswordButton from "@/components/ChangePasswordButton";
import TwoFactorSetup from "@/components/TwoFactorSetup";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT username, email, joindate, last_login, expansion, totp_secret IS NOT NULL AS totpEnabled FROM account WHERE id = ? LIMIT 1",
    [session.id],
  );
  const acc = rows[0];
  if (!acc) redirect("/login");

  const [chars] = await charDb.query<RowDataPacket[]>(
    "SELECT guid, name, race, class, level, money, totaltime, online FROM characters WHERE account = ? ORDER BY level DESC, name ASC",
    [session.id],
  );

  return (
    <div className="site py-12"><div className="mx-auto max-w-[720px] space-y-6">
      <div className="panel">
        <div className="panel-title">Account Panel</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gold)" }}>Welcome, {acc.username}</h1>
        <p className="mt-1" style={{ color: "var(--muted)" }}>Greetings, hero. Your journey awaits.</p>
        <div className="divider" />
        <dl className="grid grid-cols-[140px_1fr] gap-y-2">
          <dt>Email</dt><dd>{acc.email || "—"}</dd>
          <dt>Joined</dt><dd>{formatDate(acc.joindate)}</dd>
          <dt>Last login</dt><dd>{acc.last_login ? formatDateTime(acc.last_login) : "Never"}</dd>
          <dt>Expansion</dt><dd>{["1.x", "2.x", "3.3.5a"][acc.expansion] ?? acc.expansion}</dd>
        </dl>
        <div className="divider" />
        <ChangePasswordButton />
        <div className="divider" />
        <div className="mb-2 font-bold uppercase" style={{ color: "var(--gold)" }}>Two-Factor Authentication</div>
        <TwoFactorSetup enabled={Boolean(acc.totpEnabled)} />
      </div>

      <div className="panel">
        <div className="panel-title">Characters</div>
        {chars.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No characters yet. Log in to the game and create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm uppercase" style={{ color: "var(--muted)" }}>
                  <th className="pb-2 pr-3">Name</th>
                  <th className="pb-2 pr-3">Level</th>
                  <th className="pb-2 pr-3">Race</th>
                  <th className="pb-2 pr-3">Class</th>
                  <th className="pb-2 pr-3">Faction</th>
                  <th className="pb-2 pr-3">Gold</th>
                  <th className="pb-2 pr-3">Played</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {chars.map((c) => (
                  <tr key={c.guid} style={{ borderTop: "1px solid #2a2116" }}>
                    <td className="py-2 pr-3 font-bold"><Link href={`/armory/${encodeURIComponent(c.name)}`} style={{ color: CLASS_COLORS[c.class] ?? "inherit" }}>{c.name}</Link></td>
                    <td className="py-2 pr-3">{c.level}</td>
                    <td className="py-2 pr-3">{RACES[c.race] ?? c.race}</td>
                    <td className="py-2 pr-3">{CLASSES[c.class] ?? c.class}</td>
                    <td className="py-2 pr-3" style={{ color: faction(c.race) === "Alliance" ? "#4a90e2" : "#c41f3b" }}>{faction(c.race)}</td>
                    <td className="py-2 pr-3">{formatMoney(c.money)}</td>
                    <td className="py-2 pr-3">{formatPlaytime(c.totaltime)}</td>
                    <td className="py-2" style={{ color: c.online ? "#5fd35f" : "var(--muted)" }}>{c.online ? "Online" : "Offline"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div></div>
  );
}
