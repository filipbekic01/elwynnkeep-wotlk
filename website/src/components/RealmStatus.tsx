import { getRealmStatus, formatUptime } from "@/lib/realm";

export default async function RealmStatus() {
  const realm = await getRealmStatus();
  const realmlist = process.env.NEXT_PUBLIC_REALMLIST ?? realm?.address ?? "logon.elwynnkeep.com";

  return (
    <section className="panel">
      <div className="panel-title flex items-center justify-between">
        Realm Status
        <span className="group relative inline-flex h-5 w-5 cursor-help before:absolute before:-inset-3 before:content-[''] items-center justify-center rounded-full border border-[var(--border-hi)] text-sm font-bold normal-case text-[var(--gold-dim)]">
          ?
          <span className="absolute right-0 top-full z-10 mt-2 hidden w-max border-2 border-[var(--border)] bg-[#15100c] px-3 py-2 text-left text-sm font-normal normal-case tracking-normal shadow-[0_0_12px_#000] group-hover:block">
            <span className="mb-1 block font-bold text-[var(--gold)]">Server specs</span>
            <span className="block text-[#e8dcc0]">CPU: 6 cores @ 4.00 GHz</span>
            <span className="block text-[#e8dcc0]">RAM: 32 GB DDR4 ECC</span>
          </span>
        </span>
      </div>
      <dl className="space-y-2">
        <div className="flex justify-between"><dt>Realm</dt><dd>{realm?.name ?? process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep"}</dd></div>
        <div className="flex justify-between"><dt>Type</dt><dd>{realm?.type ?? "—"}</dd></div>
        <div className="flex justify-between"><dt>Rates</dt><dd>1x, true to original</dd></div>
        <div className="flex justify-between">
          <dt>Status</dt>
          <dd style={{ color: realm?.online ? "#5fd35f" : "#e05a5a" }}>{realm ? (realm.online ? "Online" : "Offline") : "Unknown"}</dd>
        </div>
        {realm?.online && (
          <>
            <div className="flex justify-between"><dt>Players online</dt><dd>{realm.players}</dd></div>
            {realm.uptime != null && <div className="flex justify-between"><dt>Uptime</dt><dd>{formatUptime(realm.uptime)}</dd></div>}
          </>
        )}
      </dl>
      <div className="divider" />
      <dt>Realmlist</dt>
      <pre className="input mt-1 overflow-x-auto px-3 py-3 text-base font-bold" style={{ color: "var(--gold)" }}>{realmlist}</pre>
    </section>
  );
}
