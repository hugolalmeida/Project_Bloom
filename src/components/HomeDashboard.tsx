"use client";

import {
  BATTLE_UNLOCK_LEVEL,
  DAILY_BONUS_XP,
  DAILY_COMPLETE_COINS,
  DAILY_TASK_COINS,
  PROJECT_TASK_COINS,
  getDailyTasks,
  getLevelFromXp,
  getNextCharacterMilestone,
  getProjectTaskXp,
  getTodayKey,
  isBattleUnlocked,
  normalizeTaskProgress,
} from "@/lib/game";
import type { DailyProgress, PersonalProject, UserProfile } from "@/types/teancum";

type HomeDashboardProps = {
  profile: UserProfile;
  progress: DailyProgress | null;
  projects: PersonalProject[];
};

export function HomeDashboard({ profile, progress, projects }: HomeDashboardProps) {
  const todayKey = getTodayKey();
  const dailyTasks = getDailyTasks(profile);
  const taskProgress = progress ? normalizeTaskProgress(progress, profile) : null;
  const activeProjects = projects.filter((project) => !project.completed);
  const projectTasks = activeProjects.flatMap((project) =>
    project.tasks.map((task, taskIndex) => {
      const customTaskIndex =
        task.source === "custom"
          ? project.tasks
              .slice(0, taskIndex + 1)
              .filter((projectTask) => projectTask.source === "custom").length - 1
          : 0;

      return {
        doneToday: task.completed || task.lastCompletedDate === todayKey,
        xp: task.xpReward ?? getProjectTaskXp(task.source, customTaskIndex),
      };
    }),
  );

  const completedDailyCount = taskProgress
    ? dailyTasks.filter((task) => taskProgress[task.id] >= task.target).length
    : 0;
  const completedProjectTaskCount = projectTasks.filter((task) => task.doneToday).length;
  const totalTaskCount = dailyTasks.length + projectTasks.length;
  const completedTaskCount = completedDailyCount + completedProjectTaskCount;
  const dailyXpLeft = taskProgress
    ? dailyTasks.reduce((total, task) => {
        const remainingSteps = Math.max(0, task.target - taskProgress[task.id]);
        return total + remainingSteps * task.xpPerStep;
      }, progress?.completedAll ? 0 : DAILY_BONUS_XP)
    : 0;
  const projectXpLeft = projectTasks.reduce(
    (total, item) => (item.doneToday ? total : total + item.xp),
    0,
  );
  const possibleXpToday = dailyXpLeft + projectXpLeft;
  const dailyCoinsLeft = taskProgress
    ? dailyTasks.reduce((total, task) => {
        const remainingSteps = Math.max(0, task.target - taskProgress[task.id]);
        return total + remainingSteps * DAILY_TASK_COINS;
      }, progress?.completedAll ? 0 : DAILY_COMPLETE_COINS)
    : 0;
  const projectCoinsLeft = projectTasks.reduce(
    (total, item) => (item.doneToday ? total : total + PROJECT_TASK_COINS),
    0,
  );
  const possibleCoinsToday = dailyCoinsLeft + projectCoinsLeft;
  const currentLevel = getLevelFromXp(profile.xp);
  const nextMilestone = getNextCharacterMilestone(currentLevel);
  const battleUnlocked = isBattleUnlocked(currentLevel);
  const missionProgress =
    totalTaskCount === 0 ? 0 : Math.round((completedTaskCount / totalTaskCount) * 100);

  return (
    <section className="space-y-4">
      <div className="rounded-[30px] bg-[#102b55] p-4 text-white shadow-[0_16px_36px_rgba(17,49,96,0.2)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb5ff]">
              Resumo de hoje
            </p>
            <h2 className="mt-1 text-2xl font-black">Painel rápido</h2>
          </div>
          <div className="rounded-2xl bg-white/12 px-3 py-2 text-right">
            <p className="text-xs font-bold text-[#c8dcff]">XP disponível</p>
            <p className="text-xl font-black text-[#fff2b8]">+{possibleXpToday}</p>
            <p className="text-xs font-black text-[#ffe783]">🪙 +{possibleCoinsToday}</p>
          </div>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-white/15 p-1">
          <div
            className="h-full rounded-full bg-[#f0a83a] transition-all duration-700"
            style={{ width: `${missionProgress}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <SummaryPill label="Missões" value={`${completedTaskCount}/${totalTaskCount}`} />
          <SummaryPill label="Projetos" value={String(activeProjects.length)} />
          <SummaryPill label="Sequência" value={String(profile.streak)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(17,49,96,0.1)]">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
            Próximo título
          </p>
          <p className="mt-2 text-lg font-black leading-tight text-[#102b55]">
            {nextMilestone ? nextMilestone.title : "Título máximo"}
          </p>
          <p className="mt-1 text-xs font-bold text-[#66799e]">
            {nextMilestone ? `Chega no level ${nextMilestone.level}` : "Continue firme"}
          </p>
        </div>

        <div
          className={`rounded-[24px] p-4 shadow-[0_12px_26px_rgba(17,49,96,0.1)] ${
            battleUnlocked ? "bg-[#fff2b8] text-[#7a6418]" : "bg-white text-[#102b55]"
          }`}
        >
          <p
            className={`text-xs font-black uppercase tracking-[0.12em] ${
              battleUnlocked ? "text-[#7a6418]" : "text-[#1f5fbf]"
            }`}
          >
            Combate
          </p>
          <p className="mt-2 text-lg font-black leading-tight">
            {battleUnlocked ? "Em preparação" : "Bloqueado"}
          </p>
          <p
            className={`mt-1 text-xs font-bold ${
              battleUnlocked ? "text-[#7a6418]" : "text-[#66799e]"
            }`}
          >
            {battleUnlocked ? "Você chegou no level 5" : `Libera no level ${BATTLE_UNLOCK_LEVEL}`}
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#d7e3fb] bg-white/80 p-4 shadow-[0_14px_32px_rgba(17,49,96,0.08)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dff2cf] text-2xl">
            🌱
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1f5fbf]">
              Evento futuro
            </p>
            <h2 className="text-base font-black text-[#102b55]">Bloom</h2>
            <p className="mt-1 text-sm font-semibold text-[#66799e]">
              Uma temporada especial de 7 semanas para ganhar muito XP.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type SummaryPillProps = {
  label: string;
  value: string;
};

function SummaryPill({ label, value }: SummaryPillProps) {
  return (
    <div className="rounded-2xl bg-white/12 px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#c8dcff]">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
