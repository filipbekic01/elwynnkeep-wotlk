import { formatDate } from "@/lib/wow";

export const REPO = "filipbekic01/elwynnkeep-wotlk";
export const COMMITS_URL = `https://github.com/${REPO}/commits/master`;

export type Commit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } };
  author: { login: string; html_url: string } | null;
};

export async function getCommits(): Promise<Commit[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=10`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Changelog() {
  const commits = await getCommits();
  return (
    <section className="panel">
      <div className="panel-title">Changelog</div>
      <p className="mb-4">
        Every change you need or want to know about lives on GitHub. It is the most detailed record of what is
        happening on the realm: follow it at a high level through commit titles, or dive into every single line of
        code. Contributions are welcome; anything merged upstream ends up on Elwynnkeep.
      </p>
      <div className="divider" />
      {commits.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Could not load commits right now.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {commits.map((c) => (
            <li key={c.sha} className="flex min-w-0 items-center gap-3 py-2 leading-tight" style={{ borderColor: "#2a2116" }}>
              <a href={c.html_url} target="_blank" rel="noopener noreferrer" className="shrink-0 font-mono text-sm leading-none" style={{ color: "var(--gold-dim)" }}>
                {c.sha.slice(0, 7)}
              </a>
              <span className="min-w-0 flex-1 truncate" title={c.commit.message}>
                {c.commit.message.split("\n")[0]}
              </span>
              <span className="hidden shrink-0 text-sm leading-none sm:inline" style={{ color: "var(--muted)" }}>
                {c.author ? c.author.login : c.commit.author.name} · {formatDate(c.commit.author.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="divider" />
      <a href={COMMITS_URL} target="_blank" rel="noopener noreferrer">» Full history on GitHub</a>
    </section>
  );
}
