import {
  DAILY_TASK_COINS,
  PROJECT_TASK_COINS,
  getDailyTasks,
  getProjectTaskXp,
  getTodayKey,
  normalizeTaskProgress,
} from "@/lib/game";
import type { DailyProgress, PersonalProject, TaskId, UserProfile } from "@/types/teancum";

type TaskChecklistProps = {
  feedbackTaskId: TaskId | null;
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

export function TaskChecklist({
  feedbackTaskId,
  pendingProjectTaskId,
  pendingTaskId,
  profile,
  progress,
  projectSaving,
  projects,
  saving,
  onCompleteProjectTask,
  onCompleteTask,
}: TaskChecklistProps) {
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
        project,
        task,
        doneToday: task.completed || task.lastCompletedDate === todayKey,
        xp: task.xpReward ?? getProjectTaskXp(task.source, customTaskIndex),
      };
    }),
  );

  const completedDailyCount = taskProgress
    ? dailyTasks.filter((task) => taskProgress[task.id] >= task.target).length
    : 0;
  const completedProjectTaskCount = projectTasks.filter((item) => item.doneToday).length;
  const totalTaskCount = dailyTasks.length + projectTasks.length;
  const completedTaskCount = completedDailyCount + completedProjectTaskCount;
  const dayComplete = Boolean(progress?.completedAll);

  if (!taskProgress) {
    return (
      <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
        <div className="mb-4 h-5 w-36 animate-pulse rounded-full bg-[#e8eddc]" />
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div className="h-16 animate-pulse rounded-2xl bg-[#f8fbff]" key={task.id} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(17,49,96,0.12)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#102b55]">Afazeres de hoje</h2>
          <p className="text-xs font-bold text-[#8ba0c4]">
            {completedTaskCount}/{totalTaskCount} missões completas
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            dayComplete ? "bg-[#eaf1ff] text-[#1f5fbf]" : "bg-[#fff2b8] text-[#7a6418]"
          }`}
        >
          {dayComplete ? "Dia completo" : "+20 bônus"}
        </span>
      </div>

      <div className="space-y-3">
        {dailyTasks.map((task) => {
          const current = taskProgress[task.id];
          const completed = current >= task.target;
          const pending = pendingTaskId === task.id;
          const justCompleted = feedbackTaskId === task.id;

          return (
            <button
              className={`relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 text-left transition ${
                completed
                  ? "border-[#8fb5ff] bg-[#eaf1ff]"
                  : "border-[#dce7fb] bg-[#f8fbff] active:scale-[0.99]"
              } ${justCompleted ? "animate-task-complete" : ""} disabled:cursor-not-allowed disabled:opacity-80`}
              disabled={saving || completed}
              key={task.id}
              onClick={() => onCompleteTask(task.id)}
              type="button"
            >
              {pending ? <span className="animate-progress-shimmer absolute inset-0 bg-white/35" /> : null}
              <TaskIcon done={completed} pending={pending} />
              <span className="relative min-w-0 flex-1">
                <span className="block text-sm font-black text-[#1f5fbf]">Diária</span>
                <span className="block text-base font-black text-[#102b55]">{task.label}</span>
                <span className="block text-sm font-semibold text-[#66799e]">
                  {pending
                    ? "Salvando..."
                    : completed
                      ? "Meta feita por hoje"
                      : `${current}/${task.target} ${task.unit} · +${task.xpPerStep} XP`}
                </span>
              </span>
              {justCompleted ? (
                <span className="relative animate-xp-float rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                  +{task.xpPerStep} XP · 🪙 {DAILY_TASK_COINS}
                </span>
              ) : (
                <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                  {completed ? "Feita" : `+${task.xpPerStep} XP · 🪙 ${DAILY_TASK_COINS}`}
                </span>
              )}
            </button>
          );
        })}

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
              {pending ? <span className="animate-progress-shimmer absolute inset-0 bg-white/35" /> : null}
              <TaskIcon done={doneToday} pending={pending} />
              <span className="relative min-w-0 flex-1">
                <span className="block text-sm font-black text-[#1f5fbf]">{project.title}</span>
                <span className="block text-base font-black text-[#102b55]">{task.label}</span>
                <span className="block text-sm font-semibold text-[#66799e]">
                  {doneToday ? "Concluída hoje" : "Tarefa de projeto"}
                </span>
              </span>
              <span className="relative rounded-full bg-white px-2 py-1 text-xs font-black text-[#1f5fbf]">
                {doneToday ? "Hoje" : `+${xp} XP · 🪙 ${PROJECT_TASK_COINS}`}
              </span>
            </button>
          );
        })}

        {totalTaskCount === 0 ? (
          <p className="rounded-2xl bg-[#eaf1ff] px-4 py-3 text-sm font-bold text-[#4b638f]">
            Suas missões aparecem aqui assim que a jornada carregar.
          </p>
        ) : null}
      </div>
    </section>
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
