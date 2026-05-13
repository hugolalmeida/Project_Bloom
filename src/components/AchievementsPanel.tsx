import { getAchievements } from "@/lib/game";
import type { PersonalProject, UserProfile } from "@/types/teancum";

type AchievementsPanelProps = {
  profile: UserProfile;
  projects: PersonalProject[];
};

export function AchievementsPanel({ profile, projects }: AchievementsPanelProps) {
  const achievements = getAchievements(profile, projects);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
            Badges
          </p>
          <h2 className="text-lg font-black text-[#102b55]">Conquistas</h2>
        </div>
        <span className="rounded-full bg-[#eaf1ff] px-3 py-2 text-xs font-black text-[#1f5fbf]">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <article
            className={`min-h-[9.5rem] rounded-[24px] border p-3 transition ${
              achievement.unlocked
                ? "border-[#8fb5ff] bg-[#eaf1ff] shadow-[0_10px_22px_rgba(17,49,96,0.08)]"
                : "border-[#dbe6fb] bg-[#f8fbff] opacity-70"
            }`}
            key={achievement.id}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                  achievement.unlocked ? "bg-white" : "bg-[#edf3ff] grayscale"
                }`}
              >
                {achievement.icon}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-black ${
                  achievement.unlocked
                    ? "bg-[#fff2b8] text-[#7a6418]"
                    : "bg-[#edf3ff] text-[#66799e]"
                }`}
              >
                {achievement.unlocked ? "Liberado" : achievement.progressLabel}
              </span>
            </div>
            <h3 className="text-sm font-black leading-tight text-[#102b55]">{achievement.name}</h3>
            <p className="mt-1 text-xs font-semibold leading-4 text-[#66799e]">
              {achievement.description}
            </p>
            {achievement.unlocked ? (
              <p className="mt-2 text-[11px] font-black text-[#1f5fbf]">
                {achievement.progressLabel}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
