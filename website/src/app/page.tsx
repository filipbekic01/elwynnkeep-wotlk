import Link from "next/link";
import Changelog, { getCommits, COMMITS_URL } from "@/components/Changelog";
import { timeAgo } from "@/lib/wow";
import RealmStatus from "@/components/RealmStatus";
import CustomChanges from "@/components/CustomChanges";
import { getSession } from "@/lib/session";

export default async function Home() {
  const [latest] = await getCommits();
  const session = await getSession();
  const realm = process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep";
  return (
    <>
      <section className="site py-8">
        <div className="panel !p-1">
          <div
            className="banner relative mx-auto flex w-full items-start justify-start bg-cover bg-center"
            style={{ backgroundImage: "url(/img/banner.jpg)", backgroundColor: "#1a2414", boxShadow: "inset 200px 120px 160px -80px rgba(0,0,0,0.85)" }}
          >
            <div className="relative p-6 text-left">
              <h1 className="text-5xl font-bold leading-none first-letter:float-left first-letter:mr-1 first-letter:font-[Georgia,'Times_New_Roman',serif] first-letter:text-[6.5rem] first-letter:leading-[0.75] first-letter:[text-shadow:1px_1px_0_#000]" style={{ color: "var(--gold)" }}>{realm}</h1>
              <p className="mt-1 text-lg font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#f2e9d0", textShadow: "1px 1px 0 #000" }}>
                AzerothCore · 3.3.5a
              </p>
              {latest && (
                <p className="mt-2 text-sm" style={{ color: "var(--muted)", textShadow: "1px 1px 0 #000" }}>
                  Core updated{" "}
                  <a href={latest.html_url} target="_blank" rel="noopener noreferrer" style={{ color: "#f2e9d0" }}>{timeAgo(latest.commit.author.date)}</a>
                  {" "}·{" "}
                  <a href={COMMITS_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="site content-grid pb-8">
        <div className="min-w-0 space-y-6">
          <CustomChanges />

          <Changelog />

        </div>

        <aside className="space-y-6">
          <RealmStatus />
          <a href="https://discord.gg/2bBZATmF3m" target="_blank" rel="noopener noreferrer" className="panel discord-block block text-center no-underline">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="mx-auto mb-2 h-10 w-10" fill="currentColor">
              <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 2.87a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <div className="text-lg font-bold uppercase tracking-wide" style={{ color: "var(--gold)", textShadow: "1px 1px 0 #000" }}>
              Join our Discord
            </div>
            <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Announcements, help and finding groups
            </div>
          </a>
          <section className="panel">
            <div className="panel-title">Quick Links</div>
            <ul className="space-y-1">
              {session ? (
                <li><Link href="/account">» Account Panel</Link></li>
              ) : (
                <>
                  <li><Link href="/register">» Register</Link></li>
                  <li><Link href="/login">» Login</Link></li>
                </>
              )}
              <li><Link href="/armory">» Armory</Link></li>
              <li><a href="https://github.com/filipbekic01/elwynnkeep-wotlk/commits/master" target="_blank" rel="noopener noreferrer">» Changelog (GitHub)</a></li>
              <li><a href="https://discord.gg/2bBZATmF3m" target="_blank" rel="noopener noreferrer">» Discord</a></li>
              <li><Link href="/terms">» Terms of Use</Link></li>
              <li><Link href="/privacy">» Privacy Policy</Link></li>
            </ul>
          </section>
          {/* Here to stay banner — temporarily disabled
          <section className="panel !p-1">
            <div className="relative overflow-hidden">
              <img src="/img/banner-side.jpg" alt="Horde" className="block w-full scale-[1.35]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent_50%)]" />
              <div className="absolute inset-x-0 top-0 [text-shadow:0_1px_3px_#000,0_0_8px_#000]">
                <div className="px-4 py-2 text-lg font-bold uppercase text-[var(--gold)] border-b border-[var(--border-hi)]">Here to stay</div>
              </div>
            </div>
          </section>
          */}
        </aside>
      </div>
    </>
  );
}
