"use client";

import {
  CUSTOM_PROJECT_TASK_XP,
  DAILY_BONUS_XP,
  PRESET_PROJECT_TASK_XP,
  getDailyTasks,
  getTodayKey,
  normalizeTaskProgress,
} from "@/lib/game";
import type { DailyProgress, PersonalProject, TaskId, UserProfile } from "@/types/teancum";

type HomeDashboardProps = {
  pendingProjectTaskId: string | null;
  pendingTaskId: TaskId | null;
  profile: UserProfile;
  progress: DailyProgress | null;
  projectSaving: boolean;
  projects: PersonalProject[];
  saving: boolean;
  onCompleteProjectTask: (projectId: string, taskId: string) => Promise<void>;
  onCompleteTask: (taskId: TaskId) => Promise<void>;
};

export function HomeDashboard({
  pendingProjectTaskId,
  pendingTaskId,
  profile,
  progress,
  projectSaving,
  projects,
  saving,
  onCompleteProjectTask,
  onCompleteTask,
}: HomeDashboardProps) {
  const todayKey = getTodayKey();
  const dailyTasks = getDailyTasks(profile);
  const taskProgress = progress ? normalizeTaskProgress(progress, profile) : null;
  const activeProjects = projects.filter((project) => !project.completed);
  const projectTasks = activeProjects.flatMap((project) =>
    project.tasks.map((task) => ({
      project,
      task,
      doneToday: task.completed || task.lastCompletedDate === todayKey,
      xp:
        task.xpReward ??
        (task.source === "custom" ? CUSTOM_PROJECT_TASK_XP : PRESET_PROJECT_TASK_XP),
    })),
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

  return (
    <section className="space-y-4">
      <div className="rounded-[30px] bg-[#102b55] p-4 text-white shadow-[0_16px_36px_rgba(17,49,96,0.2)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb5ff]">
              Painel de missao
            </p>
            <h2 className="mt-1 text-2xl font-black">Resumo de hoje</h2>
          </div>
          <div className="rounded-2xl bg-white/12 px-3 py-2 text-right">
            <p className="text-xs font-bold text-[#c8dcff]">XP disponivel</p>
            <p className="text-xl font-black text-[#fff2b8]">+{possibleXpToday}</p>
          </div>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-white/15 p-1">
          <div
            className="h-full rounded-full bg-[#f0a83a] transition-all duration-700"
            style={{
              width: `${totalTaskCount === 0 ? 0 : Math.round((completedTaskCount / totalTaskCount) * 100)}%`,
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <SummaryPill label="Tarefas" value={`${completedTaskCount}/${totalTaskCount}`} />
          <SummaryPill label="Projetos" value={String(activeProjects.length)} />
          <SummaryPill label="Sequencia" value={String(profile.streak)} />
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#102b55]">Lista de missoes</h2>
            <p className="text-xs font-bold text-[#66799e]">
              Metas diarias e tarefas dos projetos em um lugar so.
            </p>
          </div>
          <span className="rounded-full bg-[#eaf1ff] px-3 py-1 text-xs font-black text-[#1f5fbf]">
            Hoje
          </span>
        </div>

        <div className="space-y-3">
          {taskProgress
            ? dailyTasks.map((task) => {
                const current = taskProgress[task.id];
                const completed = current >= task.target;
                const pending = pendingTaskId === task.id;

                return (
                  <button
                    className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
                      completed
                        ? "border-[#8fb5ff] bg-[#eaf1ff]"
                        : "border-[#dce7fb] bg-[#f8fbff] active:scale-[0.99]"
                    } disabled:cursor-not-allowed disabled:opacity-80`}
                    disabled={saving || completed}
                    key={task.id}
                    onClick={() => onCompleteTask(task.id)}
                    type="button"
                  >
                    {pending ? (
                      <span className="absolute inset-0 animate-progress-shimmer bg-white/35" />
                    ) : null}
                    <TaskIcon done={completed} pending={pending} />
                    <span className="relative min-w-0 flex-1">
                      <span className="block text-sm font-black text-[#1f5fbf]">Diaria</span>
                      <span className="block text-base font-black text-[#102b55]">
                        {task.label}
                      </span>
                      <span className="block text-sm font-semibold text-[#66799e]">
                        {completed
                          ? "Concluida hoje"
                          : `${current}/${task.target} ${task.unit}`}
                      </span>
                    </span>
                    <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                      {completed ? "Feita" : `+${task.xpPerStep}`}
                    </span>
                  </button>
                );
              })
            : dailyTasks.map((task) => (
                <div className="h-16 animate-pulse rounded-2xl bg-[#f8fbff]" key={task.id} />
              ))}

          {projectTasks.map(({ project, task, doneToday, xp }) => {
            const pending = pendingProjectTaskId === `${project.id}:${task.id}`;

            return (
              <button
                className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
                  doneToday
                    ? "border-[#8fb5ff] bg-[#eaf1ff]"
                    : "border-[#dce7fb] bg-[#f8fbff] active:scale-[0.99]"
                } disabled:cursor-not-allowed disabled:opacity-80`}
                disabled={projectSaving || doneToday}
                key={`${project.id}-${task.id}`}
                onClick={() => onCompleteProjectTask(project.id, task.id)}
                type="button"
              >
                {pending ? (
                  <span className="absolute inset-0 animate-progress-shimmer bg-white/35" />
                ) : null}
                <TaskIcon done={doneToday} pending={pending} />
                <span className="relative min-w-0 flex-1">
                  <span className="block text-sm font-black text-[#1f5fbf]">{project.title}</span>
                  <span className="block text-base font-black text-[#102b55]">{task.label}</span>
                  <span className="block text-sm font-semibold text-[#66799e]">
                    {doneToday ? "Concluida hoje" : "Tarefa de projeto"}
                  </span>
                </span>
                <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                  {doneToday ? "Hoje" : `+${xp}`}
                </span>
              </button>
            );
          })}

          {totalTaskCount === 0 ? (
            <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-bold text-[#4b638f]">
              Suas metas diarias vao aparecer aqui assim que a jornada carregar.
            </p>
          ) : null}
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

type TaskIconProps = {
  done: boolean;
  pending: boolean;
};

function TaskIcon({ done, pending }: TaskIconProps) {
  return (
    <span
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
        done ? "bg-[#1f5fbf] text-white" : "bg-[#e8f0ff] text-[#1f5fbf]"
      }`}
    >
      {pending ? "..." : done ? "✓" : "+"}
    </span>
  );
}
