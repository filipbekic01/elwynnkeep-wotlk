import type { AchievementRow } from "@/lib/armory";
import { formatDate } from "@/lib/wow";
import { iconUrl, achievementUrl } from "@/lib/wotlkdb";

export default function Achievements({ achievements }: { achievements: AchievementRow[] }) {
  return (
    <div className="panel ach-panel">
      <div className="panel-title">Recent Achievements</div>
      {achievements.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No achievements yet.</p>
      ) : (
        <div className="ach-grid">
          {achievements.map((a) => (
            <a key={`${a.achievement}-${a.date}`} className="ach" href={achievementUrl(a.achievement)} target="_blank" rel="noopener noreferrer">
                <div className="ach-icon">
                  {a.power && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconUrl(a.power.icon)} alt="" width={52} height={52} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="ach-title">{a.power?.name ?? `Achievement #${a.achievement}`}</div>
                  <div className="ach-date">Earned {formatDate(a.date * 1000)}</div>
                </div>
                <div className="ach-shield">★</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
