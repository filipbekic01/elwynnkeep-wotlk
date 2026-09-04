import Link from "next/link";
import Changelog, { getCommits, COMMITS_URL } from "@/components/Changelog";
import { timeAgo } from "@/lib/wow";
import RealmStatus from "@/components/RealmStatus";
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
          <section className="panel">
            <div className="panel-title">Welcome to the server</div>
            <p>
              Elwynnkeep was born out of frustration with pay-to-win realms and commercial private servers. All I
              ever wanted was a place to log in after work and relive the nostalgia of the 3.3.5a era, and
              for years I kept looking for it. As a senior engineer with a strong technical background, I decided to
              take what the community has already done so well, AzerothCore, and run it the way production systems
              should be run: automated, regularly tested
              backups, up-to-date software, monitoring, and a stable, well-maintained realm. Your characters and
              progress are safe here.
            </p>
            <p className="mt-3">
              The server runs on the latest AzerothCore build with no custom content. Everything is kept as
              true to the original 3.3.5a experience as possible, with nothing custom added. It is synced
              with upstream AzerothCore roughly every week, so every fix and improvement merged into the open-source
              repository reaches the realm shortly after.
            </p>
            <p className="mt-3">
              All server costs are covered out of my own pocket. There is no shop and there never will be; this is
              purely for the fun of it and for that home-like feeling. We all contribute, and we all play that code.
              It is free for anyone to play and free for anyone to contribute.
            </p>
            <p className="mt-3">
              Whether the population is low or high, Elwynnkeep will always be a safe place to log in and simply
              enjoy the game. This is not a competitive server. It exists purely for the nostalgia and for that
              feeling of being home.
            </p>
            <p className="mt-3 font-bold" style={{ color: "var(--gold)" }}>Welcome home, my friend.</p>
          </section>

          <Changelog />

        </div>

        <aside className="space-y-6">
          <RealmStatus />
          <section className="panel">
            <div className="panel-title">Community</div>
            <p className="mb-3" style={{ color: "var(--muted)" }}>
              Join the community — announcements, help and finding groups.
            </p>
            <a href="https://discord.gg/2bBZATmF3m" target="_blank" rel="noopener noreferrer" className="btn block w-full text-center">
              Join our Discord
            </a>
          </section>
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
